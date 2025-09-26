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
            
            // AI Revenue Impact Assessment
            aiUsagePercentage: discoveryData.aiUsagePercentage,
            growthUseCases: discoveryData.growthUseCases,
            messagingAdaptation: discoveryData.messagingAdaptation,
            revenueKPIs: discoveryData.revenueKPIs,
            powerUsers: discoveryData.powerUsers,
            teamRecognition: discoveryData.teamRecognition,
            
            // Assessment Results
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
              AI Revenue Impact Analysis Complete
            </Badge>
          </div>

          {/* Team Category Result */}
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-primary mb-2">
                {discoveryData.aiInsights?.category || 'AI-Curious Team'}
              </h2>
              <p className="text-xl text-muted-foreground">
                {discoveryData.aiInsights?.description || 'Promising experiments—but no tie to growth yet.'}
              </p>
            </div>
          </div>

          {/* Score Display */}
          <div className="glass-card bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="p-6 text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {discoveryData.aiInsights?.readinessScore || 0}/6
              </div>
              <p className="text-sm text-muted-foreground">AI Revenue Impact Score</p>
            </div>
          </div>


          {/* CTA Section */}
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Ready to turn experiments into revenue?</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Book a Workflow Redesign Jam: from literacy to measurable growth
              </p>
            </div>
            
            <div className="flex justify-center px-4 sm:px-0">
              <button 
                onClick={handleScheduleConsultation}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group min-h-[56px]"
              >
                Book My Session
                <Calendar className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Trust & Social Proof */}
          <div className="glass-card bg-gradient-to-r from-muted/30 to-muted/10">
            <div className="p-6 text-center">
              <h4 className="font-semibold mb-4">Join leaders who've transformed their teams</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-sm">
                <div>
                  <div className="flex justify-center mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="text-2xl text-yellow-500">★</div>
                    ))}
                  </div>
                  <div className="text-muted-foreground">Executive sessions</div>
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
              className="btn-ghost text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};