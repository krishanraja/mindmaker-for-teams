import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendPreworkEmailsRequest {
  intakeId: string;
  participants: Array<{ name: string; email: string; role: string }>;
  organizerName: string;
  companyName: string;
  workshopDate: string;
  qrData: Array<{
    participantEmail: string;
    participantName: string;
    qrUrl: string;
    directUrl: string;
  }>;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      participants,
      organizerName,
      companyName,
      workshopDate,
      qrData,
    } = await req.json() as SendPreworkEmailsRequest;

    const results = [];

    for (const qr of qrData) {
      const participant = participants.find(p => p.email === qr.participantEmail);
      if (!participant) continue;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: white; border-radius: 8px; }
            .qr-section img { max-width: 300px; height: auto; }
            .checklist { list-style: none; padding: 0; }
            .checklist li { padding: 8px 0; padding-left: 30px; position: relative; }
            .checklist li:before { content: "✅"; position: absolute; left: 0; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">Quick prep for your AI Bootcamp!</h1>
            </div>
            <div class="content">
              <p><strong>Hi ${participant.name},</strong></p>
              
              <p>You're confirmed for the <strong>${companyName} AI Leadership Bootcamp</strong> on <strong>${new Date(workshopDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>!</p>
              
              <p>Help us tailor the session to YOUR needs by completing this <strong>3-minute questionnaire</strong>:</p>
              
              <div style="text-align: center;">
                <a href="${qr.directUrl}" class="button">Complete Pre-Workshop Form</a>
              </div>
              
              <p style="text-align: center; color: #6b7280; font-size: 14px; margin: 10px 0;">
                Or scan this QR code on your phone:
              </p>
              
              <div class="qr-section">
                <img src="${qr.qrUrl}" alt="QR Code for Pre-Workshop Form" />
              </div>
              
              <p><strong>Your input will help us:</strong></p>
              <ul class="checklist">
                <li>Focus on bottlenecks you actually face</li>
                <li>Customize simulation scenarios to your experience</li>
                <li>Align the workshop with your strategic goals</li>
              </ul>
              
              <p>This should take less than <strong>4 minutes</strong>. We'll see you on ${new Date(workshopDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}!</p>
              
              <p>Best,<br>${organizerName}</p>
              
              <div class="footer">
                <p><em>P.S. You'll also receive a separate email for the AI Pulse assessment if you haven't completed it yet. Both are quick!</em></p>
                <p style="font-size: 12px; color: #9ca3af;">Questions? Reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const emailResponse = await resend.emails.send({
          from: "The Mindmaker <onboarding@resend.dev>",
          to: [participant.email],
          subject: `3-min prep: ${companyName} AI Bootcamp on ${new Date(workshopDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          html: emailHtml,
        });

        results.push({
          email: participant.email,
          success: true,
          messageId: emailResponse.id,
        });

        console.log(`Pre-work email sent to ${participant.email}`);
      } catch (emailError: any) {
        console.error(`Error sending email to ${participant.email}:`, emailError);
        results.push({
          email: participant.email,
          success: false,
          error: emailError.message,
        });
      }
    }

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in send-prework-emails:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});