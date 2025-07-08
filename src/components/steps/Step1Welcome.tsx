import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { useMindmaker } from '../../contexts/MindmakerContext';

export const Step1Welcome: React.FC = () => {
  const { setCurrentStep, markStepCompleted } = useMindmaker();

  const handleStart = () => {
    markStepCompleted(1);
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary-purple)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary-purple)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Floating Gradient Orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-purple rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-purple-blue rounded-full blur-3xl opacity-15 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 flex items-center justify-center mx-auto mb-4">
            <img 
              src="/lovable-uploads/cda45e60-bf8b-4a41-bd29-0e6c465c1377.png" 
              alt="Fractionl Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="font-display font-bold text-3xl md:text-5xl lg:text-6xl mb-6 leading-tight text-white">
          Let's turn your people from{' '}
          <span className="text-white">
            anxious
          </span>{' '}
          to{' '}
          <span className="text-white underline">
            AI-ambitious
          </span>.
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
          Create your personalized AI transformation sprint mindmaker. 
          Get actionable insights tailored to your team's needs and readiness.
        </p>

        {/* CTA Button */}
        <Button
          onClick={handleStart}
          size="lg"
          className="bg-gradient-purple hover:opacity-90 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          Start mapping your workshop
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Trust Indicators */}
        <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>7-minute assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Personalized recommendations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Downloadable mindmaker</span>
          </div>
        </div>
      </div>
    </div>
  );
};