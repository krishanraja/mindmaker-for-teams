import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { CanvasData, AppState, StepProgress } from '../types/canvas';
import { toast } from 'sonner';

interface CanvasContextType {
  state: AppState;
  updateCanvasData: (data: Partial<CanvasData>) => void;
  setCurrentStep: (step: number) => void;
  markStepCompleted: (step: number) => void;
  markStepVisited: (step: number) => void;
  resetCanvas: () => void;
  saveToStorage: () => void;
}

const initialCanvasData: CanvasData = {
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
  userName: '',
  businessEmail: '',
  logoFile: null,
  ndaAccepted: false,
};

const initialState: AppState = {
  currentStep: 1,
  canvasData: initialCanvasData,
  stepProgress: {},
  lastSaved: null,
};

type Action = 
  | { type: 'UPDATE_CANVAS_DATA'; payload: Partial<CanvasData> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_STEP_COMPLETED'; payload: number }
  | { type: 'MARK_STEP_VISITED'; payload: number }
  | { type: 'RESET_CANVAS' }
  | { type: 'LOAD_FROM_STORAGE'; payload: AppState }
  | { type: 'UPDATE_LAST_SAVED'; payload: Date };

const canvasReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'UPDATE_CANVAS_DATA':
      return {
        ...state,
        canvasData: { ...state.canvasData, ...action.payload },
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
    case 'RESET_CANVAS':
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

const CanvasContext = createContext<CanvasContextType | null>(null);

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(canvasReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('fractionl-canvas-data');
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
  }, [state.canvasData]);

  const saveToStorage = useCallback(() => {
    try {
      const dataToSave = {
        ...state,
        lastSaved: new Date(),
      };
      localStorage.setItem('fractionl-canvas-data', JSON.stringify(dataToSave));
      dispatch({ type: 'UPDATE_LAST_SAVED', payload: new Date() });
    } catch (error) {
      console.error('Failed to save data:', error);
      toast.error('Failed to save progress');
    }
  }, [state]);

  const updateCanvasData = useCallback((data: Partial<CanvasData>) => {
    dispatch({ type: 'UPDATE_CANVAS_DATA', payload: data });
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

  const resetCanvas = useCallback(() => {
    localStorage.removeItem('fractionl-canvas-data');
    dispatch({ type: 'RESET_CANVAS' });
  }, []);

  const value: CanvasContextType = {
    state,
    updateCanvasData,
    setCurrentStep,
    markStepCompleted,
    markStepVisited,
    resetCanvas,
    saveToStorage,
  };

  return (
    <CanvasContext.Provider value={value}>
      {children}
    </CanvasContext.Provider>
  );
};