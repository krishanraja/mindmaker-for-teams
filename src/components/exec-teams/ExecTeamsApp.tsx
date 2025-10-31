import React from 'react';
import { useExecTeams } from '@/contexts/ExecTeamsContext';
import { ExecTeamsWelcome } from './ExecTeamsWelcome';
import { OrganizerIntakeForm } from './OrganizerIntakeForm';
import { SimulationConfigurator } from './SimulationConfigurator';
import { BootcampBookingSummary } from './BootcampBookingSummary';

export const ExecTeamsApp: React.FC = () => {
  const { state } = useExecTeams();

  if (state.currentStep === 1) {
    return <ExecTeamsWelcome key="welcome-step-1" />;
  }

  if (state.currentStep === 2) {
    return <OrganizerIntakeForm />;
  }

  if (state.currentStep === 3) {
    return <SimulationConfigurator />;
  }

  if (state.currentStep === 4) {
    return <BootcampBookingSummary />;
  }

  return <ExecTeamsWelcome key="welcome-default" />;
}
