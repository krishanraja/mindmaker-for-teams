import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const MobilePreWorkshop: React.FC = () => {
  const { intakeId, participantHash } = useParams<{ intakeId: string; participantHash: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [participantInfo, setParticipantInfo] = useState<any>(null);
  const [bootcampData, setBootcampData] = useState<any>(null);
  
  const [responses, setResponses] = useState({
    personal_bottleneck: '',
    strategic_goal_focus: '',
    ai_concern: '',
    ai_workflow_wish: '',
    simulation_1_experience: {
      dealt_with: false,
      outcome: '',
      success_criteria: '',
    },
    simulation_2_experience: {
      dealt_with: false,
      outcome: '',
      success_criteria: '',
    },
  });

  useEffect(() => {
    validateAndLoadData();
  }, [intakeId, participantHash]);

  const validateAndLoadData = async () => {
    try {
      // Decode hash
      const decoded = atob(participantHash!);
      const [email] = decoded.split('-');
      
      // Verify email exists in intake participants
      const { data: intake, error: intakeError } = await supabase
        .from('exec_intakes')
        .select('*, participants')
        .eq('id', intakeId)
        .single();
      
      if (intakeError) throw intakeError;
      
      const participantsList = (intake?.participants || []) as any[];
      const participant = participantsList.find((p: any) => p.email === email);
      if (!participant) {
        toast.error('Invalid access link');
        navigate('/');
        return;
      }
      
      setParticipantInfo({ ...participant, email, companyName: intake.company_name });
      
      // Load bootcamp plan data
      const { data: plan } = await supabase
        .from('bootcamp_plans')
        .select('*')
        .eq('intake_id', intakeId)
        .single();
      
      setBootcampData(plan);
      
      // Check if already submitted
      const { data: existing } = await supabase
        .from('pre_workshop_inputs')
        .select('pre_work_responses')
        .eq('participant_email', email)
        .eq('intake_id', intakeId)
        .maybeSingle();
      
      if (existing) {
        setAlreadySubmitted(true);
        setResponses(existing.pre_work_responses as any);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Invalid access link');
      navigate('/');
    }
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const validateCurrentQuestion = () => {
    switch (currentQuestion) {
      case 1:
        if (!responses.personal_bottleneck.trim()) {
          toast.error('Please describe your current bottleneck');
          return false;
        }
        break;
      case 2:
        if (!responses.strategic_goal_focus) {
          toast.error('Please select a strategic goal');
          return false;
        }
        break;
      case 3:
        if (!responses.ai_concern) {
          toast.error('Please select an AI concern');
          return false;
        }
        break;
      case 4:
        if (!responses.ai_workflow_wish.trim()) {
          toast.error('Please describe a workflow where AI could help');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) return;
    
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('pre_workshop_inputs')
        .insert([{
          intake_id: intakeId,
          participant_email: participantInfo.email,
          participant_name: participantInfo.name,
          pre_work_responses: responses,
          submitted_at: new Date().toISOString(),
        }]);
      
      if (error) throw error;
      
      setAlreadySubmitted(true);
      toast.success('Thank you! Your input has been submitted.');
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast.error(error.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-2xl border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Thank you, {participantInfo.name}!</CardTitle>
            <CardDescription className="text-lg">
              Your pre-workshop input has been received.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your responses will help us tailor the {participantInfo.companyName} AI Leadership Bootcamp to your team's specific needs and challenges.
            </p>
            <div className="pt-4 border-t">
              <p className="text-sm font-medium">We'll see you at the workshop!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalQuestions = 6;
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <Card className="w-full max-w-2xl border-2">
        <CardHeader>
          <div className="space-y-2">
            <CardDescription>Pre-Workshop Questionnaire</CardDescription>
            <CardTitle className="text-2xl">Hi {participantInfo.name}!</CardTitle>
            <p className="text-sm text-muted-foreground">
              {participantInfo.companyName} • {participantInfo.role}
            </p>
          </div>
          <div className="pt-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Question {currentQuestion} of {totalQuestions}</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Question 1: Personal Bottleneck */}
          {currentQuestion === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">What's your #1 bottleneck right now?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Think about what's slowing you down or preventing you from achieving your goals.
                </p>
              </div>
              <Textarea
                value={responses.personal_bottleneck}
                onChange={(e) => setResponses({ ...responses, personal_bottleneck: e.target.value })}
                placeholder="Example: Too many competing priorities, can't focus on strategy"
                rows={4}
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground text-right">
                {responses.personal_bottleneck.length}/200 characters
              </p>
            </div>
          )}

          {/* Question 2: Strategic Goal Focus */}
          {currentQuestion === 2 && bootcampData?.strategic_goals_2026 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Which 2026 goal are you most excited about?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select the strategic objective that resonates most with your role.
                </p>
              </div>
              <RadioGroup
                value={responses.strategic_goal_focus}
                onValueChange={(value) => setResponses({ ...responses, strategic_goal_focus: value })}
              >
                {bootcampData.strategic_goals_2026.map((goal: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer">
                    <RadioGroupItem value={goal} id={`goal-${index}`} />
                    <Label htmlFor={`goal-${index}`} className="flex-1 cursor-pointer">
                      {goal}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Question 3: AI Concern */}
          {currentQuestion === 3 && bootcampData?.ai_myths_concerns && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">What AI concern resonates most with you?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  We'll address these concerns directly in the workshop.
                </p>
              </div>
              <RadioGroup
                value={responses.ai_concern}
                onValueChange={(value) => setResponses({ ...responses, ai_concern: value })}
              >
                {bootcampData.ai_myths_concerns.map((concern: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-accent/5 cursor-pointer">
                    <RadioGroupItem value={concern} id={`concern-${index}`} />
                    <Label htmlFor={`concern-${index}`} className="flex-1 cursor-pointer">
                      {concern}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Question 4: AI Workflow Wish */}
          {currentQuestion === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">What's ONE workflow you wish AI could help with?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Think about repetitive tasks or complex processes in your day-to-day work.
                </p>
              </div>
              <Textarea
                value={responses.ai_workflow_wish}
                onChange={(e) => setResponses({ ...responses, ai_workflow_wish: e.target.value })}
                placeholder="Example: Drafting quarterly board narratives faster"
                rows={3}
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground text-right">
                {responses.ai_workflow_wish.length}/150 characters
              </p>
            </div>
          )}

          {/* Question 5: Simulation 1 Experience */}
          {currentQuestion === 5 && bootcampData?.simulation_1_snapshot && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Simulation 1: {bootcampData.simulation_1_snapshot.title || 'Scenario'}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {bootcampData.simulation_1_snapshot.currentState}
                </p>
              </div>
              
              <div className="space-y-3">
                <Label>Have you dealt with this type of scenario before?</Label>
                <RadioGroup
                  value={responses.simulation_1_experience.dealt_with ? 'yes' : 'no'}
                  onValueChange={(value) => setResponses({
                    ...responses,
                    simulation_1_experience: {
                      ...responses.simulation_1_experience,
                      dealt_with: value === 'yes',
                    }
                  })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="sim1-yes" />
                    <Label htmlFor="sim1-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="sim1-no" />
                    <Label htmlFor="sim1-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {responses.simulation_1_experience.dealt_with && (
                <div className="space-y-3">
                  <Label>What was the outcome?</Label>
                  <Input
                    value={responses.simulation_1_experience.outcome}
                    onChange={(e) => setResponses({
                      ...responses,
                      simulation_1_experience: {
                        ...responses.simulation_1_experience,
                        outcome: e.target.value,
                      }
                    })}
                    placeholder="Example: Took 3 weeks, board was unhappy"
                    maxLength={100}
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label>What would success look like?</Label>
                <Input
                  value={responses.simulation_1_experience.success_criteria}
                  onChange={(e) => setResponses({
                    ...responses,
                    simulation_1_experience: {
                      ...responses.simulation_1_experience,
                      success_criteria: e.target.value,
                    }
                  })}
                  placeholder="Example: Complete in 2 days with AI assistance"
                  maxLength={100}
                />
              </div>
            </div>
          )}

          {/* Question 6: Simulation 2 Experience */}
          {currentQuestion === 6 && bootcampData?.simulation_2_snapshot && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Simulation 2: {bootcampData.simulation_2_snapshot.title || 'Scenario'}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {bootcampData.simulation_2_snapshot.currentState}
                </p>
              </div>
              
              <div className="space-y-3">
                <Label>Have you dealt with this type of scenario before?</Label>
                <RadioGroup
                  value={responses.simulation_2_experience.dealt_with ? 'yes' : 'no'}
                  onValueChange={(value) => setResponses({
                    ...responses,
                    simulation_2_experience: {
                      ...responses.simulation_2_experience,
                      dealt_with: value === 'yes',
                    }
                  })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="sim2-yes" />
                    <Label htmlFor="sim2-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="sim2-no" />
                    <Label htmlFor="sim2-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {responses.simulation_2_experience.dealt_with && (
                <div className="space-y-3">
                  <Label>What was the outcome?</Label>
                  <Input
                    value={responses.simulation_2_experience.outcome}
                    onChange={(e) => setResponses({
                      ...responses,
                      simulation_2_experience: {
                        ...responses.simulation_2_experience,
                        outcome: e.target.value,
                      }
                    })}
                    placeholder="Example: Needed external consultants"
                    maxLength={100}
                  />
                </div>
              )}

              <div className="space-y-3">
                <Label>What would success look like?</Label>
                <Input
                  value={responses.simulation_2_experience.success_criteria}
                  onChange={(e) => setResponses({
                    ...responses,
                    simulation_2_experience: {
                      ...responses.simulation_2_experience,
                      success_criteria: e.target.value,
                    }
                  })}
                  placeholder="Example: Clear response within 72 hours"
                  maxLength={100}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              variant="outline"
              disabled={currentQuestion === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {currentQuestion < totalQuestions ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Responses'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};