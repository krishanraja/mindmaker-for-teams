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
      {/* Hero Content */}
      <div className="min-h-screen flex items-center justify-center section-padding">
        <div className="container-width">
          <div className="text-center mobile-spacing max-w-4xl mx-auto">
            {/* Logo Placeholder */}
            <div className="mb-6 sm:mb-8">
              <div className="mx-auto w-48 h-12 sm:w-64 sm:h-16 md:w-72 md:h-18 lg:w-80 lg:h-20 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-semibold text-lg">MINDMAKER</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="mobile-spacing">
              <h1 className="hero-heading">
                Teams
              </h1>
              
              <p className="mobile-text-lg text-white/90 mx-auto max-w-2xl">
                Transform and level up your team. Get started with a personalized AI literacy roadmap in under 2 minutes.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center pt-2 sm:pt-4">
              <button 
                onClick={handleStartDiscovery}
                className="btn-hero-primary group w-full sm:w-auto max-w-sm"
              >
                Get My Roadmap (2 min)
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 animated-arrow" />
              </button>
            </div>

            {/* Value Props Grid */}
            <div className="responsive-grid mt-16">
              <div className="glass-card-dark mobile-padding fade-in-up">
                <div className="text-center mobile-spacing">
                  <Target className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-3 sm:mb-4 mx-auto" />
                  <h3 className="mobile-text-base font-semibold text-white">Intelligent Discovery</h3>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    AI-powered conversation reveals your organization's unique needs and readiness level
                  </p>
                </div>
              </div>

              <div className="glass-card-dark mobile-padding fade-in-up">
                <div className="text-center mobile-spacing">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-3 sm:mb-4 mx-auto" />
                  <h3 className="mobile-text-base font-semibold text-white">Personalized Roadmap</h3>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    Custom recommendations based on your industry, team size, and current AI adoption
                  </p>
                </div>
              </div>

              <div className="glass-card-dark mobile-padding fade-in-up lg:col-span-1 sm:col-span-2">
                <div className="text-center mobile-spacing">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-3 sm:mb-4 mx-auto" />
                  <h3 className="mobile-text-base font-semibold text-white">Expert Guidance</h3>
                  <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                    Access to proven methodologies from teaching AI to Fortune 500 teams
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12 sm:pt-16 border-t border-white/20 mt-12 sm:mt-16">
              <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">Trusted by teams at:</p>
              <div className="flex flex-wrap justify-center gap-x-4 sm:gap-x-8 gap-y-2 text-white/60 text-xs sm:text-sm">
                <span>Media</span>
                <span className="hidden sm:inline">•</span>
                <span>Tech</span>
                <span className="hidden sm:inline">•</span>
                <span>Telco</span>
                <span className="hidden sm:inline">•</span>
                <span>Scale-ups</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};