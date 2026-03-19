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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("SIMPLE_TEXTING_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Simple Texting API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch queued messages
    const { data: queued, error: fetchErr } = await supabase
      .from("sms_logs")
      .select("*")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(20);

    if (fetchErr) throw fetchErr;
    if (!queued || queued.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    let failed = 0;

    for (const sms of queued) {
      const cleanPhone = sms.phone.replace(/\D/g, "");
      const url = `https://app2.simpletexting.com/v1/send?token=${encodeURIComponent(apiKey)}&phone=${encodeURIComponent(cleanPhone)}&message=${encodeURIComponent(sms.message)}`;

      try {
        const resp = await fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        const data = await resp.json();

        await supabase
          .from("sms_logs")
          .update({
            status: resp.ok ? "sent" : "failed",
            provider_response: data,
          })
          .eq("id", sms.id);

        if (resp.ok) sent++;
        else failed++;
      } catch (e) {
        await supabase
          .from("sms_logs")
          .update({ status: "failed", provider_response: { error: e.message } })
          .eq("id", sms.id);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({ processed: queued.length, sent, failed }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
