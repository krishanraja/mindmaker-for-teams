import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAutosave } from '@/hooks/useAutosave';
import { Target, AlertCircle, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface Segment6PilotCharterProps {
  workshopId: string;
  bootcampPlanData?: any;
}

export const Segment6PilotCharter: React.FC<Segment6PilotCharterProps> = ({
  workshopId,
  bootcampPlanData
}) => {
  const [charter, setCharter] = useState({
    pilot_owner: '',
    executive_sponsor: '',
    pilot_budget: '',
    meeting_cadence: '',
    milestone_d10: '',
    milestone_d30: '',
    milestone_d60: '',
    milestone_d90: '',
    kill_criteria: '',
    extend_criteria: '',
    scale_criteria: '',
  });

  // Battle Test #3: Commitment Signal Tracking
  const [ownerClarity, setOwnerClarity] = useState<'clear' | 'vague' | 'contested'>('vague');
  const [budgetAgreement, setBudgetAgreement] = useState<'aligned' | 'debated' | 'unclear'>('unclear');
  const [killCriteriaQuality, setKillCriteriaQuality] = useState<'specific' | 'generic' | 'missing'>('missing');
  const [observations, setObservations] = useState<string>('');

  useEffect(() => {
    loadCharter();
  }, [workshopId]);

  const loadCharter = async () => {
    try {
      const { data, error } = await supabase
        .from('pilot_charter')
        .select('*')
        .eq('workshop_session_id', workshopId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setCharter({
          pilot_owner: data.pilot_owner || '',
          executive_sponsor: data.executive_sponsor || '',
          pilot_budget: String(data.pilot_budget || ''),
          meeting_cadence: data.meeting_cadence || '',
          milestone_d10: data.milestone_d10 || '',
          milestone_d30: data.milestone_d30 || '',
          milestone_d60: data.milestone_d60 || '',
          milestone_d90: data.milestone_d90 || '',
          kill_criteria: data.kill_criteria || '',
          extend_criteria: data.extend_criteria || '',
          scale_criteria: data.scale_criteria || '',
        });
        
        if (data.owner_clarity_level) setOwnerClarity(data.owner_clarity_level as any);
        if (data.budget_agreement_level) setBudgetAgreement(data.budget_agreement_level as any);
        if (data.kill_criteria_specificity) setKillCriteriaQuality(data.kill_criteria_specificity as any);
      } else if (bootcampPlanData?.pilot_expectations) {
        setCharter({
          ...charter,
          pilot_owner: bootcampPlanData.pilot_expectations.pilot_owner || '',
          executive_sponsor: bootcampPlanData.pilot_expectations.executive_sponsor || '',
          pilot_budget: bootcampPlanData.pilot_expectations.pilot_budget || '',
          meeting_cadence: bootcampPlanData.pilot_expectations.meeting_cadence || '',
        });
      }
    } catch (error) {
      console.error('Error loading charter:', error);
    }
  };

  const saveCharter = async (currentCharter: typeof charter) => {
    try {
      const commitmentSignals = {
        named_owner: !!currentCharter.pilot_owner,
        named_sponsor: !!currentCharter.executive_sponsor,
        specific_budget: !!currentCharter.pilot_budget && currentCharter.pilot_budget !== 'TBD',
        wrote_kill_criteria: !!currentCharter.kill_criteria && currentCharter.kill_criteria.length > 20,
      };

      const { error } = await supabase
        .from('pilot_charter')
        .upsert({
          workshop_session_id: workshopId,
          ...currentCharter,
          owner_clarity_level: ownerClarity,
          budget_agreement_level: budgetAgreement,
          kill_criteria_specificity: killCriteriaQuality,
          commitment_signals: commitmentSignals,
        } as any, {
          onConflict: 'workshop_session_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('[PilotCharter] Save error:', error);
      throw error;
    }
  };

  useAutosave({
    data: charter,
    saveFunction: saveCharter,
    debounceMs: 1500,
  });

  const handleSave = async () => {
    try {
      await saveCharter(charter);
      
      const commitmentSignals = {
        named_owner: !!charter.pilot_owner,
        named_sponsor: !!charter.executive_sponsor,
        specific_budget: !!charter.pilot_budget && charter.pilot_budget !== 'TBD',
        wrote_kill_criteria: !!charter.kill_criteria && charter.kill_criteria.length > 20,
      };

      // Write segment summary
      await supabase.functions.invoke('write-segment-summary', {
        body: {
          workshop_session_id: workshopId,
          segment_number: 6,
          segment_name: 'Battle Test #3: Commitment',
          summary_data: {
            owner_clarity: ownerClarity,
            budget_agreement: budgetAgreement,
            kill_criteria_quality: killCriteriaQuality,
            commitment_signals: commitmentSignals,
          }
        }
      });

      toast({ title: 'Battle test results saved!' });
    } catch (error) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
  };

  const getOwnerIcon = (level: string) => {
    switch (level) {
      case 'clear': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'vague': return <HelpCircle className="h-4 w-4 text-yellow-600" />;
      case 'contested': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            Battle Test #3: Can Your Team Agree on Who Owns It and How to Kill It?
          </CardTitle>
          <CardDescription className="text-base">
            The final test: Can this team commit to a specific owner, budget, and decision criteria? Or do they punt, defer, or remain vague?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="bg-muted/50 border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Facilitator Note
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Your job: <strong>Observe commitment signals</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Can they name a specific owner? Or does everyone defer?</li>
                <li>Do they state a real budget number or say "we'll figure it out"?</li>
                <li>Can they write concrete kill criteria or stay generic?</li>
                <li>Track the quality of their answers—clarity = commitment</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Ownership Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ownership & Sponsorship</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Who will own this day-to-day?</Label>
            <Input
              value={charter.pilot_owner}
              onChange={(e) => setCharter({ ...charter, pilot_owner: e.target.value })}
              placeholder="Name and role (e.g., Sarah Chen, Head of Operations)"
            />
          </div>

          <div className="space-y-2">
            <Label>Who will be the executive sponsor?</Label>
            <Input
              value={charter.executive_sponsor}
              onChange={(e) => setCharter({ ...charter, executive_sponsor: e.target.value })}
              placeholder="Name and role (e.g., John Smith, CFO)"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {getOwnerIcon(ownerClarity)}
              Owner clarity level
            </Label>
            <div className="flex gap-2">
              <Button
                variant={ownerClarity === 'clear' ? 'default' : 'outline'}
                onClick={() => setOwnerClarity('clear')}
                size="sm"
              >
                Clear (Named specific person)
              </Button>
              <Button
                variant={ownerClarity === 'vague' ? 'default' : 'outline'}
                onClick={() => setOwnerClarity('vague')}
                size="sm"
              >
                Vague ("We'll figure it out")
              </Button>
              <Button
                variant={ownerClarity === 'contested' ? 'default' : 'outline'}
                onClick={() => setOwnerClarity('contested')}
                size="sm"
              >
                Contested (Disagreement)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget & Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>What budget are we committing?</Label>
            <Input
              value={charter.pilot_budget}
              onChange={(e) => setCharter({ ...charter, pilot_budget: e.target.value })}
              placeholder="Specific amount (e.g., $50K for 3 months) or 'TBD'"
            />
          </div>

          <div className="space-y-2">
            <Label>Budget agreement level</Label>
            <div className="flex gap-2">
              <Button
                variant={budgetAgreement === 'aligned' ? 'default' : 'outline'}
                onClick={() => setBudgetAgreement('aligned')}
                size="sm"
              >
                Aligned (Specific number agreed)
              </Button>
              <Button
                variant={budgetAgreement === 'debated' ? 'default' : 'outline'}
                onClick={() => setBudgetAgreement('debated')}
                size="sm"
              >
                Debated (Needed discussion)
              </Button>
              <Button
                variant={budgetAgreement === 'unclear' ? 'default' : 'outline'}
                onClick={() => setBudgetAgreement('unclear')}
                size="sm"
              >
                Unclear (Punted decision)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Decision Criteria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Decision Gates</CardTitle>
          <CardDescription>When do we kill it? Extend it? Scale it?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Kill Criteria (When do we stop?)</Label>
            <Textarea
              value={charter.kill_criteria}
              onChange={(e) => setCharter({ ...charter, kill_criteria: e.target.value })}
              placeholder="Be specific: 'If accuracy drops below 90% after 30 days' or 'If adoption is under 20% by day 60'"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Kill criteria quality</Label>
            <div className="flex gap-2">
              <Button
                variant={killCriteriaQuality === 'specific' ? 'default' : 'outline'}
                onClick={() => setKillCriteriaQuality('specific')}
                size="sm"
              >
                Specific (Measurable thresholds)
              </Button>
              <Button
                variant={killCriteriaQuality === 'generic' ? 'default' : 'outline'}
                onClick={() => setKillCriteriaQuality('generic')}
                size="sm"
              >
                Generic ("If it doesn't work out")
              </Button>
              <Button
                variant={killCriteriaQuality === 'missing' ? 'default' : 'outline'}
                onClick={() => setKillCriteriaQuality('missing')}
                size="sm"
              >
                Missing (Couldn't define)
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Extend Criteria (When do we continue?)</Label>
            <Textarea
              value={charter.extend_criteria}
              onChange={(e) => setCharter({ ...charter, extend_criteria: e.target.value })}
              placeholder="e.g., If we see 50% time savings and positive user feedback after 60 days"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Scale Criteria (When do we go organization-wide?)</Label>
            <Textarea
              value={charter.scale_criteria}
              onChange={(e) => setCharter({ ...charter, scale_criteria: e.target.value })}
              placeholder="e.g., If 80% of pilot users actively use it and error rate is under 5%"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">90-Day Milestones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Day 10 Milestone</Label>
              <Input
                value={charter.milestone_d10}
                onChange={(e) => setCharter({ ...charter, milestone_d10: e.target.value })}
                placeholder="e.g., AI model selected and tested"
              />
            </div>
            <div className="space-y-2">
              <Label>Day 30 Milestone</Label>
              <Input
                value={charter.milestone_d30}
                onChange={(e) => setCharter({ ...charter, milestone_d30: e.target.value })}
                placeholder="e.g., 10 users trained and using daily"
              />
            </div>
            <div className="space-y-2">
              <Label>Day 60 Milestone</Label>
              <Input
                value={charter.milestone_d60}
                onChange={(e) => setCharter({ ...charter, milestone_d60: e.target.value })}
                placeholder="e.g., Full team adoption, metrics tracked"
              />
            </div>
            <div className="space-y-2">
              <Label>Day 90 Goal</Label>
              <Input
                value={charter.milestone_d90}
                onChange={(e) => setCharter({ ...charter, milestone_d90: e.target.value })}
                placeholder="e.g., Decision gate: kill, extend, or scale"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Facilitator Observations</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Note any hesitation, avoidance, or strong commitment signals you observed during this discussion"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Save Status */}
      <Card className="bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Auto-saves as you type
            </span>
            <Button onClick={handleSave}>
              Complete Battle Test #3
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
