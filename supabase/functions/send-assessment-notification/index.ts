import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

// Edge function for sending AI assessment notifications
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
    
    // AI Revenue Impact Assessment Data (6 new questions)
    aiUsagePercentage: string;
    growthUseCases: string;
    messagingAdaptation: string;
    revenueKPIs: string;
    powerUsers: string;
    teamRecognition: string;
    
    // AI Generated Insights
    aiInsights?: {
      readinessScore: number;
      category: string;
      description: string;
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
      subject: `🚀 AI Revenue Impact Pulse - ${assessmentData.businessName} (${assessmentData.aiInsights?.category || 'Assessment Complete'})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 2px solid #e5e7eb;">
              <h1 style="color: #1f2937; margin: 0; font-size: 28px;">🚀 AI Revenue Impact Pulse</h1>
              <p style="color: #6b7280; margin: 8px 0 0 0; font-size: 16px;">Strategic AI readiness assessment for revenue acceleration</p>
            </div>

            <!-- Contact Information -->
            <div style="margin-bottom: 32px; background: #f3f4f6; padding: 24px; border-radius: 8px;">
              <h2 style="color: #374151; margin-top: 0; font-size: 20px; margin-bottom: 16px;">📋 Leadership Contact</h2>
              <div style="display: grid; gap: 8px;">
                <p style="margin: 0;"><strong>Name:</strong> ${assessmentData.contactName}</p>
                <p style="margin: 0;"><strong>Email:</strong> <a href="mailto:${assessmentData.contactEmail}" style="color: #3b82f6;">${assessmentData.contactEmail}</a></p>
                <p style="margin: 0;"><strong>Company:</strong> ${assessmentData.businessName}</p>
              </div>
            </div>

            <!-- AI Revenue Impact Score -->
            <div style="margin-bottom: 32px; background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 24px; border-radius: 8px; text-align: center;">
              <h2 style="color: #1e40af; margin-top: 0; font-size: 20px;">💰 AI Revenue Impact Assessment</h2>
              <div style="font-size: 48px; font-weight: bold; color: #1e40af; margin: 16px 0;">${assessmentData.aiInsights?.readinessScore || 0}/6</div>
              <div style="font-size: 24px; font-weight: bold; color: #1e40af; margin: 8px 0;">${assessmentData.aiInsights?.category || 'Assessment Complete'}</div>
              <p style="color: #1e40af; margin: 0; font-size: 16px;">${assessmentData.aiInsights?.description || 'Strategic AI readiness assessment completed'}</p>
            </div>

            <!-- Revenue Impact Analysis -->
            <div style="margin-bottom: 32px;">
              <h2 style="color: #374151; margin-top: 0; font-size: 20px; margin-bottom: 16px;">📈 Revenue Impact Analysis</h2>
              
              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Team AI Adoption Rate:</h3>
                <p style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
                  <strong>${assessmentData.aiUsagePercentage}</strong> of team uses AI weekly
                  <br><span style="color: #6b7280; font-size: 14px;">
                    ${assessmentData.aiUsagePercentage === '>50%' ? 'Strong adoption indicates good change management and AI literacy foundation.' :
                      assessmentData.aiUsagePercentage === '25–50%' ? 'Moderate adoption showing promising early momentum.' :
                      assessmentData.aiUsagePercentage === '<25%' ? 'Early adoption phase with significant growth potential.' :
                      'Opportunity to introduce AI literacy and overcome initial resistance.'}
                  </span>
                </p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Growth-Oriented AI Use Cases:</h3>
                <p style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
                  <strong>${assessmentData.growthUseCases}</strong> - Has growth-oriented AI use cases (faster GTM, pipeline acceleration)
                  <br><span style="color: #6b7280; font-size: 14px;">
                    ${assessmentData.growthUseCases === 'Yes' ? 'Team is already connecting AI to revenue acceleration opportunities.' :
                      'Opportunity to develop strategic AI applications beyond operational efficiency.'}
                  </span>
                </p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Market Responsiveness Capability:</h3>
                <p style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
                  <strong>${assessmentData.messagingAdaptation}</strong> - Can adapt positioning/messaging faster using AI outputs
                  <br><span style="color: #6b7280; font-size: 14px;">
                    ${assessmentData.messagingAdaptation === 'Yes' ? 'Team demonstrates strategic AI application for competitive advantage.' :
                      'Opportunity to leverage AI for agile market positioning and competitive responsiveness.'}
                  </span>
                </p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Business Impact Measurement:</h3>
                <p style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
                  <strong>${assessmentData.revenueKPIs}</strong> - AI experiments linked to revenue KPIs
                  <br><span style="color: #6b7280; font-size: 14px;">
                    ${assessmentData.revenueKPIs === 'Yes' ? 'Strong business discipline in measuring AI ROI and revenue impact.' :
                      'Critical opportunity to establish metrics connecting AI initiatives to business outcomes.'}
                  </span>
                </p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Internal Champions & Scaling:</h3>
                <p style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
                  <strong>${assessmentData.powerUsers}</strong> - Has emerging "power users" who drive business wins
                  <br><span style="color: #6b7280; font-size: 14px;">
                    ${assessmentData.powerUsers === 'Yes' ? 'Internal champions are accelerating adoption and demonstrating value.' :
                      'Opportunity to identify and develop AI power users who can lead internal transformation.'}
                  </span>
                </p>
              </div>

              <div style="margin-bottom: 20px;">
                <h3 style="color: #4b5563; margin: 0 0 8px 0; font-size: 16px;">Organizational Value Recognition:</h3>
                <p style="margin: 0; padding: 12px; background: #f9fafb; border-radius: 6px;">
                  <strong>${assessmentData.teamRecognition}</strong> - Team recognized internally as growth drivers because of AI
                  <br><span style="color: #6b7280; font-size: 14px;">
                    ${assessmentData.teamRecognition === 'Yes' ? 'Team has achieved strategic recognition as AI-enabled growth leaders.' :
                      'Opportunity to position the team as organizational AI and growth champions.'}
                  </span>
                </p>
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

            <!-- Strategic Recommendations -->
            <div style="background: #1f2937; color: white; padding: 24px; border-radius: 8px; text-align: center;">
              <h2 style="color: white; margin-top: 0; font-size: 20px; margin-bottom: 16px;">🚀 Strategic Recommendations</h2>
              <p style="margin: 0 0 16px 0; color: #d1d5db;">Based on ${assessmentData.aiInsights?.category || 'their assessment'}, here are the recommended next steps:</p>
              
              ${(() => {
                const score = assessmentData.aiInsights?.readinessScore || 0;
                if (score <= 2) {
                  return `<div style="background: #dc2626; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                    <h3 style="color: white; margin: 0 0 8px 0;">Priority: AI Literacy Foundation</h3>
                    <p style="color: #fecaca; margin: 0; font-size: 14px;">Focus on basic AI literacy and connecting tools to business outcomes</p>
                  </div>
                  <ul style="text-align: left; margin: 0; padding-left: 20px; color: #d1d5db;">
                    <li>Start with AI Literacy Bootcamp to build foundational understanding</li>
                    <li>Implement outcome-oriented AI pilot programs</li>
                    <li>Establish basic AI governance and experimentation frameworks</li>
                    <li>Identify and develop initial AI champions within the team</li>
                  </ul>`;
                } else if (score <= 4) {
                  return `<div style="background: #f59e0b; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                    <h3 style="color: white; margin: 0 0 8px 0;">Priority: Scale & Measurement</h3>
                    <p style="color: #fed7aa; margin: 0; font-size: 14px;">Build on existing experiments with structured growth focus</p>
                  </div>
                  <ul style="text-align: left; margin: 0; padding-left: 20px; color: #d1d5db;">
                    <li>Implement revenue KPI tracking for AI initiatives</li>
                    <li>Scale successful experiments across the organization</li>
                    <li>Advanced AI workshop focusing on growth applications</li>
                    <li>Develop power user program and internal AI community</li>
                  </ul>`;
                } else if (score === 5) {
                  return `<div style="background: #059669; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                    <h3 style="color: white; margin: 0 0 8px 0;">Priority: Strategic Acceleration</h3>
                    <p style="color: #a7f3d0; margin: 0; font-size: 14px;">Optimize and scale proven AI-driven growth strategies</p>
                  </div>
                  <ul style="text-align: left; margin: 0; padding-left: 20px; color: #d1d5db;">
                    <li>Executive AI Strategy Workshop for leadership alignment</li>
                    <li>Advanced automation and agentic workflow implementation</li>
                    <li>Cross-functional AI integration and optimization</li>
                    <li>Thought leadership positioning in AI-driven business growth</li>
                  </ul>`;
                } else {
                  return `<div style="background: #7c3aed; padding: 16px; border-radius: 6px; margin-bottom: 16px;">
                    <h3 style="color: white; margin: 0 0 8px 0;">Priority: Market Leadership</h3>
                    <p style="color: #ddd6fe; margin: 0; font-size: 14px;">Leverage AI leadership for competitive advantage and market expansion</p>
                  </div>
                  <ul style="text-align: left; margin: 0; padding-left: 20px; color: #d1d5db;">
                    <li>AI Innovation Lab and R&D acceleration programs</li>
                    <li>Market expansion strategies powered by AI insights</li>
                    <li>Executive coaching for AI-driven transformation leadership</li>
                    <li>Strategic partnerships and thought leadership opportunities</li>
                  </ul>`;
                }
              })()}
            </div>

            <!-- Footer -->
            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                Generated automatically from AI Revenue Impact Pulse assessment<br>
                Completed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
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