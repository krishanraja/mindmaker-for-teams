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
        <div className="absolute top-10 left-4 md:top-20 md:left-20 w-32 h-32 md:w-64 md:h-64 bg-gradient-purple rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-4 md:bottom-20 md:right-20 w-40 h-40 md:w-80 md:h-80 bg-gradient-purple-blue rounded-full blur-3xl opacity-15 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 bg-brand-blue/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 md:px-6">
        {/* Logo */}
        <div className="mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-4">
            <img 
              src="/lovable-uploads/cda45e60-bf8b-4a41-bd29-0e6c465c1377.png" 
              alt="Fractionl Logo" 
              className="w-16 h-16 md:w-24 md:h-24 object-contain"
            />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="font-display font-bold text-2xl md:text-5xl lg:text-6xl mb-4 md:mb-6 leading-tight text-white px-2">
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
        <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
          Create your personalized AI transformation sprint mindmaker. 
          Get actionable insights tailored to your team's needs and readiness.
        </p>

        {/* CTA Button */}
        <Button
          onClick={handleStart}
          size="lg"
          className="bg-gradient-purple hover:opacity-90 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group w-full md:w-auto"
        >
          Start mapping your workshop
          <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        {/* Trust Indicators */}
        <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground px-4">
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