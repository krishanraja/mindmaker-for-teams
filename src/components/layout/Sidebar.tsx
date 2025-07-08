import React from 'react';
import { useCanvas } from '../../contexts/CanvasContext';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const STEPS = [
  { id: 1, title: 'Welcome', description: 'Get started' },
  { id: 2, title: 'Organization', description: 'Team snapshot' },
  { id: 3, title: 'Anxiety Pulse', description: 'Assess concerns' },
  { id: 4, title: 'Capability Map', description: 'Skills & risks' },
  { id: 5, title: 'Habit Hooks', description: 'Learning style' },
  { id: 6, title: 'Success Goals', description: 'Define targets' },
  { id: 7, title: 'Canvas Results', description: 'Get your plan' },
];

export const Sidebar: React.FC = () => {
  const { state, setCurrentStep } = useCanvas();
  
  const handleStepClick = (stepId: number) => {
    // Allow navigation to visited steps or the next unvisited step
    const stepProgress = state.stepProgress[stepId];
    const canNavigate = stepProgress?.visited || stepId === state.currentStep || stepId === state.currentStep + 1;
    
    if (canNavigate) {
      setCurrentStep(stepId);
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-70 bg-card border-r border-border z-10">
      <div className="p-6">
        {/* Logo Area */}
        <div className="mb-8">
          <div className="w-12 h-12 bg-gradient-purple rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-outfit font-bold text-xl">F</span>
          </div>
          <h2 className="font-outfit font-semibold text-lg text-foreground">
            AI Canvas
          </h2>
          <p className="text-sm text-muted-foreground">
            Build your transformation plan
          </p>
        </div>

        {/* Progress Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">
              {Object.values(state.stepProgress).filter(s => s.completed).length}/7
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-purple h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Object.values(state.stepProgress).filter(s => s.completed).length / 7) * 100}%` 
              }}
            />
          </div>
        </div>

        {/* Steps List */}
        <nav className="space-y-2">
          {STEPS.map((step) => {
            const stepProgress = state.stepProgress[step.id];
            const isCompleted = stepProgress?.completed || false;
            const isVisited = stepProgress?.visited || false;
            const isCurrent = state.currentStep === step.id;
            const canNavigate = isVisited || step.id === state.currentStep || step.id === state.currentStep + 1;

            return (
              <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                disabled={!canNavigate}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all duration-200 group",
                  "hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-50",
                  isCurrent && "bg-gradient-purple text-white",
                  !isCurrent && canNavigate && "hover:bg-muted",
                  !canNavigate && "opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-success" />
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
                      {step.title}
                    </div>
                    <div className={cn(
                      "text-xs",
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
        </nav>

        {/* Save Status */}
        {state.lastSaved && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Last saved: {state.lastSaved.toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};