import React from 'react';
import { Sparkles, Zap, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentStep } = useMindmaker();

  const handleStartDiscovery = () => {
    setCurrentStep(2);
  };

  return (
    <div className="mobile-app-welcome hero-gradient">
      {/* Animated Background Layer */}
      <div className="animated-gradient-bg">
        <div className="floating-shapes">
          {/* Floating geometric shapes for visual interest */}
          <div className="floating-shape w-32 h-32 bg-white/10 top-20 left-[10%]" style={{ animationDelay: '0s' }} />
          <div className="floating-shape w-24 h-24 bg-white/8 top-40 right-[15%]" style={{ animationDelay: '2s' }} />
          <div className="floating-shape w-40 h-40 bg-white/6 bottom-32 left-[20%]" style={{ animationDelay: '4s' }} />
          <div className="floating-shape w-28 h-28 bg-white/10 bottom-20 right-[25%]" style={{ animationDelay: '6s' }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-10">
        <div className="glass-card-hero fade-in-sequence">
          {/* Floating Logo */}
          <div className="logo-float mb-8">
            <img 
              src="/lovable-uploads/mindmaker-logo-64px.png" 
              alt="MINDMAKER" 
              className="mx-auto h-16 w-auto"
            />
          </div>

          {/* Content Stack */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight text-white">
              Is your team's AI literacy driving measurable growth?
            </h1>
            
            <p className="text-lg sm:text-xl text-white/90 max-w-md mx-auto leading-relaxed">
              Take 2 minutes to pulse check your team's AI impact
            </p>

            {/* Visual Benefit Indicators */}
            <div className="benefit-icons py-4">
              <div className="benefit-icon">
                <div className="benefit-icon-circle">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium">AI Ready</span>
              </div>
              <div className="benefit-icon">
                <div className="benefit-icon-circle">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium">Growth</span>
              </div>
              <div className="benefit-icon">
                <div className="benefit-icon-circle">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium">Impact</span>
              </div>
              <div className="benefit-icon">
                <div className="benefit-icon-circle">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium">Fast</span>
              </div>
            </div>
          </div>

          {/* Enhanced CTA */}
          <button 
            onClick={handleStartDiscovery}
            className="cta-primary-large group mt-8"
          >
            Start the Pulse Check
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 animated-arrow" />
          </button>

          {/* Trust Indicator */}
          <p className="text-center text-white/60 text-sm mt-6">
            ✓ No signup required • 2 min assessment
          </p>
        </div>
      </div>
    </div>
  );
};