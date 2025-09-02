import React from 'react';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';

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

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { state, setCurrentStep } = useMindmaker();
  

  // Mobile version (used in Sheet)
  if (onNavigate) {
    return (
      <div className="h-full w-full bg-card">
        <div className="p-6">
          {/* Logo Area */}
          <div className="mb-8">
            <div className="w-24 h-24 mb-2 flex items-center justify-center">
              <img 
                src="/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png" 
                alt="AI Mindmaker Logo" 
                className="w-24 h-24 object-contain"
              />
            </div>
            <h2 className="font-outfit font-semibold text-lg text-foreground">
              AI Mindmaker
            </h2>
            <p className="text-sm text-muted-foreground">
              Build your AI workshop
            </p>
          </div>

          {/* Progress Overview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Progress</span>
              <span className="text-sm text-muted-foreground">
               {Object.values(state.stepProgress).filter(s => s.completed).length}/8
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-purple h-2 rounded-full transition-all duration-300"
                style={{ 
                 width: `${(Object.values(state.stepProgress).filter(s => s.completed).length / 8) * 100}%`
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

            return (
              <div
                key={step.id}
                className={cn(
                  "w-full text-left p-3 rounded-lg",
                  isCurrent && "bg-gradient-purple text-white"
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
              </div>
            );
          })}
          </nav>

          {/* Save Status */}
          {state.lastSaved && (
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Last saved: {state.lastSaved instanceof Date ? state.lastSaved.toLocaleTimeString() : 'Recently'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop version (fixed sidebar)
  return (
    <div className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-10">
      <div className="p-6">
        {/* Logo Area */}
        <div className="mb-8">
          <div className="w-24 h-24 mb-2 flex items-center justify-center">
            <img 
              src="/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png" 
              alt="AI Mindmaker Logo" 
              className="w-24 h-24 object-contain"
            />
          </div>
          <h2 className="font-outfit font-semibold text-lg text-foreground">
            AI Mindmaker
          </h2>
          <p className="text-sm text-muted-foreground">
            Build your AI workshop
          </p>
        </div>

        {/* Progress Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">
              {Object.values(state.stepProgress).filter(s => s.completed).length}/8
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-gradient-purple h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(Object.values(state.stepProgress).filter(s => s.completed).length / 8) * 100}%` 
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

            return (
              <div
                key={step.id}
                className={cn(
                  "w-full text-left p-3 rounded-lg",
                  isCurrent && "bg-gradient-purple text-white"
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
              </div>
            );
          })}
        </nav>

        {/* Save Status */}
        {state.lastSaved && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Last saved: {state.lastSaved instanceof Date ? state.lastSaved.toLocaleTimeString() : 'Recently'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};