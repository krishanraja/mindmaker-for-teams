import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useMindmaker } from '@/contexts/MindmakerContext';
import { ConversationalInterface } from '@/components/ai/ConversationalInterface';

export const Step1Welcome = () => {
  const { setCurrentStep, markStepCompleted, updateMindmakerData } = useMindmaker();
  const [showConversation, setShowConversation] = useState(false);

  const handleTraditionalStart = () => {
    markStepCompleted(1);
    setCurrentStep(2);
  };

  const handleConversationalStart = () => {
    setShowConversation(true);
  };

  const handleDataExtracted = (extractedData: any) => {
    if (extractedData.businessName) {
      updateMindmakerData({ businessName: extractedData.businessName });
    }
    if (extractedData.industry) {
      updateMindmakerData({ businessDescription: extractedData.industry });
    }
    if (extractedData.employeeCount) {
      updateMindmakerData({ employeeCount: extractedData.employeeCount });
    }
    if (extractedData.challenges) {
      updateMindmakerData({ businessFunctions: extractedData.challenges });
    }
  };

  const handleConversationComplete = (allData: any) => {
    if (allData) {
      updateMindmakerData({
        businessName: allData.businessName || '',
        businessDescription: allData.businessDescription || allData.industry || '',
        employeeCount: allData.employeeCount || 0,
        businessFunctions: allData.businessFunctions || allData.challenges || [],
        aiAdoption: allData.aiAdoption || 'none',
        anxietyLevels: allData.anxietyLevels || {
          executives: allData.executiveAnxiety || 50,
          middleManagement: allData.managementAnxiety || 50,
          frontlineStaff: allData.staffAnxiety || 50,
          techTeam: allData.techAnxiety || 50,
          nonTechTeam: allData.nonTechAnxiety || 50,
        },
        aiSkills: allData.aiSkills || [],
        automationRisks: allData.automationRisks || [],
        learningModality: allData.learningModality || 'live-cohort',
        changeNarrative: allData.changeNarrative || '',
        successTargets: allData.successTargets || [],
        userName: allData.userName || '',
        businessEmail: allData.businessEmail || '',
        businessUrl: allData.businessUrl || '',
        company: allData.company || allData.businessName || '',
        country: allData.country || ''
      });
    }
    
    markStepCompleted(1);
    markStepCompleted(2);
    markStepCompleted(3);
    markStepCompleted(4);
    markStepCompleted(5);
    markStepCompleted(6);
    setCurrentStep(7);
  };

  if (showConversation) {
    return (
      <div className="hero-clouds relative overflow-hidden">
        {/* Glass Navigation Header */}
        <div className="glass-nav sticky top-0 z-50 px-6 py-4">
          <div className="container-width flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png" alt="MindMaker" className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">MindMaker AI Literacy</h1>
                <p className="text-sm text-muted-foreground">Your AI consultant is listening...</p>
              </div>
            </div>
          </div>
        </div>

        <ConversationalInterface
          onDataExtracted={handleDataExtracted}
          onConversationComplete={handleConversationComplete}
          initialPrompt="I'm your AI literacy consultant. I'll help you assess your organization's AI readiness in a natural conversation. Let's start with understanding your organization - what industry are you in and roughly how many people work there?"
          placeholder="Tell me about your organization..."
          aiPersonality="professional"
        />
      </div>
    );
  }

  return (
    <>
      {/* Full Screen Hero */}
      <div className="hero-clouds relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-40 right-32 w-96 h-96 bg-white/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/30 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Navigation Header */}
        <div className="glass-nav relative z-20 px-6 py-4">
          <div className="container-width flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png" alt="MindMaker" className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">MindMaker</h1>
                <p className="text-sm text-muted-foreground">AI Literacy & Confidence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-20 container-width flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
          {/* Logo & Branding */}
          <div className="fade-in-up mb-8">
            <img src="/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png" alt="MindMaker AI" className="h-20 w-20 mx-auto mb-6" />
          </div>

          {/* Hero Title */}
          <h1 className="hero-title fade-in-up mb-6">
            Transform How You
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Think About AI</span>
          </h1>

          {/* Subtitle */}
          <p className="body-lg fade-in-up mb-12 max-w-2xl">
            Bridge the gap between AI confusion and AI confidence through proven cognitive learning methodologies. Build deep understanding, not just surface-level tool usage.
          </p>

          {/* CTA Buttons */}
          <div className="fade-in-up flex flex-col sm:flex-row gap-4 mb-16">
            <Button
              variant="hero"
              size="lg"
              onClick={handleConversationalStart}
              className="button-hero gap-3 px-8 py-4 text-lg"
            >
              <MessageCircle className="h-5 w-5" />
              Start AI Consultation
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button
              variant="glass"
              size="lg"
              onClick={handleTraditionalStart}
              className="button-glass gap-3 px-8 py-4 text-lg"
            >
              <CheckCircle2 className="h-5 w-5" />
              Take Structured Assessment
            </Button>
          </div>

          {/* Comparison Cards */}
          <div className="fade-in-up grid md:grid-cols-2 gap-8 max-w-4xl w-full">
            {/* AI Consultant Card */}
            <div className="glass-card-dark p-8 text-left">
              <div className="card-grid">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-white mb-2">AI Consultant</h3>
                  <p className="text-white/70">Natural conversation approach</p>
                </div>
                
                <div className="card-content">
                  <ul className="space-y-3 text-white/90">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Personalized insights through AI conversation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Adaptive questioning based on your responses</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Interactive discovery of pain points</span>
                    </li>
                  </ul>
                </div>
                
                <div className="card-footer">
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>⏱️ 5-10 minutes</span>
                    <span>🎯 High insight quality</span>
                    <span>📊 Dynamic canvas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Structured Assessment Card */}
            <div className="glass-card-dark p-8 text-left">
              <div className="card-grid">
                <div className="card-header">
                  <h3 className="text-xl font-semibold text-white mb-2">Structured Assessment</h3>
                  <p className="text-white/70">Step-by-step guided process</p>
                </div>
                
                <div className="card-content">
                  <ul className="space-y-3 text-white/90">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Systematic evaluation across 7 key areas</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Comprehensive scoring and benchmarking</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Detailed action plan with priorities</span>
                    </li>
                  </ul>
                </div>
                
                <div className="card-footer">
                  <div className="flex justify-between items-center text-sm text-white/60">
                    <span>⏱️ 7-12 minutes</span>
                    <span>🎯 Thorough analysis</span>
                    <span>📋 Structured report</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="fade-in-up mt-16 text-center">
            <p className="text-white/60 text-sm mb-4">Trusted by professionals at</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <span className="text-white font-medium">Fortune 500</span>
              <div className="w-px h-4 bg-white/30"></div>
              <span className="text-white font-medium">Scale-ups</span>
              <div className="w-px h-4 bg-white/30"></div>
              <span className="text-white font-medium">Consultancies</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};