import { MindmakerData, AppState } from '../types/canvas';
import { supabase } from '../integrations/supabase/client';

export interface LeadScore {
  totalScore: number;
  qualityTier: 'hot' | 'warm' | 'cold' | 'disqualified';
  businessReadiness: number;
  engagementScore: number;
  contactQuality: number;
  painPointSeverity: number;
  urgencyScore: number;
}

export interface LeadData {
  mindmakerData: MindmakerData;
  stepProgress: Record<number, any>;
  engagementMetrics: {
    stepsCompleted: number;
    totalSteps: number;
    timeSpent: number;
    pdfGenerated: boolean;
    summaryViewed: boolean;
  };
  leadScore: LeadScore;
}

/**
 * Calculates lead score based on business data and engagement
 * This runs completely silently with no user awareness
 */
export const calculateLeadScore = (data: MindmakerData, stepProgress: Record<number, any>, engagementMetrics: any): LeadScore => {
  let businessReadiness = 0;
  let engagementScore = 0;
  let contactQuality = 0;
  let painPointSeverity = 0;
  let urgencyScore = 0;

  // Business Readiness Scoring (0-30 points)
  if (data.employeeCount >= 50) businessReadiness += 10;
  if (data.employeeCount >= 200) businessReadiness += 5;
  if (data.employeeCount >= 1000) businessReadiness += 5;
  
  if (data.aiAdoption === 'pilots') businessReadiness += 5;
  if (data.aiAdoption === 'team-level') businessReadiness += 8;
  if (data.aiAdoption === 'enterprise-wide') businessReadiness += 10;
  
  if (data.businessFunctions.length >= 3) businessReadiness += 5;
  if (data.businessFunctions.includes('Strategy & Leadership')) businessReadiness += 5;

  // Engagement Score (0-25 points)
  const completionRate = engagementMetrics.stepsCompleted / engagementMetrics.totalSteps;
  engagementScore += Math.floor(completionRate * 15);
  
  if (engagementMetrics.pdfGenerated) engagementScore += 10;
  if (engagementMetrics.summaryViewed) engagementScore += 5;
  if (engagementMetrics.timeSpent > 900) engagementScore += 5; // 15+ minutes

  // Contact Quality (0-20 points)
  if (data.businessEmail && data.businessEmail.includes('@')) {
    contactQuality += 5;
    // Business domain check (not gmail, yahoo, etc.)
    const domain = data.businessEmail.split('@')[1]?.toLowerCase();
    if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'].includes(domain)) {
      contactQuality += 10;
    }
  }
  if (data.userName && data.userName.length > 3) contactQuality += 3;
  if (data.businessUrl && data.businessUrl.includes('http')) contactQuality += 2;

  // Pain Point Severity (0-15 points)
  const avgAnxiety = Object.values(data.anxietyLevels).reduce((sum, level) => sum + level, 0) / 5;
  if (avgAnxiety > 70) painPointSeverity += 15;
  else if (avgAnxiety > 50) painPointSeverity += 10;
  else if (avgAnxiety > 30) painPointSeverity += 5;

  if (data.automationRisks.length >= 3) painPointSeverity += 5;

  // Urgency Score (0-10 points)
  if (data.successTargets.length >= 3) urgencyScore += 5;
  if (data.successTargets.some(target => target.includes('months') || target.includes('quarter'))) {
    urgencyScore += 5;
  }

  const totalScore = businessReadiness + engagementScore + contactQuality + painPointSeverity + urgencyScore;

  let qualityTier: 'hot' | 'warm' | 'cold' | 'disqualified' = 'disqualified';
  if (totalScore >= 80) qualityTier = 'hot';
  else if (totalScore >= 60) qualityTier = 'warm';
  else if (totalScore >= 40) qualityTier = 'cold';

  return {
    totalScore,
    qualityTier,
    businessReadiness,
    engagementScore,
    contactQuality,
    painPointSeverity,
    urgencyScore
  };
};

/**
 * Determines if a lead should be synced to Google Sheets
 * Only sync qualified leads to avoid spam
 */
export const shouldSyncLead = (leadScore: LeadScore, engagementMetrics: any): boolean => {
  // Always sync hot leads
  if (leadScore.qualityTier === 'hot') return true;
  
  // Sync warm leads if they've shown high engagement
  if (leadScore.qualityTier === 'warm' && (engagementMetrics.pdfGenerated || engagementMetrics.stepsCompleted >= 6)) {
    return true;
  }
  
  // Sync cold leads only if they completed the entire flow
  if (leadScore.qualityTier === 'cold' && engagementMetrics.stepsCompleted >= 7 && engagementMetrics.pdfGenerated) {
    return true;
  }
  
  return false;
};

/**
 * Silently sync lead data to Google Sheets
 * This happens completely in the background with no user interaction
 */
