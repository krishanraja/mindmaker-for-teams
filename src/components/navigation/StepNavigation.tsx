import React from 'react';
import { useMindmaker } from '@/contexts/MindmakerContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Welcome', shortTitle: 'Welcome' },
  { id: 2, title: 'Organization', shortTitle: 'Org' },
  { id: 3, title: 'Anxiety Pulse', shortTitle: 'Anxiety' },
  { id: 4, title: 'Capability Map', shortTitle: 'Skills' },
  { id: 5, title: 'Habit Hooks', shortTitle: 'Habits' },
  { id: 6, title: 'Success Goals', shortTitle: 'Goals' },
  { id: 7, title: 'Mindmaker Results', shortTitle: 'Results' },
  { id: 8, title: 'Summary', shortTitle: 'Summary' },
];

export const StepNavigation: React.FC = () => {
  const { state, setCurrentStep } = useMindmaker();
  
  const currentStepIndex = STEPS.findIndex(step => step.id === state.currentStep);
  const canGoPrev = currentStepIndex > 0;
  const canGoNext = currentStepIndex < STEPS.length - 1;

  const handlePrevStep = () => {
    if (canGoPrev) {
      setCurrentStep(STEPS[currentStepIndex - 1].id);
    }
  };

  const handleNextStep = () => {
    if (canGoNext) {
      setCurrentStep(STEPS[currentStepIndex + 1].id);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Previous Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevStep}
        disabled={!canGoPrev}
        className="text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Step Indicators */}
      <div className="flex items-center space-x-2">
        {STEPS.map((step, index) => {
          const stepProgress = state.stepProgress[step.id];
          const isCompleted = stepProgress?.completed || false;
          const isCurrent = state.currentStep === step.id;
          const isVisited = stepProgress?.visited || false;

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step.id)}
              className={cn(
                "relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all duration-200",
                isCurrent 
                  ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20" 
                  : isCompleted
                  ? "bg-success text-success-foreground"
                  : isVisited
                  ? "bg-muted text-muted-foreground hover:bg-muted/80"
                  : "bg-muted/50 text-muted-foreground/50 cursor-not-allowed"
              )}
              disabled={!isVisited && !isCurrent}
              title={step.title}
            >
              {isCompleted ? (
                <div className="w-3 h-3 bg-white rounded-full" />
              ) : (
                step.id
              )}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNextStep}
        disabled={!canGoNext}
        className="text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Current Step Name */}
      <div className="hidden lg:block text-sm text-muted-foreground">
        {STEPS[currentStepIndex]?.title}
      </div>
    </div>
  );
};