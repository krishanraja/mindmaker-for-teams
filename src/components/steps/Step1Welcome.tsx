import React from 'react';
import { useStreamlinedMindmaker } from '../../contexts/StreamlinedMindmakerContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Sparkles, Brain, Target, Users } from 'lucide-react';
import { ConversationalInterface } from '../ai/ConversationalInterface';

export const Step1Welcome: React.FC = () => {
  const { state, setCurrentStep, markConversationComplete, updateDiscoveryData } = useStreamlinedMindmaker();

  const handleStartDiscovery = () => {
    setCurrentStep(2); // Move to conversation step
  };

  const handleDataExtracted = (data: any) => {
    // Extract and update discovery data in real-time
    const mappedData = {
      businessName: data.company || data.businessName || '',
      businessDescription: data.businessDescription || data.description || '',
      industry: data.industry || '',
      employeeCount: data.employeeCount || data.teamSize || 0,
      businessFunctions: data.businessFunctions || data.departments || [],
      aiAdoption: data.aiAdoption || 'none',
      teamReadiness: data.teamReadiness || 50,
      learningModality: data.learningModality || 'live-cohort',
      successTargets: data.successTargets || data.goals || [],
      userName: data.name || data.userName || '',
      businessEmail: data.email || data.businessEmail || '',
      country: data.country || data.location || ''
    };
    
    updateDiscoveryData(mappedData);
  };

  const handleConversationComplete = (allData: any) => {
    // Final data extraction and mark conversation complete
    handleDataExtracted(allData);
    markConversationComplete();
  };

  // Show conversation interface when user has started discovery
  if (state.currentStep === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
        
        {/* Enhanced glass morphism navigation */}
        <nav className="relative z-10 px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-white font-semibold text-2xl tracking-tight">Fractionl.ai</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-white/70 text-sm">AI Transformation Discovery</span>
            </div>
          </div>
        </nav>
        
        <ConversationalInterface
          onDataExtracted={handleDataExtracted}
          onConversationComplete={handleConversationComplete}
          initialPrompt="Welcome! I'm here to help you discover the perfect AI transformation approach for your organization. Let's start with your name and company - what should I call you?"
          placeholder="Type your response here..."
          aiPersonality="professional"
        />
      </div>
    );
  }

  // Main welcome page with enhanced visuals
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary floating elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
        
        {/* Additional floating particles */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" style={{ animation: 'float 6s ease-in-out infinite reverse' }}></div>
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-purple-300/20 rounded-full blur-lg" style={{ animation: 'float 7s ease-in-out infinite' }}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
      </div>

      {/* Enhanced glass morphism navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-white font-semibold text-2xl tracking-tight">Fractionl.ai</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-white/70 text-sm">AI Transformation Discovery</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Animated badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-white text-sm font-medium" style={{ animation: 'fade-in-up 0.6s ease-out forwards' }}>
            <Brain className="w-4 h-4" />
            AI Literacy & Confidence Transformation
          </div>

          {/* Main headline with enhanced typography */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight tracking-tight" style={{ animation: 'fade-in-up 0.6s ease-out 0.2s forwards', opacity: 0 }}>
            Turn Your People From
            <br />
            <span className="bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Anxious to AI-Ambitious
            </span>
            <br />
            in 7 Minutes
          </h1>

          {/* Enhanced subtitle */}
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed" style={{ animation: 'fade-in-up 0.6s ease-out 0.4s forwards', opacity: 0 }}>
            Our AI-powered discovery reveals your organization's exact transformation roadmap. 
            Get personalized insights, overcome resistance, and build the AI-confident team your company needs.
          </p>

          {/* Enhanced CTA button */}
          <div style={{ animation: 'fade-in-up 0.6s ease-out 0.6s forwards', opacity: 0 }}>
            <button
              onClick={handleStartDiscovery}
              className="group bg-white text-purple-900 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                Start AI Discovery 
                <svg className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Trust indicator */}
          <p className="text-white/70 text-lg" style={{ animation: 'fade-in-up 0.6s ease-out 0.8s forwards', opacity: 0 }}>
            Used by Fortune 500 companies, healthcare systems, and tech leaders
          </p>
        </div>
      </div>

      {/* Value proposition cards */}
      <div className="relative z-10 px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-white" style={{ animation: 'fade-in-up 0.6s ease-out 1s forwards', opacity: 0 }}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Intelligent Discovery</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                AI-powered conversation reveals your team's exact readiness level, anxiety points, and optimal learning paths in minutes.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-white" style={{ animation: 'fade-in-up 0.6s ease-out 1.2s forwards', opacity: 0 }}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Personalized Roadmap</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                Get a customized AI literacy program designed specifically for your industry, company size, and team dynamics.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 text-white" style={{ animation: 'fade-in-up 0.6s ease-out 1.4s forwards', opacity: 0 }}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Expert Guidance</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                Connect with AI literacy experts who've transformed teams at companies like yours. Skip the trial and error.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust indicators */}
      <div className="relative z-10 px-6 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white/60 text-lg mb-6" style={{ animation: 'fade-in-up 0.6s ease-out 1.6s forwards', opacity: 0 }}>
            Trusted by organizations in
          </p>
          <div className="flex flex-wrap justify-center gap-8 text-white/80 text-lg" style={{ animation: 'fade-in-up 0.6s ease-out 1.8s forwards', opacity: 0 }}>
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
  );
};