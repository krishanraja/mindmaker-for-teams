import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Sparkles, Zap, Target, Users, ChevronRight } from 'lucide-react';
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
          {/* Logo Placeholder */}
          <div className="mb-12">
            <div className="mx-auto w-48 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">MINDMAKER</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="mb-8">
            <h1 className="hero-heading mb-6">
              Teams
            </h1>
            
          </div>

          {/* CTA Button */}
          <button 
            onClick={handleStartDiscovery}
            className="btn-hero-primary"
          >
            Start Assessment
          </button>
        </div>
      </div>
    </div>
  );
};