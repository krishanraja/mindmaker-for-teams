import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssessmentNotificationRequest {
  assessmentData: {
    // Contact Information
    businessName: string;
    contactName: string;
    contactEmail: string;
    contactRole: string;
    
    // Business Details
    industry: string;
    employeeCount: number;
    currentAIUse: string;
    
    // Assessment Inputs
    biggestChallenges: string[];
    leadershipVision: string;
    successMetrics: string[];
    learningPreferences: string[];
    implementationTimeline: string;
    
    // AI Generated Insights
    aiInsights?: {
      readinessScore: number;
      recommendations: string[];
      riskFactors: string[];
      opportunityAreas: string[];
      investmentRange: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentData }: AssessmentNotificationRequest = await req.json();

    console.log("Sending assessment notification to krish@fractionl.ai");
    
    const emailResponse = await resend.emails.send({
      from: "AI Assessment <assessments@fractionl.ai>",
      to: ["krish@fractionl.ai"],
      subject: `🎯 AI Literacy for Teams Inquiry - ${assessmentData.businessName} (${assessmentData.employeeCount} employees)`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb;">
              <h1 style="color: #1f2937; margin: 0; font-size: 28px;">🎯 AI Literacy for Teams Inquiry</h1>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">Corporate workshop assessment completed and strategy call requested</p>
            </div>

            <!-- Contact Information -->
            <div style="margin-bottom: 32px; background: #f3f4f6; padding: 24px; border-radius: 8px;">
              <h2 style="color: #374151; margin-top: 0; font-size: 20px; margin-bottom: 16px;">📋 Contact Information</h2>
              <div style="display: grid; gap: 8px;">
                <p style="margin: 0;"><strong>Name:</strong> ${assessmentData.contactName}</p>
                <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${assessmentData.contactEmail}" style="color: #3b82f6;">${assessmentData.contactEmail}</a></p>
                <p style="margin: 0;"><strong>Role:</strong> ${assessmentData.contactRole}</p>
                <p style="margin: 0;"><strong>Company:</strong> ${assessmentData.businessName}</p>
                <p style="margin: 0;"><strong>Industry:</strong> ${assessmentData.industry}</p>
                <p style="margin: 0;"><strong>Team Size:</strong> ${assessmentData.employeeCount} employees</p>
              </div>
            </div>

            <!-- AI Readiness Score -->
            <div style="margin-bottom: 32px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 24px; border-radius: 8px; text-align: center;">
              <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">🧠 AI Readiness Score</h2>
              <div style="font-size: 48px; font-weight: bold; color: #1e40af; margin: 16px 0;">${assessmentData.aiInsights?.readinessScore || 'N/A'}/100</div>
              <p style="color: #1e40af; margin: 0; font-size: 16px;">
                ${assessmentData.aiInsights?.readinessScore >= 80 ? 'Advanced - Ready for implementation' : 
                  assessmentData.aiInsights?.readinessScore >= 60 ? 'Intermediate - Good foundation' : 
                  assessmentData.aiInsights?.readinessScore >= 40 ? 'Beginner - High potential' :
                  'Early stage - Great opportunity'}
              </p>
            </div>

            <!-- Business Context -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #374151; margin-top: 0; font-size: 20px; margin-bottom: 16px;">🏢 Business Context</h2>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Current AI Use:</h3>
                <p style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">${assessmentData.currentAIUse}</p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Leadership Vision:</h3>
                <p style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">${assessmentData.leadershipVision}</p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Implementation Timeline:</h3>
                <p style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">${assessmentData.implementationTimeline}</p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Biggest Challenges:</h3>
                <ul style="margin: 0; padding: 12px 12px 12px 32px; background: #f9fafb; border-radius: 6px;">
                  ${assessmentData.biggestChallenges.map(challenge => `<li>${challenge}</li>`).join('')}
                </ul>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Success Metrics:</h3>
                <ul style="margin: 0; padding: 12px 12px 12px 32px; background: #f9fafb; border-radius: 6px;">
                  ${assessmentData.successMetrics.map(metric => `<li>${metric}</li>`).join('')}
                </ul>
              </div>

            <div style="margin-bottom: 20px;">
              <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Learning Preferences:</h3>
              <div style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
                ${Array.isArray(assessmentData.learningPreferences) 
                  ? assessmentData.learningPreferences.map(pref => `<li>${pref}</li>`).join('') 
                  : assessmentData.learningPreferences}
              </div>
            </div>
            </div>

            <!-- AI-Generated Insights -->
            ${assessmentData.aiInsights ? `
            <div style="margin-bottom: 32px;">
              <h2 style="color: #374151; margin-top: 0; font-size: 20px; margin-bottom: 16px;">🤖 AI-Generated Strategic Analysis</h2>
              
              <!-- Investment Range -->
              <div style="margin-bottom: 20px; background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); padding: 20px; border-radius: 8px; text-align: center;">
                <h3 style="color: #166534; margin: 0 0 8px 0; font-size: 18px;">💰 Recommended Investment Range</h3>
                <div style="font-size: 32px; font-weight: bold; color: #166534; margin: 8px 0;">${assessmentData.aiInsights.investmentRange}</div>
                <p style="color: #166534; margin: 0; font-size: 14px;">Based on team size and complexity</p>
              </div>

              <!-- Recommendations -->
              <div style="margin-bottom: 20px;">
                <h3 style="color: #059669; margin: 0 0 12px 0; font-size: 16px;">📈 Strategic Recommendations:</h3>
                <ul style="margin: 0; padding: 16px 16px 16px 32px; background: #ecfdf5; border-radius: 6px; border-left: 4px solid #059669;">
                  ${assessmentData.aiInsights.recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
                </ul>
              </div>

              <!-- Risk Factors -->
              <div style="margin-bottom: 20px;">
                <h3 style="color: #d97706; margin: 0 0 12px 0; font-size: 16px;">⚠️ Risk Mitigation Areas:</h3>
                <ul style="margin: 0; padding: 16px 16px 16px 32px; background: #fffbeb; border-radius: 6px; border-left: 4px solid #d97706;">
                  ${assessmentData.aiInsights.riskFactors.map(risk => `<li style="margin-bottom: 8px;">${risk}</li>`).join('')}
                </ul>
              </div>

              <!-- Opportunity Areas -->
              <div style="margin-bottom: 20px;">
                <h3 style="color: #7c3aed; margin: 0 0 12px 0; font-size: 16px;">✨ Key Opportunity Areas:</h3>
                <ul style="margin: 0; padding: 16px 16px 16px 32px; background: #faf5ff; border-radius: 6px; border-left: 4px solid #7c3aed;">
                  ${assessmentData.aiInsights.opportunityAreas.map(opp => `<li style="margin-bottom: 8px;">${opp}</li>`).join('')}
                </ul>
              </div>
            </div>
            ` : ''}

            <!-- Next Steps -->
            <div style="background: #1f2937; color: white; padding: 24px; border-radius: 8px; text-align: center;">
              <h2 style="color: white; margin-top: 0; font-size: 20px; margin-bottom: 16px;">🚀 Next Steps - AI Literacy Workshop</h2>
              <p style="margin: 0 0 16px 0; color: #d1d5db;">The prospect has scheduled a strategy call for AI Literacy for Teams workshop. Here's what to prepare:</p>
              <ul style="text-align: left; margin: 0; padding-left: 20px; color: #d1d5db;">
                <li>Review their industry-specific AI literacy challenges and workshop needs</li>
                <li>Prepare team size-appropriate AI Literacy program recommendations</li>
                <li>Address their specific success metrics and implementation timeline</li>
                <li>Have AI Literacy workshop pricing options ready for ${assessmentData.aiInsights?.investmentRange || 'their team size'}</li>
                <li>Consider executive vs. team-wide workshop formats based on their preferences</li>
              </ul>
            </div>

            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Generated automatically when user clicked "Schedule Strategy Call"<br>
                Assessment completed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
              </p>
            </div>

          </div>
        </div>
      `,
    });

    console.log("Assessment notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailResponse,
      message: "Assessment notification sent successfully" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-assessment-notification function:", error);
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