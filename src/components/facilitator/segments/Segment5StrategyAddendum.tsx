import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { FileText, QrCode, Target, TrendingUp, AlertTriangle, Award, Medal, Trophy, ArrowUp, ArrowDown, Minus, Sparkles, Loader2, Gauge, Check, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { getSimulationDisplayName } from '@/lib/simulation-constants';
import { useEnhancedAutosave } from '@/hooks/useEnhancedAutosave';
import { useSaveQueue } from '@/hooks/useSaveQueue';
import { AIGenerateButton } from '@/components/ui/ai-generate-button';

interface Segment5StrategyAddendumProps {
  workshopId: string;
  bootcampPlanData?: any;
}

export const Segment5StrategyAddendum: React.FC<Segment5StrategyAddendumProps> = ({ workshopId, bootcampPlanData }) => {
  const dataLoaded = useRef(false);
  const [activitySession, setActivitySession] = useState<any>(null);
  const [addendum, setAddendum] = useState({
    targets_at_risk: '',
    data_governance_changes: '',
    pilot_kpis: '',
  });
  const [votingResults, setVotingResults] = useState<any[]>([]);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [readinessScore, setReadinessScore] = useState(0);

  useEffect(() => {
    loadAddendum();
    loadWorkshopData();
  }, [workshopId]);

  useEffect(() => {
    if (!loadingData) {
      calculateReadinessScore();
    }
  }, [votingResults, simulationResults, loadingData]);

  useEffect(() => {
    // Only pre-populate if database data hasn't been loaded yet
    if (bootcampPlanData && !dataLoaded.current && addendum.targets_at_risk === '') {
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
      dataLoaded.current = true;
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

  const calculateReadinessScore = () => {
    let score = 0;
    
    // Strategic alignment (20 points)
    if (votingResults.length > 0) score += 20;
    
    // AI performance confidence (30 points)
    const avgQuality = simulationResults.reduce((sum, s) => sum + (s.quality_improvement_pct || 0), 0) / (simulationResults.length || 1);
    score += Math.min(30, (avgQuality / 100) * 30);
    
    // Guardrails designed (20 points)
    const guardrailsCount = simulationResults.filter(s => s.guardrails).length;
    score += (guardrailsCount / Math.max(simulationResults.length, 1)) * 20;
    
    // Task breakdown completeness (15 points)
    const taskBreakdownCount = simulationResults.filter(s => s.task_breakdown).length;
    score += (taskBreakdownCount / Math.max(simulationResults.length, 1)) * 15;
    
    // Team engagement (15 points)
    if (votingResults.length >= 3) score += 15;
    else score += votingResults.length * 5;
    
    setReadinessScore(Math.round(score));
  };

  const getRiskLabel = (value: number) => {
    if (value < 34) return 'Conservative (Maximum Oversight)';
    if (value < 67) return 'Balanced';
    return 'Aggressive (Trust AI Performance)';
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-strategy-insights', {
        body: {
          workshop_session_id: workshopId,
          risk_tolerance: riskTolerance,
        },
      });

      if (error) throw error;

      if (data) {
        setAddendum({
          targets_at_risk: data.targets_at_risk || '',
          data_governance_changes: data.data_governance_changes || '',
          pilot_kpis: data.pilot_kpis || '',
        });
        toast({ 
          title: 'Strategy insights generated!', 
          description: `Created based on ${getRiskLabel(riskTolerance).toLowerCase()} approach` 
        });
      }
    } catch (error: any) {
      console.error('Error generating strategy insights:', error);
      toast({ 
        title: 'Error generating strategy insights', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    await flushAll(); // Force immediate save of all queued changes
    toast({ title: 'Strategy addendum saved!', description: 'All changes have been saved immediately' });
  };

  // Autosave callback - ALWAYS save, even if empty (deletion is valid)
  const saveAddendum = useCallback(async () => {
    const { error } = await supabase.from('strategy_addendum').upsert({
      workshop_session_id: workshopId,
      targets_at_risk: addendum.targets_at_risk,
      data_governance_changes: addendum.data_governance_changes,
      pilot_kpis: addendum.pilot_kpis,
    });

    if (error) {
      console.error('[StrategyAddendum] Autosave error:', error);
      throw error;
    }
  }, [workshopId, addendum]);

  // Enable autosave with 2 second debounce (strategic thinking needs more time)
  const { isSaving, lastSaved } = useEnhancedAutosave({
    data: addendum,
    saveFunction: saveAddendum,
    debounceMs: 2000,
    enabled: true,
    componentName: 'StrategyAddendum',
  });

  const { flushAll } = useSaveQueue();

  console.log('[StrategyAddendum] Current state:', { 
    addendum, 
    isSaving, 
    lastSaved: lastSaved?.toISOString() 
  });

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
        {/* Pilot Readiness Score */}
        <div className="p-6 bg-muted/30 rounded-lg border-2 border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Gauge className="h-8 w-8 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Pilot Readiness Score</h3>
                <p className="text-sm text-muted-foreground">Based on workshop data quality</p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${
                readinessScore >= 80 ? 'text-success' : 
                readinessScore >= 60 ? 'text-warning' : 
                'text-error'
              }`}>
                {readinessScore}
              </div>
              <div className="text-sm text-muted-foreground">
                {readinessScore >= 80 ? 'Strong' : readinessScore >= 60 ? 'Moderate' : 'Needs Work'}
              </div>
            </div>
          </div>
          <div className="w-full bg-secondary rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-500 ${
                readinessScore >= 80 ? 'bg-success' : 
                readinessScore >= 60 ? 'bg-warning' : 
                'bg-error'
              }`}
              style={{ width: `${readinessScore}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2 text-xs text-muted-foreground">
            <div>Strategic Alignment</div>
            <div>AI Performance</div>
            <div>Guardrails</div>
            <div>Task Breakdown</div>
            <div>Team Engagement</div>
          </div>
        </div>

        {/* AI-Assisted Strategy Generation */}
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">AI-Assisted Strategy Generation</h3>
          </div>
          <div className="space-y-2">
            <Label className="flex justify-between">
              <span>Risk Tolerance</span>
              <span className="text-sm font-medium">{getRiskLabel(riskTolerance)}</span>
            </Label>
            <Slider
              value={[riskTolerance]}
              onValueChange={(value) => setRiskTolerance(value[0])}
              min={0}
              max={100}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Conservative</span>
              <span>Aggressive</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {riskTolerance < 34 && "Maximum human oversight, extensive validation required"}
              {riskTolerance >= 34 && riskTolerance < 67 && "Balanced approach based on observed AI performance"}
              {riskTolerance >= 67 && "Trust AI capabilities, streamlined oversight where appropriate"}
            </p>
          </div>
          
          <AIGenerateButton
            onClick={handleGenerateWithAI}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Strategy Insights'
            )}
          </AIGenerateButton>
        </div>

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

        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Key Questions for Your Team</h2>
            </div>
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

          <div><Label>Strategic Targets at Risk</Label>
            <Textarea value={addendum.targets_at_risk} onChange={(e) => setAddendum({ ...addendum, targets_at_risk: e.target.value })} rows={4} /></div>
          <div><Label>Data & Governance Changes</Label>
            <Textarea value={addendum.data_governance_changes} onChange={(e) => setAddendum({ ...addendum, data_governance_changes: e.target.value })} rows={4} /></div>
          <div><Label>90-Day Pilot Metrics</Label>
            <Textarea value={addendum.pilot_kpis} onChange={(e) => setAddendum({ ...addendum, pilot_kpis: e.target.value })} rows={4} /></div>

          <Button onClick={handleSave} size="lg" className="w-full" variant="outline">
            Manual Save Override
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
