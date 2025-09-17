import React from 'react';
import { useStreamlinedMindmaker } from '../../contexts/StreamlinedMindmakerContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Sparkles, Brain, Target, Users } from 'lucide-react';
import { ConversationalInterface } from '../ai/ConversationalInterface';

export const Step1Welcome: React.FC = () => {
  const { state, setCurrentStep, markConversationComplete, updateDiscoveryData } = useStreamlinedMindmaker();

  const handleStartDiscovery = () => {
    setCurrentStep(2); // Start conversation
  };

  const handleConversationComplete = (allData: any) => {
    updateDiscoveryData(allData);
    markConversationComplete();
  };

  const handleDataExtracted = (data: any) => {
    updateDiscoveryData(data);
  };

  // Show conversation interface if user has started
  if (state.currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary via-primary-600 to-accent relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute top-32 right-16 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Glass Navigation Header */}
        <div className="glass-nav fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <div className="container-width">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-foreground">Fractionl.ai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversation Interface */}
        <div className="pt-20 min-h-screen flex items-center justify-center p-6">
          <div className="w-full max-w-4xl mx-auto">
            <div className="glass-card-dark p-8 rounded-2xl shadow-large">
              <ConversationalInterface 
                onDataExtracted={handleDataExtracted}
                onConversationComplete={handleConversationComplete}
                initialPrompt="👋 Hi there! I'm Alex, your AI transformation companion from Fractionl.ai.

I'm excited to help you discover your organization's AI potential! Think of this as a conversation with a trusted advisor who understands both the opportunities and anxieties around AI.

I'll ask thoughtful questions about your business, understand your team's concerns, and help you see exactly how AI can transform your organization. Ready to explore your AI future together?

Let's start with something simple - what's your company called? 🚀"
                placeholder="Share whatever feels comfortable to start..."
                aiPersonality="friendly"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Welcome page with single entry point

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-600 to-accent relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-white/5 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-32 right-10 w-14 h-14 bg-white/10 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
      
      {/* Glass Navigation Header */}
      <div className="glass-nav fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="container-width">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">Fractionl.ai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 pt-24 pb-section section-padding">
        <div className="container-width">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium animate-fade-in-up">
              <Brain className="w-4 h-4" />
              AI Literacy & Confidence Transformation
            </div>

            {/* Main Headline */}
            <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Turn Your People From
              <br />
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Anxious to AI-Ambitious
              </span>
              <br />
              in 7 Minutes
            </h1>

            {/* Subtitle */}
            <p className="body-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Our AI-powered discovery reveals your organization's exact transformation roadmap. 
              Get personalized insights, overcome resistance, and build the AI-confident team your company needs.
            </p>

            {/* CTA Button */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button
                onClick={handleStartDiscovery}
                variant="hero"
                size="lg"
                className="button-hero text-lg px-8 py-4 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start AI Transformation Discovery
              </Button>
            </div>

            {/* Trust Indicator */}
            <p className="text-white/70 text-sm animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              Used by Fortune 500 companies, healthcare systems, and tech leaders
            </p>
          </div>
        </div>
      </div>

      {/* Value Proposition Cards */}
      <div className="relative z-10 pb-section">
        <div className="container-width">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="glass-card-dark text-white border-white/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader className="card-header">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-semibold">Intelligent Discovery</CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <CardDescription className="text-white/80">
                  AI-powered conversation reveals your team's exact readiness level, anxiety points, and optimal learning paths in minutes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card-dark text-white border-white/20 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <CardHeader className="card-header">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-semibold">Personalized Roadmap</CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <CardDescription className="text-white/80">
                  Get a customized AI literacy program designed specifically for your industry, company size, and team dynamics.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card-dark text-white border-white/20 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
              <CardHeader className="card-header">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-semibold">Expert Guidance</CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <CardDescription className="text-white/80">
                  Connect with AI literacy experts who've transformed teams at companies like yours. Skip the trial and error.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="relative z-10 pb-12">
        <div className="container-width">
          <div className="text-center">
            <p className="text-white/60 text-sm mb-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              Trusted by organizations in
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-white/70 text-sm animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
              <span>Healthcare Systems</span>
              <span>•</span>
              <span>Financial Services</span>
              <span>•</span>
              <span>Technology Companies</span>
              <span>•</span>
              <span>Manufacturing</span>
              <span>•</span>
              <span>Professional Services</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};