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

    const emailData: any = {
      from: "AI Canvas <onboarding@resend.dev>",
      to: ["hello@krishraja.com", "krish@fractionl.ai"],  // Send to both addresses
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
      emailData.attachments = [{
        filename: fileName,
        content: pdfData,
        type: 'application/pdf',
      }];
    }

    const emailResponse = await resend.emails.send(emailData);

    console.log("Canvas email sent successfully:", emailResponse);
    
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message || emailResponse.error}`);
    }

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