import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

export interface Participant {
  name: string;
  email: string;
  role: string;
}

export interface SimulationSnapshot {
  id: string;
  currentState: string;
  stakeholders: string;
  desiredOutcome: string;
  timeConstraint: string;
  budgetConstraint: string;
  dataAvailability: string;
  successCriteria: string;
}

export interface ExecIntakeData {
  companyName: string;
  industry: string;
  strategicObjectives: string;
  anticipatedBottlenecks: string[];
  participants: Participant[];
  preferredDates: string[];
  schedulingNotes: string;
  organizerName: string;
  organizerEmail: string;
}

// AI Readiness & Workshop Context
export interface AIReadinessData {
  aiMythsConcerns: string[];
  currentBottlenecks: string[];
  aiExperienceLevel: 'none' | 'experimenting' | 'deploying' | 'scaled';
}

export interface StrategicContextData {
  strategicGoals2026: string[];
  competitiveLandscape: string;
  riskTolerance: number; // 1-5
  stillDefiningObjectives?: boolean;
}

export interface PilotExpectationsData {
  pilotDescription: string;
  pilotOwnerName: string;
  pilotOwnerRole: string;
  budgetRange: string;
}

export interface ExecTeamsState {
  currentStep: number; // 1: welcome, 2: intake, 3: configurator, 4: summary
  intakeData: ExecIntakeData;
  intakeId?: string;
  selectedSimulations: string[];
  simulation1Snapshot?: SimulationSnapshot;
  simulation2Snapshot?: SimulationSnapshot;
  aiReadinessData?: AIReadinessData;
  strategicContextData?: StrategicContextData;
  pilotExpectationsData?: PilotExpectationsData;
  bootcampPlanId?: string;
  cognitiveBaseline?: any;
  jargonLevel: number; // 0-100: controls content complexity across entire tool
}

interface ExecTeamsContextType {
  state: ExecTeamsState;
  updateIntakeData: (data: Partial<ExecIntakeData>) => void;
  updateAIReadinessData: (data: Partial<AIReadinessData>) => void;
  updateStrategicContextData: (data: Partial<StrategicContextData>) => void;
  updatePilotExpectationsData: (data: Partial<PilotExpectationsData>) => void;
  setCurrentStep: (step: number) => void;
  setIntakeId: (id: string) => void;
  selectSimulation: (simulationId: string) => void;
  deselectSimulation: (simulationId: string) => void;
  updateSimulation1Snapshot: (data: Partial<SimulationSnapshot>) => void;
  updateSimulation2Snapshot: (data: Partial<SimulationSnapshot>) => void;
  setBootcampPlanId: (id: string) => void;
  setCognitiveBaseline: (data: any) => void;
  setJargonLevel: (level: number) => void;
  resetExecTeams: () => void;
}

type Action = 
  | { type: 'UPDATE_INTAKE_DATA'; payload: Partial<ExecIntakeData> }
  | { type: 'UPDATE_AI_READINESS'; payload: Partial<AIReadinessData> }
  | { type: 'UPDATE_STRATEGIC_CONTEXT'; payload: Partial<StrategicContextData> }
  | { type: 'UPDATE_PILOT_EXPECTATIONS'; payload: Partial<PilotExpectationsData> }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_INTAKE_ID'; payload: string }
  | { type: 'SELECT_SIMULATION'; payload: string }
  | { type: 'DESELECT_SIMULATION'; payload: string }
  | { type: 'UPDATE_SIMULATION_1'; payload: Partial<SimulationSnapshot> }
  | { type: 'UPDATE_SIMULATION_2'; payload: Partial<SimulationSnapshot> }
  | { type: 'SET_BOOTCAMP_PLAN_ID'; payload: string }
  | { type: 'SET_COGNITIVE_BASELINE'; payload: any }
  | { type: 'SET_JARGON_LEVEL'; payload: number }
  | { type: 'RESET' };

const initialIntakeData: ExecIntakeData = {
  companyName: '',
  industry: '',
  strategicObjectives: '',
  anticipatedBottlenecks: [],
  participants: [],
  preferredDates: [],
  schedulingNotes: '',
  organizerName: '',
  organizerEmail: '',
};

const initialState: ExecTeamsState = {
  currentStep: 1,
  intakeData: initialIntakeData,
  selectedSimulations: [],
  jargonLevel: 50, // Default to balanced complexity
};

