import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, ArrowRight, Sparkles, Building2, Users, Target, Brain, Zap, TrendingUp, Clock, RotateCcw, Shield } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import { supabase } from '../integrations/supabase/client';
import { ButtonGridSelection, LargeButtonSelection } from './ai/SelectionComponents';
import { ProgressiveLoadingStates } from './ai/ProgressiveLoadingStates';

export const ExecutiveFlow: React.FC = () => {
  const { state, updateDiscoveryData, setCurrentStep, markConversationComplete } = useMindmaker();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState({
    aiUsagePercentage: '',
    growthUseCases: '',
    messagingAdaptation: '',
    revenueKPIs: '',
    powerUsers: '',
    teamRecognition: '',
    authorityLevel: '',
    implementationTimeline: '',
    contactName: '',
    contactEmail: '',
    businessName: ''
  });
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [justSelected, setJustSelected] = useState(false);

  const questions = [
    {
      id: 'aiUsagePercentage',
      title: 'Team AI Usage',
      description: 'What % of your team uses AI weekly?',
      icon: Users,
      type: 'select',
      options: [
        '0%',
        '<25%',
        '25–50%',
        '>50%'
      ]
    },
    {
      id: 'growthUseCases',
      title: 'Growth-Oriented AI Use Cases',
      description: 'Do you have growth-oriented AI use cases (faster GTM, pipeline acceleration)?',
      icon: TrendingUp,
      type: 'select',
      options: [
        'Yes',
        'No'
      ]
    },
    {
      id: 'messagingAdaptation',
      title: 'Messaging Adaptation',
      description: 'Can your team adapt positioning/messaging faster using AI outputs?',
      icon: Target,
      type: 'select',
      options: [
        'Yes',
        'No'
      ]
    },
    {
      id: 'revenueKPIs',
      title: 'Revenue KPIs',
      description: 'Are AI experiments linked to revenue KPIs?',
      icon: Zap,
      type: 'select',
      options: [
        'Yes',
        'No'
      ]
    },
    {
      id: 'powerUsers',
      title: 'Power Users',
      description: 'Do you have emerging "power users" who drive business wins?',
      icon: Brain,
      type: 'select',
      options: [
        'Yes',
        'No'
      ]
    },
    {
      id: 'teamRecognition',
      title: 'Team Recognition',
      description: 'Is your team recognized internally as growth drivers because of AI?',
      icon: Building2,
      type: 'select',
      options: [
        'Yes',
        'No'
      ]
    },
    {
      id: 'authorityLevel',
      title: 'Decision Authority',
      description: 'What\'s your role in AI/growth initiatives for your team?',
      icon: Shield,
      type: 'select',
      options: [
        'I lead these decisions',
        'I influence these decisions',
        'I\'m exploring for my team',
        'I\'m researching options'
      ]
    },
    {
      id: 'implementationTimeline',
      title: 'Implementation Urgency',
      description: 'When would you want to see measurable AI revenue impact?',
      icon: Clock,
      type: 'select',
      options: [
        'Within 90 days',
        'This quarter',
        'Next 6 months',
        'Exploring for future'
      ]
    },
    {
      id: 'contactName',
      title: 'Your Name',
      description: 'What\'s your name?',
      icon: Users,
      type: 'input',
      placeholder: 'e.g., Sarah Johnson'
    },
    {
      id: 'contactEmail',
      title: 'Email Address',
      description: 'Where can we send your AI revenue impact results?',
      icon: Target,
      type: 'input',
      placeholder: 'e.g., sarah@company.com'
    },
    {
      id: 'businessName',
      title: 'Company Name',
      description: 'What\'s your company called?',
      icon: Building2,
      type: 'input',
      placeholder: 'e.g., Acme Corp'
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const Icon = currentQ.icon;

  const calculateScore = () => {
    let score = 0;
    
    // Calculate score based on responses
    if (formData.aiUsagePercentage === '>50%') score += 1;
    else if (formData.aiUsagePercentage === '25–50%') score += 0.5;
    
    if (formData.growthUseCases === 'Yes') score += 1;
    if (formData.messagingAdaptation === 'Yes') score += 1;
    if (formData.revenueKPIs === 'Yes') score += 1;
    if (formData.powerUsers === 'Yes') score += 1;
    if (formData.teamRecognition === 'Yes') score += 1;
    
    return Math.round(score);
  };

  const getTeamCategory = (score: number) => {
    if (score <= 2) return { category: 'AI-Confused Team', description: 'Tools without outcomes. Literacy is missing.' };
    if (score <= 4) return { category: 'AI-Curious Team', description: 'Promising experiments—but no tie to growth yet.' };
    if (score === 5) return { category: 'AI-Ready Team', description: 'Safe adoption, measurable impact—now scale.' };
    return { category: 'AI-Enabled Team', description: 'Your team is leading growth with AI.' };
  };

  const calculateLeadScore = () => {
    let leadScore = 0;
    
    // Authority Level (0-25 points)
    const authority = formData.authorityLevel;
    if (authority === 'I lead these decisions') leadScore += 25;
    else if (authority === 'I influence these decisions') leadScore += 15;
    else if (authority === 'I\'m exploring for my team') leadScore += 8;
    else if (authority === 'I\'m researching options') leadScore += 3;
    
    // Implementation Timeline (0-25 points)
    const timeline = formData.implementationTimeline;
    if (timeline === 'Within 90 days') leadScore += 25;
    else if (timeline === 'This quarter') leadScore += 15;
    else if (timeline === 'Next 6 months') leadScore += 8;
    else if (timeline === 'Exploring for future') leadScore += 2;
    
    // Email Domain Analysis (0-15 points)
    const email = formData.contactEmail || '';
    const emailDomain = email.split('@')[1]?.toLowerCase() || '';
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    const isBusinessEmail = email && !personalDomains.includes(emailDomain);
    if (isBusinessEmail) leadScore += 15;
    
    // AI Readiness Score (0-15 points based on revenue questions)
    const aiScore = calculateScore();
    if (aiScore >= 5) leadScore += 15;
    else if (aiScore >= 4) leadScore += 10;
    else if (aiScore >= 2) leadScore += 5;
    
    // Company Name Indicator (0-10 points)
    const companyName = formData.businessName || '';
    if (companyName && companyName.length > 2) leadScore += 10;
    
    // Deductions for low engagement signals
    if (authority === 'I\'m researching options') leadScore -= 15;
    if (timeline === 'Exploring for future') leadScore -= 15;
    if (!isBusinessEmail) leadScore -= 20;
    
    return Math.max(0, Math.min(100, leadScore));
  };

  const getQualificationTier = (score: number): 'Hot' | 'Warm' | 'Cold' => {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cold';
  };

  const getEmailDomainType = (email: string): 'Business' | 'Personal' => {
    const emailDomain = email.split('@')[1]?.toLowerCase() || '';
    const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
    return personalDomains.includes(emailDomain) ? 'Personal' : 'Business';
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setIsGeneratingInsights(true);
      
      try {
        // Calculate scores and category
        const score = calculateScore();
        const leadScore = calculateLeadScore();
        const teamAssessment = getTeamCategory(score);
        const email = formData.contactEmail || '';
        
        // Prepare assessment data for AI insights
        const assessmentData = {
          businessName: formData.businessName,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          aiUsagePercentage: formData.aiUsagePercentage,
          growthUseCases: formData.growthUseCases,
          messagingAdaptation: formData.messagingAdaptation,
          revenueKPIs: formData.revenueKPIs,
          powerUsers: formData.powerUsers,
          teamRecognition: formData.teamRecognition,
          authorityLevel: formData.authorityLevel,
          implementationTimeline: formData.implementationTimeline,
          leadScore: leadScore,
          qualificationTier: getQualificationTier(leadScore),
          emailDomainType: getEmailDomainType(email)
        };
        
        // Call AI insights generation
        const { data: insights, error } = await supabase.functions.invoke('generate-business-insights', {
          body: { assessmentData }
        });
        
        if (error) {
          console.error('Error generating insights:', error);
          throw error;
        }
        
        // Complete the discovery with AI-powered insights
        updateDiscoveryData({
          ...assessmentData,
          aiInsights: {
            readinessScore: score,
            category: teamAssessment.category,
            description: teamAssessment.description,
            recommendations: insights?.keyOpportunities || [],
            riskFactors: insights?.riskFactors || [],
            opportunityAreas: insights?.keyOpportunities || [],
            investmentRange: insights?.investmentInsight || '',
            aiMaturityScore: insights?.aiMaturityScore || score * 10,
            revenueImpactPotential: insights?.revenueImpactPotential || 70,
            implementationReadiness: insights?.implementationReadiness || leadScore,
            strategicSummary: insights?.strategicSummary || teamAssessment.description,
            recommendedModules: insights?.recommendedModules || []
          }
        });
        
        markConversationComplete();
      } catch (error) {
        console.error('Failed to generate insights:', error);
        // Fallback to basic scoring if AI insights fail
        const score = calculateScore();
        const leadScore = calculateLeadScore();
        const teamAssessment = getTeamCategory(score);
        const email = formData.contactEmail || '';
        
        updateDiscoveryData({
          businessName: formData.businessName,
          contactName: formData.contactName,
          contactEmail: formData.contactEmail,
          aiUsagePercentage: formData.aiUsagePercentage,
          growthUseCases: formData.growthUseCases,
          messagingAdaptation: formData.messagingAdaptation,
          revenueKPIs: formData.revenueKPIs,
          powerUsers: formData.powerUsers,
          teamRecognition: formData.teamRecognition,
          authorityLevel: formData.authorityLevel,
          implementationTimeline: formData.implementationTimeline,
          leadScore: leadScore,
          qualificationTier: getQualificationTier(leadScore),
          emailDomainType: getEmailDomainType(email),
          aiInsights: {
            readinessScore: score,
            category: teamAssessment.category,
            description: teamAssessment.description,
            recommendations: [],
            riskFactors: [],
            opportunityAreas: [],
            investmentRange: ''
          }
        });
        markConversationComplete();
      } finally {
        setIsGeneratingInsights(false);
      }
    }
  };

  const handleBack = () => {
    setJustSelected(false); // Clear the flag when going back
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      setCurrentStep(1);
    }
  };

  const updateFormData = (value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
    
    // Mark that a selection was just made (for auto-advance logic)
    if (currentQ.type === 'select') {
      setJustSelected(true);
    }
  };

  // Auto-advance for single-select questions (only when just selected, not when navigating back)
  useEffect(() => {
    if (currentQ.type === 'select' && formData[currentQ.id as keyof typeof formData] && justSelected) {
      const timer = setTimeout(() => {
        if (currentQuestion < questions.length - 1) {
          setCurrentQuestion(prev => prev + 1);
          setJustSelected(false); // Clear the flag after advancing
        }
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [formData[currentQ.id as keyof typeof formData], currentQ.type, currentQuestion, questions.length, justSelected]);

  const handleMultiSelectChange = (value: string, checked: boolean) => {
    // Note: Multi-select is no longer used in the new question set
    // This function is kept for backwards compatibility
    updateFormData(value);
  };

  const canProceed = () => {
    const value = formData[currentQ.id as keyof typeof formData];
    return value && value !== '';
  };

  // Keyboard navigation - Enter key support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && canProceed() && !isGeneratingInsights) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canProceed, isGeneratingInsights]);

  // Show loading screen during AI generation
  if (isGeneratingInsights) {
    return <ProgressiveLoadingStates />;
  }

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container-width">
          <div className="flex items-center justify-between h-14 sm:h-16 px-4 sm:px-0">
            <button 
              onClick={handleBack}
              className="btn-ghost flex items-center gap-1 sm:gap-2 touch-target-md p-2 sm:p-3"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <span className="font-medium text-sm sm:text-base">Discovery</span>
              <span className="text-xs sm:text-sm text-muted-foreground">
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted/50 h-1">
        <div 
          className="bg-gradient-to-r from-primary to-primary/80 h-1 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Container */}
      <div className="container-width py-6 sm:py-8 md:py-12 px-4 sm:px-6 md:px-0">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card card-mobile p-6 sm:p-8 md:p-10">
            {/* Question Header */}
            <div className="text-center mb-8 sm:mb-10">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 border border-primary/20 mb-4 sm:mb-6">
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">{currentQ.title}</h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground mobile-readable">{currentQ.description}</p>
            </div>

            {/* Input Field */}
            <div className="mb-8 sm:mb-10">
              {currentQ.type === 'input' ? (
                <Input
                  value={formData[currentQ.id as keyof typeof formData] as string}
                  onChange={(e) => updateFormData(e.target.value)}
                  placeholder={currentQ.placeholder}
                  className="h-12 sm:h-14 text-base sm:text-lg text-center border-2 focus-visible:ring-2 touch-target-md"
                  autoFocus
                />
              ) : currentQ.type === 'select' && currentQ.options && currentQ.options.length <= 4 ? (
                <ButtonGridSelection
                  title=""
                  choices={currentQ.options.map(option => ({ value: option, label: option }))}
                  value={formData[currentQ.id as keyof typeof formData] as string}
                  onSelect={updateFormData}
                />
              ) : (
                <LargeButtonSelection
                  title=""
                  choices={currentQ.options?.map(option => ({ value: option, label: option })) || []}
                  value={formData[currentQ.id as keyof typeof formData] as string}
                  onSelect={updateFormData}
                />
              )}
            </div>

            {/* Navigation - Only show for input questions or final question */}
            {(currentQ.type === 'input' || currentQuestion === questions.length - 1) && (
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 sm:gap-6">
                <button
                  onClick={handleBack}
                  className="btn-outline flex items-center justify-center gap-2 touch-target-md order-2 sm:order-1"
                >
                  {currentQuestion === 0 ? (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Start Over</span>
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-sm sm:text-base">Previous</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || isGeneratingInsights}
                  className="btn-primary flex items-center justify-center gap-2 touch-target-md order-1 sm:order-2"
                >
                  {isGeneratingInsights ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span className="text-sm sm:text-base">Generating...</span>
                    </>
                  ) : (
                    <>
                       <span className="text-sm sm:text-base">
                         {currentQuestion === questions.length - 1 ? 'Get My Impact Results' : 'Next'}
                       </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};