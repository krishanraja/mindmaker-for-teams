import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Calendar,
  ArrowLeft,
  Brain
} from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import { SwipeableResultsCards } from './SwipeableResultsCards';
import { RecommendedModules } from './RecommendedModules';
import { supabase } from '../integrations/supabase/client';

export const ResultsScreen: React.FC = () => {
  const { state, resetMindmaker } = useMindmaker();
  const { discoveryData } = state;

  const getReadinessScore = () => {
    return discoveryData.aiInsights?.readinessScore || 65;
  };

  const getInvestmentRange = () => {
    return discoveryData.aiInsights?.investmentRange || '$25k-$45k';
  };

  const getRecommendedProgram = () => {
    const size = discoveryData.employeeCount;
    const urgency = discoveryData.implementationTimeline;
    
    if (size <= 50 && urgency?.includes('ASAP')) {
      return 'Executive Sprint + Intensive Bootcamp';
    } else if (size > 200) {
      return 'Enterprise AI Transformation Program';
    } else {
      return 'AI Literacy & Confidence Bootcamp';
    }
  };

  const handleScheduleConsultation = async () => {
    try {
      // Send comprehensive assessment notification to krish@fractionl.ai
      const { error } = await supabase.functions.invoke('send-assessment-notification', {
        body: {
          assessmentData: {
            // Contact Information
            businessName: discoveryData.businessName,
            contactName: discoveryData.contactName,
            contactEmail: discoveryData.contactEmail,
            contactRole: discoveryData.contactRole,
            
            // Business Details
            industry: discoveryData.industry,
            employeeCount: discoveryData.employeeCount,
            currentAIUse: discoveryData.currentAIUse,
            
            // Assessment Inputs
            biggestChallenges: discoveryData.biggestChallenges || [],
            leadershipVision: discoveryData.leadershipVision,
            successMetrics: discoveryData.successMetrics || [],
            learningPreferences: discoveryData.learningPreferences || [],
            implementationTimeline: discoveryData.implementationTimeline,
            
            // AI Generated Insights
            aiInsights: discoveryData.aiInsights
          }
        }
      });

      if (error) {
        // Silently log error without exposing to user
      }
    } catch (error) {
      // Silently handle error
    }
    
    // Always open Calendly regardless of email success/failure
    window.open('https://calendly.com/krish-raja/mindmaker-teams', '_blank');
  };


  const readinessScore = getReadinessScore();
  const investmentRange = getInvestmentRange();
  const recommendedProgram = getRecommendedProgram();

  return (
    <div className="min-h-screen bg-background">

      <div className="container-width py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-0">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header */}
          <div className="text-center space-y-2 px-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {discoveryData.businessName}
            </h1>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
              <Brain className="w-3 h-3 mr-1" />
              AI Analysis Complete
            </Badge>
          </div>

          {/* Key Insights - Swipeable Cards */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">Your AI Readiness Profile</h2>
            <SwipeableResultsCards />
          </div>

          {/* Recommended AI Literacy Modules */}
          <RecommendedModules />


          {/* CTA Button */}
          <div className="flex justify-center px-4 sm:px-0">
            <button 
              onClick={handleScheduleConsultation}
              className="btn-hero-primary text-base sm:text-lg px-6 sm:px-8 py-4 group touch-target-lg"
            >
              Schedule Strategy Call
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust & Social Proof */}
          <div className="glass-card bg-gradient-to-r from-muted/30 to-muted/10">
            <div className="p-6 text-center">
              <h4 className="font-semibold mb-4">Join leaders who've transformed their teams</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
                <div>
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-muted-foreground">Executives trained</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-muted-foreground">Confidence increase</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">30 days</div>
                  <div className="text-muted-foreground">To see results</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="text-center pt-8">
            <button 
              onClick={resetMindmaker}
              className="btn-ghost text-muted-foreground hover:text-foreground px-6 whitespace-nowrap"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};