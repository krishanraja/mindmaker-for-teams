import React from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import logo from '@/assets/mindmaker-logo-white-bg.png';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentStep } = useMindmaker();

  const handleStartDiscovery = () => {
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-12">
          <img 
            src={logo}
            alt="MINDMAKER" 
            className="mx-auto h-12 w-auto"
          />
        </div>

        {/* Main Card */}
        <div className="premium-card max-w-2xl mx-auto mb-8">
          {/* Headline */}
          <h1 className="premium-hero-text mb-4">
            Is your team's AI literacy driving measurable growth?
          </h1>

          {/* Subtext */}
          <p className="text-lg text-muted-foreground mb-8 text-center max-w-xl mx-auto">
            Take 2 minutes to pulse check your team's AI impact
          </p>

          {/* CTA Button */}
          <div className="text-center mb-6">
            <Button
              onClick={handleStartDiscovery}
              size="lg"
              className="px-10 py-6 text-lg min-w-[280px] rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Start the Pulse Check
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Trust Indicator */}
          <p className="text-sm text-muted-foreground text-center">
            No credit card required • 2 minute assessment
          </p>
        </div>
      </div>
    </div>
  );
};