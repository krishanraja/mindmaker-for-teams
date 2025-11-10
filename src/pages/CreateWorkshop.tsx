import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Calendar } from 'lucide-react';

export const CreateWorkshop: React.FC = () => {
  const navigate = useNavigate();
  const [intakes, setIntakes] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    intake_id: '',
    facilitator_name: '',
    workshop_date: '',
  });

  useEffect(() => {
    loadIntakes();
  }, []);

  const loadIntakes = async () => {
    const { data } = await supabase
      .from('exec_intakes')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setIntakes(data);
  };

  const handleCreate = async () => {
    if (!formData.intake_id || !formData.facilitator_name || !formData.workshop_date) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

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
        workshop_date: formData.workshop_date,
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
    navigate(`/facilitator/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
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
              <Select
                value={formData.intake_id}
                onValueChange={(value) => setFormData({ ...formData, intake_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose an intake..." />
                </SelectTrigger>
                <SelectContent>
                  {intakes.map((intake) => (
                    <SelectItem key={intake.id} value={intake.id}>
                      {intake.company_name} - {intake.organizer_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Facilitator Name</Label>
              <Input
                value={formData.facilitator_name}
                onChange={(e) => setFormData({ ...formData, facilitator_name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div>
              <Label>Workshop Date & Time</Label>
              <Input
                type="datetime-local"
                value={formData.workshop_date}
                onChange={(e) => setFormData({ ...formData, workshop_date: e.target.value })}
              />
            </div>

            <Button onClick={handleCreate} className="w-full" size="lg">
              Create Workshop Session
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
