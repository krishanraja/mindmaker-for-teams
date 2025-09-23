import React from 'react';
import { Card } from './ui/card';
import { Sparkles, Zap, Target, Users, ChevronRight, ArrowRight } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import mindmakerLogo from '../assets/mindmaker-logo.png';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentStep } = useMindmaker();

  const handleStartDiscovery = () => {
    setCurrentStep(2);
  };

  return (
    <div className="hero-gradient min-h-screen">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-2xl mx-auto">
          {/* Logo */}
          <div className="mb-12">
            <img 
              src="/lovable-uploads/mindmaker-logo-64px.png" 
              alt="MINDMAKER" 
              className="mx-auto h-16 w-auto"
            />
          </div>

          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="hero-heading hero-text-shimmer mb-6">
              Teams
            </h1>
            
          </div>

          {/* CTA Button */}
          <button 
            onClick={handleStartDiscovery}
            className="btn-hero-primary px-8 py-3 text-lg font-medium group"
          >
            Start Assessment
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform animated-arrow" />
          </button>
        </div>
      </div>
    </div>
  );
};