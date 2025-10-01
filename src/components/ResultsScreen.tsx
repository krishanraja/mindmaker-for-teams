import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Calendar,
  ArrowLeft,
  Brain,
  Sparkles
} from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import { ResultsInsights } from './ResultsInsights';
import { AIModuleRecommendations } from './AIModuleRecommendations';
import { supabase } from '../integrations/supabase/client';

export const ResultsScreen: React.FC = () => {
  const { state, resetMindmaker } = useMindmaker();
  const { discoveryData } = state;

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
            
            // Lead Qualification Data
            authorityLevel: discoveryData.authorityLevel,
            implementationTimeline: discoveryData.implementationTimeline,
            leadScore: discoveryData.leadScore,
            qualificationTier: discoveryData.qualificationTier,
            emailDomainType: discoveryData.emailDomainType,
            
            // Assessment Results
            aiInsights: discoveryData.aiInsights
          }
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
    
    // Always open Calendly regardless of email success/failure
    window.open('https://calendly.com/krish-raja/mindmaker-teams', '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-width py-4 sm:py-6 md:py-12 px-4 sm:px-6 md:px-0">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
          {/* Header - More compact on mobile */}
          <div className="text-center space-y-2 sm:space-y-3 md:space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 border-2 border-primary/20 mb-2 sm:mb-4">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {discoveryData.businessName}
            </h1>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs sm:text-sm">
              <Brain className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Analysis Complete
            </Badge>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Your personalized AI literacy roadmap
            </p>
          </div>

          {/* Team Category Result - More compact on mobile */}
          <Card className="glass-card bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
            <div className="p-4 sm:p-6 md:p-8 text-center space-y-1 sm:space-y-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                {discoveryData.aiInsights?.category || 'AI-Curious Team'}
              </h2>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground">
                {discoveryData.aiInsights?.description || 'Promising experiments—but no tie to growth yet.'}
              </p>
              <div className="pt-2 sm:pt-4">
                <div className="inline-flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold">Score:</span>
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    {discoveryData.aiInsights?.readinessScore || 0}/6
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* AI-Powered Insights */}
          {discoveryData.aiInsights && (
            <ResultsInsights insights={discoveryData.aiInsights} />
          )}

          {/* Module Recommendations */}
          {discoveryData.aiInsights?.recommendedModules && 
           discoveryData.aiInsights.recommendedModules.length > 0 && (
            <AIModuleRecommendations 
              modules={discoveryData.aiInsights.recommendedModules}
              onBookSession={handleScheduleConsultation}
            />
          )}

          {/* CTA Section (if no modules available, show basic CTA) */}
          {(!discoveryData.aiInsights?.recommendedModules || 
            discoveryData.aiInsights.recommendedModules.length === 0) && (
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
              
              <p className="text-xs text-center text-muted-foreground px-4 mt-3">
                By booking a session, you consent to receiving tailored AI growth insights from Krish Raja at Fractionl.ai
              </p>
            </div>
          )}

          {/* Trust & Social Proof - Compact on mobile */}
          <Card className="glass-card bg-gradient-to-r from-muted/30 to-muted/10">
            <div className="p-3 sm:p-4 md:p-6 text-center">
              <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-4">Join leaders who've transformed their teams</h4>
              <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm">
                <div>
                  <div className="flex justify-center mb-0.5 sm:mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="text-base sm:text-xl md:text-2xl text-yellow-500">★</div>
                    ))}
                  </div>
                  <div className="text-muted-foreground">Sessions</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">200+</div>
                  <div className="text-muted-foreground">Transformed</div>
                </div>
                <div>
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-primary">90d</div>
                  <div className="text-muted-foreground">Impact</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer Action - Compact on mobile */}
          <div className="text-center pt-4 sm:pt-6 md:pt-8">
            <button 
              onClick={resetMindmaker}
              className="btn-ghost text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm sm:text-base"
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