import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Validate input
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = createHmac('sha256', razorpayKeySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order details
    const { data: order, error: orderFetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .single();

    if (orderFetchError || !order) {
      console.error('Order not found:', orderFetchError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status to paid
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: 'paid', 
        updated_at: new Date().toISOString() 
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    // Store payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        order_id: order.id,
        razorpay_payment_id,
        razorpay_signature,
        status: 'captured',
        amount: order.amount,
      });

    if (paymentError) {
      console.error('Failed to store payment:', paymentError);
      // Continue even if payment record fails - order is already marked as paid
    }

    // Create ticket using atomic RPC function
    const { data: ticketData, error: ticketError } = await supabase.rpc('purchase_ticket', {
      p_user_id: order.user_id,
      p_event_id: order.event_id,
      p_category_id: order.notes?.categoryId,
      p_quantity: order.notes?.quantity || 1,
    });

    if (ticketError) {
      console.error('Failed to create ticket:', ticketError);
      return NextResponse.json({ 
        error: 'Payment successful but ticket creation failed. Please contact support.',
        orderId: order.id,
      }, { status: 500 });
    }

    const ticket = ticketData?.[0];

    // Update ticket with order and payment info
    if (ticket) {
      await supabase
        .from('tickets')
        .update({
          order_id: order.id,
          payment_status: 'captured',
          razorpay_payment_id,
        })
        .eq('id', ticket.ticket_id);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      order: { 
        id: order.id, 
        status: 'paid' 
      },
      ticket: ticket ? {
        id: ticket.ticket_id,
        ticket_number: ticket.ticket_number,
      } : null,
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
