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
import { CheckCircle2, ArrowRight, ArrowLeft, Target, Zap, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
      // Use security definer function for public access
      const { data: intake, error } = await supabase
        .rpc('get_intake_for_registration', { intake_uuid: intakeId });
      
      if (error) throw error;
      
      if (!intake || intake.length === 0) {
        throw new Error('Invalid registration link');
      }
      
      setIntakeData(intake[0]);
      setLoading(false);
    } catch (error) {
      console.error('Error loading intake:', error);
      toast({ title: 'Invalid registration link', variant: 'destructive' });
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
          toast({ title: 'Please enter your name', variant: 'destructive' });
          return false;
        }
        if (!formData.participantEmail.trim() || !formData.participantEmail.includes('@')) {
          toast({ title: 'Please enter a valid email', variant: 'destructive' });
          return false;
        }
        if (!formData.participantRole.trim()) {
          toast({ title: 'Please enter your role', variant: 'destructive' });
          return false;
        }
        break;
      case 2:
        if (formData.aiMythsConcerns.length === 0) {
          toast({ title: 'Please select at least one concern', variant: 'destructive' });
          return false;
        }
        break;
      case 3:
        if (formData.currentBottlenecks.length === 0) {
          toast({ title: 'Please select at least one bottleneck', variant: 'destructive' });
          return false;
        }
        break;
      case 4:
        if (!formData.aiExperienceLevel) {
          toast({ title: 'Please select your AI experience level', variant: 'destructive' });
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
      toast({ title: 'Registration complete!' });
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast({ title: error.message || 'Failed to submit registration', variant: 'destructive' });
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
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto mb-2 w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-3xl">🎉 You're All Set!</CardTitle>
            <CardDescription className="text-lg font-medium text-foreground">
              Thank you, {formData.participantName}!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-muted-foreground">
              We're analyzing your responses along with your team's to create a custom bootcamp agenda for {intakeData.company_name}.
            </p>
            
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold text-center">What happens next:</h4>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Prep pack arriving within 48 hours</p>
                    <p className="text-xs text-muted-foreground">Calendar invite with all the details</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Tailored agenda based on your input</p>
                    <p className="text-xs text-muted-foreground">Custom scenarios for your team's challenges</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 rounded-lg bg-accent/5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Hands-on AI simulations</p>
                    <p className="text-xs text-muted-foreground">Walk away with a 90-day pilot charter</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t text-center">
              <p className="font-semibold text-foreground mb-4">See you at the bootcamp! 🚀</p>
              <p className="text-xs text-muted-foreground">
                Questions? Reach out to {intakeData.organizer_name}
              </p>
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
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-2xl mb-2">You're Invited! 🎯</CardTitle>
            <CardDescription className="text-base">
              <span className="font-semibold text-foreground">{intakeData.company_name}</span> is bringing you an exclusive AI Leadership Bootcamp
            </CardDescription>
          </div>
          
          {currentStep === 1 && (
            <div className="pt-2 pb-2 space-y-3 text-sm border-t border-b">
              <p className="text-muted-foreground">In this hands-on 4-hour session, you'll:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Run real-world AI decision simulations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Identify your team's cognitive blind spots</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✓</span>
                  <span>Leave with a 90-day AI pilot charter — no vendor pitches</span>
                </li>
              </ul>
              <p className="text-foreground font-medium pt-2">
                Your input helps us tailor the experience. This takes 3 minutes. Let's get started! 👇
              </p>
            </div>
          )}
          
          <div className="pt-2">
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
                <h3 className="text-lg font-semibold mb-2">First, let's get to know you</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll use this to personalize your workshop experience.
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
                <h3 className="text-lg font-semibold mb-2">What AI concerns keep you up at night?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select all that resonate. We'll address these head-on in the workshop.
                </p>
              </div>
              
              <div className="space-y-3">
                {AI_MYTHS_OPTIONS.map((myth) => (
                  <div key={myth} className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer transition-colors" onClick={() => toggleMythConcern(myth)}>
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
                <h3 className="text-lg font-semibold mb-2">What's slowing your team down right now?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your answers help us create relevant simulations for the bootcamp.
                </p>
              </div>
              
              <div className="space-y-3">
                {BOTTLENECK_OPTIONS.map((bottleneck) => (
                  <div key={bottleneck} className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer transition-colors" onClick={() => toggleBottleneck(bottleneck)}>
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
                <h3 className="text-lg font-semibold mb-2">Where is your team on the AI journey?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  This helps us calibrate the workshop content to your starting point.
                </p>
              </div>
              
              <RadioGroup
                value={formData.aiExperienceLevel}
                onValueChange={(value: any) => setFormData({ ...formData, aiExperienceLevel: value })}
              >
                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer transition-colors">
                  <RadioGroupItem value="none" id="exp-none" />
                  <div className="flex-1">
                    <Label htmlFor="exp-none" className="cursor-pointer font-medium">
                      No AI Experience
                    </Label>
                    <p className="text-sm text-muted-foreground">Haven't used AI tools professionally yet</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer transition-colors">
                  <RadioGroupItem value="experimenting" id="exp-experimenting" />
                  <div className="flex-1">
                    <Label htmlFor="exp-experimenting" className="cursor-pointer font-medium">
                      Experimenting
                    </Label>
                    <p className="text-sm text-muted-foreground">Using ChatGPT or similar tools occasionally</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer transition-colors">
                  <RadioGroupItem value="deploying" id="exp-deploying" />
                  <div className="flex-1">
                    <Label htmlFor="exp-deploying" className="cursor-pointer font-medium">
                      Deploying
                    </Label>
                    <p className="text-sm text-muted-foreground">Actively implementing AI in specific workflows</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer transition-colors">
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
