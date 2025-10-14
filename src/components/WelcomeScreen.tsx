import React from 'react';
import { Sparkles, Clock, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentStep } = useMindmaker();

  const handleStartDiscovery = () => {
    setCurrentStep(2);
  };

  return (
    <div className="welcome-app-container">
      {/* Animated Background Layer */}
      <div className="animated-bg-gradient">
        <div className="floating-shape shape-1" />
        <div className="floating-shape shape-2" />
        <div className="floating-shape shape-3" />
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col items-center justify-center relative z-10 px-4">
        <div className="hero-glass-card staggered-fade-in text-center">
          {/* Logo with animation */}
          <div className="logo-float-animation mb-8 sm:mb-10">
            <img 
              src="/lovable-uploads/mindmaker-logo-64px.png" 
              alt="MINDMAKER" 
              className="mx-auto"
            />
          </div>

          {/* Headline & Subtitle */}
          <h1 className="hero-heading-app">
            Is your team's AI literacy driving measurable growth?
          </h1>
          <p className="hero-subtitle">
            Take 2 minutes to pulse check your team's AI impact
          </p>

          {/* Visual Benefit Indicators */}
          <div className="benefit-badges-grid">
            <div className="benefit-badge">
              <Sparkles />
              <span>AI-Powered</span>
            </div>
            <div className="benefit-badge">
              <Clock />
              <span>2-Minute</span>
            </div>
            <div className="benefit-badge">
              <TrendingUp />
              <span>Data-Driven</span>
            </div>
            <div className="benefit-badge">
              <Users />
              <span>Team Insights</span>
            </div>
          </div>

          {/* Enhanced CTA */}
          <button 
            onClick={handleStartDiscovery}
            className="cta-app-primary"
          >
            Start the Pulse Check
            <ArrowRight />
          </button>
        </div>

        {/* Trust Bar */}
        <div className="trust-bar">
          <span>✓ 500+ teams assessed</span>
          <span>✓ 95% recommend</span>
          <span>✓ 2-min avg time</span>
        </div>
      </div>
    </div>
  );
};