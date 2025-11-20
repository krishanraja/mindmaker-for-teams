import React from 'react';
import { useExecTeams } from '@/contexts/ExecTeamsContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CardDescription } from '@/components/ui/card';
import { Brain, Target, Users, Zap, Lock } from 'lucide-react';
import logo from '@/assets/mindmaker-logo-horizontal.png';
import { RapidInsightsProof } from './RapidInsightsProof';

const FULL_TEXT = "DESIGN YOUR AI\nLEADERSHIP BOOTCAMP";

export const ExecTeamsWelcome: React.FC = () => {
  const { setCurrentStep } = useExecTeams();
  const navigate = useNavigate();
  
  const [displayedText, setDisplayedText] = React.useState('');
  const [isTypingComplete, setIsTypingComplete] = React.useState(false);
  const [activeCardIndex, setActiveCardIndex] = React.useState(0);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    // Reset on mount
    setDisplayedText('');
    setIsTypingComplete(false);
  }, []);

  React.useEffect(() => {
    if (displayedText.length < FULL_TEXT.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(FULL_TEXT.slice(0, displayedText.length + 1));
      }, 60);
      return () => clearTimeout(timeout);
    } else if (displayedText.length === FULL_TEXT.length) {
      setIsTypingComplete(true);
    }
  }, [displayedText]);

  React.useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const handleScroll = () => {
      const scrollLeft = carousel.scrollLeft;
      const cardWidth = carousel.offsetWidth * 0.9; // 90vw
      const gap = 16;
      const paddingLeft = carousel.offsetWidth * 0.05; // 5vw
      const adjustedScroll = scrollLeft - paddingLeft + (carousel.offsetWidth - cardWidth) / 2;
      const newIndex = Math.round(adjustedScroll / (cardWidth + gap));
      setActiveCardIndex(Math.max(0, Math.min(3, newIndex)));
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex items-start justify-center p-3 md:p-8 lg:p-12 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="w-full max-w-5xl relative">
        <div className="border-2 border-border/50 shadow-2xl rounded-lg bg-card text-card-foreground">
          <div className="space-y-1 pb-4 md:pb-8 text-left p-4 md:p-6">
            {/* Logo and Facilitator Button - Horizontal Layout */}
            <div className="flex justify-between items-center mb-3 md:mb-6 -ml-3 md:-ml-6">
              <img 
                src={logo} 
                alt="MINDMAKER" 
                className="h-7 md:h-12 w-auto" 
              />
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/facilitator-login')}
                className="text-[10px] md:text-xs opacity-70 hover:opacity-100 transition-opacity h-7 px-2"
              >
                <Lock className="h-3 w-3 mr-1" />
                Facilitator Login
              </Button>
            </div>
            
            <div>
              <div className="relative">
                {/* Invisible full text to reserve space and prevent layout shift */}
                <h2 
                  className="text-xl md:text-5xl font-bold mb-2 md:mb-6 text-left whitespace-pre-line leading-tight invisible"
                  aria-hidden="true"
                >
                  {FULL_TEXT}
                </h2>
                {/* Visible typing text positioned absolutely */}
                <h2 className="absolute top-0 left-0 right-0 text-xl md:text-5xl font-bold mb-2 md:mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent text-left whitespace-pre-line leading-tight">
                  {displayedText}
                  {!isTypingComplete && <span className="typewriter-cursor" />}
                </h2>
              </div>
              <CardDescription className="text-base md:text-2xl text-foreground/80 font-medium text-left">
                Increase Decision Velocity inside one session.
              </CardDescription>
            </div>

            <p className="text-xs md:text-lg text-muted-foreground max-w-3xl text-left pt-2">
              Your executive team will run 2 real-world AI decision simulations, surface cognitive gaps, 
              and leave with a 90-day pilot charter. The accelerator that enables you to genuinely accelerate.
            </p>
          </div>

          <div className="space-y-3 md:space-y-8 pb-4 md:pb-12 px-4 md:px-6">
            <div ref={carouselRef} className="mobile-carousel">
              <div className="mobile-carousel-item">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-primary/10 p-2 md:p-2.5">
                    <Brain className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-semibold">Decision Simulations</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Choose 2 scenarios that mirror your current challenges. We'll configure the room agenda and lock timeboxes for maximum impact.
                </p>
              </div>

              <div className="mobile-carousel-item">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-primary/10 p-2 md:p-2.5">
                    <Target className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-semibold">Cognitive Baseline</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Team pulse across 4 dimensions reveals alignment gaps and readiness scores before you walk into the room.
                </p>
              </div>

              <div className="mobile-carousel-item">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-primary/10 p-2 md:p-2.5">
                    <Users className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-semibold">Leadership Alignment</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Six structured segments (Mirror, Time Machine, Crystal Ball, Rewrite, Huddle, Provocation) ensure strategic coherence.
                </p>
              </div>

              <div className="mobile-carousel-item">
                <div className="flex items-center gap-2 mb-2">
                  <div className="rounded-lg bg-primary/10 p-2 md:p-2.5">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-primary" strokeWidth={2} />
                  </div>
                  <h3 className="text-base font-semibold">90-Day Pilot Charter</h3>
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave with actionable next steps, documented insights, and a clear implementation roadmap.
                </p>
              </div>
            </div>

            {/* Carousel Dot Indicators - Mobile Only */}
            <div className="flex md:hidden justify-center gap-2 pt-2 pb-1">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => {
                    const carousel = carouselRef.current;
                    if (carousel) {
                      const cards = carousel.children;
                      if (cards[index]) {
                        cards[index].scrollIntoView({
                          behavior: 'smooth',
                          block: 'nearest',
                          inline: 'center'
                        });
                      }
                    }
                  }}
                  className={`h-2 rounded-full transition-all ${
                    activeCardIndex === index 
                      ? 'w-8 bg-primary' 
                      : 'w-2 bg-muted-foreground/30'
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                />
              ))}
            </div>

            {/* Rapid Insights Proof Section */}
            <RapidInsightsProof />

            <div className="w-full px-2 md:px-4 flex flex-col items-center gap-2 md:gap-3 pt-3 md:pt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                size="lg"
                className="w-full max-w-full text-sm md:text-base px-6 md:px-8 py-4 md:py-5 whitespace-normal"
              >
                Configure Your Session
              </Button>
              <p className="text-[10px] md:text-xs text-muted-foreground text-center px-2">
                Takes 10 minutes • Sends pulse to your team • Generates custom agenda
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
