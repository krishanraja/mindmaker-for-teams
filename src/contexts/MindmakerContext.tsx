import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Clean, minimal data structure
export interface AIDiscoveryData {
  // Core business essentials
  businessName: string;
  businessDescription: string;
  industry: string;
  employeeCount: number;
  
  // AI readiness essentials
  currentAIUse: string;
  teamReadiness: number; // 0-100 calculated score
  learningModality: string;
  successTargets: string[];
  
  // Contact essentials  
  userName: string;
  businessEmail: string;
}

export interface AppState {
  currentStep: number; // 1 = welcome, 2 = conversation, 3 = results
  discoveryData: AIDiscoveryData;
  conversationComplete: boolean;
}

interface MindmakerContextType {
  state: AppState;
  updateDiscoveryData: (data: Partial<AIDiscoveryData>) => void;
  setCurrentStep: (step: number) => void;
  markConversationComplete: () => void;
  resetMindmaker: () => void;
}

const initialData: AIDiscoveryData = {
  businessName: '',
  businessDescription: '',
  industry: '',
  employeeCount: 0,
  currentAIUse: '',
  teamReadiness: 50,
  learningModality: '',
  successTargets: [],
  userName: '',
  businessEmail: '',
};

const initialState: AppState = {
  currentStep: 1,
  discoveryData: initialData,
  conversationComplete: false,
};

type Action = 
  | { type: 'UPDATE_DATA'; payload: Partial<AIDiscoveryData> }
  | { type: 'SET_STEP'; payload: number }
  | { type: 'COMPLETE_CONVERSATION' }
  | { type: 'RESET' };

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'UPDATE_DATA':
      return {
        ...state,
        discoveryData: { ...state.discoveryData, ...action.payload },
      };
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'COMPLETE_CONVERSATION':
      return { ...state, conversationComplete: true, currentStep: 3 };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
};

const MindmakerContext = createContext<MindmakerContextType | null>(null);

export const useMindmaker = () => {
  const context = useContext(MindmakerContext);
  if (!context) {
    throw new Error('useMindmaker must be used within MindmakerProvider');
  }
  return context;
};

export const MindmakerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateDiscoveryData = useCallback((data: Partial<AIDiscoveryData>) => {
    dispatch({ type: 'UPDATE_DATA', payload: data });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const markConversationComplete = useCallback(() => {
    dispatch({ type: 'COMPLETE_CONVERSATION' });
  }, []);

  const resetMindmaker = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return (
    <MindmakerContext.Provider value={{
      state,
      updateDiscoveryData,
      setCurrentStep,
      markConversationComplete,
      resetMindmaker,
    }}>
      {children}
    </MindmakerContext.Provider>
  );
};