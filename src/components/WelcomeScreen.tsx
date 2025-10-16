import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, ArrowRight, Brain, TrendingUp } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentStep } = useMindmaker();

  const handleStartDiscovery = () => {
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-width py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-0">
        <div className="max-w-3xl mx-auto">
          <Card className="glass-card p-6 sm:p-8 md:p-12">
            {/* Logo & Icon */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 border-2 border-primary/20 mb-6">
                <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
              <img 
                src="/lovable-uploads/mindmaker-logo-64px.png" 
                alt="MINDMAKER" 
                className="mx-auto h-12 sm:h-16 w-auto mb-6"
              />
            </div>

            {/* Main Headline */}
            <div className="text-center mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Is your team's AI literacy driving measurable growth?
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mobile-readable max-w-2xl mx-auto">
                Take 2 minutes to pulse check your team's AI impact
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 sm:mb-10">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">AI-Powered Analysis</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Instant personalized insights</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base mb-1">Revenue Impact</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Turn literacy into growth</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button
                onClick={handleStartDiscovery}
                variant="default"
                size="xl"
                className="w-full sm:w-auto min-w-[280px] group shadow-lg hover:shadow-xl"
              >
                Start the Pulse Check
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                No credit card required • 2 minute assessment
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};