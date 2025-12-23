// deno-lint-ignore-file no-explicit-any
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

/**
 * Supabase Edge Function: SMS OTP via MSG91
 * 
 * Environment Variables Required (set in Supabase Dashboard > Functions):
 * - MSG91_KEY: Your MSG91 Auth Key
 * - MSG91_SMSOTP_TEMPLATE_ID: Your MSG91 Flow Template ID
 * 
 * Usage:
 * POST { "to": "+919876543210", "otp": "123456" }
 */

const MSG91_KEY = Deno.env.get("MSG91_KEY");
const MSG91_SMSOTP_TEMPLATE_ID = Deno.env.get("MSG91_SMSOTP_TEMPLATE_ID");
const MSG91_SMS_ENDPOINT = "https://api.msg91.com/api/v5/flow/";

// IMPORTANT: Must match your MSG91 template variable name
const MSG91_OTP_VAR_NAME = "otp";

function json(status: number, data: any) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return json(200, { ok: true });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed" });
  }

  // Check required env vars
  if (!MSG91_KEY || !MSG91_SMSOTP_TEMPLATE_ID) {
    console.error("Missing MSG91 configuration");
    return json(500, {
      ok: false,
      error: "Missing MSG91 configuration",
      need: ["MSG91_KEY", "MSG91_SMSOTP_TEMPLATE_ID"],
    });
  }

  // Parse request body
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return json(400, {
      ok: false,
      error: "Invalid JSON body",
      details: String(e),
    });
  }

  // Extract phone and OTP
  // Supports both: { to, otp } and { phone, otp }
  const phone = body?.to || body?.phone;
  const otp = body?.otp;

  if (!phone || !otp) {
    return json(400, {
      ok: false,
      error: "Missing required fields",
      hint: "Send JSON like: { to: '+919876543210', otp: '123456' }",
    });
  }

  // Remove '+' prefix if present (MSG91 doesn't want it)
  const mobile = String(phone).replace(/^\+/, "");

  // Build MSG91 payload
  const payload = {
    template_id: MSG91_SMSOTP_TEMPLATE_ID,
    recipients: [
      {
        mobiles: mobile,
        [MSG91_OTP_VAR_NAME]: String(otp),
      },
    ],
  };

  console.log("Sending SMS to:", mobile);

  // Call MSG91 API
  try {
    const resp = await fetch(MSG91_SMS_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json",
        "authkey": MSG91_KEY,
      },
      body: JSON.stringify(payload),
    });

    const text = await resp.text();
    let data: any;
    
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!resp.ok) {
      console.error("MSG91 error:", resp.status, data);
      return json(resp.status, {
        ok: false,
        error: "MSG91 API error",
        status: resp.status,
        response: data,
      });
    }

    // Success
    console.log("SMS sent successfully to:", mobile);
    return json(200, {
      ok: true,
      message: "SMS sent successfully",
      provider: "msg91",
      result: data,
    });

  } catch (error) {
    console.error("Network error:", error);
    return json(500, {
      ok: false,
      error: "Failed to connect to MSG91",
      details: String(error),
    });
  }
});
