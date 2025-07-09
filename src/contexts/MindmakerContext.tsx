import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { MindmakerData, AppState, StepProgress } from '../types/canvas';
import { toast } from 'sonner';

interface MindmakerContextType {
  state: AppState;
  updateMindmakerData: (data: Partial<MindmakerData>) => void;
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  markStepVisited: (step: number) => void;
  resetMindmaker: () => void;
  saveToStorage: () => void;
}

const initialMindmakerData: MindmakerData = {
  employeeCount: 0,
  businessFunctions: [],
  aiAdoption: 'none',
  anxietyLevels: {
    executives: 50,
    middleManagement: 50,
    frontlineStaff: 50,
    techTeam: 50,
    nonTechTeam: 50,
  },
  aiSkills: [],
  automationRisks: [],
  learningModality: 'live-cohort',
  changeNarrative: '',
  successTargets: [],
  businessName: '',
  businessDescription: '',
  userName: '',
  businessEmail: '',
  businessUrl: '',
  company: '',
  country: '',
  logoFile: null,
  ndaAccepted: false,
};

const initialState: AppState = {
  currentStep: 1,
  mindmakerData: initialMindmakerData,
  stepProgress: {},
  lastSaved: null,
};

type Action = 
  | { type: 'UPDATE_MINDMAKER_DATA'; payload: Partial<MindmakerData> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_VISITED'; payload: number }
  | { type: 'RESET_MINDMAKER' }
  | { type: 'LOAD_FROM_STORAGE'; payload: AppState }
  | { type: 'UPDATE_LAST_SAVED'; payload: Date };

const mindmakerReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'UPDATE_MINDMAKER_DATA':
      return {
        ...state,
        mindmakerData: { ...state.mindmakerData, ...action.payload },
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
        stepProgress: {
          ...state.stepProgress,
          [action.payload]: {
            ...state.stepProgress[action.payload],
            visited: true,
          },
        },
      };
    case 'MARK_STEP_COMPLETED':
      return {
        ...state,
        stepProgress: {
          ...state.stepProgress,
          [action.payload]: {
            completed: true,
            visited: true,
          },
        },
      };
    case 'MARK_STEP_VISITED':
      return {
        ...state,
        stepProgress: {
          ...state.stepProgress,
          [action.payload]: {
            ...state.stepProgress[action.payload],
            visited: true,
          },
        },
      };
    case 'RESET_MINDMAKER':
      return initialState;
    case 'LOAD_FROM_STORAGE':
      return action.payload;
    case 'UPDATE_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.payload,
      };
    default:
      return state;
  }
};

const MindmakerContext = createContext<MindmakerContextType | null>(null);

export const useMindmaker = () => {
  const context = useContext(MindmakerContext);
  if (!context) {
    throw new Error('useMindmaker must be used within a MindmakerProvider');
  }
  return context;
};

export const MindmakerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(mindmakerReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('fractionl-mindmaker-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert lastSaved string back to Date object if it exists
        if (parsed.lastSaved) {
          parsed.lastSaved = new Date(parsed.lastSaved);
        }
        dispatch({ type: 'LOAD_FROM_STORAGE', payload: parsed });
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Auto-save every 3 seconds after changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage();
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [state.mindmakerData]);

  const saveToStorage = useCallback(() => {
    try {
      const dataToSave = {
        ...state,
        lastSaved: new Date(),
      };
      localStorage.setItem('fractionl-mindmaker-data', JSON.stringify(dataToSave));
      dispatch({ type: 'UPDATE_LAST_SAVED', payload: new Date() });
    } catch (error) {
      console.error('Failed to save data:', error);
      toast.error('Failed to save progress');
    }
  }, [state]);

  const updateMindmakerData = useCallback((data: Partial<MindmakerData>) => {
    dispatch({ type: 'UPDATE_MINDMAKER_DATA', payload: data });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const markStepCompleted = useCallback((step: number) => {
    dispatch({ type: 'MARK_STEP_COMPLETED', payload: step });
  }, []);

  const markStepVisited = useCallback((step: number) => {
    dispatch({ type: 'MARK_STEP_VISITED', payload: step });
  }, []);

  const resetMindmaker = useCallback(() => {
    localStorage.removeItem('fractionl-mindmaker-data');
    dispatch({ type: 'RESET_MINDMAKER' });
  }, []);

  const value: MindmakerContextType = {
    state,
    updateMindmakerData,
    setCurrentStep,
    markStepCompleted,
    markStepVisited,
    resetMindmaker,
    saveToStorage,
  };

  return (
    <MindmakerContext.Provider value={value}>
      {children}
    </MindmakerContext.Provider>
  );
};