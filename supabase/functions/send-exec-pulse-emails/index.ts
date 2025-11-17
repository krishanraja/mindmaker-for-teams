import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PulseEmailRequest {
  intakeId: string;
  participants: Array<{ name: string; email: string; role: string }>;
  organizerName: string;
  companyName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intakeId, participants, organizerName, companyName }: PulseEmailRequest = await req.json();

    console.log(`Sending pulse emails for intake ${intakeId} to ${participants.length} participants`);

    for (const participant of participants) {
      const emailHash = btoa(`${participant.email}-${intakeId}`);
      const pulseUrl = `${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '')}/exec-pulse/${intakeId}/${emailHash}`;

      await resend.emails.send({
        from: "The Mindmaker <onboarding@resend.dev>",
        to: [participant.email],
        subject: `Your input needed: ${companyName} AI Leadership Bootcamp prep`,
        html: `
          <h2>Hi ${participant.name},</h2>
          <p>${organizerName} has scheduled an executive AI bootcamp for ${companyName}.</p>
          <p>Complete your 5-minute pulse to help us tailor the session to your team's needs:</p>
          <p><a href="${pulseUrl}" style="background-color: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Your Pulse</a></p>
          <p>This quick assessment covers:</p>
          <ul>
            <li><strong>Awareness</strong> - Your AI knowledge and confidence</li>
            <li><strong>Application</strong> - Your hands-on AI experience</li>
            <li><strong>Trust</strong> - Your comfort with AI-augmented decisions</li>
            <li><strong>Governance</strong> - Your organization's AI readiness</li>
          </ul>
          <p>Your responses will help shape the bootcamp agenda to focus on what matters most to your leadership team.</p>
          <p>We'll see you at the session!</p>
          <p>Best regards,<br>The Mindmaker Team</p>
        `,
      });

      console.log(`Sent pulse email to ${participant.email}`);
    }

    return new Response(
      JSON.stringify({ success: true, emailsSent: participants.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending pulse emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
