import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
  );
  const logStep = (step, details) => {
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : "";
    console.log(`[SEND-TIMELESS-MESSAGE] ${step}${detailsStr}`);
  };
  try {
    // Get all due messages (both date and datetime)
    const now = new Date();
    const currentDate = now.toISOString().split("T")[0];
    const currentTime = now.toISOString().split("T")[1].substring(0, 5); // HH:MM
    const { data: messages, error } = await supabase
      .from("timeless_messages")
      .select("*")
      .eq("status", "pending")
      .eq("delivery_type", "date")
      .lte("delivery_date", currentDate);
    logStep("Fetched messages", {
      count: messages?.length,
    });
    if (error) {
      logStep("Error fetching messages", {
        error,
      });
      return new Response("Error fetching messages", {
        status: 500,
      });
    }
    console.log(messages);
    for (const msg of messages || []) {
      try {
        // Ensure recipient_emails is an array
        let recipients = msg.recipient_emails;
        if (!Array.isArray(recipients)) {
          recipients = [recipients];
        }
        const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
        if (!RESEND_API_KEY) {
          logStep("Missing RESEND_API_KEY");
          continue;
        }
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: msg.from || "noreply@mindmortal.com",
            to: recipients,
            subject: msg.title,
            html: msg.content,
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          logStep("Email send failed", {
            id: msg.id,
            error: errorText,
          });
          continue;
        }
        // Mark as sent
        const sent = await supabase
          .from("timeless_messages")
          .update({
            status: "sent",
          })
          .eq("id", msg.id);
        console.log(sent);
        logStep("Email sent successfully", {
          id: msg.id,
        });
      } catch (err) {
        logStep("Error processing message", {
          id: msg.id,
          error: err,
        });
      }
    }
    return new Response(`Processed ${messages?.length || 0} messages`, {
      status: 200,
    });
  } catch (err) {
    logStep("Unexpected error", {
      error: err,
    });
    return new Response("Internal server error", {
      status: 500,
    });
  }
});
