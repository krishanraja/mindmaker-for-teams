import React from 'react';
import { useMindmaker } from '../contexts/MindmakerContext';
import { Step1Welcome } from './steps/Step1Welcome';
import { Step2Organization } from './steps/Step2Organization';
import { Step3AnxietyPulse } from './steps/Step3AnxietyPulse';
import { Step4CapabilityMap } from './steps/Step4CapabilityMap';
import { Step5HabitHooks } from './steps/Step5HabitHooks';
import { Step6SuccessGoals } from './steps/Step6SuccessGoals';
import { Step7Mindmaker } from './steps/Step7Canvas';

export const MindmakerApp: React.FC = () => {
  const { state } = useMindmaker();

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <Step1Welcome />;
      case 2:
        return <Step2Organization />;
      case 3:
        return <Step3AnxietyPulse />;
      case 4:
        return <Step4CapabilityMap />;
      case 5:
        return <Step5HabitHooks />;
      case 6:
        return <Step6SuccessGoals />;
      case 7:
        return <Step7Mindmaker />;
      default:
        return <Step1Welcome />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderStep()}
    </div>
  );
};