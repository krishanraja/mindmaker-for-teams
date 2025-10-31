import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SummaryEmailRequest {
  type: 'intake_created' | 'pulse_completed';
  intakeId: string;
  pulseId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, intakeId, pulseId }: SummaryEmailRequest = await req.json();
    
    console.log(`Generating summary email for ${type}, intake: ${intakeId}`);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch intake data
    const { data: intake, error: intakeError } = await supabase
      .from('exec_intakes')
      .select('*')
      .eq('id', intakeId)
      .single();

    if (intakeError || !intake) {
      throw new Error(`Failed to fetch intake: ${intakeError?.message}`);
    }

    // Fetch all pulses for this intake
    const { data: pulses, error: pulsesError } = await supabase
      .from('exec_pulses')
      .select('*')
      .eq('intake_id', intakeId)
      .order('created_at', { ascending: true });

    if (pulsesError) {
      throw new Error(`Failed to fetch pulses: ${pulsesError.message}`);
    }

    const participants = intake.participants || [];
    const completedCount = pulses?.length || 0;
    const totalCount = participants.length;

    // Generate subject line
    let subject = '';
    if (type === 'intake_created') {
      subject = `[NEW INTAKE] ${intake.company_name} - AI Leadership Bootcamp Request`;
    } else {
      subject = `[PULSE COMPLETED] ${intake.company_name} - ${completedCount}/${totalCount} completed`;
    }

    // Build comprehensive email content
    const emailHtml = generateEmailContent(intake, pulses || [], type);

    // Send email to Krish
    const emailResponse = await resend.emails.send({
      from: "Fractionl.ai Executive Bootcamp <onboarding@resend.dev>",
      to: ["krish@fractionl.ai"],
      subject: subject,
      html: emailHtml,
    });

    console.log("Summary email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending summary email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

function generateEmailContent(intake: any, pulses: any[], type: string): string {
  const participants = intake.participants || [];
  const completedCount = pulses.length;
  const totalCount = participants.length;
  
  // Calculate aggregate scores
  let avgAwareness = 0, avgApplication = 0, avgTrust = 0, avgGovernance = 0;
  if (pulses.length > 0) {
    avgAwareness = pulses.reduce((sum, p) => sum + (p.awareness_score || 0), 0) / pulses.length;
    avgApplication = pulses.reduce((sum, p) => sum + (p.application_score || 0), 0) / pulses.length;
    avgTrust = pulses.reduce((sum, p) => sum + (p.trust_score || 0), 0) / pulses.length;
    avgGovernance = pulses.reduce((sum, p) => sum + (p.governance_score || 0), 0) / pulses.length;
  }
  const overallScore = ((avgAwareness + avgApplication + avgTrust + avgGovernance) / 4) * 20;

  let html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
      <div style="background: white; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        
        <h1 style="color: #1f2937; margin-bottom: 24px; font-size: 24px; border-bottom: 3px solid #3b82f6; padding-bottom: 16px;">
          ${type === 'intake_created' ? '🎯 NEW INTAKE RECEIVED' : '✅ PULSE COMPLETED'}
        </h1>

        <!-- ORGANIZER & COMPANY CONTEXT -->
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin-bottom: 24px; border-radius: 4px;">
          <h2 style="color: #1e40af; margin-top: 0; font-size: 18px; margin-bottom: 16px;">📋 ORGANIZER & COMPANY CONTEXT</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600; width: 200px;">Organizer:</td><td style="padding: 8px 0; color: #1f2937;">${intake.organizer_name} (${intake.organizer_email})</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Company:</td><td style="padding: 8px 0; color: #1f2937;">${intake.company_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Industry:</td><td style="padding: 8px 0; color: #1f2937;">${intake.industry || 'Not specified'}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Participants:</td><td style="padding: 8px 0; color: #1f2937;"><strong>${totalCount}</strong> executives</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Status:</td><td style="padding: 8px 0; color: #1f2937;"><strong>${completedCount}/${totalCount}</strong> pulses completed</td></tr>
          </table>
        </div>

        <!-- STRATEGIC OBJECTIVES -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px;">🎯 Strategic Objectives 2026</h3>
          <p style="color: #4b5563; line-height: 1.6; background: #f3f4f6; padding: 16px; border-radius: 4px; margin: 0;">${intake.strategic_objectives || 'Not provided'}</p>
        </div>

        <!-- ANTICIPATED BOTTLENECKS -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px;">⚠️ Anticipated Bottlenecks</h3>
          <ul style="color: #4b5563; line-height: 1.6; background: #fef3c7; padding: 16px 16px 16px 36px; border-radius: 4px; margin: 0;">
            ${intake.anticipated_bottlenecks?.map((b: string) => `<li style="margin-bottom: 8px;">${b}</li>`).join('') || '<li>None specified</li>'}
          </ul>
        </div>

        <!-- PREFERRED DATES -->
        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px;">📅 Preferred Session Dates</h3>
          <ul style="color: #4b5563; line-height: 1.6; background: #f3f4f6; padding: 16px 16px 16px 36px; border-radius: 4px; margin: 0;">
            ${intake.preferred_dates?.map((d: string) => `<li style="margin-bottom: 8px;">${new Date(d).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>`).join('') || '<li>Not specified</li>'}
          </ul>
          ${intake.scheduling_constraints ? `<p style="color: #6b7280; margin-top: 12px; font-style: italic;"><strong>Scheduling Notes:</strong> ${intake.scheduling_constraints}</p>` : ''}
        </div>

        <!-- PARTICIPANTS LIST -->
        <div style="margin-bottom: 32px;">
          <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">👥 PARTICIPANTS LIST</h2>
          <table style="width: 100%; border-collapse: collapse;">
            ${participants.map((p: any, idx: number) => {
              const hasPulse = pulses.some(pulse => pulse.participant_email === p.email);
              return `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  <td style="padding: 12px 8px; color: #6b7280; font-weight: 600;">${idx + 1}.</td>
                  <td style="padding: 12px 8px; color: #1f2937;">${p.name}</td>
                  <td style="padding: 12px 8px; color: #6b7280;">${p.role}</td>
                  <td style="padding: 12px 8px; color: #6b7280; font-size: 14px;">${p.email}</td>
                  <td style="padding: 12px 8px; text-align: right;">
                    ${hasPulse 
                      ? '<span style="background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">✓ COMPLETED</span>' 
                      : '<span style="background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">⏳ PENDING</span>'}
                  </td>
                </tr>
              `;
            }).join('')}
          </table>
        </div>
  `;

  // Add pulse details if any exist
  if (pulses.length > 0) {
    html += `
        <!-- PULSE RESPONSES -->
        <div style="margin-bottom: 32px;">
          <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">📊 PULSE RESPONSES</h2>
    `;

    pulses.forEach((pulse, idx) => {
      const participant = participants.find((p: any) => p.email === pulse.participant_email);
      const totalScore = ((pulse.awareness_score + pulse.application_score + pulse.trust_score + pulse.governance_score) / 4) * 20;
      
      html += `
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin-top: 0; margin-bottom: 16px;">
              ${idx + 1}. ${participant?.name || 'Unknown'} - ${participant?.role || 'Unknown Role'}
            </h3>
            
            <div style="background: white; padding: 16px; border-radius: 4px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 600;">Awareness:</span>
                <span style="color: #3b82f6; font-weight: bold;">${pulse.awareness_score.toFixed(1)}/5</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 600;">Application:</span>
                <span style="color: #10b981; font-weight: bold;">${pulse.application_score.toFixed(1)}/5</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                <span style="color: #6b7280; font-weight: 600;">Trust:</span>
                <span style="color: #f59e0b; font-weight: bold;">${pulse.trust_score.toFixed(1)}/5</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                <span style="color: #6b7280; font-weight: 600;">Governance:</span>
                <span style="color: #8b5cf6; font-weight: bold;">${pulse.governance_score.toFixed(1)}/5</span>
              </div>
              <div style="border-top: 2px solid #e5e7eb; padding-top: 12px; display: flex; justify-content: space-between;">
                <span style="color: #1f2937; font-weight: 700; font-size: 16px;">Overall AI Readiness:</span>
                <span style="color: #1f2937; font-weight: 700; font-size: 16px;">${totalScore.toFixed(0)}/100</span>
              </div>
            </div>

            <details style="cursor: pointer;">
              <summary style="color: #3b82f6; font-weight: 600; margin-bottom: 12px;">View detailed responses</summary>
              <div style="background: white; padding: 16px; border-radius: 4px; margin-top: 12px; font-size: 14px;">
                <pre style="white-space: pre-wrap; word-wrap: break-word; color: #4b5563; margin: 0;">${JSON.stringify(pulse.responses, null, 2)}</pre>
              </div>
            </details>
          </div>
      `;
    });

    html += `</div>`;

    // Add aggregate insights
    html += `
        <!-- AGGREGATE TEAM INSIGHTS -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
          <h2 style="color: white; margin-top: 0; margin-bottom: 20px; font-size: 18px;">🎯 AGGREGATE TEAM INSIGHTS</h2>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
            <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 4px;">
              <div style="font-size: 32px; font-weight: bold; margin-bottom: 4px;">${completedCount}/${totalCount}</div>
              <div style="opacity: 0.9;">Pulses Completed</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 4px;">
              <div style="font-size: 32px; font-weight: bold; margin-bottom: 4px;">${overallScore.toFixed(0)}%</div>
              <div style="opacity: 0.9;">Team AI Readiness</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 4px;">
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">${avgAwareness.toFixed(1)}/5</div>
              <div style="opacity: 0.9;">Avg Awareness</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 4px;">
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">${avgApplication.toFixed(1)}/5</div>
              <div style="opacity: 0.9;">Avg Application</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 4px;">
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">${avgTrust.toFixed(1)}/5</div>
              <div style="opacity: 0.9;">Avg Trust</div>
            </div>
            <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 4px;">
              <div style="font-size: 24px; font-weight: bold; margin-bottom: 4px;">${avgGovernance.toFixed(1)}/5</div>
              <div style="opacity: 0.9;">Avg Governance</div>
            </div>
          </div>
        </div>
    `;
  }

  // LLM CONTEXT JSON
  const llmContext = {
    intake: intake,
    pulses: pulses,
    aggregateScores: {
      completedCount,
      totalCount,
      avgAwareness,
      avgApplication,
      avgTrust,
      avgGovernance,
      overallScore
    }
  };

  html += `
        <!-- LLM CONTEXT -->
        <div style="margin-bottom: 24px;">
          <h2 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">🤖 LLM CONTEXT (JSON)</h2>
          <p style="color: #6b7280; margin-bottom: 12px; font-size: 14px;">Copy the JSON below and paste directly into any LLM for instant context:</p>
          <div style="background: #1f2937; color: #10b981; padding: 20px; border-radius: 8px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 12px;">
            <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${JSON.stringify(llmContext, null, 2)}</pre>
          </div>
        </div>

      </div>
    </div>
  `;

  return html;
}

serve(handler);
