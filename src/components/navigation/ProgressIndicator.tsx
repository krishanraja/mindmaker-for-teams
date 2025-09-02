import React from 'react';
import { useMindmaker } from '@/contexts/MindmakerContext';
import { CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProgressIndicator: React.FC = () => {
  const { state } = useMindmaker();
  
  const completedSteps = Object.values(state.stepProgress).filter(s => s.completed).length;
  const totalSteps = 8;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="flex items-center space-x-3">
      {/* Progress Circle */}
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
          {/* Background circle */}
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted"
          />
          {/* Progress circle */}
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 12}`}
            strokeDashoffset={`${2 * Math.PI * 12 * (1 - progressPercentage / 100)}`}
            className="text-primary transition-all duration-500"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-foreground">
            {completedSteps}
          </span>
        </div>
      </div>

      {/* Progress Text */}
      <div className="hidden sm:block">
        <div className="text-xs font-medium text-foreground">
          Step {state.currentStep} of {totalSteps}
        </div>
        <div className="text-xs text-muted-foreground">
          {completedSteps} completed
        </div>
      </div>
    </div>
  );
};