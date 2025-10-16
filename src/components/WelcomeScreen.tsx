import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
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
          <h1 className="text-lg sm:text-xl md:text-3xl font-bold mb-4 leading-tight text-center">
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

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <div className="card">
            <div className="icon-box mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">AI-Powered Analysis</h3>
            <p className="text-muted-foreground">
              Get instant, personalized insights on your team's AI readiness and growth opportunities
            </p>
          </div>

          <div className="card">
            <div className="icon-box mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-2">Measurable Impact</h3>
            <p className="text-muted-foreground">
              Turn AI literacy into revenue growth with data-driven recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};