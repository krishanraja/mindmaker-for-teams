import React from 'react';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import logo from '@/assets/mindmaker-logo-white-bg.png';

export const WelcomeScreen: React.FC = () => {
  const { setCurrentStep } = useMindmaker();
  
  const fullText = "AI LITERACY TO UNLOCK COMMERCIAL TEAMS";
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
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-16">
          <img 
            src={logo}
            alt="MINDMAKER" 
            className="mx-auto h-14 md:h-16 w-auto"
          />
        </div>

        {/* Content Container */}
        <div className="max-w-5xl mx-auto">
          {/* Hero Text with Typewriter */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wide text-primary mb-6 md:mb-10 text-center max-w-4xl mx-auto min-h-[120px] sm:min-h-[140px] md:min-h-[180px] lg:min-h-[200px] flex flex-col justify-center">
            {displayedText}
            {!isTypingComplete && <span className="typewriter-cursor" />}
          </h1>

          {/* Description */}
          <p className="text-xs md:text-sm font-normal leading-relaxed text-muted-foreground mb-4 md:mb-6 text-center max-w-xl mx-auto">
            Take 2 minutes to pulse check your team's AI impact
          </p>

          {/* CTA Button */}
          <div className="text-center mb-8">
            <Button
              onClick={handleStartDiscovery}
              size="lg"
              className="px-10 py-6 text-lg min-w-[280px] rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Start the Pulse Check
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* Trust Indicator */}
          <p className="text-xs text-muted-foreground/60 text-center tracking-wide uppercase">
            No credit card required • 2 minute assessment
          </p>
        </div>
      </div>
    </div>
  );
};