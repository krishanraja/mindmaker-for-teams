import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, CheckCircle, Mail, User, Building, Target, Brain, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { getAnxietyLevel } from '../../types/canvas';
import { BackNavigationDialog } from '../ui/back-navigation-dialog';

export const Step8Summary: React.FC = () => {
  const { state, setCurrentStep, resetCurrentStepData } = useMindmaker();
  const [showBackDialog, setShowBackDialog] = useState(false);
  const { mindmakerData } = state;

  const formatArrayAnswer = (items: string[]) => {
    if (!items || items.length === 0) return 'None specified';
    return items.join(', ');
  };

  const formatAnxietyLevel = (level: number) => {
    const anxietyInfo = getAnxietyLevel(level);
    return `${level}/100 (${anxietyInfo.label})`;
  };

  const formatLearningModality = (modality: string) => {
    const modalityMap: Record<string, string> = {
      'live-cohort': 'Live Cohort Sessions',
      'self-paced': 'Self-Paced Learning',
      'coaching': 'One-on-One Coaching',
      'chatbot': 'AI Chatbot Assistance',
      'blended': 'Blended Learning Approach'
    };
    return modalityMap[modality] || modality;
  };

  const formatAiAdoption = (adoption: string) => {
    const adoptionMap: Record<string, string> = {
      'none': 'No Current AI Usage',
      'pilots': 'Pilot Programs',
      'team-level': 'Team-Level Implementation',
      'enterprise-wide': 'Enterprise-Wide Deployment'
    };
    return adoptionMap[adoption] || adoption;
  };

  const handlePrevious = () => {
    setShowBackDialog(true);
  };

  const handleConfirmBack = () => {
    setCurrentStep(7);
    setShowBackDialog(false);
  };

  const questionsAndAnswers = [
    {
      section: 'Business Information',
      icon: <Building className="w-5 h-5" />,
      questions: [
        {
          question: 'What is your business name?',
          answer: mindmakerData.businessName || 'Not specified'
        },
        {
          question: 'Please describe your business:',
          answer: mindmakerData.businessDescription || 'Not specified'
        },
        {
          question: 'What type of organization are you?',
          answer: mindmakerData.company || 'Not specified'
        },
        {
          question: 'What is your business website?',
          answer: mindmakerData.businessUrl || 'Not specified'
        },
        {
          question: 'Which business functions does your organization focus on?',
          answer: formatArrayAnswer(mindmakerData.businessFunctions)
        },
        {
          question: 'What is your current level of AI adoption?',
          answer: formatAiAdoption(mindmakerData.aiAdoption)
        }
      ]
    },
    {
      section: 'Team Anxiety Assessment',
      icon: <Brain className="w-5 h-5" />,
      questions: [
        {
          question: 'How anxious are executives about AI replacing their decision-making?',
          answer: formatAnxietyLevel(mindmakerData.anxietyLevels.executives)
        },
        {
          question: 'How anxious is middle management about AI changing their role?',
          answer: formatAnxietyLevel(mindmakerData.anxietyLevels.middleManagement)
        },
        {
          question: 'How anxious are frontline staff about AI automation?',
          answer: formatAnxietyLevel(mindmakerData.anxietyLevels.frontlineStaff)
        },
        {
          question: 'How anxious is your tech team about AI complexity?',
          answer: formatAnxietyLevel(mindmakerData.anxietyLevels.techTeam)
        },
        {
          question: 'How anxious are non-tech teams about learning AI tools?',
          answer: formatAnxietyLevel(mindmakerData.anxietyLevels.nonTechTeam)
        }
      ]
    },
    {
      section: 'Capability Assessment',
      icon: <Zap className="w-5 h-5" />,
      questions: [
        {
          question: 'Which AI skills would benefit your team most?',
          answer: formatArrayAnswer(mindmakerData.aiSkills)
        },
        {
          question: 'Which tasks are most at risk of automation?',
          answer: formatArrayAnswer(mindmakerData.automationRisks)
        }
      ]
    },
    {
      section: 'Learning Preferences',
      icon: <FileText className="w-5 h-5" />,
      questions: [
        {
          question: 'What learning approach works best for your team?',
          answer: formatLearningModality(mindmakerData.learningModality)
        },
        {
          question: 'Describe your experience with organizational change:',
          answer: mindmakerData.changeNarrative || 'Not specified'
        }
      ]
    },
    {
      section: 'Success Targets',
      icon: <Target className="w-5 h-5" />,
      questions: [
        {
          question: 'What are your key success targets for AI adoption?',
          answer: formatArrayAnswer(mindmakerData.successTargets)
        }
      ]
    },
    {
      section: 'Contact Information',
      icon: <User className="w-5 h-5" />,
      questions: [
        {
          question: 'What is your name?',
          answer: mindmakerData.userName || 'Not specified'
        },
        {
          question: 'What is your email address?',
          answer: mindmakerData.businessEmail || 'Not specified'
        },
        {
          question: 'Which country are you located in?',
          answer: mindmakerData.country || 'Not specified'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Step 8 of 8</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Your AI Transformation Summary
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              A complete overview of your responses to keep for your records and reference.
            </p>
          </div>
        </div>

        {/* Summary Content */}
        <div className="space-y-8">
          {questionsAndAnswers.map((section, sectionIndex) => (
            <Card key={sectionIndex} className="border-border bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl text-foreground">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {section.icon}
                  </div>
                  {section.section}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {section.questions.map((qa, questionIndex) => (
                    <div key={questionIndex} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-medium text-foreground leading-relaxed">
                          {qa.question}
                        </h3>
                      </div>
                      <div className="space-y-2">
                        <div className="p-3 bg-muted/50 rounded-lg border border-border">
                          <p className="text-foreground leading-relaxed">
                            {qa.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setCurrentStep(7)}
              size="lg"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Generate PDF
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Print Summary
            </Button>
          </div>
        </div>

        {/* Footer Bar */}
        <div className="mt-16 py-4 border-t border-primary/20">
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>Fractionl AI • AI Transformation Mindmaker</span>
            <span>Summary • Page 1 of 1</span>
          </div>
        </div>
      </div>

      <BackNavigationDialog
        isOpen={showBackDialog}
        onClose={() => setShowBackDialog(false)}
        onConfirm={handleConfirmBack}
        title="Go Back to Previous Step"
        description="Are you sure you want to go back? This will not affect your saved responses."
      />
    </div>
  );
};