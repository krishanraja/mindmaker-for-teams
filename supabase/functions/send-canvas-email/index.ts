import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MindmakerEmailRequest {
  businessName: string;
  userName: string;
  businessEmail: string;
  mindmakerData: {
    employeeCount: string;
    businessFunctions: string[];
    aiAdoption: string;
    anxietyLevels: {
      executives: number;
      middleManagement: number;
      frontlineStaff: number;
      techTeam: number;
      nonTechTeam: number;
    };
    aiSkills: string[];
    automationRisks: string[];
    learningModality: string;
    changeNarrative: string;
    successTargets: string[];
  };
  aiRecommendation: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, userName, businessEmail, mindmakerData, aiRecommendation }: MindmakerEmailRequest = await req.json();

    console.log("Attempting to send email to:", ["hello@krishraja.com", "krish@themindmaker.ai"]);
    
    // Calculate average anxiety
    const avgAnxiety = Object.values(mindmakerData.anxietyLevels).reduce((a, b) => a + b, 0) / 5;
    
    const baseEmailData = {
      from: "AI Mindmaker <mindmaker@fractionl.ai>",
      subject: `${businessName} - AI Workshop for Teams`,
      html: `
        <h2>New AI Mindmaker Download</h2>
        <p>A new AI Transformation Mindmaker has been completed.</p>
        
        <h3>Contact Details:</h3>
        <p><strong>Name:</strong> ${userName}</p>
        <p><strong>Email:</strong> ${businessEmail}</p>
        <p><strong>Business:</strong> ${businessName}</p>
        
        <hr>
        
        <h2>AI TRANSFORMATION MINDMAKER</h2>
        
        <h3>ORGANIZATION SNAPSHOT</h3>
        <p><strong>Team Size:</strong> ${mindmakerData.employeeCount} employees</p>
        <p><strong>Functions:</strong> ${mindmakerData.businessFunctions.join(', ')}</p>
        <p><strong>AI Maturity:</strong> ${mindmakerData.aiAdoption}</p>
        
        <h3>ANXIETY LEVELS (Average: ${avgAnxiety.toFixed(1)}%)</h3>
        <p><strong>Executives:</strong> ${mindmakerData.anxietyLevels.executives}%</p>
        <p><strong>Middle Management:</strong> ${mindmakerData.anxietyLevels.middleManagement}%</p>
        <p><strong>Frontline Staff:</strong> ${mindmakerData.anxietyLevels.frontlineStaff}%</p>
        <p><strong>Tech Team:</strong> ${mindmakerData.anxietyLevels.techTeam}%</p>
        <p><strong>Non-Tech Team:</strong> ${mindmakerData.anxietyLevels.nonTechTeam}%</p>
        
        <h3>CAPABILITIES</h3>
        <p><strong>AI Skills:</strong> ${mindmakerData.aiSkills.join(', ')}</p>
        <p><strong>Automation Risks:</strong> ${mindmakerData.automationRisks.join(', ')}</p>
        
        <h3>LEARNING & CHANGE</h3>
        <p><strong>Learning Preference:</strong> ${mindmakerData.learningModality || 'Not specified'}</p>
        <p><strong>Change Experience:</strong> ${mindmakerData.changeNarrative || 'Not provided'}</p>
        
        <h3>SUCCESS TARGETS</h3>
        ${mindmakerData.successTargets.map(target => `<p>• ${target}</p>`).join('')}
        
        <h3>AI RECOMMENDATION</h3>
        <p>${aiRecommendation}</p>
        
        <hr>
        
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
        <p>This email was sent automatically when the user completed their AI Transformation Mindmaker.</p>
      `,
    };

    // Send to first email
    const emailResponse1 = await resend.emails.send({
      ...baseEmailData,
      to: ["hello@krishraja.com"]
    });
    
    console.log("Email 1 response (hello@krishraja.com):", emailResponse1);

    // Send to second email
    const emailResponse2 = await resend.emails.send({
      ...baseEmailData,
      to: ["krish@themindmaker.ai"]
    });
    
    console.log("Email 2 response (krish@themindmaker.ai):", JSON.stringify(emailResponse2, null, 2));

    // Check for errors in either response
    if (emailResponse1.error) {
      console.error("Resend API error for hello@krishraja.com:", emailResponse1.error);
    }
    
    if (emailResponse2.error) {
      console.error("Resend API error for krish@themindmaker.ai:", emailResponse2.error);
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