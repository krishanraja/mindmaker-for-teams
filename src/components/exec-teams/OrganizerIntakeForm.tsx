import React, { useState, useEffect } from 'react';
import { useExecTeams } from '@/contexts/ExecTeamsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, Trash2, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BOTTLENECK_OPTIONS = [
  'Competing priorities',
  'Leadership alignment',
  'Resource constraints',
  'Change fatigue',
  'Technical debt',
  'Market uncertainty',
];

const ROLE_OPTIONS = ['CEO', 'CTO', 'COO', 'CMO', 'CFO', 'VP', 'Director', 'Other'];

const INDUSTRY_OPTIONS = ['Media', 'Telco', 'Finance', 'Healthcare', 'Retail & CPG', 'Education', 'Consulting', 'Other'];

const AUTHORIZED_ORGANIZERS = [
  { email: 'krish@fractionl.ai', name: 'Krish Munot' },
  { email: 'demo@fractionl.ai', name: 'Demo User' },
];

export const OrganizerIntakeForm: React.FC = () => {
  const { state, updateIntakeData, setCurrentStep, setIntakeId } = useExecTeams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Auto-populate first participant with organizer details when moving to step 2
  useEffect(() => {
    if (step === 2 && state.intakeData.participants.length === 0) {
      if (state.intakeData.organizerName && state.intakeData.organizerEmail) {
        updateIntakeData({
          participants: [{
            name: state.intakeData.organizerName,
            email: state.intakeData.organizerEmail,
            role: '',
          }],
        });
      }
    }
  }, [step]);

  const handleAddParticipant = () => {
    const newParticipant = { name: '', email: '', role: '' };
    updateIntakeData({
      participants: [...state.intakeData.participants, newParticipant],
    });
  };

  const handleRemoveParticipant = (index: number) => {
    const updated = state.intakeData.participants.filter((_, i) => i !== index);
    updateIntakeData({ participants: updated });
  };

  const handleParticipantChange = (index: number, field: string, value: string) => {
    const updated = [...state.intakeData.participants];
    updated[index] = { ...updated[index], [field]: value };
    updateIntakeData({ participants: updated });
  };

  const handleBottleneckToggle = (bottleneck: string) => {
    const current = state.intakeData.anticipatedBottlenecks;
    const updated = current.includes(bottleneck)
      ? current.filter(b => b !== bottleneck)
      : [...current, bottleneck];
    updateIntakeData({ anticipatedBottlenecks: updated });
  };

  const handleDateAdd = () => {
    updateIntakeData({
      preferredDates: [...state.intakeData.preferredDates, ''],
    });
  };

  const handleDateChange = (index: number, value: string) => {
    const updated = [...state.intakeData.preferredDates];
    updated[index] = value;
    updateIntakeData({ preferredDates: updated });
  };

  const handleDateRemove = (index: number) => {
    const updated = state.intakeData.preferredDates.filter((_, i) => i !== index);
    updateIntakeData({ preferredDates: updated });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!state.intakeData.companyName || !state.intakeData.organizerName || !state.intakeData.organizerEmail) {
        toast.error('Please fill in all required fields');
        return false;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(state.intakeData.organizerEmail)) {
        toast.error('Please enter a valid email address');
        return false;
      }
    } else if (step === 2) {
      // Allow skipping participants - they can use QR code registration
      if (state.intakeData.participants.length > 0) {
        const invalidParticipants = state.intakeData.participants.filter(
          p => !p.name || !p.email || !p.role
        );
        if (invalidParticipants.length > 0) {
          toast.error('Please complete all participant information or remove incomplete entries');
          return false;
        }
      }
      // Validate participant email formats
      const invalidEmails = state.intakeData.participants.filter(
        p => p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)
      );
      if (invalidEmails.length > 0) {
        toast.error('Please enter valid email addresses for all participants');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const { data: intake, error } = await supabase
        .from('exec_intakes')
        .insert([{
          company_name: state.intakeData.companyName,
          industry: state.intakeData.industry,
          strategic_objectives_2026: state.intakeData.strategicObjectives,
          anticipated_bottlenecks: state.intakeData.anticipatedBottlenecks as any,
          participants: state.intakeData.participants as any,
          preferred_dates: state.intakeData.preferredDates as any,
          scheduling_notes: state.intakeData.schedulingNotes,
          organizer_name: state.intakeData.organizerName,
          organizer_email: state.intakeData.organizerEmail,
        }])
        .select()
        .single();

      if (error) throw error;

      setIntakeId(intake.id);

      toast.success('Intake submitted successfully!');
      setCurrentStep(3);
    } catch (error: any) {
      console.error('Error submitting intake:', error);
      toast.error(error.message || 'Failed to submit intake');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <Card className="w-full max-w-3xl border-2">
        <CardHeader>
          <CardTitle className="text-3xl">Pre-Session Intake</CardTitle>
          <CardDescription className="text-lg">
            Step {step} of 3 • Configure your executive bootcamp session
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="organizerName">Your Name *</Label>
                <Input
                  id="organizerName"
                  value={state.intakeData.organizerName}
                  onChange={(e) => updateIntakeData({ organizerName: e.target.value })}
                  placeholder="Jane Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizerEmail">Your Email *</Label>
                <Input
                  id="organizerEmail"
                  type="email"
                  value={state.intakeData.organizerEmail}
                  onChange={(e) => updateIntakeData({ organizerEmail: e.target.value })}
                  placeholder="your.email@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={state.intakeData.companyName}
                  onChange={(e) => updateIntakeData({ companyName: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="industry">Industry</Label>
                <ToggleGroup
                  type="single"
                  value={state.intakeData.industry}
                  onValueChange={(value) => value && updateIntakeData({ industry: value })}
                  className="grid grid-cols-2 gap-2"
                >
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <ToggleGroupItem
                      key={industry}
                      value={industry}
                      className="text-sm py-3 border border-primary/30 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary"
                    >
                      {industry}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">2026 Strategic Objectives</Label>
                <Textarea
                  id="objectives"
                  value={state.intakeData.strategicObjectives}
                  onChange={(e) => updateIntakeData({ strategicObjectives: e.target.value })}
                  placeholder="What are your top 2-3 strategic priorities for 2026?"
                  maxLength={200}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {state.intakeData.strategicObjectives.length}/200 characters
                </p>
              </div>

              <div className="space-y-3">
                <Label>Anticipated Bottlenecks (select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {BOTTLENECK_OPTIONS.map((bottleneck) => (
                    <div key={bottleneck} className="flex items-center space-x-2">
                      <Checkbox
                        id={bottleneck}
                        checked={state.intakeData.anticipatedBottlenecks.includes(bottleneck)}
                        onCheckedChange={() => handleBottleneckToggle(bottleneck)}
                      />
                      <label
                        htmlFor={bottleneck}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {bottleneck}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <Label className="text-lg">Executive Participants</Label>

              <Alert className="border-primary/30 bg-primary/5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Tip: Team Self-Registration Available</AlertTitle>
                <AlertDescription>
                  You can add a few key participants now, or skip this and use the QR code self-registration feature in the next step. Team members can register themselves with their own information!
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                {state.intakeData.participants.map((participant, index) => (
                  <Card key={index} className="p-4 relative">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name *</Label>
                          <Input
                            value={participant.name}
                            onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={participant.email}
                            onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                            placeholder="john@company.com"
                          />
                        </div>
                      </div>
                      <div className="flex items-end gap-4">
                        <div className="flex-1 space-y-2">
                          <Label>Role *</Label>
                          <Select
                            value={participant.role}
                            onValueChange={(value) => handleParticipantChange(index, 'role', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROLE_OPTIONS.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => handleRemoveParticipant(index)}
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {state.intakeData.participants.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No participants added yet. Click "Add Participant" to begin.
                </p>
              )}

              <Button onClick={handleAddParticipant} variant="outline" size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Participant
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">Preferred Session Dates</Label>
                  <Button onClick={handleDateAdd} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Date
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Provide 3 preferred dates for the half-day session
                </p>

                <div className="space-y-3">
                  {state.intakeData.preferredDates.map((date, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => handleDateChange(index, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleDateRemove(index)}
                        variant="ghost"
                        size="icon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="schedulingNotes">Scheduling Constraints (optional)</Label>
                <Textarea
                  id="schedulingNotes"
                  value={state.intakeData.schedulingNotes}
                  onChange={(e) => updateIntakeData({ schedulingNotes: e.target.value })}
                  placeholder="Any specific timing preferences or constraints..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {step < 3 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit & Send Pulses'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
