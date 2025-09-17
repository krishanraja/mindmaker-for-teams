import React from 'react';
import { useMindmaker } from '../contexts/MindmakerContext';
import { WelcomeScreen } from './WelcomeScreen';
import { ExecutiveFlow } from './ExecutiveFlow';
import { ResultsScreen } from './ResultsScreen';

export const MindmakerApp: React.FC = () => {
  const { state } = useMindmaker();

  // Clean single-flow architecture
  if (state.currentStep === 1) {
    return <WelcomeScreen />;
  }
  
  if (state.currentStep === 2) {
    return <ExecutiveFlow />;
  }
  
  if (state.currentStep === 3 || state.conversationComplete) {
    return <ResultsScreen />;
  }

  // Fallback
  return <WelcomeScreen />;
};