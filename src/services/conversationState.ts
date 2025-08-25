interface ConversationState {
  currentPhase: 'intro' | 'business' | 'team' | 'anxiety' | 'skills' | 'learning' | 'goals' | 'complete';
  collectedData: {
    businessName?: string;
    businessDescription?: string;
    industry?: string;
    employeeCount?: number;
    businessFunctions?: string[];
    aiAdoption?: string;
    currentAIUse?: string;
    challenges?: string[];
    
    // Anxiety levels
    executiveAnxiety?: number;
    managementAnxiety?: number;
    staffAnxiety?: number;
    techAnxiety?: number;
    nonTechAnxiety?: number;
    
    // Skills and risks
    aiSkills?: string[];
    automationRisks?: string[];
    
    // Learning preferences
    learningModality?: string;
    changeNarrative?: string;
    
    // Goals
    successTargets?: string[];
    
    // Contact info
    userName?: string;
    businessEmail?: string;
    businessUrl?: string;
    company?: string;
    country?: string;
  };
  questionsAsked: Set<string>;
  confidence: number;
}

export class ConversationStateManager {
  private state: ConversationState;
  
  constructor() {
    this.state = {
      currentPhase: 'intro',
      collectedData: {},
      questionsAsked: new Set(),
      confidence: 0
    };
  }

  updateData(data: any): void {
    this.state.collectedData = { ...this.state.collectedData, ...data };
    this.updatePhase();
    this.calculateConfidence();
  }

  private updatePhase(): void {
    const data = this.state.collectedData;
    
    if (!data.businessName) {
      this.state.currentPhase = 'business';
    } else if (!data.employeeCount || !data.industry) {
      this.state.currentPhase = 'business';
    } else if (!data.executiveAnxiety && !data.managementAnxiety) {
      this.state.currentPhase = 'anxiety';
    } else if (!data.aiSkills?.length && !data.automationRisks?.length) {
      this.state.currentPhase = 'skills';
    } else if (!data.learningModality) {
      this.state.currentPhase = 'learning';
    } else if (!data.successTargets?.length) {
      this.state.currentPhase = 'goals';
    } else {
      this.state.currentPhase = 'complete';
    }
  }

  private calculateConfidence(): void {
    const data = this.state.collectedData;
    let score = 0;
    
    // Much more conservative confidence calculation
    // Business info (40% - core requirements)
    if (data.businessName) score += 15;
    if (data.industry) score += 15; 
    if (data.employeeCount) score += 10;
    
    // Current AI use (20% - understanding their starting point)
    if (data.currentAIUse) score += 20;
    
    // Anxiety levels (20% - at least executive anxiety)
    if (data.executiveAnxiety !== undefined) score += 10;
    if (data.managementAnxiety !== undefined) score += 5;
    if (data.staffAnxiety !== undefined) score += 5;
    
    // Learning preferences (10%)
    if (data.learningModality) score += 10;
    
    // Goals (10%)
    if (data.successTargets?.length) score += 10;
    
    // Cap confidence at 85% until ready to progress
    this.state.confidence = Math.min(score, 85);
  }

  getState(): ConversationState {
    return { ...this.state };
  }

  isComplete(): boolean {
    return this.state.currentPhase === 'complete' && this.state.confidence >= 80;
  }

  getNextQuestion(): string {
    const phase = this.state.currentPhase;
    const data = this.state.collectedData;
    
    switch (phase) {
      case 'business':
        if (!data.businessName) return "What's your company name?";
        if (!data.industry) return "What industry are you in?";
        if (!data.employeeCount) return "How many employees do you have?";
        if (!data.businessFunctions?.length) return "What are your main business functions or departments?";
        return "Tell me about your current use of AI tools or technologies.";
        
      case 'anxiety':
        return "On a scale of 1-10, how anxious are your executives about AI adoption? What about middle management and frontline staff?";
        
      case 'skills':
        return "What AI skills does your team currently have? What processes are you most worried about being automated?";
        
      case 'learning':
        return "How does your team prefer to learn - live workshops, self-paced online, or hands-on projects?";
        
      case 'goals':
        return "What are your top 3 success targets for AI transformation?";
        
      default:
        return "Great! I have everything I need. Let me create your personalized AI readiness canvas.";
    }
  }

  markQuestionAsked(question: string): void {
    this.state.questionsAsked.add(question);
  }

  hasAskedQuestion(question: string): boolean {
    return this.state.questionsAsked.has(question);
  }

  reset(): void {
    this.state = {
      currentPhase: 'intro',
      collectedData: {},
      questionsAsked: new Set(),
      confidence: 0
    };
  }
}