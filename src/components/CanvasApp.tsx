import React from 'react';
import { useStreamlinedMindmaker } from '../contexts/StreamlinedMindmakerContext';
import { Step1Welcome } from './steps/Step1Welcome';
import { AITransformationFlow } from './ai/AITransformationFlow';

export const MindmakerApp: React.FC = () => {
  const { state } = useStreamlinedMindmaker();

  // CEO-Grade Flow: Welcome → AI Conversation → Personalized Results
  return (
    <>
      {!state.conversationComplete ? (
        <Step1Welcome />
      ) : (
        <AITransformationFlow />
      )}
    </>
  );
};