import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, Users, User, MessageSquare, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { BackNavigationDialog } from '../ui/back-navigation-dialog';

const LEARNING_MODALITIES = [
  {
    id: 'live-cohort',
    title: 'Live Cohort Learning',
    description: 'Interactive group sessions with instructor-led training',
    icon: <Users className="w-5 h-5" />,
    color: 'text-brand-purple'
  },
  {
    id: 'self-paced',
    title: 'Self-paced Digital Learning',
    description: 'Online courses and modules completed at your own speed',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'text-brand-blue'
  },
  {
    id: 'coaching',
    title: '1:1 Coaching',
    description: 'Personalized mentoring and guidance sessions',
    icon: <User className="w-5 h-5" />,
    color: 'text-success'
  },
  {
    id: 'chatbot',
    title: 'Chatbot AI Learning Assistant',
    description: 'AI-powered learning companion for instant help',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'text-warning'
  },
  {
    id: 'blended',
    title: 'Blended Approach',
    description: 'Combination of multiple learning methods',
    icon: <Zap className="w-5 h-5" />,
    color: 'text-error'
  }
];

export const Step5HabitHooks: React.FC = () => {
  const { state, updateMindmakerData, setCurrentStep, markStepCompleted, resetCurrentStepData } = useMindmaker();

  const [learningModality, setLearningModality] = useState(state.mindmakerData.learningModality);
  const [changeNarrative, setChangeNarrative] = useState(state.mindmakerData.changeNarrative);
  const [showBackDialog, setShowBackDialog] = useState(false);
  
  // Store initial values to check for changes
  const [initialValues] = useState({
    learningModality: state.mindmakerData.learningModality,
    changeNarrative: state.mindmakerData.changeNarrative
  });

  useEffect(() => {
    updateMindmakerData({ learningModality, changeNarrative });
  }, [learningModality, changeNarrative, updateMindmakerData]);

  const handleNext = () => {
    markStepCompleted(5);
    setCurrentStep(6);
  };

  const handlePrevious = () => {
    // Check if any form field has been changed from initial values
    const hasChanged = (
      learningModality !== initialValues.learningModality ||
      changeNarrative !== initialValues.changeNarrative
    );
    
    if (hasChanged) {
      setShowBackDialog(true);
    } else {
      setCurrentStep(4);
    }
  };

  const handleConfirmBack = () => {
    // Reset current step data
    setLearningModality('live-cohort');
    setChangeNarrative('');
    setShowBackDialog(false);
    setCurrentStep(4);
  };

  const selectedModality = LEARNING_MODALITIES.find(m => m.id === learningModality);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl mb-3">
          Learning & Change Strategy
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Define how your team learns best and capture your change management approach
        </p>
      </div>

      {/* Learning Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-brand-purple" />
            Preferred Learning Modality
          </CardTitle>
          <CardDescription>
            How does your team prefer to learn new skills and technologies?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={learningModality}
            onValueChange={(value) => setLearningModality(value as any)}
            className="space-y-4"
          >
            {LEARNING_MODALITIES.map((modality) => (
              <div key={modality.id} className="flex items-start space-x-3">
                <RadioGroupItem value={modality.id} id={modality.id} className="mt-1" />
                <div className="space-y-1 flex-1">
                  <Label 
                    htmlFor={modality.id}
                    className="text-base font-medium cursor-pointer flex items-center gap-2"
                  >
                    <span className={modality.color}>
                      {modality.icon}
                    </span>
                    {modality.title}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {modality.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>

          {selectedModality && (
            <div className="mt-6 p-4 bg-gradient-to-r from-muted/50 to-muted/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className={selectedModality.color}>
                  {selectedModality.icon}
                </span>
                <span className="font-medium">Selected: {selectedModality.title}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedModality.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Management Narrative */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-success" />
            Change Management Experience
          </CardTitle>
          <CardDescription>
            Tell us about your organization's experience with previous transformations or major changes. 
            This helps us understand what works for your culture.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe any previous transformation experiences, what worked well, what didn't, and what you learned about change management in your organization..."
              value={changeNarrative}
              onChange={(e) => setChangeNarrative(e.target.value)}
              className="min-h-32 resize-none"
            />
            
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Consider sharing:</p>
              <ul className="space-y-1 pl-4">
                <li>• Previous digital transformations or major system changes</li>
                <li>• What communication strategies worked best</li>
                <li>• Common resistance points and how you overcame them</li>
                <li>• Timeline expectations and rollout preferences</li>
                <li>• Key stakeholders and change champions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Learning Strategy Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Preferred Learning Method:</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedModality?.title || 'Not selected'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Change Appetite:</Label>
              <p className="text-sm text-muted-foreground mt-1">
                {changeNarrative.length > 0 
                  ? (() => {
                      const text = changeNarrative.toLowerCase();
                      
                      // 1. Scale & Scope Detection
                      const largeScaleWords = ['entire business', 'whole company', 'complete overhaul', 'major transformation', 'comprehensive change', 'organization-wide', 'company-wide', 'across the business', 'full transformation', 'complete restructure'];
                      const mediumScaleWords = ['department', 'division', 'team', 'specific area', 'business unit', 'function', 'process'];
                      const hasLargeScale = largeScaleWords.some(phrase => text.includes(phrase));
                      const hasMediumScale = mediumScaleWords.some(word => text.includes(word));
                      
                      // 2. External Expertise Detection
                      const externalHelpWords = ['consultant', 'consulting firm', 'external help', 'brought in', 'hired', 'specialists', 'experts', 'third party', 'outsourced', 'consulting company'];
                      const hasExternalHelp = externalHelpWords.some(phrase => text.includes(phrase));
                      
                      // 3. No Experience Detection
                      const noExperienceWords = ['no', 'never', 'first time', 'new to', 'haven\'t', 'limited', 'minimal', 'no experience', 'never done'];
                      const hasNoExperience = noExperienceWords.some(phrase => text.includes(phrase));
                      
                      // 4. Outcome & Impact Analysis
                      const successWords = ['success', 'successful', 'worked', 'effective', 'smooth', 'achieved', 'improved', 'positive', 'well', 'good', 'great', 'excellent', 'buy-in', 'adoption', 'embraced'];
                      const failureWords = ['failed', 'disaster', 'went wrong', 'didn\'t work', 'unsuccessful', 'poor results'];
                      const challengeWords = ['struggle', 'difficult', 'resistance', 'challenge', 'problem', 'issue', 'conflict', 'opposed', 'pushback', 'friction'];
                      const peopleImpactWords = ['people left', 'turnover', 'resignations', 'team exodus', 'lost talent', 'staff left', 'employees quit', 'high turnover'];
                      const skillsGapWords = ['wasn\'t upskilled', 'lack of training', 'unprepared', 'skill shortage', 'not trained', 'skills gap', 'training needed'];
                      
                      const hasSuccess = successWords.some(word => text.includes(word));
                      const hasFailure = failureWords.some(phrase => text.includes(phrase));
                      const hasChallenges = challengeWords.some(word => text.includes(word));
                      const hasPeopleImpact = peopleImpactWords.some(phrase => text.includes(phrase));
                      const hasSkillsGap = skillsGapWords.some(phrase => text.includes(phrase));
                      
                      // 5. Implementation Quality Assessment
                      const poorProcessWords = ['poorly managed', 'rushed', 'no planning', 'chaotic', 'disorganized', 'too fast', 'badly planned'];
                      const poorCommunicationWords = ['poor communication', 'didn\'t explain', 'no buy-in', 'communication issues'];
                      const badConsultantWords = ['consultants were not good', 'poor advice', 'didn\'t understand', 'bad consultants', 'waste of money'];
                      
                      const hasPoorProcess = poorProcessWords.some(phrase => text.includes(phrase));
                      const hasPoorCommunication = poorCommunicationWords.some(phrase => text.includes(phrase));
                      const hasBadConsultants = badConsultantWords.some(phrase => text.includes(phrase));
                      
                      // 6. Learning & Adaptation Detection
                      const learningWords = ['learned that', 'next time', 'would do differently', 'now we know', 'learned from', 'better approach', 'lesson learned'];
                      const hasLearning = learningWords.some(phrase => text.includes(phrase));
                      
                      // 7. Timeline & Pace Preferences
                      const rapidWords = ['fast', 'quick', 'rapid', 'immediate', 'urgent', 'aggressive'];
                      const gradualWords = ['gradual', 'slow', 'step-by-step', 'phased', 'careful', 'cautious'];
                      const prefersRapid = rapidWords.some(word => text.includes(word));
                      const prefersGradual = gradualWords.some(word => text.includes(word));
                      
                      // 8. Change Type Detection
                      const digitalWords = ['digital', 'technology', 'system', 'software', 'platform', 'tool', 'automation', 'ai'];
                      const hasDigitalExp = digitalWords.some(word => text.includes(word));
                      
                      // Smart Classification Logic
                      if (hasNoExperience) {
                        return 'First-time transformation, learning-focused approach needed';
                      }
                      
                      // Major transformation with external expertise
                      if (hasLargeScale && hasExternalHelp) {
                        if (hasSuccess) {
                          return 'Major transformation with proven external expertise';
                        } else if (hasBadConsultants) {
                          return 'Large-scale experience, prefer internal capability building';
                        } else if (hasChallenges && hasLearning) {
                          return 'Complex transformation wisdom, learned from challenges';
                        } else {
                          return 'Major transformation with external expertise';
                        }
                      }
                      
                      // Large scale without external help
                      if (hasLargeScale && !hasExternalHelp) {
                        if (hasSuccess) {
                          return 'Successful large-scale internal transformation';
                        } else if (hasChallenges) {
                          return 'Significant internal change experience, knows the challenges';
                        } else {
                          return 'Large-scale transformation background';
                        }
                      }
                      
                      // External help without large scale
                      if (hasExternalHelp && !hasLargeScale) {
                        if (hasBadConsultants) {
                          return 'Previous consulting experience, prefers internal approach';
                        } else if (hasSuccess) {
                          return 'Successful professional change management experience';
                        } else {
                          return 'Professional change management background';
                        }
                      }
                      
                      // People impact focus
                      if (hasPeopleImpact) {
                        if (hasLearning) {
                          return 'People-focused approach, learned from retention challenges';
                        } else {
                          return 'High people impact awareness, retention-focused strategy needed';
                        }
                      }
                      
                      // Skills gap awareness
                      if (hasSkillsGap) {
                        if (hasLearning) {
                          return 'Skills development priority, training-first approach';
                        } else {
                          return 'Skills gap experience, upskilling-focused strategy';
                        }
                      }
                      
                      // Process quality issues
                      if (hasPoorProcess || hasPoorCommunication) {
                        if (hasLearning) {
                          return 'Process improvement focus, communication-first approach';
                        } else {
                          return 'Structured change management needed, communication priority';
                        }
                      }
                      
                      // Success-focused
                      if (hasSuccess && !hasChallenges) {
                        if (hasDigitalExp) {
                          return 'Successful digital transformation track record';
                        } else {
                          return 'Proven change management success';
                        }
                      }
                      
                      // Challenge-focused with learning
                      if (hasChallenges && hasLearning) {
                        return 'Hard-won transformation wisdom, challenge-ready approach';
                      }
                      
                      // Failure with learning
                      if (hasFailure && hasLearning) {
                        return 'Resilient change approach, learned from setbacks';
                      }
                      
                      // Mixed results
                      if (hasSuccess && hasChallenges) {
                        return 'Mixed transformation results, balanced approach needed';
                      }
                      
                      // Digital focus
                      if (hasDigitalExp) {
                        return 'Digital transformation experience';
                      }
                      
                      // Timeline preferences
                      if (prefersGradual) {
                        return 'Cautious change approach, prefers gradual implementation';
                      }
                      
                      if (prefersRapid) {
                        return 'Rapid change preference, fast implementation ready';
                      }
                      
                      // Default for any other input
                      return 'Change management experience, tailored approach needed';
                    })()
                  : 'No change experience provided (Optional)'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          className="bg-gradient-purple hover:opacity-90 text-white flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <BackNavigationDialog
        isOpen={showBackDialog}
        onClose={() => setShowBackDialog(false)}
        onConfirm={handleConfirmBack}
      />
    </div>
  );
};