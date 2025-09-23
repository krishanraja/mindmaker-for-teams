import { AIDiscoveryData } from '../contexts/MindmakerContext';

// AI Literacy Module Database
export interface AILiteracyModule {
  id: string;
  title: string;
  category: 'LEADERSHIP' | 'IMPLEMENTATION';
  tier: 'Basic' | 'Advanced' | 'Expert';
  credits: number;
  description: string;
  icon: string;
  targetAudience: string[];
  challenges: string[];
  teamSizes: string[];
  urgency: string[];
  learningStyles: string[];
  prerequisites?: string[];
}

export const AI_LITERACY_MODULES: AILiteracyModule[] = [
  // Leadership Tier - Basic
  {
    id: 'align-leaders',
    title: 'ALIGN LEADERS',
    category: 'LEADERSHIP',
    tier: 'Basic',
    credits: 15,
    description: 'Exec Team primer on AI literacy, market shifts, and how media leaders are preparing teams for 2030',
    icon: '👥',
    targetAudience: ['Executives', 'Leadership Team', 'C-Suite'],
    challenges: ['Leadership buy-in', 'Strategic direction', 'Change management'],
    teamSizes: ['small', 'medium', 'large'],
    urgency: ['immediate', 'short-term'],
    learningStyles: ['Live workshops', 'Keynote', 'Executive briefing']
  },
  {
    id: 'inspire-staff',
    title: 'INSPIRE STAFF',
    category: 'LEADERSHIP',
    tier: 'Basic',
    credits: 10,
    description: 'All Hands keynote on the future of work in 2030 & principles required to thrive',
    icon: '📢',
    targetAudience: ['All staff', 'General workforce'],
    challenges: ['Employee engagement', 'AI anxiety', 'Change resistance'],
    teamSizes: ['medium', 'large', 'enterprise'],
    urgency: ['immediate', 'short-term'],
    learningStyles: ['Live workshops', 'Keynote', 'All-hands']
  },
  {
    id: 'product-strategy',
    title: 'PRODUCT STRATEGY',
    category: 'LEADERSHIP',
    tier: 'Basic',
    credits: 25,
    description: 'Map AI capabilities to your Product Strategy to future-proof the business or develop a new revenue line',
    icon: '🎯',
    targetAudience: ['Product teams', 'Strategy teams', 'Innovation leaders'],
    challenges: ['Product development', 'Market differentiation', 'Innovation'],
    teamSizes: ['small', 'medium', 'large'],
    urgency: ['short-term', 'medium-term'],
    learningStyles: ['Workshop', 'Strategy session', 'Collaborative']
  },
  {
    id: 'agent-opp-spotter',
    title: 'AGENT OPP SPOTTER',
    category: 'IMPLEMENTATION',
    tier: 'Basic',
    credits: 5,
    description: 'Learn to spot Agent opportunities, workflow redesign jam session with one team',
    icon: '🔍',
    targetAudience: ['Operations', 'Process teams', 'Team leads'],
    challenges: ['Process optimization', 'Workflow efficiency', 'Automation opportunities'],
    teamSizes: ['small', 'medium'],
    urgency: ['immediate', 'short-term'],
    learningStyles: ['Workshop', 'Hands-on', 'Collaborative']
  },
  // Leadership Tier - Advanced
  {
    id: 'formalize-ops',
    title: 'FORMALIZE OPS',
    category: 'LEADERSHIP',
    tier: 'Advanced',
    credits: 20,
    description: 'Production and training of an internal AI usage playbook',
    icon: '⚙️',
    targetAudience: ['Operations', 'HR', 'Training teams'],
    challenges: ['Standardization', 'Best practices', 'Knowledge management'],
    teamSizes: ['medium', 'large', 'enterprise'],
    urgency: ['medium-term', 'long-term'],
    learningStyles: ['Self-paced', 'Documentation', 'Process design']
  },
  {
    id: 'get-building',
    title: 'GET BUILDING',
    category: 'IMPLEMENTATION',
    tier: 'Advanced',
    credits: 20,
    description: 'Deep dive inspiration session on AI usage patterns, build a lightweight internal tool with one team and track it to a chosen KPI',
    icon: '🔨',
    targetAudience: ['Technical teams', 'Innovation teams', 'Early adopters'],
    challenges: ['Technical implementation', 'Tool development', 'Measurement'],
    teamSizes: ['small', 'medium'],
    urgency: ['short-term', 'medium-term'],
    learningStyles: ['Hands-on', 'Technical', 'Project-based']
  },
  {
    id: 'coach-coaches',
    title: 'COACH THE COACHES',
    category: 'IMPLEMENTATION',
    tier: 'Advanced',
    credits: 20,
    description: 'Coach the coach: 1-1 AI literacy coaching for power users',
    icon: '🎓',
    targetAudience: ['Team leads', 'Trainers', 'Champions'],
    challenges: ['Train the trainer', 'Scale literacy', 'Internal advocacy'],
    teamSizes: ['medium', 'large', 'enterprise'],
    urgency: ['medium-term', 'long-term'],
    learningStyles: ['Coaching', '1-on-1', 'Mentorship']
  },
  {
    id: 'gamify-learning',
    title: 'GAMIFY LEARNING',
    category: 'IMPLEMENTATION',
    tier: 'Advanced',
    credits: 15,
    description: '"No time - no problem" internal newsletter: produce tailored digital mini-lessons and score cards to distribute via email',
    icon: '🎮',
    targetAudience: ['All staff', 'Remote teams', 'Busy professionals'],
    challenges: ['Time constraints', 'Engagement', 'Continuous learning'],
    teamSizes: ['medium', 'large', 'enterprise'],
    urgency: ['long-term', 'ongoing'],
    learningStyles: ['Self-paced', 'Microlearning', 'Digital']
  },
  // Expert Tier
  {
    id: 'workflow-redesign-mastery',
    title: 'WORKFLOW REDESIGN MASTERY',
    category: 'IMPLEMENTATION',
    tier: 'Expert',
    credits: 25,
    description: 'Master the art of identifying inefficient processes and redesigning them with AI-first thinking for maximum business impact',
    icon: '🔄',
    targetAudience: ['Operations leaders', 'Process experts', 'Transformation leads'],
    challenges: ['Process optimization', 'Transformation', 'Efficiency gains'],
    teamSizes: ['medium', 'large', 'enterprise'],
    urgency: ['medium-term', 'long-term'],
    learningStyles: ['Strategic', 'Analytical', 'Workshop']
  },
  {
    id: 'competitive-intelligence-bootcamp',
    title: 'COMPETITIVE INTELLIGENCE BOOTCAMP',
    category: 'IMPLEMENTATION',
    tier: 'Expert',
    credits: 30,
    description: 'Transform market research and competitor analysis using AI tools to gain strategic advantages and spot opportunities faster',
    icon: '🕵️',
    targetAudience: ['Strategy teams', 'Market research', 'Business intelligence'],
    challenges: ['Market intelligence', 'Competitive advantage', 'Strategic insights'],
    teamSizes: ['small', 'medium', 'large'],
    urgency: ['immediate', 'short-term'],
    learningStyles: ['Strategic', 'Analytical', 'Research-focused']
  },
  {
    id: 'internal-champion-development',
    title: 'INTERNAL CHAMPION DEVELOPMENT',
    category: 'LEADERSHIP',
    tier: 'Expert',
    credits: 35,
    description: 'Build a network of AI champions across departments who can drive adoption, training, and continuous improvement initiatives',
    icon: '🌟',
    targetAudience: ['Champions', 'Change agents', 'Department leads'],
    challenges: ['Change management', 'Adoption', 'Cultural transformation'],
    teamSizes: ['large', 'enterprise'],
    urgency: ['medium-term', 'long-term'],
    learningStyles: ['Leadership development', 'Network building', 'Mentorship']
  },
  {
    id: 'ai-powered-content-strategy',
    title: 'AI-POWERED CONTENT STRATEGY',
    category: 'IMPLEMENTATION',
    tier: 'Expert',
    credits: 20,
    description: 'Create systematic content workflows using AI for consistent, high-quality output across all marketing and communication channels',
    icon: '📝',
    targetAudience: ['Content teams', 'Marketing', 'Communications'],
    challenges: ['Content creation', 'Brand consistency', 'Scalability'],
    teamSizes: ['small', 'medium', 'large'],
    urgency: ['immediate', 'short-term'],
    learningStyles: ['Creative', 'Hands-on', 'Project-based']
  }
];

