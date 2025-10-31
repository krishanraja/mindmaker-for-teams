import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import logo from '@/assets/mindmaker-logo.png';

const QUESTIONS = {
  awareness: [
    {
      id: 'awareness_1',
      question: 'How confident are you in explaining AI\'s commercial value to your board?',
      type: 'scale',
      scale: 5,
    },
    {
      id: 'awareness_2',
      question: 'How often do you discuss AI strategy in executive meetings?',
      type: 'scale',
      scale: 5,
      labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    },
  ],
  application: [
    {
      id: 'application_1',
      question: 'How many AI pilots has your function run in the past 6 months?',
      type: 'select',
      options: ['0', '1-2', '3-5', '6+'],
    },
    {
      id: 'application_2',
      question: 'How would you rate your team\'s AI experimentation capability?',
      type: 'scale',
      scale: 5,
    },
  ],
  trust: [
    {
      id: 'trust_1',
      question: 'When would you delegate a strategic decision to an AI-augmented process?',
      type: 'select',
      options: ['Never', 'With heavy oversight', 'Selectively', 'Routinely'],
    },
    {
      id: 'trust_2',
      question: 'How comfortable are you with AI-generated insights for critical decisions?',
      type: 'scale',
      scale: 5,
    },
  ],
  governance: [
    {
      id: 'governance_1',
      question: 'Does your organization have AI usage guardrails documented?',
      type: 'select',
      options: ['No', 'In draft', 'Yes, informal', 'Yes, enforced'],
    },
    {
      id: 'governance_2',
      question: 'How prepared is your organization for AI compliance and ethics challenges?',
      type: 'scale',
      scale: 5,
    },
  ],
};

