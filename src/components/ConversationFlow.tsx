import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Sparkles, Send, Loader2, ArrowLeft } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useMindmaker } from '../contexts/MindmakerContext';
import { supabase } from '../integrations/supabase/client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ConversationFlow: React.FC = () => {
  const { state, updateDiscoveryData, setCurrentStep, markConversationComplete } = useMindmaker();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    const initialMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: `👋 Hi! I'm Alex from Fractionl.ai. I'll help you discover your organization's AI potential through a friendly conversation.\n\nI'll ask about your business, understand your team's relationship with AI, and create a personalized transformation roadmap.\n\nLet's start simple - what's your company called?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const calculateProgress = (data: any) => {
    let score = 0;
    if (data.businessName) score += 20;
    if (data.industry) score += 15;
    if (data.employeeCount) score += 15;
    if (data.currentAIUse) score += 20;
    if (data.learningModality) score += 15;
    if (data.successTargets?.length) score += 15;
    return Math.min(score, 100);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Supabase Edge Function for AI conversation
      const { data: response, error } = await supabase.functions.invoke('ai-conversation', {
        body: {
          message: input.trim(),
          conversationHistory: messages,
          currentData: state.discoveryData
        }
      });

      if (error) throw error;

      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Update discovery data with extracted information
      if (response.extractedData) {
        updateDiscoveryData(response.extractedData);
        const newProgress = calculateProgress({ ...state.discoveryData, ...response.extractedData });
        setProgress(newProgress);

        // Check if conversation is complete
        if (response.isComplete || newProgress >= 85) {
          setTimeout(() => {
            markConversationComplete();
          }, 2000);
        }
      }

    } catch (error) {
      console.error('Conversation error:', error);
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing that. Could you try rephrasing your response?",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="glass-nav border-b">
        <div className="container-width">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={() => setCurrentStep(1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium">AI Discovery in Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {progress > 0 && (
        <div className="w-full bg-muted/50 h-1">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-1 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Conversation Container */}
      <div className="container-width py-8">
        <div className="max-w-3xl mx-auto">
          {/* Messages */}
          <div className="space-y-6 mb-6 max-h-[60vh] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-10 h-10 border-2 border-primary/20">
                    <AvatarFallback className="bg-primary text-white">
                      <Sparkles className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <Card
                  className={`max-w-[80%] p-4 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary/90 text-white'
                      : 'glass-card'
                  }`}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                </Card>
                
                {message.role === 'user' && (
                  <Avatar className="w-10 h-10 border-2 border-muted">
                    <AvatarFallback className="bg-muted text-foreground">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-4 justify-start">
                <Avatar className="w-10 h-10 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary text-white">
                    <Sparkles className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <Card className="glass-card p-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Alex is thinking...
                    </span>
                  </div>
                </Card>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <Card className="glass-card p-4">
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 border-none focus-visible:ring-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};