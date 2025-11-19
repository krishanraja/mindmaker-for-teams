import React from 'react';
import { NewExecutiveReport } from './provocation/NewExecutiveReport';

interface Segment7ProvocationProps {
  workshopId: string;
}

export const Segment7Provocation: React.FC<Segment7ProvocationProps> = ({ workshopId }) => {
  return (
    <div className="min-h-screen bg-background py-4">
      <div className="max-w-7xl mx-auto px-4 lg:px-6">
        <NewExecutiveReport workshopId={workshopId} />
      </div>
    </div>
  );
};
