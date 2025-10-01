import React, { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';

interface LoadingStep {
  id: string;
  message: string;
  icon: React.ElementType;
  duration: number;
}

const loadingSteps: LoadingStep[] = [
  {
    id: 'analyzing',
    message: 'Analyzing your responses...',
    icon: Brain,
    duration: 3000
  },
  {
    id: 'consulting',
    message: 'Consulting AI literacy framework...',
    icon: Sparkles,
    duration: 4000
  },
  {
    id: 'generating',
    message: 'Generating personalized recommendations...',
    icon: TrendingUp,
    duration: 3000
  },
  {
    id: 'finalizing',
    message: 'Finalizing your roadmap...',
    icon: CheckCircle2,
    duration: 2000
  }
];

export const ProgressiveLoadingStates: React.FC = () => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const currentStep = loadingSteps[currentStepIndex];
    const stepDuration = currentStep.duration;
    const intervalTime = 50;
    const incrementPerInterval = (100 / stepDuration) * intervalTime;

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + incrementPerInterval;
        if (newProgress >= 100) {
          clearInterval(progressInterval);
          if (currentStepIndex < loadingSteps.length - 1) {
            setTimeout(() => {
              setCurrentStepIndex((prev) => prev + 1);
              setProgress(0);
            }, 200);
          }
          return 100;
        }
        return newProgress;
      });
    }, intervalTime);

    return () => clearInterval(progressInterval);
  }, [currentStepIndex]);

  const currentStep = loadingSteps[currentStepIndex];
  const Icon = currentStep.icon;
  const overallProgress = ((currentStepIndex + (progress / 100)) / loadingSteps.length) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Animated Icon */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 animate-scale-in">
              <Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary animate-pulse" />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-4">
          <div className="text-center space-y-2 animate-fade-in">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {currentStep.message}
            </h2>
            <p className="text-sm text-muted-foreground">
              This may take 10-15 seconds
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-muted/50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-primary/80 h-2 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Step {currentStepIndex + 1} of {loadingSteps.length}</span>
              <span>{Math.round(overallProgress)}%</span>
            </div>
          </div>
        </div>

        {/* Steps Preview */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {loadingSteps.map((step, index) => {
            const StepIcon = step.icon;
            const isComplete = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            
            return (
              <div
                key={step.id}
                className={`flex flex-col items-center gap-2 p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                  isComplete
                    ? 'bg-primary/10 border border-primary/30'
                    : isCurrent
                    ? 'bg-primary/5 border border-primary/20 animate-pulse'
                    : 'bg-muted/30 border border-transparent'
                }`}
              >
                <StepIcon 
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                    isComplete || isCurrent ? 'text-primary' : 'text-muted-foreground'
                  }`}
                />
                <div className={`h-1 w-full rounded-full ${
                  isComplete
                    ? 'bg-primary'
                    : isCurrent
                    ? 'bg-primary/50'
                    : 'bg-muted'
                }`} />
              </div>
            );
          })}
        </div>

        {/* Educational Tip */}
        <div className="text-center p-4 rounded-lg bg-muted/30 border border-border animate-fade-in">
          <p className="text-xs sm:text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Pro tip:</span> We're analyzing your responses against enterprise AI literacy frameworks to deliver personalized insights.
          </p>
        </div>
      </div>
    </div>
  );
};
