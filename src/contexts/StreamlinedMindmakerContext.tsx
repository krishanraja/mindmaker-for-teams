import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { trackEngagementEvent } from '../lib/lead-capture';

// Simplified data structure for AI-first flow
export interface AIDiscoveryData {
  // Core business info
  businessName: string;
  businessDescription: string;
  industry: string;
  employeeCount: number;
  businessFunctions: string[];
  
  // AI readiness
  aiAdoption: 'none' | 'pilots' | 'team-level' | 'enterprise-wide';
  teamReadiness: number; // 0-100 confidence score
  
  // Learning preferences
  learningModality: 'live-cohort' | 'self-paced' | 'coaching' | 'chatbot' | 'blended';
  successTargets: string[];
  
  // Contact details
  userName: string;
  businessEmail: string;
  country: string;
}

export interface StreamlinedAppState {
  currentStep: number; // 1 = welcome, 2 = AI flow, 3 = results
  discoveryData: AIDiscoveryData;
  conversationComplete: boolean;
  lastSaved: Date | null;
}

interface StreamlinedMindmakerContextType {
  state: StreamlinedAppState;
  updateDiscoveryData: (data: Partial<AIDiscoveryData>) => void;
  setCurrentStep: (step: number) => void;
  markConversationComplete: () => void;
  resetMindmaker: () => void;
  saveToStorage: () => void;
}

const initialDiscoveryData: AIDiscoveryData = {
  businessName: '',
  businessDescription: '',
  industry: '',
  employeeCount: 0,
  businessFunctions: [],
  aiAdoption: 'none',
  teamReadiness: 50,
  learningModality: 'live-cohort',
  successTargets: [],
  userName: '',
  businessEmail: '',
  country: '',
};

const initialState: StreamlinedAppState = {
  currentStep: 1,
  discoveryData: initialDiscoveryData,
  conversationComplete: false,
  lastSaved: null,
};

type Action = 
  | { type: 'UPDATE_DISCOVERY_DATA'; payload: Partial<AIDiscoveryData> }
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'MARK_CONVERSATION_COMPLETE' }
  | { type: 'RESET_MINDMAKER' }
  | { type: 'LOAD_FROM_STORAGE'; payload: StreamlinedAppState }
  | { type: 'UPDATE_LAST_SAVED'; payload: Date };

const mindmakerReducer = (state: StreamlinedAppState, action: Action): StreamlinedAppState => {
  switch (action.type) {
    case 'UPDATE_DISCOVERY_DATA':
      return {
        ...state,
        discoveryData: { ...state.discoveryData, ...action.payload },
      };
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'MARK_CONVERSATION_COMPLETE':
      return {
        ...state,
        conversationComplete: true,
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

const StreamlinedMindmakerContext = createContext<StreamlinedMindmakerContextType | null>(null);

export const useStreamlinedMindmaker = () => {
  const context = useContext(StreamlinedMindmakerContext);
  if (!context) {
    throw new Error('useStreamlinedMindmaker must be used within a StreamlinedMindmakerProvider');
  }
  return context;
};

export const StreamlinedMindmakerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(mindmakerReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('fractionl-streamlined-mindmaker-data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
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
  }, [state.discoveryData]);

  const saveToStorage = useCallback(() => {
    try {
      const dataToSave = {
        ...state,
        lastSaved: new Date(),
      };
      localStorage.setItem('fractionl-streamlined-mindmaker-data', JSON.stringify(dataToSave));
      dispatch({ type: 'UPDATE_LAST_SAVED', payload: new Date() });
    } catch (error) {
      console.error('Failed to save data:', error);
      toast.error('Failed to save progress');
    }
  }, [state]);

  const updateDiscoveryData = useCallback((data: Partial<AIDiscoveryData>) => {
    dispatch({ type: 'UPDATE_DISCOVERY_DATA', payload: data });
    trackEngagementEvent('data_updated', { fields: Object.keys(data) });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
    trackEngagementEvent('step_visited', { step });
  }, []);

  const markConversationComplete = useCallback(() => {
    dispatch({ type: 'MARK_CONVERSATION_COMPLETE' });
    trackEngagementEvent('conversation_completed', { 
      businessName: state.discoveryData.businessName,
      completionTime: new Date().toISOString()
    });
  }, [state.discoveryData.businessName]);

  const resetMindmaker = useCallback(() => {
    localStorage.removeItem('fractionl-streamlined-mindmaker-data');
    dispatch({ type: 'RESET_MINDMAKER' });
  }, []);

  const value: StreamlinedMindmakerContextType = {
    state,
    updateDiscoveryData,
    setCurrentStep,
    markConversationComplete,
    resetMindmaker,
    saveToStorage,
  };

  return (
    <StreamlinedMindmakerContext.Provider value={value}>
      {children}
    </StreamlinedMindmakerContext.Provider>
  );
};