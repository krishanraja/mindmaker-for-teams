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
    <div className="hero-clouds">
      {/* Hero Content */}
      <div className="min-h-screen flex items-center justify-center py-8 px-6 sm:px-8">
        <div className="container-width">
          <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">
            {/* Logo */}
            <div className="mb-6 sm:mb-8">
              <img 
                src={mindmakerLogo} 
                alt="MindMaker Logo" 
                className="mx-auto w-48 h-12 sm:w-64 sm:h-16 md:w-72 md:h-18 lg:w-80 lg:h-20 object-contain"
              />
            </div>

            {/* Main Headline */}
            <div className="space-y-4 sm:space-y-6">
              <h1 className="hero-title px-4">
                Teams
              </h1>
              
              <p className="body-lg mx-auto px-4 sm:px-6">
                Transform and level up your team. Get started with a personalized AI literacy roadmap in under 2 minutes.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center px-4 pt-2 sm:pt-4">
              <Button 
                onClick={handleStartDiscovery}
                className="button-hero text-base sm:text-lg px-6 sm:px-8 py-4 group touch-target-lg w-full sm:w-auto max-w-sm"
                size="lg"
              >
                Get My Roadmap (2 min)
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Value Props Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 px-4">
              <Card className="bg-white/15 backdrop-blur-md border border-white/20 shadow-xl text-white card-mobile">
                <div className="card-header text-center">
                  <Target className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-3 sm:mb-4 mx-auto" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Intelligent Discovery</h3>
                </div>
                <div className="card-content text-center">
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                    AI-powered conversation reveals your organization's unique needs and readiness level
                  </p>
                </div>
              </Card>

              <Card className="bg-white/15 backdrop-blur-md border border-white/20 shadow-xl text-white card-mobile">
                <div className="card-header text-center">
                  <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-3 sm:mb-4 mx-auto" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Personalized Roadmap</h3>
                </div>
                <div className="card-content text-center">
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                    Custom recommendations based on your industry, team size, and current AI adoption
                  </p>
                </div>
              </Card>

              <Card className="bg-white/15 backdrop-blur-md border border-white/20 shadow-xl text-white card-mobile sm:col-span-2 lg:col-span-1">
                <div className="card-header text-center">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-white mb-3 sm:mb-4 mx-auto" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-white">Expert Guidance</h3>
                </div>
                <div className="card-content text-center">
                  <p className="text-white/90 text-sm sm:text-base leading-relaxed">
                    Access to proven methodologies from teaching AI to Fortune 500 teams
                  </p>
                </div>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12 sm:pt-16 border-t border-white/20 mt-12 sm:mt-16 px-4">
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