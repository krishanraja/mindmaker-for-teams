import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, ArrowRight, Sparkles, Building2, Users, Target, Brain, Zap, TrendingUp, Clock, RotateCcw } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import { supabase } from '../integrations/supabase/client';
import { ButtonGridSelection, LargeButtonSelection } from './ai/SelectionComponents';

export const ExecutiveFlow: React.FC = () => {
  const { state, updateDiscoveryData, setCurrentStep, markConversationComplete } = useMindmaker();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    employeeCount: '',
    currentAIUse: '',
    biggestChallenges: [] as string[],
    leadershipVision: '',
    learningPreferences: '',
    successMetrics: [] as string[],
    implementationTimeline: '',
    contactName: '',
    contactEmail: '',
    contactRole: ''
  });
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [justSelected, setJustSelected] = useState(false);

  const questions = [
    {
      id: 'businessName',
      title: 'Company Name',
      description: 'What\'s your company called?',
      icon: Building2,
      type: 'input',
      placeholder: 'e.g., Acme Corp'
    },
    {
      id: 'industry',
      title: 'Industry',
      description: 'What industry are you in?',
      icon: Target,
      type: 'select',
      options: [
        'E-commerce',
        'SaaS',
        'Digital Marketing/Agency',
        'FinTech',
        'EdTech',
        'MarTech',
        'Creator Economy',
        'Technology/Software',
        'Finance/Banking',
        'Consulting',
        'Education',
        'Other Digital Business'
      ]
    },
    {
      id: 'employeeCount',
      title: 'Team Size',
      description: 'How many employees do you have?',
      icon: Users,
      type: 'select',
      options: [
        '1-10',
        '11-50',
        '51-200',
        '201-1000',
        '1000+'
      ]
    },
    {
      id: 'currentAIUse',
      title: 'Current AI Usage',
      description: 'Where is your organization with AI today?',
      icon: Brain,
      type: 'select',
      options: [
        'No AI usage - exploring opportunities',
        'Limited experimentation with ChatGPT/similar tools',
        'Some teams piloting AI solutions',
        'AI tools deployed for specific functions',
        'Comprehensive AI strategy in execution'
      ]
    },
    {
      id: 'biggestChallenges',
      title: 'Biggest AI Challenges',
      description: 'What are your team\'s biggest concerns about AI? (Select all that apply)',
      icon: Zap,
      type: 'multi-select',
      options: [
        'Fear of job displacement',
        'Security and data privacy concerns',
        'Lack of understanding of AI capabilities',
        'Difficulty identifying valuable use cases',
        'Resistance to change from team members',
        'Budget and ROI uncertainties',
        'Lack of technical expertise',
        'Regulatory and compliance concerns'
      ]
    },
    {
      id: 'leadershipVision',
      title: 'Leadership Vision',
      description: 'How does leadership view AI\'s role in your organization?',
      icon: TrendingUp,
      type: 'select',
      options: [
        'Essential competitive advantage we must embrace',
        'Useful tool to improve efficiency and productivity',
        'Interesting but not urgent priority',
        'Cautious - want to see how others succeed first',
        'Mixed views - some excited, others concerned'
      ]
    },
    {
      id: 'learningPreferences',
      title: 'Learning Preferences',
      description: 'How does your team prefer to learn new skills?',
      icon: Target,
      type: 'select',
      options: [
        'Live workshops with hands-on practice',
        'Self-paced online modules',
        'One-on-one coaching sessions',
        'Peer learning and discussion groups',
        'Mixed approach with multiple formats'
      ]
    },
    {
      id: 'successMetrics',
      title: 'Success Metrics',
      description: 'What outcomes matter most for your AI initiative? (Select all that apply)',
      icon: Target,
      type: 'multi-select',
      options: [
        'Increased team confidence with AI tools',
        'Measurable productivity improvements',
        'Reduced fear and resistance to AI',
        'Clear governance and best practices',
        'Identification of high-value use cases',
        'Cost savings and efficiency gains',
        'Competitive advantage in market',
        'Employee satisfaction and engagement'
      ]
    },
    {
      id: 'implementationTimeline',
      title: 'Implementation Timeline',
      description: 'What\'s your preferred timeline for AI literacy training?',
      icon: Clock,
      type: 'select',
      options: [
        'ASAP - urgent business priority',
        'Within next 1-3 months',
        'Next quarter (3-6 months)',
        'This fiscal year',
        'Flexible - when the right opportunity arises'
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
      description: 'Where can we send your personalized roadmap?',
      icon: Target,
      type: 'input',
      placeholder: 'e.g., sarah@company.com'
    },
    {
      id: 'contactRole',
      title: 'Your Role',
      description: 'What\'s your role at the company?',
      icon: Users,
      type: 'select',
      options: [
        'CEO/President',
        'CTO/Head of Technology',
        'COO/Head of Operations',
        'CHRO/Head of HR',
        'VP/Director',
        'Manager/Team Lead',
        'Other C-Suite',
        'Consultant/Advisor'
      ]
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const Icon = currentQ.icon;

  const generateAIInsights = async () => {
    try {
      setIsGeneratingInsights(true);
      
      const { data, error } = await supabase.functions.invoke('generate-ai-insights', {
        body: {
          discoveryData: {
            businessName: formData.businessName,
            industry: formData.industry,
            employeeCount: formData.employeeCount,
            currentAIUse: formData.currentAIUse,
            biggestChallenges: formData.biggestChallenges,
            leadershipVision: formData.leadershipVision,
            learningPreferences: formData.learningPreferences,
            successMetrics: formData.successMetrics,
            implementationTimeline: formData.implementationTimeline,
            contactRole: formData.contactRole
          }
        }
      });
      
      if (error) throw error;
      return data.insights;
    } catch (error) {
      // Silently handle error and return fallback
      return null;
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Generate AI insights before completing
      const aiInsights = await generateAIInsights();
      
      // Complete the discovery
      updateDiscoveryData({
        businessName: formData.businessName,
        industry: formData.industry,
        employeeCount: parseInt(formData.employeeCount.split('-')[0]) || 1,
        currentAIUse: formData.currentAIUse,
        biggestChallenges: formData.biggestChallenges,
        leadershipVision: formData.leadershipVision,
        learningPreferences: formData.learningPreferences,
        successMetrics: formData.successMetrics,
        implementationTimeline: formData.implementationTimeline,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactRole: formData.contactRole,
        aiInsights: aiInsights
      });
      markConversationComplete();
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
    const currentValues = formData[currentQ.id as keyof typeof formData] as string[] || [];
    if (checked) {
      updateFormData([...currentValues, value]);
    } else {
      updateFormData(currentValues.filter(v => v !== value));
    }
  };

  const canProceed = () => {
    const value = formData[currentQ.id as keyof typeof formData];
    if (currentQ.type === 'multi-select') {
      return Array.isArray(value) && value.length > 0;
    }
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
              ) : currentQ.type === 'multi-select' ? (
                <div className="space-y-3 sm:space-y-4">
                  {currentQ.options?.map((option) => (
                    <div key={option} className="flex items-start space-x-3 p-4 sm:p-5 border rounded-lg hover:bg-muted/50 touch-target-md">
                      <Checkbox
                        id={option}
                        checked={(formData[currentQ.id as keyof typeof formData] as string[] || []).includes(option)}
                        onCheckedChange={(checked) => handleMultiSelectChange(option, checked as boolean)}
                        className="mt-1 flex-shrink-0"
                      />
                      <label htmlFor={option} className="text-sm sm:text-base font-medium cursor-pointer flex-grow leading-relaxed">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              ) : currentQ.options && currentQ.options.length <= 5 ? (
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

            {/* Navigation - Only show for multi-select and final question */}
            {(currentQ.type === 'multi-select' || currentQ.type === 'input' || currentQuestion === questions.length - 1) && (
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
                        {currentQuestion === questions.length - 1 ? 'Get My AI Roadmap' : 'Next'}
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