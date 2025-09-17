import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, ArrowRight, Sparkles, Building2, Users, Target } from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';

export const ExecutiveFlow: React.FC = () => {
  const { state, updateDiscoveryData, setCurrentStep, markConversationComplete } = useMindmaker();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState({
    businessName: '',
    industry: '',
    employeeCount: ''
  });

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
        'Technology',
        'Healthcare',
        'Finance',
        'Manufacturing',
        'Retail',
        'Education',
        'Consulting',
        'Legal',
        'Real Estate',
        'Other'
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
    }
  ];

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentQ = questions[currentQuestion];
  const Icon = currentQ.icon;

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Complete the discovery
      updateDiscoveryData({
        businessName: formData.businessName,
        industry: formData.industry,
        employeeCount: parseInt(formData.employeeCount.split('-')[0]) || 1,
        currentAIUse: 'exploring opportunities',
        learningModality: 'live-cohort',
        successTargets: ['operational efficiency', 'competitive advantage']
      });
      markConversationComplete();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    } else {
      setCurrentStep(1);
    }
  };

  const updateFormData = (value: string) => {
    setFormData(prev => ({
      ...prev,
      [currentQ.id]: value
    }));
  };

  const canProceed = formData[currentQ.id as keyof typeof formData];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="glass-nav border-b">
        <div className="container-width">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium">Executive Discovery</span>
              <span className="text-sm text-muted-foreground">
                {currentQuestion + 1} of {questions.length}
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
      <div className="container-width py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card p-8">
            {/* Question Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20 mb-4">
                <Icon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">{currentQ.title}</h1>
              <p className="text-lg text-muted-foreground">{currentQ.description}</p>
            </div>

            {/* Input Field */}
            <div className="mb-8">
              {currentQ.type === 'input' ? (
                <Input
                  value={formData[currentQ.id as keyof typeof formData]}
                  onChange={(e) => updateFormData(e.target.value)}
                  placeholder={currentQ.placeholder}
                  className="h-14 text-lg text-center border-2 focus-visible:ring-2"
                  autoFocus
                />
              ) : (
                <Select
                  value={formData[currentQ.id as keyof typeof formData]}
                  onValueChange={updateFormData}
                >
                  <SelectTrigger className="h-14 text-lg border-2 focus:ring-2">
                    <SelectValue placeholder="Select an option..." />
                  </SelectTrigger>
                  <SelectContent>
                    {currentQ.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {currentQuestion === 0 ? 'Back to Welcome' : 'Previous'}
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                {currentQuestion === questions.length - 1 ? 'Get My Roadmap' : 'Next'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {questions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index <= currentQuestion ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};