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
import { Calendar } from '@/components/ui/calendar';
import { Plus, Trash2, ArrowRight, ArrowLeft, AlertCircle, CalendarIcon, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const DEPARTMENT_OPTIONS = ['Revenue', 'Operations', 'Technology', 'Finance', 'Marketing', 'Product', 'Human Resources', 'Customer Success', 'Other'];

const INDUSTRY_OPTIONS = ['Media', 'Telco', 'Finance', 'Healthcare', 'Retail & CPG', 'Education', 'Consulting', 'Other'];

const AUTHORIZED_ORGANIZERS = [
  { email: 'krish@themindmaker.ai', name: 'Krish Munot' },
  { email: 'demo@themindmaker.ai', name: 'Demo User' },
];

export const OrganizerIntakeForm: React.FC = () => {
  const { state, updateIntakeData, setCurrentStep, setIntakeId } = useExecTeams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Auto-populate first participant with organizer details when moving to step 3
  useEffect(() => {
    if (step === 3 && state.intakeData.participants.length === 0) {
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

  // Convert string dates to Date objects when moving to step 2
  useEffect(() => {
    if (step === 2 && state.intakeData.preferredDates.length > 0) {
      const dates = state.intakeData.preferredDates
        .filter(d => d)
        .map(d => new Date(d));
      setSelectedDates(dates);
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

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    const dateStr = format(date, 'yyyy-MM-dd');
    const isAlreadySelected = selectedDates.some(d => format(d, 'yyyy-MM-dd') === dateStr);
    
    let newDates: Date[];
    if (isAlreadySelected) {
      newDates = selectedDates.filter(d => format(d, 'yyyy-MM-dd') !== dateStr);
    } else {
      newDates = [...selectedDates, date];
    }
    
    setSelectedDates(newDates);
    updateIntakeData({
      preferredDates: newDates.map(d => format(d, 'yyyy-MM-dd'))
    });
  };

  const handleRemoveDate = (dateToRemove: Date) => {
    const newDates = selectedDates.filter(d => 
      format(d, 'yyyy-MM-dd') !== format(dateToRemove, 'yyyy-MM-dd')
    );
    setSelectedDates(newDates);
    updateIntakeData({
      preferredDates: newDates.map(d => format(d, 'yyyy-MM-dd'))
    });
  };

  const validateStep = () => {
    if (step === 1) {
      if (!state.intakeData.companyName || !state.intakeData.organizerName || !state.intakeData.organizerEmail) {
        toast({ title: 'Please fill in all required fields', variant: 'destructive' });
        return false;
      }
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(state.intakeData.organizerEmail)) {
        toast({ title: 'Please enter a valid email address', variant: 'destructive' });
        return false;
      }
    } else if (step === 3) {
      // Allow skipping participants - they can use QR code registration
      if (state.intakeData.participants.length > 0) {
        const invalidParticipants = state.intakeData.participants.filter(
          p => !p.name || !p.email || !p.role
        );
        if (invalidParticipants.length > 0) {
          toast({ title: 'Please complete all participant information or remove incomplete entries', variant: 'destructive' });
          return false;
        }
      }
      // Validate participant email formats
      const invalidEmails = state.intakeData.participants.filter(
        p => p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)
      );
      if (invalidEmails.length > 0) {
        toast({ title: 'Please enter valid email addresses for all participants', variant: 'destructive' });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) {
      // If moving from step 2 to 3, submit the intake first
      if (step === 2) {
        handleSubmit();
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleSubmit = async () => {
    // This is called when moving from step 2 to step 3
    setLoading(true);
    try {
      const { data: intake, error } = await supabase
        .from('exec_intakes')
        .insert([{
          company_name: state.intakeData.companyName,
          industry: state.intakeData.industry,
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
      setStep(3); // Move to participants step
      toast({ title: 'Basic information saved!' });
    } catch (error: any) {
      console.error('Error submitting intake:', error);
      toast({ title: error.message || 'Failed to save information', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    toast({ title: 'Intake completed successfully!' });
    setCurrentStep(3);
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

            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg">Preferred Session Dates</Label>
                <p className="text-sm text-muted-foreground">
                  Select up to 3 preferred dates for the half-day session
                </p>

                {selectedDates.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date) => (
                      <div
                        key={format(date, 'yyyy-MM-dd')}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm"
                      >
                        <CalendarIcon className="w-3 h-3" />
                        {format(date, 'MMM dd, yyyy')}
                        <button
                          onClick={() => handleRemoveDate(date)}
                          className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Card className="p-4 w-fit mx-auto">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => {
                      if (dates && dates.length <= 3) {
                        setSelectedDates(dates as Date[]);
                        updateIntakeData({
                          preferredDates: (dates as Date[]).map(d => format(d, 'yyyy-MM-dd'))
                        });
                      } else if (dates && dates.length > 3) {
                        toast({ title: 'You can select up to 3 dates', variant: 'destructive' });
                      }
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className={cn("pointer-events-auto")}
                  />
                </Card>
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

          {step === 3 && (
            <div className="space-y-6">
              <Label className="text-lg">Executive Participants</Label>

              <Alert className="border-primary/30 bg-primary/5">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Tip: Team Self-Registration Available</AlertTitle>
                <AlertDescription>
                  You can add a few key participants now, or use the QR code below to allow team members to self-register with their own information!
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
                          <Label>Department *</Label>
                          <Select
                            value={participant.role}
                            onValueChange={(value) => handleParticipantChange(index, 'role', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent className="bg-background z-50">
                              {DEPARTMENT_OPTIONS.map((dept) => (
                                <SelectItem key={dept} value={dept}>
                                  {dept}
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
              <Button onClick={handleNext} disabled={loading}>
                {loading ? 'Saving...' : 'Next'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Complete Setup
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
