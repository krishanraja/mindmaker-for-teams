import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const AI_MYTHS_OPTIONS = [
  'AI will replace our team',
  'AI is too expensive to implement',
  'We need data scientists to use AI',
  'AI is not ready for our industry',
  'AI will make too many mistakes',
  'AI projects take years to deliver value',
];

const BOTTLENECK_OPTIONS = [
  'Competing priorities',
  'Leadership alignment',
  'Resource constraints',
  'Change fatigue',
  'Technical debt',
  'Market uncertainty',
  'Slow decision-making',
  'Lack of AI expertise',
];

export const MobileRegistration: React.FC = () => {
  const { intakeId } = useParams<{ intakeId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [intakeData, setIntakeData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    participantName: '',
    participantEmail: '',
    participantRole: '',
    aiMythsConcerns: [] as string[],
    currentBottlenecks: [] as string[],
    aiExperienceLevel: '' as 'none' | 'experimenting' | 'deploying' | 'scaled' | '',
  });

  useEffect(() => {
    loadIntakeData();
  }, [intakeId]);

  const loadIntakeData = async () => {
    try {
      const { data: intake, error } = await supabase
        .from('exec_intakes')
        .select('*')
        .eq('id', intakeId)
        .single();
      
      if (error) throw error;
      
      setIntakeData(intake);
      setLoading(false);
    } catch (error) {
      console.error('Error loading intake:', error);
      toast.error('Invalid registration link');
      navigate('/');
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.participantName.trim()) {
          toast.error('Please enter your name');
          return false;
        }
        if (!formData.participantEmail.trim() || !formData.participantEmail.includes('@')) {
          toast.error('Please enter a valid email');
          return false;
        }
        if (!formData.participantRole.trim()) {
          toast.error('Please enter your role');
          return false;
        }
        break;
      case 2:
        if (formData.aiMythsConcerns.length === 0) {
          toast.error('Please select at least one concern');
          return false;
        }
        break;
      case 3:
        if (formData.currentBottlenecks.length === 0) {
          toast.error('Please select at least one bottleneck');
          return false;
        }
        break;
      case 4:
        if (!formData.aiExperienceLevel) {
          toast.error('Please select your AI experience level');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setSubmitting(true);
    try {
      // Check if participant already exists
      const { data: existingIntake } = await supabase
        .from('exec_intakes')
        .select('participants')
        .eq('id', intakeId)
        .single();
      
      const participants = (existingIntake?.participants as any[]) || [];
      const existingIndex = participants.findIndex(p => p.email === formData.participantEmail);
      
      // Add or update participant
      if (existingIndex >= 0) {
        participants[existingIndex] = {
          name: formData.participantName,
          email: formData.participantEmail,
          role: formData.participantRole,
        };
      } else {
        participants.push({
          name: formData.participantName,
          email: formData.participantEmail,
          role: formData.participantRole,
        });
      }
      
      // Update intake with new participant
      const { error: updateError } = await supabase
        .from('exec_intakes')
        .update({ participants })
        .eq('id', intakeId);
      
      if (updateError) throw updateError;
      
      // Store pre-workshop responses
      const { error: insertError } = await supabase
        .from('pre_workshop_inputs')
        .insert({
          intake_id: intakeId,
          participant_email: formData.participantEmail,
          participant_name: formData.participantName,
          pre_work_responses: {
            ai_myths_concerns: formData.aiMythsConcerns,
            current_bottlenecks: formData.currentBottlenecks,
            ai_experience_level: formData.aiExperienceLevel,
          },
          submitted_at: new Date().toISOString(),
        });
      
      if (insertError) throw insertError;
      
      setSubmitted(true);
      toast.success('Registration complete!');
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast.error(error.message || 'Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleMythConcern = (myth: string) => {
    setFormData(prev => ({
      ...prev,
      aiMythsConcerns: prev.aiMythsConcerns.includes(myth)
        ? prev.aiMythsConcerns.filter(m => m !== myth)
        : [...prev.aiMythsConcerns, myth]
    }));
  };

  const toggleBottleneck = (bottleneck: string) => {
    setFormData(prev => ({
      ...prev,
      currentBottlenecks: prev.currentBottlenecks.includes(bottleneck)
        ? prev.currentBottlenecks.filter(b => b !== bottleneck)
        : [...prev.currentBottlenecks, bottleneck]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-2xl border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Registration Complete!</CardTitle>
            <CardDescription className="text-lg">
              Thank you, {formData.participantName}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You've successfully registered for the {intakeData.company_name} AI Leadership Bootcamp.
            </p>
            <p className="text-muted-foreground">
              Your responses will help us tailor the workshop to your team's needs.
            </p>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium">We'll see you at the workshop!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <Card className="w-full max-w-2xl border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Workshop Registration</CardTitle>
          <CardDescription>{intakeData.company_name} AI Leadership Bootcamp</CardDescription>
          <div className="pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Step {currentStep} of {totalSteps}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Participant Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Tell us about yourself</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll use this information to personalize your workshop experience.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.participantName}
                  onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.participantEmail}
                  onChange={(e) => setFormData({ ...formData, participantEmail: e.target.value })}
                  placeholder="john@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Your Role *</Label>
                <Input
                  id="role"
                  value={formData.participantRole}
                  onChange={(e) => setFormData({ ...formData, participantRole: e.target.value })}
                  placeholder="e.g., VP Product, CTO, Head of Operations"
                />
              </div>
            </div>
          )}

          {/* Step 2: AI Myths & Concerns */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">What are your AI concerns?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select all that resonate with you. We'll address these in the workshop.
                </p>
              </div>
              
              <div className="space-y-3">
                {AI_MYTHS_OPTIONS.map((myth) => (
                  <div key={myth} className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer" onClick={() => toggleMythConcern(myth)}>
                    <Checkbox
                      checked={formData.aiMythsConcerns.includes(myth)}
                      onCheckedChange={() => toggleMythConcern(myth)}
                    />
                    <Label className="flex-1 cursor-pointer font-normal">
                      {myth}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Current Bottlenecks */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">What are your team's bottlenecks?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select all that apply to your current situation.
                </p>
              </div>
              
              <div className="space-y-3">
                {BOTTLENECK_OPTIONS.map((bottleneck) => (
                  <div key={bottleneck} className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer" onClick={() => toggleBottleneck(bottleneck)}>
                    <Checkbox
                      checked={formData.currentBottlenecks.includes(bottleneck)}
                      onCheckedChange={() => toggleBottleneck(bottleneck)}
                    />
                    <Label className="flex-1 cursor-pointer font-normal">
                      {bottleneck}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: AI Experience Level */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">What's your AI experience level?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This helps us calibrate the workshop content.
                </p>
              </div>
              
              <RadioGroup
                value={formData.aiExperienceLevel}
                onValueChange={(value: any) => setFormData({ ...formData, aiExperienceLevel: value })}
              >
                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer">
                  <RadioGroupItem value="none" id="exp-none" />
                  <div className="flex-1">
                    <Label htmlFor="exp-none" className="cursor-pointer font-medium">
                      No AI Experience
                    </Label>
                    <p className="text-sm text-muted-foreground">Haven't used AI tools professionally</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer">
                  <RadioGroupItem value="experimenting" id="exp-experimenting" />
                  <div className="flex-1">
                    <Label htmlFor="exp-experimenting" className="cursor-pointer font-medium">
                      Experimenting
                    </Label>
                    <p className="text-sm text-muted-foreground">Using ChatGPT or similar tools occasionally</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer">
                  <RadioGroupItem value="deploying" id="exp-deploying" />
                  <div className="flex-1">
                    <Label htmlFor="exp-deploying" className="cursor-pointer font-medium">
                      Deploying
                    </Label>
                    <p className="text-sm text-muted-foreground">Actively implementing AI in specific workflows</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer">
                  <RadioGroupItem value="scaled" id="exp-scaled" />
                  <div className="flex-1">
                    <Label htmlFor="exp-scaled" className="cursor-pointer font-medium">
                      Scaled Usage
                    </Label>
                    <p className="text-sm text-muted-foreground">AI integrated across multiple teams/processes</p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
            )}
            
            {currentStep < totalSteps ? (
              <Button onClick={handleNext} className="ml-auto">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting} className="ml-auto">
                {submitting ? 'Submitting...' : 'Complete Registration'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
