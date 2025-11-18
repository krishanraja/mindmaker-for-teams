import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, QrCode, Target, TrendingUp, AlertTriangle, Award, Medal, Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { getSimulationDisplayName } from '@/lib/simulation-constants';

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
  const [votingResults, setVotingResults] = useState<any[]>([]);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    loadAddendum();
    loadWorkshopData();
  }, [workshopId]);

  useEffect(() => {
    if (bootcampPlanData && addendum.targets_at_risk === '') {
      const initialTargets = bootcampPlanData.strategic_goals_2026?.join('\n• ') || '';
      const competitiveLandscape = bootcampPlanData.competitive_landscape || '';
      
      setAddendum(prev => ({
        ...prev,
        targets_at_risk: initialTargets ? `Strategic targets:\n• ${initialTargets}\n\nCompetitive Context:\n${competitiveLandscape}` : '',
      }));
    }
  }, [bootcampPlanData]);

  const generateWorkingGroupQR = async () => {
    const { data, error } = await supabase.functions.invoke('generate-activity-qr', {
      body: { workshop_session_id: workshopId, activity_type: 'working_group' },
    });
    if (error) {
      toast({ title: 'Error generating QR code', variant: 'destructive' });
      return;
    }
    setActivitySession(data.activity_session);
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

  const loadWorkshopData = async () => {
    setLoadingData(true);
    const { data: mapItems } = await supabase
      .from('effortless_map_items')
      .select('id, item_text, lane, vote_count')
      .eq('workshop_session_id', workshopId)
      .order('vote_count', { ascending: false })
      .limit(5);
    if (mapItems) {
      setVotingResults(mapItems.filter(item => (item.vote_count || 0) > 0));
    }
    const { data: simulations } = await supabase
      .from('simulation_results')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .order('created_at', { ascending: false });
    if (simulations) {
      setSimulationResults(simulations);
    }
    setLoadingData(false);
  };

  const handleSave = async () => {
    const { error } = await supabase.from('strategy_addendum').upsert({
      workshop_session_id: workshopId,
      targets_at_risk: addendum.targets_at_risk,
      data_governance_changes: addendum.data_governance_changes,
      pilot_kpis: addendum.pilot_kpis,
    });
    if (error) {
      toast({ title: 'Error saving strategy addendum', variant: 'destructive' });
      return;
    }
    toast({ title: 'Strategy addendum saved!' });
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Award className="h-5 w-5 text-amber-600" />;
    return <span className="font-bold text-lg text-muted-foreground">#{index + 1}</span>;
  };

  const getLaneColor = (lane: string) => {
    switch (lane) {
      case 'must_have': return 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400';
      case 'nice_to_have': return 'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400';
      case 'constraint': return 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  const getMetricDelta = (value: number | null) => {
    if (!value || value === 0) return { icon: <Minus className="h-4 w-4" />, color: 'text-muted-foreground' };
    if (value > 0) return { icon: <ArrowUp className="h-4 w-4" />, color: 'text-green-600 dark:text-green-400' };
    return { icon: <ArrowDown className="h-4 w-4" />, color: 'text-red-600 dark:text-red-400' };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-2xl">Executive Strategy Dashboard</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">AI Readiness Assessment & Strategic Recommendations</p>
            </div>
          </div>
          {bootcampPlanData && (
            <div className="flex gap-2">
              <Badge variant="outline">{bootcampPlanData.ai_experience_level || 'Not Set'}</Badge>
              <Badge variant="outline">Risk: {bootcampPlanData.risk_tolerance || 'N/A'}/10</Badge>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border">
          <div>
            <h3 className="font-semibold">Collect Working Group Inputs</h3>
            <p className="text-sm text-muted-foreground">Generate QR code for participants</p>
          </div>
          <Button onClick={generateWorkingGroupQR}><QrCode className="mr-2 h-4 w-4" />Generate QR</Button>
        </div>

        {activitySession && (
          <div className="flex justify-center p-6 bg-background border rounded-lg">
            <div className="text-center space-y-3">
              <QRCodeSVG value={activitySession.qr_code_url} size={200} />
              <p className="text-sm font-medium">Scan to submit inputs</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Top Voted AI Opportunities</h2>
            <Badge variant="outline" className="ml-auto">{votingResults.length} items</Badge>
          </div>
          {loadingData ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : votingResults.length === 0 ? (
            <Card className="border-dashed"><CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No voting results yet</p>
            </CardContent></Card>
          ) : (
            <div className="space-y-3">
              {votingResults.map((item, idx) => (
                <Card key={item.id}><CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {getRankIcon(idx)}
                    <Badge variant="outline" className={getLaneColor(item.lane)}>{item.lane.replace('_', ' ')}</Badge>
                    <span className="flex-1 font-medium">{item.item_text}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-primary">{item.vote_count || 0}</span>
                      <span className="text-sm text-muted-foreground">votes</span>
                    </div>
                  </div>
                </CardContent></Card>
              ))}
            </div>
          )}
        </div>

        <div><Label>Strategic Targets at Risk</Label>
          <Textarea value={addendum.targets_at_risk} onChange={(e) => setAddendum({ ...addendum, targets_at_risk: e.target.value })} rows={4} /></div>
        <div><Label>Data & Governance Changes</Label>
          <Textarea value={addendum.data_governance_changes} onChange={(e) => setAddendum({ ...addendum, data_governance_changes: e.target.value })} rows={4} /></div>
        <div><Label>90-Day Pilot Metrics</Label>
          <Textarea value={addendum.pilot_kpis} onChange={(e) => setAddendum({ ...addendum, pilot_kpis: e.target.value })} rows={4} /></div>

        <Button onClick={handleSave} size="lg" className="w-full">Save Strategy Addendum</Button>
      </CardContent>
    </Card>
  );
};
