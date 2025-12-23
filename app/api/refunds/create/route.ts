import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { orderId, reason, notes } = await request.json();

    // Validate input
    if (!orderId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate reason
    const validReasons = ['customer_request', 'event_cancelled', 'duplicate_payment', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid refund reason' }, { status: 400 });
    }

    // Get user token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify order belongs to user and is eligible for refund
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'paid') {
      return NextResponse.json({ error: 'Order not eligible for refund' }, { status: 400 });
    }

    // Check for existing refund
    const { data: existingRefund } = await supabase
      .from('refunds')
      .select('id')
      .eq('order_id', orderId)
      .single();

    if (existingRefund) {
      return NextResponse.json({ error: 'Refund already requested for this order' }, { status: 400 });
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', orderId)
      .eq('status', 'captured')
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Call Razorpay refund API
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

    const rzpResponse = await fetch(
      `https://api.razorpay.com/v1/payments/${payment.razorpay_payment_id}/refund`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: order.amount,
          notes: { reason, notes: notes || '' },
        }),
      }
    );

    const refundData = await rzpResponse.json();

    if (!rzpResponse.ok) {
      console.error('Razorpay refund failed:', refundData);
      return NextResponse.json({ 
        error: 'Refund request failed', 
        details: refundData.error?.description || 'Unknown error' 
      }, { status: 500 });
    }

    // Store refund in database
    const { data: refund, error: refundError } = await supabase
      .from('refunds')
      .insert({
        order_id: orderId,
        payment_id: payment.id,
        razorpay_refund_id: refundData.id,
        reason,
        amount: order.amount,
        requested_by: user.id,
        notes: notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (refundError) {
      console.error('Failed to store refund:', refundError);
      return NextResponse.json({ error: 'Failed to store refund record' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        razorpay_refund_id: refundData.id,
        amount: order.amount,
        status: 'pending',
        reason,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
