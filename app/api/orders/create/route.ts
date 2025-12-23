import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const { eventId, categoryId, quantity, unitPrice, totalPrice, paymentMethod } = await request.json();

    // Validate input
    if (!eventId || !categoryId || !quantity || !unitPrice || !totalPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user token from Authorization header
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('User verification failed:', userError);
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Amount in paise
    const amountInPaise = Math.round(totalPrice * 100);

    // Create Razorpay order
    const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          eventId,
          categoryId,
          quantity: String(quantity),
          userId: user.id,
        },
      }),
    });

    const razorpayOrder = await rzpResponse.json();

    if (!rzpResponse.ok) {
      console.error('Razorpay order creation failed:', razorpayOrder);
      return NextResponse.json(
        { error: 'Failed to create Razorpay order', details: razorpayOrder },
        { status: 500 }
      );
    }

    // Store order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        event_id: eventId,
        razorpay_order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        status: 'created',
        payment_method: paymentMethod || null,
        notes: {
          categoryId,
          quantity,
          unitPrice,
        },
      })
      .select()
      .single();

    if (orderError) {
      console.error('Database order creation failed:', orderError);
      return NextResponse.json({ error: 'Failed to store order' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount: amountInPaise,
        currency: 'INR',
        status: 'created',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
