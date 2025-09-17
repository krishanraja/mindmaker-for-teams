import React, { useState } from 'react';
import { ArrowRight, Sparkles, MessageCircle, Star, Shield, Clock, Brain } from 'lucide-react';
import { Button } from '../ui/button';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { ConversationalInterface } from '../ai/ConversationalInterface';

export const Step1Welcome: React.FC = () => {
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
    // Update mindmaker context with conversational data
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
    // Map all conversational data to mindmaker context
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
    
    // Mark all steps as completed since AI gathered everything
    markStepCompleted(1);
    markStepCompleted(2);
    markStepCompleted(3);
    markStepCompleted(4);
    markStepCompleted(5);
    markStepCompleted(6);
    
    // Jump directly to canvas step (7)
    setCurrentStep(7);
  };

  if (showConversation) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
        {/* Glass Morphism Background */}
        <div className="absolute inset-0 hero-clouds">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-transparent to-accent-400/30" />
        </div>

        {/* Conversational Interface */}
        <div className="relative z-10 w-full max-w-4xl mx-auto h-screen flex flex-col">
          {/* Glass Header */}
          <div className="glass-card m-6 p-6 text-center">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <img 
                src="/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png" 
                alt="AI Mindmaker Logo" 
                className="w-20 h-20 object-contain"
              />
            </div>
            <h1 className="section-header text-foreground mb-2">
              AI Transformation Consultant
            </h1>
            <p className="body-md text-muted-foreground">
              Let's discover your organization's AI readiness together
            </p>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-hidden mx-6 mb-6">
            <div className="glass-card h-full">
              <ConversationalInterface
                onDataExtracted={handleDataExtracted}
                onConversationComplete={handleConversationComplete}
                initialPrompt="I'm conducting an AI readiness assessment for Enterprise L&D organizations. This evaluation covers 5 key dimensions: organizational structure, current AI maturity, strategic readiness, talent & skills, and implementation capacity. Let's start with your organizational context - what industry are you in?"
                placeholder="e.g., Healthcare, Financial Services, Manufacturing..."
                aiPersonality="professional"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full Screen Hero */}
      <div className="min-h-screen flex flex-col relative">
        {/* Hero Background Container */}
        <div className="hero-clouds absolute inset-0">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 via-primary to-accent-400"></div>
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-xl animate-float"></div>
            <div className="absolute bottom-40 right-32 w-96 h-96 bg-accent/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary-200/30 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
          </div>
        </div>

        {/* Navigation Header */}
        <div className="relative z-10 w-full">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 m-6 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">Fractionl AI Literacy</h1>
                <p className="text-white/80 text-sm">Transform How Your Team Thinks About AI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex-1 flex flex-col justify-center container-width px-6">
          {/* Logo */}
          <div className="fade-in-up mb-8 text-center">
            <div className="w-24 h-24 md:w-32 md:h-32 flex items-center justify-center mx-auto mb-6">
              <img 
                src="/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png" 
                alt="AI Mindmaker Logo" 
                className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Hero Title */}
          <div className="fade-in-up mb-8 text-center">
            <h1 className="hero-title text-white mb-6 text-balance">
              Transform How Your Organization
              <br />
              <span className="bg-gradient-to-r from-white to-primary-100 bg-clip-text text-transparent">
                Thinks About AI
              </span>
            </h1>
            
            <p className="body-lg text-white/90 max-w-3xl mx-auto leading-relaxed mb-4">
              Build systematic AI literacy across your entire organization. From executives to frontline staff, 
              develop the cognitive frameworks needed to thrive in an AI-augmented workplace.
            </p>
            
            <div className="inline-flex items-center gap-2 glass-card-dark px-4 py-2 rounded-full">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white/80">CEO-Ready Assessment Tool</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="fade-in-up mb-12 text-center">
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <Button
                onClick={handleConversationalStart}
                variant="hero"
                size="lg"
                className="w-full md:flex-1 py-4 text-lg font-semibold group"
              >
                <MessageCircle className="mr-3 w-5 h-5" />
                Start AI Conversation
                <Sparkles className="ml-3 w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Button>
              
              <Button
                onClick={handleTraditionalStart}
                variant="glass"
                size="lg"
                className="w-full md:flex-1 py-4 text-lg font-semibold group"
              >
                Traditional Assessment
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Assessment Methods Comparison */}
          <div className="fade-in-up mb-12">
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="glass-card-dark p-6 text-left">
                <div className="flex items-center mb-4">
                  <MessageCircle className="w-6 h-6 mr-3 text-primary-200" />
                  <h3 className="text-xl font-semibold text-white">AI CONSULTANT</h3>
                </div>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-200 rounded-full mr-3" />
                    Natural, contextual dialogue
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-200 rounded-full mr-3" />
                    Adaptive questioning based on responses
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-200 rounded-full mr-3" />
                    Real-time insights and recommendations
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-200 rounded-full mr-3" />
                    Personalized strategic guidance
                  </li>
                </ul>
              </div>

              <div className="glass-card-dark p-6 text-left">
                <div className="flex items-center mb-4">
                  <Shield className="w-6 h-6 mr-3 text-accent-400" />
                  <h3 className="text-xl font-semibold text-white">STRUCTURED ASSESSMENT</h3>
                </div>
                <ul className="space-y-3 text-white/80">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent-400 rounded-full mr-3" />
                    Comprehensive step-by-step process
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent-400 rounded-full mr-3" />
                    Familiar questionnaire format
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent-400 rounded-full mr-3" />
                    Visual progress tracking
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-accent-400 rounded-full mr-3" />
                    Systematic data collection
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Trust Indicators */}
          <div className="fade-in-up text-center">
            <div className="flex flex-wrap items-center justify-center gap-8 text-white/80">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">5-10 minute assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="text-sm">Enterprise-grade insights</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span className="text-sm">Strategic action canvas</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};