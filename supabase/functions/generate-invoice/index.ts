import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  try {
    const { orderId, ticketId } = await req.json();

    if (!orderId || !ticketId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing orderId or ticketId" }),
        {
          status: 400,
          headers: { "content-type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, payments(*)")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        {
          status: 404,
          headers: { "content-type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get ticket details
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .select(`
        *,
        event:events(title, date, time, venue, location),
        category:ticket_categories(name)
      `)
      .eq("id", ticketId)
      .single();

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({ success: false, error: "Ticket not found" }),
        {
          status: 404,
          headers: { "content-type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", order.user_id)
      .single();

    // Generate invoice HTML content
    const invoiceHtml = generateInvoiceHtml({
      order,
      ticket,
      profile,
      event: ticket.event,
      category: ticket.category,
    });

    // Store invoice record
    const filename = `Invoice_${order.razorpay_order_id}_${Date.now()}.html`;
    const storagePath = `invoices/${order.user_id}/${filename}`;

    // Store to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(storagePath, invoiceHtml, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      // Continue without storage, return inline
    }

    // Get signed URL if upload succeeded
    let signedUrl = null;
    let publicUrl = null;

    if (!uploadError) {
      const { data: signedData } = await supabase.storage
        .from("invoices")
        .createSignedUrl(storagePath, 7 * 24 * 60 * 60); // 7 days

      signedUrl = signedData?.signedUrl;

      const { data: publicData } = supabase.storage
        .from("invoices")
        .getPublicUrl(storagePath);

      publicUrl = publicData?.publicUrl;
    }

    // Store invoice record in database
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        order_id: orderId,
        ticket_id: ticketId,
        filename,
        storage_path: storagePath,
        public_url: publicUrl,
        signed_url: signedUrl,
        file_size: new TextEncoder().encode(invoiceHtml).length,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Invoice record error:", invoiceError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        invoice: {
          id: invoice?.id,
          filename,
          downloadUrl: signedUrl,
          publicUrl,
          size: new TextEncoder().encode(invoiceHtml).length,
          generatedAt: new Date().toISOString(),
        },
        htmlContent: invoiceHtml,
      }),
      {
        status: 200,
        headers: { "content-type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("Invoice generation error:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        status: 500,
        headers: { "content-type": "application/json", ...corsHeaders },
      }
    );
  }
});

interface InvoiceData {
  order: {
    id: string;
    razorpay_order_id: string;
    amount: number;
    currency: string;
    status: string;
    created_at: string;
    payments?: Array<{
      razorpay_payment_id: string;
      status: string;
    }>;
  };
  ticket: {
    ticket_number: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    purchase_time: string;
  };
  profile?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  event?: {
    title: string;
    date: string;
    time: string;
    venue: string;
    location: string;
  };
  category?: {
    name: string;
  };
}

function generateInvoiceHtml(data: InvoiceData): string {
  const { order, ticket, profile, event, category } = data;
  const payment = order.payments?.[0];
  const amountInRupees = order.amount / 100;
  const gst = amountInRupees * 0.18;
  const baseAmount = amountInRupees - gst;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice - ${order.razorpay_order_id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; padding: 40px; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #FF6B35, #FF8C5A); color: white; padding: 40px; }
    .logo { font-size: 28px; font-weight: bold; margin-bottom: 8px; }
    .invoice-title { font-size: 14px; opacity: 0.9; }
    .content { padding: 40px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 12px; font-weight: 600; letter-spacing: 0.5px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .info-item { }
    .info-label { font-size: 12px; color: #999; margin-bottom: 4px; }
    .info-value { font-size: 16px; color: #1a1a1a; font-weight: 500; }
    .divider { height: 1px; background: #eee; margin: 24px 0; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 12px; color: #666; padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 600; }
    td { padding: 16px 0; border-bottom: 1px solid #f5f5f5; color: #333; }
    .text-right { text-align: right; }
    .total-row td { border: none; font-weight: 600; font-size: 18px; color: #FF6B35; }
    .footer { background: #f8f9fa; padding: 24px 40px; text-align: center; font-size: 12px; color: #999; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .badge-success { background: #d4edda; color: #155724; }
    .badge-pending { background: #fff3cd; color: #856404; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">Astra Productions</div>
      <div class="invoice-title">Tax Invoice</div>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Invoice Number</div>
            <div class="info-value">${order.razorpay_order_id}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date</div>
            <div class="info-value">${new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Payment ID</div>
            <div class="info-value">${payment?.razorpay_payment_id || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Status</div>
            <div class="info-value">
              <span class="badge ${order.status === 'paid' ? 'badge-success' : 'badge-pending'}">
                ${order.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">Bill To</div>
        <div class="info-value">${profile?.full_name || 'Guest'}</div>
        <div style="color: #666; font-size: 14px; margin-top: 4px;">
          ${profile?.email || ''}<br/>
          ${profile?.phone || ''}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Event Details</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Event</div>
            <div class="info-value">${event?.title || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Date & Time</div>
            <div class="info-value">${event?.date || ''} at ${event?.time || ''}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Venue</div>
            <div class="info-value">${event?.venue || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Ticket Number</div>
            <div class="info-value">${ticket.ticket_number}</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section">
        <div class="section-title">Order Summary</div>
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th class="text-right">Unit Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${category?.name || 'Ticket'} - ${event?.title || 'Event'}</td>
              <td>${ticket.quantity}</td>
              <td class="text-right">₹${ticket.unit_price.toLocaleString('en-IN')}</td>
              <td class="text-right">₹${(ticket.unit_price * ticket.quantity).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right">Subtotal</td>
              <td class="text-right">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td colspan="3" class="text-right">GST (18%)</td>
              <td class="text-right">₹${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3" class="text-right">Total</td>
              <td class="text-right">₹${amountInRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your purchase!</p>
      <p style="margin-top: 8px;">Astra Productions Pvt. Ltd. | GSTIN: 27AABCU1234F1Z5</p>
      <p style="margin-top: 4px;">For queries: support@astraproductions.com</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
