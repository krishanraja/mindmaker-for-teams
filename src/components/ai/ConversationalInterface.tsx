import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card } from '../ui/card';
import { AIConversationService, ConversationMessage } from '../../services/aiConversation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ConversationalInterfaceProps {
  onDataExtracted: (data: any) => void;
  onConversationComplete: () => void;
  initialPrompt?: string;
  placeholder?: string;
  aiPersonality?: 'friendly' | 'professional' | 'enthusiastic';
}

export const ConversationalInterface: React.FC<ConversationalInterfaceProps> = ({
  onDataExtracted,
  onConversationComplete,
  initialPrompt = "Hi! I'm your AI transformation consultant. I'm here to help you understand your organization's AI readiness and create a personalized roadmap. What brings you here today?",
  placeholder = "Tell me about your organization...",
  aiPersonality = 'friendly'
}) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const aiService = useRef(new AIConversationService());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedStarters = [
    "We're exploring AI but our team is nervous about job security",
    "I need to convince leadership that we need an AI strategy",
    "Our competitors are using AI and we're falling behind",
    "We want to start with AI but don't know where to begin"
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

      // Extract quick replies and update progress
      if (response.metadata?.suggestions) {
        setQuickReplies(response.metadata.suggestions);
      } else {
        setQuickReplies([]);
      }
      
      // Update progress based on data collected
      const extractedData = aiService.current.getExtractedData();
      const dataKeys = Object.keys(extractedData).filter(key => extractedData[key]);
      setProgress(Math.min((dataKeys.length / 6) * 100, 100)); // 6 key data points
      
      onDataExtracted(extractedData);

      // Check if conversation should complete
      if (response.metadata?.extractedData?.readyToProgress) {
        setTimeout(() => onConversationComplete(), 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ConversationMessage = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your message. Could you try again?",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
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

  const getPersonalityAvatar = () => {
    switch (aiPersonality) {
      case 'professional':
        return '/lovable-uploads/cda45e60-bf8b-4a41-bd29-0e6c465c1377.png';
      case 'enthusiastic':
        return '/lovable-uploads/cda45e60-bf8b-4a41-bd29-0e6c465c1377.png';
      default:
        return '/lovable-uploads/cda45e60-bf8b-4a41-bd29-0e6c465c1377.png';
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header with Progress */}
      {progress > 0 && (
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Assessment Progress</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
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
              className={`max-w-[80%] p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-white ml-auto'
                  : 'bg-card text-foreground'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
              
              {message.metadata?.suggestions && (
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
            <Card className="bg-card text-foreground p-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {quickReplies.length > 0 && !isLoading && (
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
      {showSuggestions && messages.length <= 1 && (
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

      {/* Input Area */}
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
    </div>
  );
};