import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { FileText, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface Segment5StrategyAddendumProps {
  workshopId: string;
  bootcampPlanData?: any;
}

export const Segment5StrategyAddendum: React.FC<Segment5StrategyAddendumProps> = ({ workshopId, bootcampPlanData }) => {
  const [activitySession, setActivitySession] = useState<any>(null);
  const [addendum, setAddendum] = useState({
    targets_at_risk: '',
    data_governance_changes: '',
    pilot_kpis: '',
  });

  useEffect(() => {
    loadAddendum();
  }, [workshopId]);

  // Pre-populate with customer data if available
  useEffect(() => {
    if (bootcampPlanData && addendum.targets_at_risk === '') {
      const initialTargets = bootcampPlanData.strategic_goals_2026?.join('\n• ') || '';
      const initialBottlenecks = bootcampPlanData.current_bottlenecks?.join('\n• ') || '';
      const competitiveLandscape = bootcampPlanData.competitive_landscape || '';
      
      setAddendum(prev => ({
        ...prev,
        targets_at_risk: initialTargets ? `Strategic targets:\n• ${initialTargets}\n\nCompetitive Context:\n${competitiveLandscape}` : '',
      }));
    }
  }, [bootcampPlanData]);

  const generateWorkingGroupQR = async () => {
    const activityUrl = `${window.location.origin}/mobile/working-group/${workshopId}`;
    
    const { data, error } = await supabase
      .from('activity_sessions')
      .insert({
        workshop_session_id: workshopId,
        activity_type: 'working_group',
        qr_code_url: activityUrl,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error generating QR code', variant: 'destructive' });
      return;
    }

    setActivitySession(data);
    toast({ title: 'Working group QR codes generated!' });
  };

  const loadAddendum = async () => {
    const { data } = await supabase
      .from('strategy_addendum')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .single();

    if (data) {
      setAddendum({
        targets_at_risk: data.targets_at_risk || '',
        data_governance_changes: data.data_governance_changes || '',
        pilot_kpis: data.pilot_kpis || '',
      });
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('strategy_addendum')
      .upsert({
        workshop_session_id: workshopId,
        ...addendum,
      });

    if (error) {
      toast({ title: 'Error saving addendum', variant: 'destructive' });
      return;
    }

    toast({ title: 'Strategy addendum saved!' });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Segment 5: The Rewrite - Strategy Addendum Builder (45 minutes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            <strong>Objective:</strong> Build a 5-block strategy addendum that integrates AI into existing strategic plans.
          </p>

          <Button onClick={generateWorkingGroupQR} disabled={!!activitySession}>
            <QrCode className="mr-2 h-4 w-4" />
            Generate Working Group QR Codes
          </Button>

          {activitySession && (
            <Card className="p-4 flex flex-col items-center">
              <h4 className="font-semibold mb-2">Table Collaboration QR</h4>
              <QRCodeSVG value={activitySession.qr_code_url} size={400} />
            </Card>
          )}

          {bootcampPlanData && (
            <Card className="bg-primary/10 border-2 border-primary/30">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">Customer Context</span>
                  Strategic Background
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium mb-1">AI Experience:</div>
                    <div className="text-muted-foreground">{bootcampPlanData.ai_experience_level || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Risk Tolerance:</div>
                    <div className="text-muted-foreground">{bootcampPlanData.risk_tolerance ? `${bootcampPlanData.risk_tolerance}/10` : 'Not specified'}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Block 1: Targets at Risk</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Which 2026 strategic targets are now at risk due to competitive AI adoption?
              </p>
              {bootcampPlanData?.strategic_goals_2026 && (
                <p className="text-xs text-primary mb-2">Pre-populated with customer's strategic goals</p>
              )}
              <Textarea
                rows={6}
                value={addendum.targets_at_risk}
                onChange={(e) => setAddendum({ ...addendum, targets_at_risk: e.target.value })}
                placeholder="List strategic targets that may be impacted..."
              />
            </div>

            <div>
              <Label className="text-base font-semibold">Block 2: AI Leverage Points</Label>
              <p className="text-sm text-muted-foreground mb-2">
                (Auto-populated from Segment 3 Effortless Enterprise Map)
              </p>
              <Card className="p-4 bg-muted">
                <p className="text-sm">Top voted items will appear here from Segment 3...</p>
              </Card>
            </div>

            <div>
              <Label className="text-base font-semibold">Block 3: Org/Process Changes</Label>
              <p className="text-sm text-muted-foreground mb-2">
                (Auto-populated from Segment 4 Simulation Results)
              </p>
              <Card className="p-4 bg-muted">
                <p className="text-sm">Simulation deltas will appear here from Segment 4...</p>
              </Card>
            </div>

            <div>
              <Label className="text-base font-semibold">Block 4: Data & Governance Changes</Label>
              <p className="text-sm text-muted-foreground mb-2">
                What data infrastructure or governance policies need updating?
              </p>
              <Textarea
                rows={4}
                value={addendum.data_governance_changes}
                onChange={(e) => setAddendum({ ...addendum, data_governance_changes: e.target.value })}
                placeholder="Data quality, security, compliance requirements..."
              />
            </div>

            <div>
              <Label className="text-base font-semibold">Block 5: 90-Day Pilot & KPI</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Define success metrics for the first pilot
              </p>
              <Textarea
                rows={4}
                value={addendum.pilot_kpis}
                onChange={(e) => setAddendum({ ...addendum, pilot_kpis: e.target.value })}
                placeholder="KPIs, success criteria, decision gates..."
              />
            </div>
          </div>

          <Button onClick={handleSave} className="w-full" size="lg">
            Save Strategy Addendum
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
