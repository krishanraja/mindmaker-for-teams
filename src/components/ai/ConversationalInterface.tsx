import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, MessageCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { AIConversationService, ConversationMessage } from '../../services/aiConversation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { VoiceRecorder } from './VoiceRecorder';
import { DropdownSelection, ButtonGridSelection, MultiSelectTags, RadioSelection } from './SelectionComponents';

interface StructuredSelection {
  type: 'dropdown' | 'button-grid' | 'radio' | 'multi-select';
  title: string;
  description?: string;
  choices: Array<{ value: string; label: string; description?: string }>;
  columns?: number;
  maxSelections?: number;
}

interface ConversationalInterfaceProps {
  onDataExtracted: (data: any) => void;
  onConversationComplete: (allData?: any) => void;
  initialPrompt?: string;
  placeholder?: string;
  aiPersonality?: 'friendly' | 'professional' | 'enthusiastic';
}

export const ConversationalInterface: React.FC<ConversationalInterfaceProps> = ({
  onDataExtracted,
  onConversationComplete,
  initialPrompt = "👋 Hi there! I'm Alex, your AI transformation companion from Fractionl.ai.\n\nI'm excited to help you discover your organization's AI potential! Think of this as a conversation with a trusted advisor who understands both the opportunities and anxieties around AI.\n\nI'll ask thoughtful questions about your business, understand your team's concerns, and help you see exactly how AI can transform your organization. Ready to explore your AI future together?\n\nLet's start with something simple - what's your company called? 🚀",
  placeholder = "Share whatever feels comfortable to start...",
  aiPersonality = 'friendly'
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [structuredSelection, setStructuredSelection] = useState<StructuredSelection | null>(null);
  const [selectionValues, setSelectionValues] = useState<any>({});
  const [progress, setProgress] = useState(0);
  const [conversationStuck, setConversationStuck] = useState(false);
  const [insightMoments, setInsightMoments] = useState<string[]>([]);
  const [showInsightAnimation, setShowInsightAnimation] = useState(false);
  const aiService = useRef(new AIConversationService());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageCountRef = useRef(0);

  const suggestedStarters = [
    "Our L&D programs need to scale but resources are limited",
    "We're evaluating AI for personalized learning paths",
    "Training completion rates are low and need improvement",
    "Leadership wants measurable L&D ROI improvements"
  ];

  useEffect(() => {
    // Add initial AI message
    const initialMessage: ConversationMessage = {
      id: 'initial',
      role: 'assistant',
      content: initialPrompt,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [initialPrompt]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);
    setShowSuggestions(false);
    setConversationStuck(false);
    messageCountRef.current += 1;

    try {
      const response = await aiService.current.sendMessage(text);
      
      // Update messages
      const userMessage: ConversationMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage, response]);

      // Handle suggestions - either structured selections or quick replies
      if (response.metadata?.suggestions) {
        if (typeof response.metadata.suggestions === 'object' && 
            !Array.isArray(response.metadata.suggestions) && 
            'type' in response.metadata.suggestions) {
          setStructuredSelection(response.metadata.suggestions as StructuredSelection);
          setQuickReplies([]);
        } else if (Array.isArray(response.metadata.suggestions)) {
          setQuickReplies(response.metadata.suggestions);
          setStructuredSelection(null);
        } else {
          setQuickReplies([]);
          setStructuredSelection(null);
        }
      } else {
        setQuickReplies([]);
        setStructuredSelection(null);
      }
      
      // Get conversation state to calculate proper progress
      const conversationState = aiService.current.getContext();
      const extractedData = aiService.current.getExtractedData();
      
      // Calculate progress based on meaningful data collection
      let progressScore = 0;
      if (extractedData.businessName) progressScore += 20;
      if (extractedData.industry) progressScore += 15;
      if (extractedData.employeeCount) progressScore += 15;
      if (extractedData.currentAIUse) progressScore += 15;
      if (extractedData.executiveAnxiety !== undefined) progressScore += 15;
      if (extractedData.learningModality) progressScore += 10;
      if (extractedData.successTargets?.length) progressScore += 10;
      
      const newProgress = Math.min(progressScore, 85); // Never show 100% until truly ready
      
      // Show insight animation when new meaningful data is collected
      if (newProgress > progress && response.metadata?.extractedData) {
        setShowInsightAnimation(true);
        setTimeout(() => setShowInsightAnimation(false), 2000);
        
        // Add specific insight moments
        const newData = response.metadata.extractedData;
        if (newData.businessName && !extractedData.businessName) {
          setInsightMoments(prev => [...prev, `✨ Connected with ${newData.businessName}!`]);
        }
        if (newData.industry && !extractedData.industry) {
          setInsightMoments(prev => [...prev, `🎯 Understanding ${newData.industry} opportunities...`]);
        }
      }
      
      setProgress(newProgress);
      onDataExtracted(extractedData);

      // Check for conversation being stuck (too many messages without progress)
      if (messageCountRef.current > 8 && progress < 50) {
        setConversationStuck(true);
      }

      // Check if conversation should complete (only when truly ready)
      if (response.metadata?.extractedData?.readyToProgress && newProgress >= 80) {
        const allData = aiService.current.getExtractedData();
        setProgress(100); // Only now show 100%
        setInsightMoments(prev => [...prev, "🎉 Your AI transformation roadmap is ready!"]);
        setTimeout(() => onConversationComplete(allData), 3000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add helpful error message with suggestions
      const errorMessage: ConversationMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your message. Let's try a simpler approach - could you tell me about your business?",
        timestamp: new Date(),
        metadata: {
          suggestions: ["Tell me about your business", "What industry are you in?", "How many employees do you have?"]
        }
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setQuickReplies(["Tell me about your business", "What industry are you in?", "How many employees do you have?"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  const handleSelectionChange = (key: string, value: any) => {
    setSelectionValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectionSubmit = () => {
    const selection = structuredSelection;
    if (!selection || !selectionValues[selection.title]) return;

    const value = selectionValues[selection.title];
    let responseText = '';

    if (Array.isArray(value)) {
      const choices = selection.choices.filter((c: any) => value.includes(c.value));
      responseText = `Selected: ${choices.map((c: any) => c.label).join(', ')}`;
    } else {
      const choice = selection.choices.find((c: any) => c.value === value);
      responseText = choice ? choice.label : value;
    }

    setStructuredSelection(null);
    setSelectionValues({});
    handleSend(responseText);
  };

  const handleVoiceTranscription = (text: string) => {
    setInput(text);
  };

  const restartConversation = () => {
    aiService.current.reset();
    setMessages([{
      id: 'initial',
      role: 'assistant',
      content: "Let's start fresh! I'm Alex, your AI transformation companion. What's your company called? 🚀",
      timestamp: new Date()
    }]);
    setProgress(0);
    setQuickReplies([]);
    setConversationStuck(false);
    setInsightMoments([]);
    setShowInsightAnimation(false);
    messageCountRef.current = 0;
    setShowSuggestions(true);
  };

  const getPersonalityAvatar = () => {
    switch (aiPersonality) {
      case 'professional':
        return '/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png';
      case 'enthusiastic':
        return '/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png';
      default:
        return '/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header with Progress */}
      {progress > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${showInsightAnimation ? 'animate-pulse text-primary' : ''}`} />
              AI Transformation Discovery
            </span>
            <span className="font-medium">{Math.round(progress)}% discovered</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 relative" 
              style={{ width: `${progress}%` }}
            >
              {showInsightAnimation && (
                <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full"></div>
              )}
            </div>
          </div>
          {insightMoments.length > 0 && (
            <div className="mt-2 text-xs text-primary font-medium animate-fade-in">
              {insightMoments[insightMoments.length - 1]}
            </div>
          )}
        </div>
      )}
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 max-h-[60vh]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' && (
              <Avatar className="w-8 h-8 border-2 border-primary/20">
                <AvatarImage src={getPersonalityAvatar()} />
                <AvatarFallback className="bg-primary text-white">
                  <Sparkles className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
            )}
            
            <Card
              className={`max-w-[80%] p-4 ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-primary to-primary/90 text-white ml-auto shadow-lg'
                  : 'bg-gradient-to-br from-card to-card/95 text-foreground shadow-md hover:shadow-lg transition-all duration-300'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
              
              {message.metadata?.suggestions && Array.isArray(message.metadata.suggestions) && (
                <div className="mt-3 pt-3 border-t border-border/20">
                  <div className="text-xs text-muted-foreground mb-2">You could ask:</div>
                  <div className="space-y-1">
                    {message.metadata.suggestions.map((suggestion, idx) => (
                      <Button
                        key={idx}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSend(suggestion)}
                        className="text-xs h-auto p-1 justify-start w-full text-left"
                      >
                        "{suggestion}"
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
            
            {message.role === 'user' && (
              <Avatar className="w-8 h-8 border-2 border-muted">
                <AvatarFallback className="bg-muted text-foreground">
                  You
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <Avatar className="w-8 h-8 border-2 border-primary/20">
              <AvatarFallback className="bg-primary text-white">
                <Sparkles className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <Card className="bg-gradient-to-br from-card to-card/95 text-foreground p-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <div className="absolute inset-0 w-4 h-4 border border-primary/30 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm text-muted-foreground">Alex is analyzing and crafting insights...</span>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Structured Selection Interface */}
      {structuredSelection && !isLoading && (
        <div className="px-4 pb-2">
          <div className="space-y-4">
            {structuredSelection.type === 'dropdown' && (
              <DropdownSelection
                title={structuredSelection.title}
                description={structuredSelection.description}
                choices={structuredSelection.choices}
                value={selectionValues[structuredSelection.title]}
                onSelect={(value) => handleSelectionChange(structuredSelection.title, value)}
              />
            )}
            
            {structuredSelection.type === 'button-grid' && (
              <ButtonGridSelection
                title={structuredSelection.title}
                description={structuredSelection.description}
                choices={structuredSelection.choices}
                value={selectionValues[structuredSelection.title]}
                onSelect={(value) => handleSelectionChange(structuredSelection.title, value)}
                columns={structuredSelection.columns || 2}
              />
            )}
            
            {structuredSelection.type === 'radio' && (
              <RadioSelection
                title={structuredSelection.title}
                description={structuredSelection.description}
                choices={structuredSelection.choices}
                value={selectionValues[structuredSelection.title]}
                onSelect={(value) => handleSelectionChange(structuredSelection.title, value)}
              />
            )}
            
            {structuredSelection.type === 'multi-select' && (
              <MultiSelectTags
                title={structuredSelection.title}
                description={structuredSelection.description}
                choices={structuredSelection.choices}
                values={selectionValues[structuredSelection.title] || []}
                onSelectionChange={(values) => handleSelectionChange(structuredSelection.title, values)}
                maxSelections={structuredSelection.maxSelections}
              />
            )}
            
            <div className="flex justify-end">
              <Button
                onClick={handleSelectionSubmit}
                disabled={!selectionValues[structuredSelection.title] || 
                  (Array.isArray(selectionValues[structuredSelection.title]) && selectionValues[structuredSelection.title].length === 0)}
                className="bg-primary hover:bg-primary/90"
              >
                Continue Assessment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Replies */}
      {quickReplies.length > 0 && !isLoading && !structuredSelection && (
        <div className="px-4 pb-2">
          <div className="text-xs text-muted-foreground mb-2">Quick replies:</div>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickReply(reply)}
                className="h-8 px-3 text-sm hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {reply}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Starters */}
      {showSuggestions && messages.length <= 1 && !structuredSelection && (
        <div className="p-4 border-t border-border">
          <div className="text-sm text-muted-foreground mb-3">Quick starts:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {suggestedStarters.map((starter, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => handleSend(starter)}
                className="text-left justify-start h-auto p-3 text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">{starter}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Reset */}
      {conversationStuck && (
        <div className="px-4 py-3 bg-gradient-to-r from-muted/50 to-muted/30 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              💡 Let's try a different approach! I can ask simpler questions to help you move forward.
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={restartConversation}
              className="ml-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Fresh Start
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      {!structuredSelection && (
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isLoading}
              className="flex-1"
            />
            <VoiceRecorder
              onTranscription={handleVoiceTranscription}
              disabled={isLoading}
            />
            <Button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};