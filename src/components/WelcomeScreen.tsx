import React from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import logo from '@/assets/mindmaker-logo-white-bg.png';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentStep } = useMindmaker();
  
  const fullText = "AI LITERACY FOR COMMERCIAL TEAMS";
  const [displayedText, setDisplayedText] = React.useState('');
  const [isTypingComplete, setIsTypingComplete] = React.useState(false);

  React.useEffect(() => {
    if (displayedText.length < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(fullText.slice(0, displayedText.length + 1));
      }, 60);
      return () => clearTimeout(timeout);
    } else {
      setIsTypingComplete(true);
    }
  }, [displayedText, fullText.length]);

  const handleStartDiscovery = () => {
    setCurrentStep(2);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl mx-auto w-full">
        {/* Glassmorphic Card - contains all content */}
        <div className="glass-card p-8 md:p-12 lg:p-16">
          {/* Logo - inside card, left aligned, 25% smaller */}
          <div className="mb-8 -ml-4 md:-ml-2">
            <img 
              src={logo}
              alt="MINDMAKER" 
              className="h-11 md:h-12 w-auto"
            />
          </div>

          {/* Hero Text with Typewriter - left aligned, 30% smaller, bolder */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-wide text-primary mb-3 md:mb-5 text-left max-w-4xl min-h-[80px] sm:min-h-[100px] md:min-h-[120px] lg:min-h-[140px]">
            {displayedText}
            {!isTypingComplete && <span className="typewriter-cursor" />}
          </h1>

          {/* Description - left aligned */}
          <p className="text-xs md:text-sm font-normal leading-relaxed text-muted-foreground mb-4 md:mb-6 text-left max-w-xl">
            Take 2 minutes to pulse check your team's AI impact
          </p>

          {/* CTA Button - left aligned */}
          <div className="mb-8">
            <Button
              onClick={handleStartDiscovery}
              size="lg"
              className="px-10 py-6 text-lg min-w-[280px] rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Start the Pulse Check
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Trust Indicator - left aligned */}
          <p className="text-xs text-muted-foreground/60 text-left tracking-wide uppercase">
            No credit card required • 2 minute assessment
          </p>
        </div>
      </div>
    </div>
  );
};