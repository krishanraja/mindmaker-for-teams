import React, { useState } from 'react';
import { ArrowLeft, Calendar, CheckCircle, Sparkles, Users, Brain, Target } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMindmaker } from '@/contexts/MindmakerContext';
import { ConversationalInterface } from './ConversationalInterface';

export const AITransformationFlow: React.FC = () => {
  const { state, setCurrentStep, resetMindmaker } = useMindmaker();
  const [showBookingOptions, setShowBookingOptions] = useState(false);
  const { mindmakerData } = state;

  const handleBackToStart = () => {
    resetMindmaker();
    setCurrentStep(1);
  };

  const handleBookWorkshop = () => {
    setShowBookingOptions(true);
  };

  const handleScheduleCall = () => {
    // Open Calendly or booking system
    window.open('https://calendly.com/fractionl-ai/consultation', '_blank');
  };

  const handleDownloadRoadmap = () => {
    // Generate and download roadmap (replaces PDF)
    const roadmapData = {
      businessName: mindmakerData.businessName,
      insights: [
        `Primary AI opportunities in ${mindmakerData.businessFunctions.join(', ')}`,
        `Team readiness: ${calculateTeamReadiness()}% confidence level`,
        `Recommended learning approach: ${formatLearningModality(mindmakerData.learningModality)}`,
        `Success targets: ${mindmakerData.successTargets.join(', ')}`
      ],
      nextSteps: [
        'Schedule workshop consultation',
        'Define AI implementation roadmap', 
        'Begin team literacy program',
        'Implement pilot AI initiatives'
      ]
    };

    const blob = new Blob([JSON.stringify(roadmapData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-transformation-roadmap-${mindmakerData.businessName || 'company'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateTeamReadiness = () => {
    const avgAnxiety = Object.values(mindmakerData.anxietyLevels).reduce((a, b) => a + b, 0) / 5;
    return Math.round(100 - avgAnxiety);
  };

  const formatLearningModality = (modality: string) => {
    const modalityMap: Record<string, string> = {
      'live-cohort': 'Live Workshop Sessions',
      'self-paced': 'Self-Paced Learning',
      'coaching': 'One-on-One Coaching',
      'chatbot': 'AI-Guided Learning',
      'blended': 'Blended Approach'
    };
    return modalityMap[modality] || modality;
  };

  if (state.currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-100 via-background to-accent-400/10">
        {/* Navigation Header */}
        <nav className="glass-nav sticky top-0 z-50 border-b border-white/20">
          <div className="container-width">
            <div className="flex items-center justify-between h-16">
              <Button
                variant="ghost"
                onClick={handleBackToStart}
                className="text-foreground hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Start Over
              </Button>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground">AI Discovery Complete</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="section-padding">
          <div className="container-width">
            <div className="text-center mb-12 space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="w-4 h-4" />
                Discovery Complete
              </div>
              
              <h1 className="hero-title font-bold text-foreground">
                Your AI Transformation Roadmap
              </h1>
              
              <p className="section-header text-muted-foreground max-w-3xl mx-auto">
                Based on our conversation about <strong className="text-foreground">{mindmakerData.businessName}</strong>, 
                here's your personalized path to AI literacy and transformation.
              </p>
            </div>

            {/* Insights Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="glass-card border-primary/20 hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center">
                  <Brain className="w-8 h-8 text-primary mx-auto mb-3" />
                  <CardTitle className="text-xl">Team Readiness</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {calculateTeamReadiness()}%
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Overall AI confidence level across your team
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-accent/20 hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center">
                  <Users className="w-8 h-8 text-accent mx-auto mb-3" />
                  <CardTitle className="text-xl">Learning Style</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-lg font-semibold text-foreground mb-2">
                    {formatLearningModality(mindmakerData.learningModality)}
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Optimal approach for your organization
                  </p>
                </CardContent>
              </Card>

              <Card className="glass-card border-primary/20 hover:scale-105 transition-all duration-300">
                <CardHeader className="text-center">
                  <Target className="w-8 h-8 text-primary mx-auto mb-3" />
                  <CardTitle className="text-xl">Focus Areas</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-lg font-semibold text-foreground mb-2">
                    {mindmakerData.businessFunctions.length} Functions
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Key areas for AI implementation
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recommended Next Steps */}
            <Card className="glass-card border-primary/20 mb-12">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Recommended Workshop Package</CardTitle>
                <CardDescription className="text-center text-lg">
                  Based on your organization's profile and needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-foreground">AI Literacy Bootcamp</h3>
                    <Badge variant="default" className="text-white">Recommended</Badge>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-foreground mb-2">What's Included:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Interactive half-day workshop</li>
                        <li>• Personalized AI literacy assessment</li>
                        <li>• Industry-specific use case examples</li>
                        <li>• 90-day implementation roadmap</li>
                        <li>• Follow-up coaching sessions</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-foreground mb-2">Perfect For:</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Teams new to AI adoption</li>
                        <li>• Organizations wanting structured learning</li>
                        <li>• {formatLearningModality(mindmakerData.learningModality)} approach</li>
                        <li>• {mindmakerData.businessFunctions.join(' & ')} focus</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleScheduleCall}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-semibold px-8"
                  >
                    <Calendar className="w-5 h-5 mr-2" />
                    Schedule Workshop Consultation
                  </Button>
                  
                  <Button 
                    onClick={handleDownloadRoadmap}
                    variant="outline"
                    size="lg"
                    className="border-primary text-primary hover:bg-primary/10 font-semibold px-8"
                  >
                    Download Roadmap Summary
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p>Ready to start your AI transformation journey?</p>
                  <p className="font-medium text-foreground">Book a free 30-minute consultation to discuss your specific needs.</p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <div className="text-center space-y-4">
              <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>500+ Executives Trained</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>95% Satisfaction Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span>Industry-Agnostic Approach</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Questions? Email <a href="mailto:krish@fractionl.ai" className="text-primary hover:underline">krish@fractionl.ai</a>
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Default: Show conversational interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-background to-accent-400/10">
      {/* Navigation Header */}
      <nav className="glass-nav sticky top-0 z-50 border-b border-white/20">
        <div className="container-width">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={handleBackToStart}
              className="text-foreground hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Start
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">AI Discovery Session</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Conversation Interface */}
      <main className="section-padding">
        <div className="container-width max-w-4xl">
          <ConversationalInterface
            onDataExtracted={(data) => {
              // Update context with extracted data
            }}
            onConversationComplete={(allData) => {
              setCurrentStep(2); // Move to results view
            }}
            initialPrompt="👋 Welcome! I'm Alex, your AI transformation guide from Fractionl.ai.

I'm here to understand your organization's unique AI journey and help you discover the perfect path forward. This isn't just another assessment—it's an intelligent conversation that adapts to your specific industry, team size, and challenges.

Let's start building your personalized AI transformation roadmap. What's your company called? 🚀"
            placeholder="Tell me about your company..."
            aiPersonality="professional"
          />
        </div>
      </main>
    </div>
  );
};