// Intelligent Module Matching Engine
export class ModuleMatchingEngine {
  static matchModules(discoveryData: AIDiscoveryData): { 
    recommendedModules: AILiteracyModule[], 
    reasoning: string[],
    totalCredits: number 
  } {
    const scores = new Map<string, number>();
    const reasoning: string[] = [];
    
    // Initialize scores
    AI_LITERACY_MODULES.forEach(module => scores.set(module.id, 0));
    
    // Team size scoring
    const teamSize = this.getTeamSizeCategory(discoveryData.employeeCount);
    AI_LITERACY_MODULES.forEach(module => {
      if (module.teamSizes.includes(teamSize)) {
        scores.set(module.id, scores.get(module.id)! + 20);
      }
    });
    
    // Urgency scoring
    const urgency = this.mapImplementationTimelineToUrgency(discoveryData.implementationTimeline);
    AI_LITERACY_MODULES.forEach(module => {
      if (module.urgency.includes(urgency)) {
        scores.set(module.id, scores.get(module.id)! + 15);
      }
    });
    
    // Challenge-based scoring
    const challenges = discoveryData.biggestChallenges || [];
    challenges.forEach(challenge => {
      AI_LITERACY_MODULES.forEach(module => {
        if (module.challenges.some(mc => mc.toLowerCase().includes(challenge.toLowerCase()) || 
                                      challenge.toLowerCase().includes(mc.toLowerCase()))) {
          scores.set(module.id, scores.get(module.id)! + 25);
        }
      });
    });
    
    // Learning preference scoring
    const learningPref = discoveryData.learningPreferences || '';
    AI_LITERACY_MODULES.forEach(module => {
      if (module.learningStyles.some(style => 
        learningPref.toLowerCase().includes(style.toLowerCase()))) {
        scores.set(module.id, scores.get(module.id)! + 15);
      }
    });
    
    // Leadership vision alignment
    const vision = discoveryData.leadershipVision?.toLowerCase() || '';
    if (vision.includes('strategy') || vision.includes('competitive')) {
      scores.set('product-strategy', scores.get('product-strategy')! + 20);
      scores.set('competitive-intelligence-bootcamp', scores.get('competitive-intelligence-bootcamp')! + 15);
    }
    if (vision.includes('team') || vision.includes('culture')) {
      scores.set('align-leaders', scores.get('align-leaders')! + 20);
      scores.set('internal-champion-development', scores.get('internal-champion-development')! + 15);
    }
    
    // AI readiness level adjustment
    const readinessScore = discoveryData.aiInsights?.readinessScore || 50;
    AI_LITERACY_MODULES.forEach(module => {
      if (module.tier === 'Basic' && readinessScore < 60) {
        scores.set(module.id, scores.get(module.id)! + 10);
      } else if (module.tier === 'Advanced' && readinessScore >= 60 && readinessScore < 80) {
        scores.set(module.id, scores.get(module.id)! + 10);
      } else if (module.tier === 'Expert' && readinessScore >= 80) {
        scores.set(module.id, scores.get(module.id)! + 10);
      }
    });
    
    // Sort by score and get top 3
    const sortedModules = AI_LITERACY_MODULES
      .map(module => ({ module, score: scores.get(module.id)! }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.module);
    
    // Generate reasoning
    reasoning.push(`Based on your team size of ${discoveryData.employeeCount} employees`);
    reasoning.push(`Aligned with ${urgency} implementation timeline`);
    if (challenges.length > 0) {
      reasoning.push(`Addresses key challenges: ${challenges.slice(0, 2).join(', ')}`);
    }
    reasoning.push(`Optimized for ${learningPref || 'mixed'} learning preferences`);
    
    const totalCredits = sortedModules.reduce((sum, module) => sum + module.credits, 0);
    
    return {
      recommendedModules: sortedModules,
      reasoning,
      totalCredits
    };
  }
  
  private static getTeamSizeCategory(employeeCount: number): string {
    if (employeeCount <= 10) return 'small';
    if (employeeCount <= 50) return 'medium';
    if (employeeCount <= 200) return 'large';
    return 'enterprise';
  }
  
  private static mapImplementationTimelineToUrgency(timeline: string): string {
    const timelineLower = timeline?.toLowerCase() || '';
    if (timelineLower.includes('asap') || timelineLower.includes('immediate')) return 'immediate';
    if (timelineLower.includes('1-3') || timelineLower.includes('quarter')) return 'short-term';
    if (timelineLower.includes('6') || timelineLower.includes('year')) return 'medium-term';
    return 'long-term';
  }
  
  static calculateInvestmentRange(modules: AILiteracyModule[]): string {
    const totalCredits = modules.reduce((sum, module) => sum + module.credits, 0);
    
    // Credit-based pricing tiers
    if (totalCredits <= 20) return '$8k-$15k';
    if (totalCredits <= 40) return '$15k-$28k';
    if (totalCredits <= 60) return '$28k-$45k';
    if (totalCredits <= 80) return '$45k-$65k';
    return '$65k+';
  }
}