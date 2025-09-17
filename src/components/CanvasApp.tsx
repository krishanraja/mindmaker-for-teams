import React from 'react';
import { useMindmaker } from '../contexts/MindmakerContext';
import { Step1Welcome } from './steps/Step1Welcome';
import { AITransformationFlow } from './ai/AITransformationFlow';

export const MindmakerApp: React.FC = () => {
  const { state } = useMindmaker();

  // Only show Step1Welcome initially
  // AI will handle the entire flow after user starts conversation
  return (
    <>
      {state.currentStep === 1 ? (
        <Step1Welcome />
      ) : (
        <AITransformationFlow />
      )}
    </>
  );
};