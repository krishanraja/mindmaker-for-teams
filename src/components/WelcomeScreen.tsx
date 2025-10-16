import React from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentStep } = useMindmaker();

  const handleStartDiscovery = () => {
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center py-12">
        {/* Logo - Clean & Simple */}
        <img 
          src="/lovable-uploads/mindmaker-logo-64px.png" 
          alt="MINDMAKER" 
          className="mx-auto h-16 w-auto mb-12"
        />

        {/* Headline - Bold & Clear */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Is your team's AI literacy driving measurable growth?
        </h1>

        {/* Subtext - Clean & Readable */}
        <p className="text-lg sm:text-xl text-muted-foreground mb-12 max-w-xl mx-auto">
          Take 2 minutes to pulse check your team's AI impact
        </p>

        {/* CTA - Prominent & Clear */}
        <Button
          onClick={handleStartDiscovery}
          size="lg"
          className="px-8 py-6 text-lg min-w-[300px] shadow-lg hover:shadow-xl"
        >
          Start the Pulse Check
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        {/* Trust Indicator - Subtle */}
        <p className="text-sm text-muted-foreground mt-6">
          No credit card required • 2 minute assessment
        </p>
      </div>
    </div>
  );
};