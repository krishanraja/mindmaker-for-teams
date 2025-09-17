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
      <div className="min-h-screen flex items-center justify-center">
        <div className="container-width">
          <div className="text-center space-y-8">
            {/* Logo */}
            <div className="mb-8">
              <img 
                src={mindmakerLogo} 
                alt="MindMaker Logo" 
                className="mx-auto"
                style={{ width: '256px', height: '64px' }}
              />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 glass-card-dark rounded-full text-white/90 text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Transformation Discovery
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="hero-title">
                Transform How Your Team
                <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Thinks About AI
                </span>
              </h1>
              
              <p className="body-lg max-w-3xl mx-auto">
                Get a personalized AI transformation roadmap in under 2 minutes. 
                Designed for busy executives who need actionable insights, not lengthy assessments.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleStartDiscovery}
                className="button-hero text-lg px-8 py-4 group"
                size="lg"
              >
                Get My Roadmap (2 min)
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Value Props Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <Card className="bg-white/15 backdrop-blur-md border border-white/20 shadow-xl text-white card-grid p-6">
                <div className="card-header">
                  <Target className="w-12 h-12 text-white mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Intelligent Discovery</h3>
                </div>
                <div className="card-content">
                  <p className="text-white/90">
                    AI-powered conversation reveals your organization's unique needs and readiness level
                  </p>
                </div>
              </Card>

              <Card className="bg-white/15 backdrop-blur-md border border-white/20 shadow-xl text-white card-grid p-6">
                <div className="card-header">
                  <Sparkles className="w-12 h-12 text-white mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Personalized Roadmap</h3>
                </div>
                <div className="card-content">
                  <p className="text-white/90">
                    Custom recommendations based on your industry, team size, and current AI adoption
                  </p>
                </div>
              </Card>

              <Card className="bg-white/15 backdrop-blur-md border border-white/20 shadow-xl text-white card-grid p-6">
                <div className="card-header">
                  <Users className="w-12 h-12 text-white mb-4 mx-auto" />
                  <h3 className="text-xl font-semibold mb-2 text-white">Expert Guidance</h3>
                </div>
                <div className="card-content">
                  <p className="text-white/90">
                    Access to proven methodologies from teaching AI to Fortune 500 teams
                  </p>
                </div>
              </Card>
            </div>

            {/* Trust Indicators */}
            <div className="pt-16 border-t border-white/20 mt-16">
              <p className="text-white/70 text-sm mb-4">Trusted by teams at:</p>
              <div className="flex justify-center space-x-8 text-white/60 text-sm">
                <span>Healthcare</span>
                <span>•</span>
                <span>Finance</span>
                <span>•</span>
                <span>Technology</span>
                <span>•</span>
                <span>Manufacturing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};