import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Strategic discovery data for AI revenue impact assessment
export interface AIDiscoveryData {
  // Core business essentials
  businessName: string;
  contactName: string;
  contactEmail: string;
  
  // AI revenue impact assessment
  aiUsagePercentage: string;
  growthUseCases: string;
  messagingAdaptation: string;
  revenueKPIs: string;
  powerUsers: string;
  teamRecognition: string;
  
  // Lead qualification data
  authorityLevel?: string;
  implementationTimeline?: string;
  leadScore?: number;
  qualificationTier?: 'Hot' | 'Warm' | 'Cold';
  emailDomainType?: 'Business' | 'Personal';
  
  // Legacy fields for backwards compatibility
  industry?: string;
  employeeCount?: number;
  currentAIUse?: string;
  biggestChallenges?: string[];
  leadershipVision?: string;
  learningPreferences?: string;
  successMetrics?: string[];
  contactRole?: string;
  
  // Assessment results
  aiInsights?: {
    readinessScore: number;
    category: string;
    description: string;
    recommendations: string[];
    riskFactors: string[];
    opportunityAreas: string[];
    investmentRange: string;
    aiMaturityScore?: number;
    revenueImpactPotential?: number;
    implementationReadiness?: number;
    strategicSummary?: string;
    recommendedModules?: any[];
  };
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
  contactName: '',
  contactEmail: '',
  aiUsagePercentage: '',
  growthUseCases: '',
  messagingAdaptation: '',
  revenueKPIs: '',
  powerUsers: '',
  teamRecognition: '',
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