function reducer(state: ExecTeamsState, action: Action): ExecTeamsState {
  switch (action.type) {
    case 'UPDATE_INTAKE_DATA':
      return {
        ...state,
        intakeData: { ...state.intakeData, ...action.payload },
      };
    case 'UPDATE_AI_READINESS':
      return {
        ...state,
        aiReadinessData: { 
          aiMythsConcerns: [],
          currentBottlenecks: [],
          aiExperienceLevel: 'none' as const,
          ...state.aiReadinessData, 
          ...action.payload 
        } as AIReadinessData,
      };
    case 'UPDATE_STRATEGIC_CONTEXT':
      return {
        ...state,
        strategicContextData: { 
          strategicGoals2026: [],
          competitiveLandscape: '',
          riskTolerance: 3,
          stillDefiningObjectives: false,
          ...state.strategicContextData, 
          ...action.payload 
        } as StrategicContextData,
      };
    case 'UPDATE_PILOT_EXPECTATIONS':
      return {
        ...state,
        pilotExpectationsData: { 
          pilotDescription: '',
          pilotOwnerName: '',
          pilotOwnerRole: '',
          budgetRange: '',
          ...state.pilotExpectationsData, 
          ...action.payload 
        } as PilotExpectationsData,
      };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_INTAKE_ID':
      return { ...state, intakeId: action.payload };
    case 'SELECT_SIMULATION':
      if (state.selectedSimulations.length >= 2) return state;
      return {
        ...state,
        selectedSimulations: [...state.selectedSimulations, action.payload],
      };
    case 'DESELECT_SIMULATION':
      return {
        ...state,
        selectedSimulations: state.selectedSimulations.filter(id => id !== action.payload),
      };
    case 'UPDATE_SIMULATION_1':
      return {
        ...state,
        simulation1Snapshot: { ...state.simulation1Snapshot, ...action.payload } as SimulationSnapshot,
      };
    case 'UPDATE_SIMULATION_2':
      return {
        ...state,
        simulation2Snapshot: { ...state.simulation2Snapshot, ...action.payload } as SimulationSnapshot,
      };
    case 'SET_BOOTCAMP_PLAN_ID':
      return { ...state, bootcampPlanId: action.payload };
    case 'SET_COGNITIVE_BASELINE':
      return { ...state, cognitiveBaseline: action.payload };
    case 'SET_JARGON_LEVEL':
      return { ...state, jargonLevel: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const ExecTeamsContext = createContext<ExecTeamsContextType | null>(null);

export function useExecTeams() {
  const context = useContext(ExecTeamsContext);
  if (!context) {
    throw new Error('useExecTeams must be used within ExecTeamsProvider');
  }
  return context;
}

export function ExecTeamsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateIntakeData = useCallback((data: Partial<ExecIntakeData>) => {
    dispatch({ type: 'UPDATE_INTAKE_DATA', payload: data });
  }, []);

  const updateAIReadinessData = useCallback((data: Partial<AIReadinessData>) => {
    dispatch({ type: 'UPDATE_AI_READINESS', payload: data });
  }, []);

  const updateStrategicContextData = useCallback((data: Partial<StrategicContextData>) => {
    dispatch({ type: 'UPDATE_STRATEGIC_CONTEXT', payload: data });
  }, []);

  const updatePilotExpectationsData = useCallback((data: Partial<PilotExpectationsData>) => {
    dispatch({ type: 'UPDATE_PILOT_EXPECTATIONS', payload: data });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const setIntakeId = useCallback((id: string) => {
    dispatch({ type: 'SET_INTAKE_ID', payload: id });
  }, []);

  const selectSimulation = useCallback((simulationId: string) => {
    dispatch({ type: 'SELECT_SIMULATION', payload: simulationId });
  }, []);

  const deselectSimulation = useCallback((simulationId: string) => {
    dispatch({ type: 'DESELECT_SIMULATION', payload: simulationId });
  }, []);

  const updateSimulation1Snapshot = useCallback((data: Partial<SimulationSnapshot>) => {
    dispatch({ type: 'UPDATE_SIMULATION_1', payload: data });
  }, []);

  const updateSimulation2Snapshot = useCallback((data: Partial<SimulationSnapshot>) => {
    dispatch({ type: 'UPDATE_SIMULATION_2', payload: data });
  }, []);

  const setBootcampPlanId = useCallback((id: string) => {
    dispatch({ type: 'SET_BOOTCAMP_PLAN_ID', payload: id });
  }, []);

  const setCognitiveBaseline = useCallback((data: any) => {
    dispatch({ type: 'SET_COGNITIVE_BASELINE', payload: data });
  }, []);

  const setJargonLevel = useCallback((level: number) => {
    dispatch({ type: 'SET_JARGON_LEVEL', payload: level });
  }, []);

  const resetExecTeams = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = useMemo(() => ({
    state,
    updateIntakeData,
    updateAIReadinessData,
    updateStrategicContextData,
    updatePilotExpectationsData,
    setCurrentStep,
    setIntakeId,
    selectSimulation,
    deselectSimulation,
    updateSimulation1Snapshot,
    updateSimulation2Snapshot,
    setBootcampPlanId,
    setCognitiveBaseline,
    setJargonLevel,
    resetExecTeams,
  }), [
    state,
    updateIntakeData,
    updateAIReadinessData,
    updateStrategicContextData,
    updatePilotExpectationsData,
    setCurrentStep,
    setIntakeId,
    selectSimulation,
    deselectSimulation,
    updateSimulation1Snapshot,
    updateSimulation2Snapshot,
    setBootcampPlanId,
    setCognitiveBaseline,
    setJargonLevel,
    resetExecTeams,
  ]);

  return (
    <ExecTeamsContext.Provider value={value}>
      {children}
    </ExecTeamsContext.Provider>
  );
}
