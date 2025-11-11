import React from 'react';
import { useExecTeams } from '@/contexts/ExecTeamsContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Users, Zap, Lock } from 'lucide-react';
import logo from '@/assets/mindmaker-logo-horizontal.png';

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
      const cardWidth = carousel.offsetWidth * 0.82;
      const gap = 16;
      const paddingLeft = carousel.offsetWidth * 0.09;
      const adjustedScroll = scrollLeft - paddingLeft + (carousel.offsetWidth - cardWidth) / 2;
      const newIndex = Math.round(adjustedScroll / (cardWidth + gap));
      setActiveCardIndex(Math.max(0, Math.min(3, newIndex)));
    };

    carousel.addEventListener('scroll', handleScroll);
    return () => carousel.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex items-start justify-start p-4 md:p-8 lg:p-12 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="w-full max-w-5xl relative">
        {/* Facilitator Login Button - Top Right */}
        <div className="absolute top-12 md:top-4 right-4 z-10">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/facilitator-login')}
            className="text-xs opacity-70 hover:opacity-100 transition-opacity"
          >
            <Lock className="h-3 w-3 mr-1" />
            Facilitator Login
          </Button>
        </div>

        <Card className="border-2 border-border/50 shadow-2xl">
          <CardHeader className="space-y-2 pb-8 text-left">
            <div className="flex justify-start mb-6 -ml-5 md:-ml-6">
              <img 
                src={logo} 
                alt="MINDMAKER" 
                className="h-9 md:h-12 w-auto" 
              />
            </div>
            
            <div>
              <CardTitle className="text-2xl md:text-5xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent text-left min-h-[80px] md:min-h-[140px] whitespace-pre-line">
                {displayedText}
                {!isTypingComplete && <span className="typewriter-cursor" />}
              </CardTitle>
              <CardDescription className="text-lg md:text-2xl text-foreground/80 font-medium text-left">
                From Hype to Strategy in 4 Hours
              </CardDescription>
            </div>

            <p className="text-sm md:text-lg text-muted-foreground max-w-3xl text-left">
              Your executive team will run 2 real-world AI decision simulations, surface cognitive gaps, 
              and leave with a 90-day pilot charter. No theory. No vendor pitches. Just strategic clarity.
            </p>
          </CardHeader>

          <CardContent className="space-y-6 md:space-y-8 pb-6 md:pb-12">
            <div ref={carouselRef} className="mobile-carousel">
              <Card className="mobile-carousel-item border border-border/50 bg-card/50">
                <CardHeader className="card-header">
                  <div className="flex items-center gap-3">
                    <div className="icon-wrapper p-2 rounded-lg bg-primary/10">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="card-title">Decision Simulations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="card-content">
                  <p className="card-description text-muted-foreground">
                    Choose 2 scenarios that mirror your current challenges. We'll configure the room agenda and lock timeboxes for maximum impact.
                  </p>
                </CardContent>
              </Card>

              <Card className="mobile-carousel-item border border-border/50 bg-card/50">
                <CardHeader className="card-header">
                  <div className="flex items-center gap-3">
                    <div className="icon-wrapper p-2 rounded-lg bg-primary/10">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="card-title">Cognitive Baseline</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="card-content">
                  <p className="card-description text-muted-foreground">
                    Team pulse across 4 dimensions reveals alignment gaps and readiness scores before you walk into the room.
                  </p>
                </CardContent>
              </Card>

              <Card className="mobile-carousel-item border border-border/50 bg-card/50">
                <CardHeader className="card-header">
                  <div className="flex items-center gap-3">
                    <div className="icon-wrapper p-2 rounded-lg bg-primary/10">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="card-title">Leadership Alignment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="card-content">
                  <p className="card-description text-muted-foreground">
                    Six structured segments (Mirror, Time Machine, Crystal Ball, Rewrite, Huddle, Provocation) ensure strategic coherence.
                  </p>
                </CardContent>
              </Card>

              <Card className="mobile-carousel-item border border-border/50 bg-card/50">
                <CardHeader className="card-header">
                  <div className="flex items-center gap-3">
                    <div className="icon-wrapper p-2 rounded-lg bg-primary/10">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="card-title">90-Day Pilot Charter</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="card-content">
                  <p className="card-description text-muted-foreground">
                    Leave with actionable next steps, documented insights, and a clear implementation roadmap.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Carousel Dot Indicators - Mobile Only */}
            <div className="flex md:hidden justify-center gap-2 pt-4 pb-2">
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

            <div className="w-full px-4 flex flex-col items-center gap-3 pt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                size="lg"
                className="w-full max-w-full text-sm md:text-base px-6 md:px-8 py-5 whitespace-normal"
              >
                Configure Your Session
              </Button>
              <p className="text-[11px] md:text-xs text-muted-foreground text-center px-2">
                Takes 10 minutes • Sends pulse to your team • Generates custom agenda
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
