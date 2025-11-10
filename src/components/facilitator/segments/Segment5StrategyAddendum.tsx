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
}

export const Segment5StrategyAddendum: React.FC<Segment5StrategyAddendumProps> = ({ workshopId }) => {
  const [activitySession, setActivitySession] = useState<any>(null);
  const [addendum, setAddendum] = useState({
    targets_at_risk: '',
    data_governance_changes: '',
    pilot_kpis: '',
  });

  useEffect(() => {
    loadAddendum();
  }, [workshopId]);

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
              <QRCodeSVG value={activitySession.qr_code_url} size={200} />
            </Card>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-base font-semibold">Block 1: Targets at Risk</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Which 2026 strategic targets are now at risk due to competitive AI adoption?
              </p>
              <Textarea
                rows={4}
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
