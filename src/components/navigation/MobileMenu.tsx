import React from 'react';
import { useMindmaker } from '@/contexts/MindmakerContext';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Get started' },
  { id: 2, title: 'Organization', description: 'Team snapshot' },
  { id: 3, title: 'Anxiety Pulse', description: 'Assess concerns' },
  { id: 4, title: 'Capability Map', description: 'Skills & risks' },
  { id: 5, title: 'Habit Hooks', description: 'Learning style' },
  { id: 6, title: 'Success Goals', description: 'Define targets' },
  { id: 7, title: 'Mindmaker Results', description: 'Get your plan' },
  { id: 8, title: 'Summary', description: 'Review responses' },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { state, setCurrentStep } = useMindmaker();

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-background border-b border-border shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Workshop Progress</span>
            <span className="text-sm text-muted-foreground">
              {Object.values(state.stepProgress).filter(s => s.completed).length}/8 Steps
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-gradient-purple h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${(Object.values(state.stepProgress).filter(s => s.completed).length / 8) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          {STEPS.map((step) => {
            const stepProgress = state.stepProgress[step.id];
            const isCompleted = stepProgress?.completed || false;
            const isCurrent = state.currentStep === step.id;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={cn(
                  "w-full text-left p-4 rounded-lg border transition-all duration-200",
                  isCurrent 
                    ? "bg-gradient-purple text-white border-primary shadow-md" 
                    : "bg-card border-border hover:border-primary/50 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-success fill-success" />
                    ) : (
                      <Circle className={cn(
                        "w-5 h-5",
                        isCurrent ? "text-white" : "text-muted-foreground"
                      )} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "font-medium text-sm",
                      isCurrent ? "text-white" : "text-foreground"
                    )}>
                      Step {step.id}: {step.title}
                    </div>
                    <div className={cn(
                      "text-xs mt-1",
                      isCurrent ? "text-white/80" : "text-muted-foreground"
                    )}>
                      {step.description}
                    </div>
                  </div>
                  
                  {isCurrent && (
                    <ArrowRight className="w-4 h-4 text-white flex-shrink-0" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* CTA Button */}
        <div className="pt-4 border-t border-border">
          <Button 
            className="w-full bg-gradient-purple hover:opacity-90 text-white"
            onClick={onClose}
          >
            Continue Workshop
          </Button>
        </div>

        {/* Save Status */}
        {state.lastSaved && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-center text-muted-foreground">
              Last saved: {state.lastSaved instanceof Date ? state.lastSaved.toLocaleTimeString() : 'Recently'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};