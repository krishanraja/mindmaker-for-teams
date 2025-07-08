import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, GraduationCap, Users, User, MessageSquare, Zap } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useMindmaker } from '../../contexts/MindmakerContext';

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
  const { state, updateMindmakerData, setCurrentStep, markStepCompleted } = useMindmaker();

  const [learningModality, setLearningModality] = useState(state.mindmakerData.learningModality);
  const [changeNarrative, setChangeNarrative] = useState(state.mindmakerData.changeNarrative);

  useEffect(() => {
    updateMindmakerData({ learningModality, changeNarrative });
  }, [learningModality, changeNarrative, updateMindmakerData]);

  const handleNext = () => {
    markStepCompleted(5);
    setCurrentStep(6);
  };

  const handlePrevious = () => {
    setCurrentStep(4);
  };

  const selectedModality = LEARNING_MODALITIES.find(m => m.id === learningModality);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-outfit font-bold text-3xl md:text-4xl mb-4">
          Learning & Change Strategy
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
                      
                      // Check for no experience indicators
                      const noExperienceWords = ['no', 'never', 'first time', 'new to', 'haven\'t', 'limited', 'minimal'];
                      const hasNoExperience = noExperienceWords.some(word => text.includes(word));
                      
                      if (hasNoExperience) {
                        return 'Limited change experience, new to transformations';
                      }
                      
                      // Analyze sentiment and outcomes
                      const positiveWords = ['success', 'successful', 'worked', 'effective', 'smooth', 'achieved', 'improved', 'positive', 'well', 'good', 'great', 'excellent', 'buy-in', 'adoption', 'embraced'];
                      const negativeWords = ['failed', 'struggle', 'difficult', 'resistance', 'challenge', 'problem', 'issue', 'conflict', 'reject', 'opposed', 'slow', 'delayed', 'frustrated', 'pushback', 'disaster'];
                      
                      const positiveScore = positiveWords.filter(word => text.includes(word)).length;
                      const negativeScore = negativeWords.filter(word => text.includes(word)).length;
                      
                      // Check for change types
                      const digitalWords = ['digital', 'technology', 'system', 'software', 'platform', 'tool', 'automation', 'ai'];
                      const hasDigitalExp = digitalWords.some(word => text.includes(word));
                      
                      // Check for timeline preferences
                      const rapidWords = ['fast', 'quick', 'rapid', 'immediate', 'urgent', 'aggressive'];
                      const gradualWords = ['gradual', 'slow', 'step-by-step', 'phased', 'careful', 'cautious'];
                      const prefersRapid = rapidWords.some(word => text.includes(word));
                      const prefersGradual = gradualWords.some(word => text.includes(word));
                      
                      // Generate summary based on analysis
                      let summary = '';
                      
                      if (positiveScore > negativeScore) {
                        if (hasDigitalExp) {
                          summary = 'Successful digital transformation experience';
                        } else {
                          summary = 'Positive change management track record';
                        }
                      } else if (negativeScore > positiveScore) {
                        if (text.includes('learn') || text.includes('better')) {
                          summary = 'Challenging past experiences, learned from setbacks';
                        } else {
                          summary = 'Faced resistance and challenges in previous changes';
                        }
                      } else {
                        if (hasDigitalExp) {
                          summary = 'Mixed results from digital initiatives';
                        } else {
                          summary = 'Moderate change management experience';
                        }
                      }
                      
                      // Add timeline preference if clear
                      if (prefersRapid && !prefersGradual) {
                        summary += ', favors rapid implementation';
                      } else if (prefersGradual && !prefersRapid) {
                        summary += ', prefers gradual approach';
                      }
                      
                      return summary;
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
    </div>
  );
};