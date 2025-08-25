import React, { useState } from 'react';
import { ArrowRight, Sparkles, MessageCircle } from 'lucide-react';
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
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(var(--primary-purple)) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(var(--primary-purple)) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
          <div className="absolute top-10 left-4 w-32 h-32 bg-gradient-purple rounded-full blur-3xl opacity-10 animate-pulse" />
          <div className="absolute bottom-10 right-4 w-40 h-40 bg-gradient-purple-blue rounded-full blur-3xl opacity-10 animate-pulse delay-1000" />
        </div>

        {/* Conversational Interface */}
        <div className="relative z-10 w-full max-w-4xl mx-auto h-screen flex flex-col">
          {/* Header */}
          <div className="p-6 text-center border-b border-border">
            <div className="w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <img 
                src="/lovable-uploads/cda45e60-bf8b-4a41-bd29-0e6c465c1377.png" 
                alt="Fractionl Logo" 
                className="w-12 h-12 object-contain"
              />
            </div>
            <h1 className="font-display font-bold text-xl md:text-2xl text-foreground">
              AI Transformation Consultant
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Let's discover your organization's AI readiness together
            </p>
          </div>

          {/* Conversation Area */}
          <div className="flex-1 overflow-hidden">
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
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary-purple)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary-purple)) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        
        {/* Floating Gradient Orbs */}
        <div className="absolute top-10 left-4 md:top-20 md:left-20 w-32 h-32 md:w-64 md:h-64 bg-gradient-purple rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-10 right-4 md:bottom-20 md:right-20 w-40 h-40 md:w-80 md:h-80 bg-gradient-purple-blue rounded-full blur-3xl opacity-15 animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-96 md:h-96 bg-brand-blue/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4 md:px-6">
        {/* Logo */}
        <div className="mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center mx-auto mb-4">
            <img 
              src="/lovable-uploads/cda45e60-bf8b-4a41-bd29-0e6c465c1377.png" 
              alt="Fractionl Logo" 
              className="w-16 h-16 md:w-24 md:h-24 object-contain"
            />
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="font-display font-bold text-2xl md:text-5xl lg:text-6xl mb-4 md:mb-6 leading-tight text-white px-2">
          Let's turn your people from{' '}
          <span className="text-white">
            anxious
          </span>{' '}
          to{' '}
          <span className="text-white underline">
            AI-ambitious
          </span>.
        </h1>

        {/* Subheading */}
        <p className="text-base md:text-lg lg:text-xl text-white/90 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
          Choose your preferred assessment style: have a conversation with our AI consultant or go through our structured questionnaire.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-8">
          <Button
            onClick={handleConversationalStart}
            size="lg"
            className="bg-gradient-purple hover:opacity-90 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group w-full md:w-auto"
          >
            <MessageCircle className="mr-2 w-4 h-4 md:w-5 md:h-5" />
            Chat with AI Consultant
            <Sparkles className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
          </Button>
          
          <Button
            onClick={handleTraditionalStart}
            variant="outline"
            size="lg"
            className="border-white/20 text-white hover:bg-white/10 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-xl transition-all duration-300 group w-full md:w-auto"
          >
            Traditional Assessment
            <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Experience Preview */}
        <div className="bg-card/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="font-semibold text-white mb-2 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2 text-primary" />
                AI Conversation
              </h3>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Natural, personalized dialogue</li>
                <li>• AI understands your context</li>
                <li>• Real-time insights and suggestions</li>
                <li>• Adaptive questioning based on your responses</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2 flex items-center">
                <ArrowRight className="w-4 h-4 mr-2 text-primary" />
                Traditional Form
              </h3>
              <ul className="text-sm text-white/80 space-y-1">
                <li>• Structured step-by-step process</li>
                <li>• Familiar questionnaire format</li>
                <li>• Visual progress tracking</li>
                <li>• Comprehensive data collection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm text-muted-foreground px-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>5-10 minute assessment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Personalized recommendations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>Downloadable strategy canvas</span>
          </div>
        </div>
      </div>
    </div>
  );
};