export const ExecutivePulse: React.FC = () => {
  const { intakeId, emailHash } = useParams();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [participantInfo, setParticipantInfo] = useState<any>(null);

  useEffect(() => {
    loadParticipantInfo();
  }, []);

  const loadParticipantInfo = async () => {
    if (!intakeId || !emailHash) return;

    try {
      const { data: intake, error } = await supabase
        .from('exec_intakes')
        .select('*')
        .eq('id', intakeId)
        .single();

      if (error) throw error;

      // In production, verify emailHash matches participant email
      setParticipantInfo(intake);
    } catch (error) {
      console.error('Error loading participant info:', error);
      toast.error('Invalid pulse link');
    }
  };

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const calculateScores = () => {
    const awarenessAnswers = Object.entries(responses)
      .filter(([key]) => key.startsWith('awareness_'))
      .map(([, value]) => parseInt(value) || 0);
    const awarenessScore = awarenessAnswers.length > 0
      ? awarenessAnswers.reduce((a, b) => a + b, 0) / awarenessAnswers.length
      : 0;

    const applicationAnswers = Object.entries(responses)
      .filter(([key]) => key.startsWith('application_'))
      .map(([, value]) => {
        if (typeof value === 'string') {
          if (value === '0') return 0;
          if (value === '1-2') return 1.5;
          if (value === '3-5') return 4;
          if (value === '6+') return 6;
        }
        return parseInt(value) || 0;
      });
    const applicationScore = applicationAnswers.length > 0
      ? applicationAnswers.reduce((a, b) => a + b, 0) / applicationAnswers.length
      : 0;

    const trustAnswers = Object.entries(responses)
      .filter(([key]) => key.startsWith('trust_'))
      .map(([, value]) => {
        if (typeof value === 'string') {
          const trustMap: Record<string, number> = {
            'Never': 1,
            'With heavy oversight': 2,
            'Selectively': 3,
            'Routinely': 4,
          };
          return trustMap[value] || parseInt(value) || 0;
        }
        return parseInt(value) || 0;
      });
    const trustScore = trustAnswers.length > 0
      ? trustAnswers.reduce((a, b) => a + b, 0) / trustAnswers.length
      : 0;

    const governanceAnswers = Object.entries(responses)
      .filter(([key]) => key.startsWith('governance_'))
      .map(([, value]) => {
        if (typeof value === 'string') {
          const govMap: Record<string, number> = {
            'No': 1,
            'In draft': 2,
            'Yes, informal': 3,
            'Yes, enforced': 4,
          };
          return govMap[value] || parseInt(value) || 0;
        }
        return parseInt(value) || 0;
      });
    const governanceScore = governanceAnswers.length > 0
      ? governanceAnswers.reduce((a, b) => a + b, 0) / governanceAnswers.length
      : 0;

    return { awarenessScore, applicationScore, trustScore, governanceScore };
  };

  const handleSubmit = async () => {
    const allQuestions = [
      ...QUESTIONS.awareness,
      ...QUESTIONS.application,
      ...QUESTIONS.trust,
      ...QUESTIONS.governance,
    ];

    const unanswered = allQuestions.filter(q => !responses[q.id]);
    if (unanswered.length > 0) {
      toast.error('Please answer all questions');
      return;
    }

    setLoading(true);
    try {
      const scores = calculateScores();

      const { error } = await supabase.from('exec_pulses').insert({
        intake_id: intakeId,
        participant_email: emailHash || 'unknown',
        participant_name: 'Participant',
        participant_role: 'Executive',
        awareness_score: Math.round(scores.awarenessScore),
        application_score: Math.round(scores.applicationScore),
        trust_score: Math.round(scores.trustScore),
        governance_score: Math.round(scores.governanceScore),
        pulse_responses: responses as any,
        completed_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success('Pulse submitted successfully!');
    } catch (error: any) {
      console.error('Error submitting pulse:', error);
      toast.error(error.message || 'Failed to submit pulse');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
        <Card className="w-full max-w-2xl text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">Thank You!</CardTitle>
            <CardDescription className="text-lg">
              Your insights have been captured and will help tailor the bootcamp session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We'll see you at the bootcamp. Check your email for the session details and pre-read materials.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-3xl mx-auto space-y-8 py-8">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src={logo} alt="MINDMAKER" className="h-12 w-auto" />
            </div>
            <CardTitle className="text-3xl">Executive AI Pulse</CardTitle>
            <CardDescription className="text-lg">
              {participantInfo?.company_name && `${participantInfo.company_name} - `}
              Leadership Bootcamp Preparation
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <p className="text-muted-foreground">
              This 5-minute pulse helps us understand your team's AI readiness across 4 dimensions. 
              Your responses will shape the bootcamp agenda and ensure we focus on what matters most to your leadership team.
            </p>

            {/* Awareness Questions */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b pb-2">Awareness</h3>
              {QUESTIONS.awareness.map((q, idx) => (
                <Card key={q.id} className="p-4">
                  <Label className="text-base mb-4 block">
                    {idx + 1}. {q.question}
                  </Label>
                  {q.type === 'scale' && (
                    <RadioGroup
                      value={responses[q.id]}
                      onValueChange={(value) => handleResponseChange(q.id, value)}
                    >
                      <div className="flex justify-between">
                        {Array.from({ length: q.scale }, (_, i) => i + 1).map((num) => (
                          <div key={num} className="flex flex-col items-center gap-2">
                            <RadioGroupItem value={String(num)} id={`${q.id}-${num}`} />
                            <Label htmlFor={`${q.id}-${num}`} className="text-sm">
                              {q.labels ? q.labels[num - 1] : num}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </Card>
              ))}
            </div>

            {/* Application Questions */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b pb-2">Application</h3>
              {QUESTIONS.application.map((q, idx) => (
                <Card key={q.id} className="p-4">
                  <Label className="text-base mb-4 block">
                    {idx + 1}. {q.question}
                  </Label>
                  {q.type === 'select' && (
                    <Select
                      value={responses[q.id]}
                      onValueChange={(value) => handleResponseChange(q.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {q.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {q.type === 'scale' && (
                    <RadioGroup
                      value={responses[q.id]}
                      onValueChange={(value) => handleResponseChange(q.id, value)}
                    >
                      <div className="flex justify-between">
                        {Array.from({ length: q.scale }, (_, i) => i + 1).map((num) => (
                          <div key={num} className="flex flex-col items-center gap-2">
                            <RadioGroupItem value={String(num)} id={`${q.id}-${num}`} />
                            <Label htmlFor={`${q.id}-${num}`} className="text-sm">{num}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </Card>
              ))}
            </div>

            {/* Trust Questions */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b pb-2">Trust</h3>
              {QUESTIONS.trust.map((q, idx) => (
                <Card key={q.id} className="p-4">
                  <Label className="text-base mb-4 block">
                    {idx + 1}. {q.question}
                  </Label>
                  {q.type === 'select' && (
                    <Select
                      value={responses[q.id]}
                      onValueChange={(value) => handleResponseChange(q.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {q.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {q.type === 'scale' && (
                    <RadioGroup
                      value={responses[q.id]}
                      onValueChange={(value) => handleResponseChange(q.id, value)}
                    >
                      <div className="flex justify-between">
                        {Array.from({ length: q.scale }, (_, i) => i + 1).map((num) => (
                          <div key={num} className="flex flex-col items-center gap-2">
                            <RadioGroupItem value={String(num)} id={`${q.id}-${num}`} />
                            <Label htmlFor={`${q.id}-${num}`} className="text-sm">{num}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </Card>
              ))}
            </div>

            {/* Governance Questions */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold border-b pb-2">Governance</h3>
              {QUESTIONS.governance.map((q, idx) => (
                <Card key={q.id} className="p-4">
                  <Label className="text-base mb-4 block">
                    {idx + 1}. {q.question}
                  </Label>
                  {q.type === 'select' && (
                    <Select
                      value={responses[q.id]}
                      onValueChange={(value) => handleResponseChange(q.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        {q.options?.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {q.type === 'scale' && (
                    <RadioGroup
                      value={responses[q.id]}
                      onValueChange={(value) => handleResponseChange(q.id, value)}
                    >
                      <div className="flex justify-between">
                        {Array.from({ length: q.scale }, (_, i) => i + 1).map((num) => (
                          <div key={num} className="flex flex-col items-center gap-2">
                            <RadioGroupItem value={String(num)} id={`${q.id}-${num}`} />
                            <Label htmlFor={`${q.id}-${num}`} className="text-sm">{num}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-6">
              <Button onClick={handleSubmit} disabled={loading} size="lg" className="min-w-[200px]">
                {loading ? 'Submitting...' : 'Submit Pulse'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
