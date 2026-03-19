import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, message, booking_id, sent_by } = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "phone and message are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("SIMPLE_TEXTING_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Simple Texting API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Clean phone number - remove non-digits
    const cleanPhone = phone.replace(/\D/g, "");

    // Send via Simple Texting API v1
    const url = `https://app2.simpletexting.com/v1/send?token=${encodeURIComponent(apiKey)}&phone=${encodeURIComponent(cleanPhone)}&message=${encodeURIComponent(message)}`;

    const smsResponse = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const responseData = await smsResponse.json();

    // Log to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const smsStatus = smsResponse.ok ? "sent" : "failed";

    await supabase.from("sms_logs").insert({
      phone: cleanPhone,
      message,
      booking_id: booking_id || null,
      sent_by: sent_by || null,
      status: smsStatus,
      provider_response: responseData,
    });

    if (!smsResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to send SMS", details: responseData }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: responseData }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
