import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CanvasEmailRequest {
  businessName: string;
  userName: string;
  businessEmail: string;
  pdfData?: string;
  fileName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, userName, businessEmail, pdfData, fileName }: CanvasEmailRequest = await req.json();

    console.log("Attempting to send email to:", ["hello@krishraja.com", "krish@fractionl.ai"]);
    
    const baseEmailData = {
      from: "AI Canvas <onboarding@resend.dev>",
      subject: `${businessName} - AI Workshop for Teams`,
      html: `
        <h2>New AI Canvas Download</h2>
        <p>A new AI Transformation Canvas has been downloaded.</p>
        
        <h3>Contact Details:</h3>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${businessEmail}</p>
        <p><strong>Business:</strong> ${businessName}</p>
        
        <br>
        <p>This email was sent automatically when the user downloaded their AI Transformation Canvas PDF.</p>
      `,
    };

    // Add PDF attachment if provided
    if (pdfData && fileName) {
      baseEmailData.attachments = [{
        filename: fileName,
        content: pdfData,
        type: 'application/pdf',
      }];
    }

    // Send to first email
    const emailResponse1 = await resend.emails.send({
      ...baseEmailData,
      to: ["hello@krishraja.com"]
    });
    
    console.log("Email 1 response (hello@krishraja.com):", emailResponse1);

    // Send to second email
    const emailResponse2 = await resend.emails.send({
      ...baseEmailData,
      to: ["krish@fractionl.ai"]
    });
    
    console.log("Email 2 response (krish@fractionl.ai):", emailResponse2);

    // Check for errors in either response
    if (emailResponse1.error) {
      console.error("Resend API error for hello@krishraja.com:", emailResponse1.error);
    }
    
    if (emailResponse2.error) {
      console.error("Resend API error for krish@fractionl.ai:", emailResponse2.error);
    }

    const emailResponse = {
      data: {
        id: `${emailResponse1.data?.id || 'failed'}, ${emailResponse2.data?.id || 'failed'}`,
        email1: emailResponse1,
        email2: emailResponse2
      },
      error: emailResponse1.error || emailResponse2.error || null
    };

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-canvas-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);