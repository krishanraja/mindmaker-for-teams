import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useEnhancedAutosave } from '@/hooks/useEnhancedAutosave';
import { Scale, Clock, AlertCircle, MessageSquare } from 'lucide-react';

interface Segment5StrategyAddendumProps {
  workshopId: string;
  bootcampPlanData?: any;
}

export const Segment5StrategyAddendum: React.FC<Segment5StrategyAddendumProps> = ({
  workshopId,
  bootcampPlanData
}) => {
  const [addendum, setAddendum] = useState({
    targets_at_risk: '',
    data_governance_changes: '',
    pilot_kpis: '',
  });
  
  // Battle Test #2: Trade-off Alignment Tracking
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [governanceDisagreements, setGovernanceDisagreements] = useState<string>('');
  const [stickingPoints, setStickingPoints] = useState<string>('');
  const [convergenceTime, setConvergenceTime] = useState<number>(0);
  const [alignmentLevel, setAlignmentLevel] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    loadAddendum();
  }, [workshopId]);

  const loadAddendum = async () => {
    try {
      const { data, error } = await supabase
        .from('strategy_addendum')
        .select('*')
        .eq('workshop_session_id', workshopId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setAddendum({
          targets_at_risk: data.targets_at_risk || '',
          data_governance_changes: data.data_governance_changes || '',
          pilot_kpis: data.pilot_kpis || '',
        });
        
        if (data.governance_disagreements) {
          setGovernanceDisagreements(data.governance_disagreements.join('\n'));
        }
        if (data.sticking_points) {
          setStickingPoints(data.sticking_points.join('\n'));
        }
        if (data.convergence_time_minutes) {
          setConvergenceTime(data.convergence_time_minutes);
        }
        if (data.risk_alignment_level) {
          setAlignmentLevel(data.risk_alignment_level as any);
        }
      } else if (bootcampPlanData) {
        // Pre-populate from bootcamp data if available
        setAddendum({
          targets_at_risk: bootcampPlanData.strategic_goals_2026?.[0] || '',
          data_governance_changes: bootcampPlanData.data_governance_notes || '',
          pilot_kpis: bootcampPlanData.pilot_metrics_notes || '',
        });
      }
    } catch (error) {
      console.error('Error loading addendum:', error);
    }
  };

  const saveAddendum = async (currentAddendum: typeof addendum) => {
    try {
      const governanceDisagreementsList = governanceDisagreements.split('\n').filter(d => d.trim());
      const stickingPointsList = stickingPoints.split('\n').filter(s => s.trim());

      const { error } = await supabase
        .from('strategy_addendum')
        .upsert({
          workshop_session_id: workshopId,
          ...currentAddendum,
          governance_disagreements: governanceDisagreementsList,
          sticking_points: stickingPointsList,
          convergence_time_minutes: convergenceTime,
          risk_alignment_level: alignmentLevel,
        }, {
          onConflict: 'workshop_session_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('[StrategyAddendum] Save error:', error);
      throw error;
    }
  };

  const { forceSave } = useEnhancedAutosave({
    data: addendum,
    saveFunction: saveAddendum,
    debounceMs: 1500,
    enabled: true,
    componentName: 'Strategy Addendum',
  });

  const handleSave = async () => {
    try {
      await forceSave();
      
      // Write segment summary
      await supabase.functions.invoke('write-segment-summary', {
        body: {
          workshop_session_id: workshopId,
          segment_number: 5,
          segment_name: 'Battle Test #2: Trade-offs',
          summary_data: {
            risk_alignment_level: alignmentLevel,
            disagreement_count: governanceDisagreements.split('\n').filter(d => d.trim()).length,
            sticking_point_count: stickingPoints.split('\n').filter(s => s.trim()).length,
            convergence_time_minutes: convergenceTime
          }
        }
      });

      toast({ title: 'Battle test results saved!' });
    } catch (error) {
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
  };

  const getRiskLabel = (value: number) => {
    if (value < 34) return 'Conservative';
    if (value < 67) return 'Balanced';
    return 'Aggressive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Scale className="h-6 w-6 text-primary" />
            Battle Test #2: Can Your Team Agree on Strategic Trade-Offs?
          </CardTitle>
          <CardDescription className="text-base">
            Use the risk tolerance slider and strategy questions below to surface where your team aligns or diverges on AI adoption approach.
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
              <p>Your job: <strong>Watch for convergence or divergence</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>When you move the risk slider, do heads nod or shake?</li>
                <li>Note who wants to move fast vs. who wants more guardrails</li>
                <li>Track sticking points: data governance? budget? ownership?</li>
                <li>Time how long it takes to reach rough agreement (if at all)</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Risk Tolerance Slider */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Risk Tolerance Discussion</CardTitle>
          <CardDescription>Move the slider and observe team reactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex justify-between">
              <span>Where should we be on the risk spectrum?</span>
              <span className="font-semibold">{getRiskLabel(riskTolerance)}</span>
            </Label>
            <Slider
              value={[riskTolerance]}
              onValueChange={(val) => setRiskTolerance(val[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Conservative (Move slow, validate everything)</span>
              <span>Aggressive (Move fast, learn by doing)</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Disagreements on risk tolerance
            </Label>
            <Textarea
              value={governanceDisagreements}
              onChange={(e) => setGovernanceDisagreements(e.target.value)}
              placeholder="Note who disagreed and why (one per line)&#10;e.g., CFO wants more validation, CMO wants faster deployment&#10;Legal concerned about compliance, CTO confident in guardrails"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Strategic Trade-off Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Strategic Questions</CardTitle>
          <CardDescription>Discuss these as a team and capture the conversation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Which 2026 targets are at risk if we don't move on AI?</Label>
            <Textarea
              value={addendum.targets_at_risk}
              onChange={(e) => setAddendum({ ...addendum, targets_at_risk: e.target.value })}
              placeholder="e.g., Revenue growth targets, operational efficiency goals, customer satisfaction metrics"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>What data governance changes are needed?</Label>
            <Textarea
              value={addendum.data_governance_changes}
              onChange={(e) => setAddendum({ ...addendum, data_governance_changes: e.target.value })}
              placeholder="e.g., New data access policies, consent management, audit trails"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>How will we measure success?</Label>
            <Textarea
              value={addendum.pilot_kpis}
              onChange={(e) => setAddendum({ ...addendum, pilot_kpis: e.target.value })}
              placeholder="e.g., Time saved, quality improvement, cost reduction, adoption rate"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Alignment Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Track Team Alignment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              How long did it take to reach rough consensus? (minutes)
            </Label>
            <Slider
              value={[convergenceTime]}
              onValueChange={(val) => setConvergenceTime(val[0])}
              min={0}
              max={90}
              step={5}
            />
            <div className="text-right text-sm text-muted-foreground">{convergenceTime} minutes</div>
          </div>

          <div className="space-y-2">
            <Label>What were the main sticking points?</Label>
            <Textarea
              value={stickingPoints}
              onChange={(e) => setStickingPoints(e.target.value)}
              placeholder="Note points where the team got stuck or couldn't agree (one per line)&#10;e.g., Who owns data quality?&#10;What level of human review is needed?&#10;How much budget to allocate?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Overall alignment level</Label>
            <div className="flex gap-2">
              <Button
                variant={alignmentLevel === 'low' ? 'default' : 'outline'}
                onClick={() => setAlignmentLevel('low')}
                size="sm"
              >
                Low (Major disagreements)
              </Button>
              <Button
                variant={alignmentLevel === 'medium' ? 'default' : 'outline'}
                onClick={() => setAlignmentLevel('medium')}
                size="sm"
              >
                Medium (Some friction)
              </Button>
              <Button
                variant={alignmentLevel === 'high' ? 'default' : 'outline'}
                onClick={() => setAlignmentLevel('high')}
                size="sm"
              >
                High (Quick consensus)
              </Button>
            </div>
          </div>
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
              Complete Battle Test #2
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
