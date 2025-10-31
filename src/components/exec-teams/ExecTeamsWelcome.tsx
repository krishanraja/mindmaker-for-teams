import React from 'react';
import { useExecTeams } from '@/contexts/ExecTeamsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Target, Users, Zap } from 'lucide-react';
import logo from '@/assets/mindmaker-logo-new.png';

const FULL_TEXT = "DESIGN YOUR AI LEADERSHIP BOOTCAMP";

export const ExecTeamsWelcome: React.FC = () => {
  const { setCurrentStep } = useExecTeams();
  
  const [displayedText, setDisplayedText] = React.useState('');
  const [isTypingComplete, setIsTypingComplete] = React.useState(false);

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

  return (
    <div className="min-h-screen flex items-start justify-start p-8 md:p-12 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="w-full max-w-5xl">
        <Card className="border-2 border-border/50 shadow-2xl">
          <CardHeader className="space-y-2 pb-8 text-left">
            <div className="flex justify-start -ml-3 mb-2">
              <img src={logo} alt="MINDMAKER" className="h-12 w-auto" />
            </div>
            
            <div>
              <CardTitle className="text-4xl md:text-5xl font-bold mb-1 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent text-left min-h-[120px] md:min-h-[140px]">
                {displayedText}
                {!isTypingComplete && <span className="typewriter-cursor" />}
              </CardTitle>
              <CardDescription className="text-xl md:text-2xl text-foreground/80 font-medium text-left">
                From Hype to Strategy in 4 Hours
              </CardDescription>
            </div>

            <p className="text-lg text-muted-foreground max-w-3xl text-left">
              Your executive team will run 2 real-world AI decision simulations, surface cognitive gaps, 
              and leave with a 90-day pilot charter. No theory. No vendor pitches. Just strategic clarity.
            </p>
          </CardHeader>

          <CardContent className="space-y-8 pb-12">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Brain className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Decision Simulations</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Choose 2 scenarios that mirror your current challenges. We'll configure the room agenda and lock timeboxes for maximum impact.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Target className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Cognitive Baseline</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Team pulse across 4 dimensions reveals alignment gaps and readiness scores before you walk into the room.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">Leadership Alignment</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Six structured segments (Mirror, Time Machine, Crystal Ball, Rewrite, Huddle, Provocation) ensure strategic coherence.
                  </p>
                </CardContent>
              </Card>

              <Card className="border border-border/50 bg-card/50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Zap className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">90-Day Pilot Charter</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Leave with actionable next steps, documented insights, and a clear implementation roadmap.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col items-start gap-4 pt-6">
              <Button 
                onClick={() => setCurrentStep(2)}
                size="lg"
                className="text-lg px-8 py-6 min-w-[300px]"
              >
                Configure Your Bootcamp Session
              </Button>
              <p className="text-sm text-muted-foreground">
                Takes 10 minutes • Sends pulse to your team • Generates custom agenda
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
