import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

// Disable body parser for raw body access
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    const body = await request.text();

    if (!signature) {
      console.error('Missing webhook signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Received webhook event:', event.event);

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity, supabase);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity, supabase);
        break;
      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity, supabase);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentCaptured(payment: any, supabase: any) {
  console.log('Processing payment.captured:', payment.id);
  
  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      status: 'paid', 
      updated_at: new Date().toISOString() 
    })
    .eq('razorpay_order_id', payment.order_id);

  if (orderError) {
    console.error('Failed to update order for captured payment:', orderError);
    throw orderError;
  }

  // Update payment status if exists
  await supabase
    .from('payments')
    .update({ 
      status: 'captured', 
      updated_at: new Date().toISOString() 
    })
    .eq('razorpay_payment_id', payment.id);

  // Update ticket payment status
  await supabase
    .from('tickets')
    .update({ 
      payment_status: 'captured' 
    })
    .eq('razorpay_payment_id', payment.id);

  console.log('Payment captured successfully:', payment.id);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handlePaymentFailed(payment: any, supabase: any) {
  console.log('Processing payment.failed:', payment.id);
  
  // Update order status
  const { error: orderError } = await supabase
    .from('orders')
    .update({ 
      status: 'failed', 
      updated_at: new Date().toISOString() 
    })
    .eq('razorpay_order_id', payment.order_id);

  if (orderError) {
    console.error('Failed to update order for failed payment:', orderError);
  }

  // Store failed payment record
  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('razorpay_order_id', payment.order_id)
    .single();

  if (order) {
    await supabase
      .from('payments')
      .upsert({
        order_id: order.id,
        razorpay_payment_id: payment.id,
        status: 'failed',
        amount: payment.amount,
        error_message: payment.error_description || 'Payment failed',
      });
  }

  console.log('Payment failure recorded:', payment.id);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleRefundProcessed(refund: any, supabase: any) {
  console.log('Processing refund.processed:', refund.id);
  
  // Update refund status
  const { error: refundError } = await supabase
    .from('refunds')
    .update({ 
      status: 'processed', 
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString() 
    })
    .eq('razorpay_refund_id', refund.id);

  if (refundError) {
    console.error('Failed to update refund status:', refundError);
  }

  // Update order status to refunded
  const { data: refundRecord } = await supabase
    .from('refunds')
    .select('order_id')
    .eq('razorpay_refund_id', refund.id)
    .single();

  if (refundRecord) {
    await supabase
      .from('orders')
      .update({ 
        status: 'refunded', 
        updated_at: new Date().toISOString() 
      })
      .eq('id', refundRecord.order_id);

    // Update ticket payment status
    await supabase
      .from('tickets')
      .update({ 
        payment_status: 'refunded',
        status: 'cancelled'
      })
      .eq('order_id', refundRecord.order_id);
  }

  console.log('Refund processed successfully:', refund.id);
}
