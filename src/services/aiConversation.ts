import { supabase } from '../integrations/supabase/client';

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    emotion?: string;
    intent?: string;
    extractedData?: any;
    suggestions?: string[];
  };
}

export interface ConversationContext {
  messages: ConversationMessage[];
  userProfile: {
    name?: string;
    company?: string;
    industry?: string;
    preferredStyle?: 'casual' | 'formal' | 'direct';
  };
  sessionData: {
    startTime: Date;
    currentTopic?: string;
    completedTopics: string[];
    personalizations: Record<string, any>;
  };
}

export class AIConversationService {
  private context: ConversationContext;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.context = {
      messages: [],
      userProfile: {},
      sessionData: {
        startTime: new Date(),
        completedTopics: [],
        personalizations: {}
      }
    };
  }

  private generateSessionId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async sendMessage(userInput: string): Promise<ConversationMessage> {
    // Add user message to context
    const userMessage: ConversationMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };
    
    this.context.messages.push(userMessage);

    try {
      // Call AI conversation edge function
      const { data, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          userInput,
          context: this.context,
          sessionId: this.sessionId
        }
      });

      if (error) {
        console.error('AI conversation error:', error);
        throw new Error('Failed to get AI response');
      }

      // Create assistant message from response
      const assistantMessage: ConversationMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: {
          emotion: data.detectedEmotion,
          intent: data.detectedIntent,
          extractedData: data.extractedData,
          suggestions: data.suggestions
        }
      };

      this.context.messages.push(assistantMessage);

      // Update context with any extracted data or personalizations
      if (data.extractedData) {
        this.updateUserProfile(data.extractedData);
      }

      if (data.personalizations) {
        this.context.sessionData.personalizations = {
          ...this.context.sessionData.personalizations,
          ...data.personalizations
        };
      }

      return assistantMessage;
    } catch (error) {
      console.error('Error in AI conversation:', error);
      
      // Return fallback message
      const fallbackMessage: ConversationMessage = {
        id: `msg_${Date.now()}_fallback`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your message right now. Could you please try rephrasing that?",
        timestamp: new Date()
      };
      
      this.context.messages.push(fallbackMessage);
      return fallbackMessage;
    }
  }

  private updateUserProfile(extractedData: any): void {
    if (extractedData.name) {
      this.context.userProfile.name = extractedData.name;
    }
    if (extractedData.company) {
      this.context.userProfile.company = extractedData.company;
    }
    if (extractedData.industry) {
      this.context.userProfile.industry = extractedData.industry;
    }
    if (extractedData.communicationStyle) {
      this.context.userProfile.preferredStyle = extractedData.communicationStyle;
    }
  }

  getContext(): ConversationContext {
    return { ...this.context };
  }

  getExtractedData(): any {
    const allExtractedData = this.context.messages
      .filter(msg => msg.metadata?.extractedData)
      .map(msg => msg.metadata!.extractedData)
      .reduce((acc, data) => ({ ...acc, ...data }), {});

    return {
      ...allExtractedData,
      userProfile: this.context.userProfile,
      sessionInsights: this.generateSessionInsights()
    };
  }

  private generateSessionInsights(): any {
    const messages = this.context.messages;
    const userMessages = messages.filter(msg => msg.role === 'user');
    
    return {
      messageCount: userMessages.length,
      averageResponseLength: userMessages.reduce((acc, msg) => acc + msg.content.length, 0) / userMessages.length,
      dominantEmotion: this.getMostFrequentEmotion(),
      communicationStyle: this.inferCommunicationStyle(),
      engagementLevel: this.calculateEngagementLevel()
    };
  }

  private getMostFrequentEmotion(): string {
    const emotions = this.context.messages
      .map(msg => msg.metadata?.emotion)
      .filter(Boolean);
    
    if (emotions.length === 0) return 'neutral';
    
    const emotionCounts = emotions.reduce((acc: Record<string, number>, emotion) => {
      acc[emotion!] = (acc[emotion!] || 0) + 1;
      return acc;
    }, {});
    
    return Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
  }

  private inferCommunicationStyle(): 'casual' | 'formal' | 'direct' {
    const userMessages = this.context.messages.filter(msg => msg.role === 'user');
    
    if (userMessages.length === 0) return 'casual';
    
    const avgLength = userMessages.reduce((acc, msg) => acc + msg.content.length, 0) / userMessages.length;
    const formalWords = userMessages.reduce((acc, msg) => {
      const formal = (msg.content.match(/\b(indeed|furthermore|consequently|therefore|thus)\b/gi) || []).length;
      return acc + formal;
    }, 0);
    
    if (formalWords > 2) return 'formal';
    if (avgLength < 30) return 'direct';
    return 'casual';
  }

  private calculateEngagementLevel(): 'low' | 'medium' | 'high' {
    const messageCount = this.context.messages.filter(msg => msg.role === 'user').length;
    const timeSpent = (new Date().getTime() - this.context.sessionData.startTime.getTime()) / 1000 / 60; // minutes
    
    if (messageCount > 8 || timeSpent > 10) return 'high';
    if (messageCount > 4 || timeSpent > 5) return 'medium';
    return 'low';
  }

  reset(): void {
    this.sessionId = this.generateSessionId();
    this.context = {
      messages: [],
      userProfile: {},
      sessionData: {
        startTime: new Date(),
        completedTopics: [],
        personalizations: {}
      }
    };
  }
}