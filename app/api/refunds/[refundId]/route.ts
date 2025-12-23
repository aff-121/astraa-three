import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ refundId: string }> }
) {
  try {
    const { refundId } = await params;
    
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

    // Get refund
    const { data: refund, error } = await supabase
      .from('refunds')
      .select(`
        *,
        order:orders (
          id,
          event_id,
          amount,
          currency,
          status,
          created_at
        )
      `)
      .eq('id', refundId)
      .eq('requested_by', user.id)
      .single();

    if (error || !refund) {
      return NextResponse.json({ error: 'Refund not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, refund });
  } catch (error) {
    console.error('Get refund error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
