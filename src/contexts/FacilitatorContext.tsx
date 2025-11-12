import React, { createContext, useContext } from 'react';
import { WorkshopSession, BootcampPlan } from '@/types/workshop';

interface FacilitatorContextType {
  workshopId: string;
  workshop: WorkshopSession | null;
  bootcampPlanData: BootcampPlan | null;
}

const FacilitatorContext = createContext<FacilitatorContextType | null>(null);

export const useFacilitatorContext = () => {
  const context = useContext(FacilitatorContext);
  if (!context) {
    throw new Error('useFacilitatorContext must be used within FacilitatorProvider');
  }
  return context;
};

interface FacilitatorProviderProps {
  workshopId: string;
  workshop: WorkshopSession | null;
  bootcampPlanData: BootcampPlan | null;
  children: React.ReactNode;
}

export const FacilitatorProvider: React.FC<FacilitatorProviderProps> = ({
  workshopId,
  workshop,
  bootcampPlanData,
  children,
}) => {
  return (
    <FacilitatorContext.Provider value={{ workshopId, workshop, bootcampPlanData }}>
      {children}
    </FacilitatorContext.Provider>
  );
};
