import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Target, Check, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAutosave } from '@/hooks/useAutosave';

interface Segment6PilotCharterProps {
  workshopId: string;
  bootcampPlanData?: any;
}

export const Segment6PilotCharter: React.FC<Segment6PilotCharterProps> = ({ workshopId, bootcampPlanData }) => {
  const [charter, setCharter] = useState({
    pilot_owner: '',
    pilot_budget: '',
    executive_sponsor: '',
    milestone_d10: '',
    milestone_d30: '',
    milestone_d60: '',
    milestone_d90: '',
    kill_criteria: '',
    extend_criteria: '',
    scale_criteria: '',
    meeting_cadence: 'Weekly',
  });

  useEffect(() => {
    loadCharter();
  }, [workshopId]);

  // Pre-populate with customer pilot expectations if available
  useEffect(() => {
    if (bootcampPlanData?.pilot_expectations && charter.pilot_owner === '') {
      const expectations = bootcampPlanData.pilot_expectations;
      setCharter(prev => ({
        ...prev,
        pilot_owner: expectations.owner || '',
        executive_sponsor: expectations.sponsor || '',
        pilot_budget: expectations.budget_min ? `${expectations.budget_min}-${expectations.budget_max}` : '',
      }));
    }
  }, [bootcampPlanData]);

  const loadCharter = async () => {
    const { data } = await supabase
      .from('pilot_charter')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .single();

    if (data) {
      setCharter({
        pilot_owner: data.pilot_owner || '',
        pilot_budget: data.pilot_budget?.toString() || '',
        executive_sponsor: data.executive_sponsor || '',
        milestone_d10: data.milestone_d10 || '',
        milestone_d30: data.milestone_d30 || '',
        milestone_d60: data.milestone_d60 || '',
        milestone_d90: data.milestone_d90 || '',
        kill_criteria: data.kill_criteria || '',
        extend_criteria: data.extend_criteria || '',
        scale_criteria: data.scale_criteria || '',
        meeting_cadence: data.meeting_cadence || 'Weekly',
      });
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('pilot_charter')
      .upsert({
        workshop_session_id: workshopId,
        ...charter,
        pilot_budget: charter.pilot_budget ? parseFloat(charter.pilot_budget) : null,
      });

    if (error) {
      toast({ title: 'Error saving pilot charter', variant: 'destructive' });
      return;
    }

    toast({ title: 'Pilot charter saved successfully!' });
  };

  // Autosave callback - ALWAYS save, even if empty (deletion is valid)
  const saveCharter = useCallback(async () => {
    const { error } = await supabase
      .from('pilot_charter')
      .upsert({
        workshop_session_id: workshopId,
        ...charter,
        pilot_budget: charter.pilot_budget ? parseFloat(charter.pilot_budget) : null,
      });

    if (error) {
      console.error('[PilotCharter] Autosave error:', error);
      throw error;
    }
  }, [workshopId, charter]);

  // Enable autosave with 1 second debounce
  const { isSaving, lastSaved } = useAutosave({
    data: charter,
    saveFunction: saveCharter,
    debounceMs: 1000,
    enabled: true,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-primary" />
              Segment 6: The Huddle - 90-Day Pilot Charter (30 minutes)
            </CardTitle>
            <div className="flex items-center gap-2">
              {isSaving ? (
                <Badge variant="secondary" className="gap-1">
                  <Clock className="h-3 w-3 animate-pulse" />
                  Saving...
                </Badge>
              ) : lastSaved ? (
                <Badge variant="outline" className="gap-1">
                  <Check className="h-3 w-3" />
                  Saved
                </Badge>
              ) : null}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            <strong>Objective:</strong> Lock in commitment, ownership, and decision gates for the 90-day pilot.
          </p>

          {bootcampPlanData?.pilot_expectations && (
            <Card className="bg-primary/10 border-2 border-primary/30">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">From Customer Intake</span>
                  Pilot Expectations
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {bootcampPlanData.pilot_expectations.description && (
                    <div className="col-span-2">
                      <div className="font-medium">Pilot Description:</div>
                      <div className="text-muted-foreground">{bootcampPlanData.pilot_expectations.description}</div>
                    </div>
                  )}
                  {bootcampPlanData.pilot_expectations.owner && (
                    <div>
                      <div className="font-medium">Expected Owner:</div>
                      <div className="text-muted-foreground">{bootcampPlanData.pilot_expectations.owner}</div>
                    </div>
                  )}
                  {bootcampPlanData.pilot_expectations.budget_min && (
                    <div>
                      <div className="font-medium">Budget Range:</div>
                      <div className="text-muted-foreground">
                        ${bootcampPlanData.pilot_expectations.budget_min}k - ${bootcampPlanData.pilot_expectations.budget_max}k
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label>Pilot Owner</Label>
              <Input
                value={charter.pilot_owner}
                onChange={(e) => setCharter({ ...charter, pilot_owner: e.target.value })}
                placeholder="Name and role"
              />
            </div>
            <div>
              <Label>Executive Sponsor</Label>
              <Input
                value={charter.executive_sponsor}
                onChange={(e) => setCharter({ ...charter, executive_sponsor: e.target.value })}
                placeholder="C-level sponsor"
              />
            </div>
            <div>
              <Label>Pilot Budget (USD)</Label>
              <Input
                type="number"
                value={charter.pilot_budget}
                onChange={(e) => setCharter({ ...charter, pilot_budget: e.target.value })}
                placeholder="50000"
              />
            </div>
            <div>
              <Label>Meeting Cadence</Label>
              <Input
                value={charter.meeting_cadence}
                onChange={(e) => setCharter({ ...charter, meeting_cadence: e.target.value })}
                placeholder="Weekly, Bi-weekly"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Milestone Gating (D10/D30/D60/D90)</h3>
            
            <div>
              <Label>Day 10 Milestone</Label>
              <Textarea
                rows={2}
                value={charter.milestone_d10}
                onChange={(e) => setCharter({ ...charter, milestone_d10: e.target.value })}
                placeholder="Team onboarded, data access secured..."
              />
            </div>

            <div>
              <Label>Day 30 Milestone</Label>
              <Textarea
                rows={2}
                value={charter.milestone_d30}
                onChange={(e) => setCharter({ ...charter, milestone_d30: e.target.value })}
                placeholder="First prototype tested..."
              />
            </div>

            <div>
              <Label>Day 60 Milestone</Label>
              <Textarea
                rows={2}
                value={charter.milestone_d60}
                onChange={(e) => setCharter({ ...charter, milestone_d60: e.target.value })}
                placeholder="User feedback incorporated, KPIs tracked..."
              />
            </div>

            <div>
              <Label>Day 90 Milestone</Label>
              <Textarea
                rows={2}
                value={charter.milestone_d90}
                onChange={(e) => setCharter({ ...charter, milestone_d90: e.target.value })}
                placeholder="Final decision: Kill, Extend, or Scale..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Decision Gates</h3>
            
            <div>
              <Label>Kill Criteria (Stop the pilot)</Label>
              <Textarea
                rows={2}
                value={charter.kill_criteria}
                onChange={(e) => setCharter({ ...charter, kill_criteria: e.target.value })}
                placeholder="No measurable improvement, budget overrun by 50%..."
              />
            </div>

            <div>
              <Label>Extend Criteria (Continue testing)</Label>
              <Textarea
                rows={2}
                value={charter.extend_criteria}
                onChange={(e) => setCharter({ ...charter, extend_criteria: e.target.value })}
                placeholder="Promising results but need more data..."
              />
            </div>

            <div>
              <Label>Scale Criteria (Roll out enterprise-wide)</Label>
              <Textarea
                rows={2}
                value={charter.scale_criteria}
                onChange={(e) => setCharter({ ...charter, scale_criteria: e.target.value })}
                placeholder="ROI proven, user adoption >70%, compliance cleared..."
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg" variant="outline">
            Manual Save Override
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
