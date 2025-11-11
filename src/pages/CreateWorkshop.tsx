import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';
import { Calendar, Clock, Trash2, ChevronDown, X } from 'lucide-react';
import { format, parse, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const CreateWorkshop: React.FC = () => {
  const navigate = useNavigate();
  const [intakes, setIntakes] = useState<any[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [preferredDates, setPreferredDates] = useState<Date[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workshopToDelete, setWorkshopToDelete] = useState<string | null>(null);
  const [intakeDeleteDialogOpen, setIntakeDeleteDialogOpen] = useState(false);
  const [intakeToDelete, setIntakeToDelete] = useState<string | null>(null);
  const [intakeDropdownOpen, setIntakeDropdownOpen] = useState(false);
  const [formData, setFormData] = useState({
    intake_id: '',
    facilitator_name: '',
    workshop_date: '',
  });

  useEffect(() => {
    loadIntakes();
    loadWorkshops();
  }, []);

  useEffect(() => {
    if (formData.intake_id) {
      loadPreferredDates(formData.intake_id);
    }
  }, [formData.intake_id]);

  const loadIntakes = async () => {
    const { data } = await supabase
      .from('exec_intakes')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setIntakes(data);
  };

  const loadWorkshops = async () => {
    const { data } = await supabase
      .from('workshop_sessions')
      .select('*, exec_intakes(company_name, organizer_name)')
      .order('workshop_date', { ascending: false });

    if (data) setWorkshops(data);
  };

  const loadPreferredDates = async (intakeId: string) => {
    const { data } = await supabase
      .from('exec_intakes')
      .select('preferred_dates')
      .eq('id', intakeId)
      .single();

    if (data?.preferred_dates) {
      const dates = (data.preferred_dates as string[]).map(dateStr => new Date(dateStr));
      setPreferredDates(dates);
    } else {
      setPreferredDates([]);
    }
  };

  const handleCreate = async () => {
    if (!formData.intake_id || !formData.facilitator_name || !selectedDate) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(':');
    const workshopDateTime = new Date(selectedDate);
    workshopDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Get facilitator email - for now use facilitator_name as placeholder
    const facilitatorEmail = `${formData.facilitator_name.toLowerCase().replace(/\s+/g, '.')}@mindmaker.com`;

    // First, get the bootcamp_plan_id for this intake
    const { data: bootcampPlan } = await supabase
      .from('bootcamp_plans')
      .select('id')
      .eq('intake_id', formData.intake_id)
      .single();

    const { data, error } = await supabase
      .from('workshop_sessions')
      .insert({
        intake_id: formData.intake_id,
        facilitator_name: formData.facilitator_name,
        facilitator_email: facilitatorEmail,
        bootcamp_plan_id: bootcampPlan?.id || null,
        workshop_date: workshopDateTime.toISOString(),
        status: 'scheduled',
        current_segment: 1,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating workshop', variant: 'destructive' });
      return;
    }

    toast({ title: 'Workshop created successfully!' });
    await loadWorkshops();
    navigate(`/facilitator/${data.id}`);
  };

  const handleDeleteClick = (workshopId: string) => {
    setWorkshopToDelete(workshopId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workshopToDelete) return;

    const { error } = await supabase
      .from('workshop_sessions')
      .delete()
      .eq('id', workshopToDelete);

    if (error) {
      toast({ title: 'Error deleting workshop', variant: 'destructive' });
      return;
    }

    toast({ title: 'Workshop deleted successfully' });
    setDeleteDialogOpen(false);
    setWorkshopToDelete(null);
    await loadWorkshops();
  };

  const handleIntakeDeleteClick = (e: React.MouseEvent, intakeId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setIntakeToDelete(intakeId);
    setIntakeDeleteDialogOpen(true);
    setIntakeDropdownOpen(false); // Close dropdown immediately
  };

  const handleIntakeDeleteConfirm = async () => {
    if (!intakeToDelete) return;

    const { error } = await supabase
      .from('exec_intakes')
      .delete()
      .eq('id', intakeToDelete);

    if (error) {
      toast({ title: 'Error deleting intake', variant: 'destructive' });
      return;
    }

    toast({ title: 'Executive intake deleted successfully' });
    setIntakeDeleteDialogOpen(false);
    setIntakeToDelete(null);
    
    // Clear selection if deleted intake was selected
    if (formData.intake_id === intakeToDelete) {
      setFormData({ ...formData, intake_id: '' });
    }
    
    await loadIntakes();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Saved Workshop Sessions */}
        {workshops.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Saved Workshop Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {workshops.map((workshop) => (
                  <div
                    key={workshop.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">
                        {workshop.exec_intakes?.company_name || 'Unknown Company'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(workshop.workshop_date), 'PPP p')} • {workshop.facilitator_name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/facilitator/${workshop.id}`)}
                      >
                        Open
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(workshop.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create New Workshop */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Create New Workshop Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Select Executive Intake</Label>
              <Popover open={intakeDropdownOpen} onOpenChange={setIntakeDropdownOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={intakeDropdownOpen}
                    className="w-full justify-between"
                  >
                    {formData.intake_id
                      ? intakes.find((intake) => intake.id === formData.intake_id)
                          ? `${intakes.find((intake) => intake.id === formData.intake_id)?.company_name} - ${intakes.find((intake) => intake.id === formData.intake_id)?.organizer_name}`
                          : "Choose an intake..."
                      : "Choose an intake..."}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[600px] p-0 bg-popover border border-border z-[100]" align="start">
                  <Command className="bg-popover">
                    <CommandGroup>
                      {intakes.map((intake) => (
                        <CommandItem
                          key={intake.id}
                          value={intake.id}
                          onSelect={(currentValue) => {
                            // Only select if not clicking delete button
                            if (currentValue === intake.id) {
                              setFormData({ ...formData, intake_id: intake.id });
                              setIntakeDropdownOpen(false);
                            }
                          }}
                          className="flex items-center justify-between cursor-pointer hover:bg-accent"
                        >
                          <span 
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              setFormData({ ...formData, intake_id: intake.id });
                              setIntakeDropdownOpen(false);
                            }}
                          >
                            {intake.company_name} - {intake.organizer_name}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            type="button"
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive z-10 relative"
                            onClick={(e) => handleIntakeDeleteClick(e, intake.id)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>Facilitator Name</Label>
              <Input
                value={formData.facilitator_name}
                onChange={(e) => setFormData({ ...formData, facilitator_name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label>Workshop Date & Time</Label>
                {preferredDates.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Customer preferred dates are highlighted in green
                  </p>
                )}
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="p-3 pointer-events-auto"
                    modifiers={{
                      preferred: preferredDates,
                    }}
                    modifiersStyles={{
                      preferred: {
                        backgroundColor: 'hsl(var(--primary) / 0.15)',
                        color: 'hsl(var(--primary))',
                        fontWeight: 'bold',
                        border: '2px solid hsl(var(--primary))',
                      },
                    }}
                  />
                </PopoverContent>
              </Popover>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleCreate} className="w-full" size="lg">
              Create Workshop Session
            </Button>
          </CardContent>
        </Card>

        {/* Delete Workshop Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this workshop session and all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Delete Intake Confirmation Dialog */}
        <AlertDialog open={intakeDeleteDialogOpen} onOpenChange={setIntakeDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Executive Intake?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this executive intake. Any workshops associated with this intake may be affected. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleIntakeDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
