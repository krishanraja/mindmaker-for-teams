export interface CanvasData {
  // Step 2: Organization Snapshot
  employeeCount: number;
  businessFunctions: string[];
  aiAdoption: 'none' | 'pilots' | 'team-level' | 'enterprise-wide';
  
  // Step 3: Anxiety Pulse
  anxietyLevels: {
    executives: number;
    middleManagement: number;
    frontlineStaff: number;
    techTeam: number;
    nonTechTeam: number;
  };
  
  // Step 4: Capability Map
  aiSkills: string[];
  automationRisks: string[];
  
  // Step 5: Habit Hooks
  learningModality: 'live-cohort' | 'self-paced' | 'coaching' | 'chatbot' | 'blended';
  changeNarrative: string;
  
  // Step 6: Success Goals
  successTargets: string[];
  
  // Step 7: Contact Details
  businessName: string;
  userName: string;
  businessEmail: string;
  logoFile: File | null;
  ndaAccepted: boolean;
}

export interface StepProgress {
  completed: boolean;
  visited: boolean;
}

export interface AppState {
  currentStep: number;
  canvasData: CanvasData;
  stepProgress: Record<number, StepProgress>;
  lastSaved: Date | null;
}

export const BUSINESS_FUNCTIONS = [
  'Sales',
  'Ops', 
  'HR',
  'Tech',
  'Data',
  'CX',
  'Other'
];

export const AI_SKILLS = [
  'Content Creation',
  'Data Analysis', 
  'Workflow Automation',
  'Code Generation',
  'Customer Service',
  'Market Research',
  'Project Management',
  'Training & Development',
  'Creative Design',
  'Strategic Planning'
];

export const AUTOMATION_RISKS = [
  'Basic Data Entry',
  'Simple Content Writing',
  'Basic Financial Analysis',
  'Routine Customer Inquiries',
  'Meeting Scheduling',
  'Document Filing',
  'Basic Research',
  'Invoice Processing',
  'Elementary Research',
  'Basic Scheduling'
];

export const SUCCESS_TARGETS_SUGGESTIONS = [
  '50% of staff using AI tools weekly',
  'Reduce task completion time by 30%',
  'Launch 3 AI-powered initiatives',
  'Achieve 80% AI confidence score',
  'Implement AI-powered customer service'
];

export const getAnxietyLevel = (percentage: number): {
  label: string;
  color: string;
  bgColor: string;
} => {
  if (percentage <= 20) {
    return { label: 'Very Low', color: 'text-anxiety-very-low', bgColor: 'bg-anxiety-very-low' };
  } else if (percentage <= 40) {
    return { label: 'Low', color: 'text-anxiety-low', bgColor: 'bg-anxiety-low' };
  } else if (percentage <= 60) {
    return { label: 'Moderate', color: 'text-anxiety-moderate', bgColor: 'bg-anxiety-moderate' };
  } else if (percentage <= 80) {
    return { label: 'High', color: 'text-anxiety-high', bgColor: 'bg-anxiety-high' };
  } else {
    return { label: 'Very High', color: 'text-anxiety-very-high', bgColor: 'bg-anxiety-very-high' };
  }
};