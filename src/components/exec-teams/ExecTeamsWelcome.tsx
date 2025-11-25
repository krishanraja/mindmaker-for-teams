import React from 'react';
import { useExecTeams } from '@/contexts/ExecTeamsContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardDescription } from '@/components/ui/card';
import { Brain, Target, FileText, Zap, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import logo from '@/assets/mindmaker-logo-rebrand.png';
import { RapidInsightsProof } from './RapidInsightsProof';

const FULL_TEXT = "ALIGN YOUR LEADERSHIP\nTEAM ON AI IN ONE SESSION";

export const ExecTeamsWelcome: React.FC = () => {
  const { setCurrentStep } = useExecTeams();
  const navigate = useNavigate();
  
  const [displayedText, setDisplayedText] = React.useState('');
  const [isTypingComplete, setIsTypingComplete] = React.useState(false);
  const [showRealOutputs, setShowRealOutputs] = React.useState(false);

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
                Surface tensions, test decision-making, walk away with shared mental models
              </CardDescription>
            </div>

            <p className="text-xs md:text-lg text-muted-foreground max-w-3xl text-left pt-2">
              Most teams waste months talking past each other about AI. We compress weeks of alignment into a single working session where you test whether your team can actually make AI decisions together—not in theory, but under pressure.
            </p>
          </div>

          <div className="space-y-3 md:space-y-8 pb-4 md:pb-12 px-4 md:px-6">
            <div className="space-y-2 mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-center">What You'll Walk Away With</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4 border-2 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Decision Framework</h4>
                    <p className="text-sm text-muted-foreground">
                      How you'll decide about AI—who, when, what criteria
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-2 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Tension Map</h4>
                    <p className="text-sm text-muted-foreground">
                      Where you disagree and why—awareness vs application, risk vs trust
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-2 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Key Concepts Library</h4>
                    <p className="text-sm text-muted-foreground">
                      Mental models for AI orchestration vs automation
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4 border-2 hover:border-primary/50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Zap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">Sample Artifacts</h4>
                    <p className="text-sm text-muted-foreground">
                      Draft pilot charter + strategy addendum that prove the framework works
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="w-full px-2 md:px-4 flex flex-col items-center gap-2 md:gap-3 pt-3 md:pt-6">
              <div className="w-full flex flex-col md:flex-row gap-2 md:gap-3">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  size="lg"
                  className="flex-1 text-sm md:text-base px-6 md:px-8 py-4 md:py-5 whitespace-normal"
                >
                  Apply for an Alignment Sprint
                </Button>
                <Button 
                  onClick={() => setShowRealOutputs(!showRealOutputs)}
                  size="lg"
                  variant="outline"
                  className="flex-1 text-sm md:text-base px-6 md:px-8 py-4 md:py-5 whitespace-normal flex items-center justify-center gap-2"
                >
                  See Real Client Deliverables
                  {showRealOutputs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-[10px] md:text-xs text-muted-foreground text-center px-2">
                Takes 12 minutes • We'll prep your agenda • You'll get a preview within 48h
              </p>
            </div>

            {/* Rapid Insights Proof Section */}
            {showRealOutputs && <RapidInsightsProof />}
          </div>
        </div>
      </div>
    </div>
  );
}