export const syncLeadToSheets = async (leadData: LeadData): Promise<boolean> => {
  try {
    // Prepare comprehensive lead data for Google Sheets
    const sheetData = {
      timestamp: new Date().toISOString(),
      businessName: leadData.mindmakerData.businessName || 'Unknown',
      contactName: leadData.mindmakerData.userName || 'Unknown',
      email: leadData.mindmakerData.businessEmail || 'Unknown',
      country: leadData.mindmakerData.country || 'Unknown',
      website: leadData.mindmakerData.businessUrl || '',
      
      // Business Context
      employeeCount: leadData.mindmakerData.employeeCount,
      company: leadData.mindmakerData.company || '',
      businessDescription: leadData.mindmakerData.businessDescription || '',
      businessFunctions: leadData.mindmakerData.businessFunctions.join('; '),
      aiAdoption: leadData.mindmakerData.aiAdoption,
      
      // Pain Points & Needs
      avgAnxietyLevel: Math.round(Object.values(leadData.mindmakerData.anxietyLevels).reduce((sum, level) => sum + level, 0) / 5),
      aiSkills: leadData.mindmakerData.aiSkills.join('; '),
      automationRisks: leadData.mindmakerData.automationRisks.join('; '),
      successTargets: leadData.mindmakerData.successTargets.join('; '),
      changeNarrative: leadData.mindmakerData.changeNarrative || '',
      learningModality: leadData.mindmakerData.learningModality,
      
      // Lead Scoring
      totalScore: leadData.leadScore.totalScore,
      qualityTier: leadData.leadScore.qualityTier,
      businessReadiness: leadData.leadScore.businessReadiness,
      engagementScore: leadData.leadScore.engagementScore,
      contactQuality: leadData.leadScore.contactQuality,
      painPointSeverity: leadData.leadScore.painPointSeverity,
      urgencyScore: leadData.leadScore.urgencyScore,
      
      // Engagement Metrics
      stepsCompleted: leadData.engagementMetrics.stepsCompleted,
      pdfGenerated: leadData.engagementMetrics.pdfGenerated,
      summaryViewed: leadData.engagementMetrics.summaryViewed,
      timeSpent: Math.round(leadData.engagementMetrics.timeSpent / 60), // Convert to minutes
      
      // Source
      source: 'AI Transformation Mindmaker',
      leadType: 'mindmaker_completion'
    };

    // Call our existing Google Sheets sync function
    const { error } = await supabase.functions.invoke('sync-to-google-sheets', {
      body: {
        syncType: 'lead_capture',
        leadData: sheetData,
        priority: leadData.leadScore.qualityTier === 'hot' ? 'high' : 'normal'
      }
    });

    if (error) {
      console.error('Silent lead sync failed:', error);
      return false;
    }

    // Log successful sync (for debugging, not visible to user)
    console.log(`Lead silently synced - ${leadData.leadScore.qualityTier} quality (Score: ${leadData.leadScore.totalScore})`);
    return true;

  } catch (error) {
    console.error('Silent lead sync error:', error);
    return false;
  }
};

/**
 * Track engagement events silently
 * Called throughout the user journey without their knowledge
 */
export const trackEngagementEvent = (eventType: string, data?: any) => {
  try {
    const existingTracking = JSON.parse(localStorage.getItem('fractionl-engagement-tracking') || '{}');
    const sessionStart = existingTracking.sessionStart || Date.now();
    
    const trackingData = {
      ...existingTracking,
      sessionStart,
      lastActivity: Date.now(),
      events: [
        ...(existingTracking.events || []),
        {
          type: eventType,
          timestamp: Date.now(),
          data: data || {}
        }
      ]
    };
    
    localStorage.setItem('fractionl-engagement-tracking', JSON.stringify(trackingData));
  } catch (error) {
    // Silent failure - don't interrupt user experience
    console.error('Engagement tracking error:', error);
  }
};

/**
 * Get engagement metrics for scoring
 */
export const getEngagementMetrics = (stepProgress: Record<number, any>) => {
  try {
    const tracking = JSON.parse(localStorage.getItem('fractionl-engagement-tracking') || '{}');
    const sessionStart = tracking.sessionStart || Date.now();
    const timeSpent = Date.now() - sessionStart;
    
    const stepsCompleted = Object.keys(stepProgress).filter(step => 
      stepProgress[parseInt(step)]?.completed
    ).length;
    
    const pdfGenerated = tracking.events?.some((event: any) => event.type === 'pdf_generated') || false;
    const summaryViewed = tracking.events?.some((event: any) => event.type === 'summary_viewed') || false;
    
    return {
      stepsCompleted,
      totalSteps: 8,
      timeSpent: Math.max(timeSpent, 0),
      pdfGenerated,
      summaryViewed
    };
  } catch (error) {
    return {
      stepsCompleted: 0,
      totalSteps: 8,
      timeSpent: 0,
      pdfGenerated: false,
      summaryViewed: false
    };
  }
};