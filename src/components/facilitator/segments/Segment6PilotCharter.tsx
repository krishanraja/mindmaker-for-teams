import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Target, Check, Clock, Shield, TrendingUp, AlertTriangle, ChevronDown, DollarSign, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAutosave } from '@/hooks/useAutosave';
import { AIGenerateButton } from '@/components/ui/ai-generate-button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

  const [strategyData, setStrategyData] = useState({
    targets_at_risk: '',
    data_governance_changes: '',
    pilot_kpis: '',
  });

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  useEffect(() => {
    loadCharter();
    loadStrategyAddendum();
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
    const { data, error } = await supabase
      .from('pilot_charter')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .maybeSingle();

    if (error) {
      console.error('[PilotCharter] Load error:', error);
      toast({ 
        title: 'Error loading pilot charter', 
        description: error.message,
        variant: 'destructive' 
      });
      return;
    }

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

  const loadStrategyAddendum = async () => {
    const { data, error } = await supabase
      .from('strategy_addendum')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .maybeSingle();

    if (data && !error) {
      setStrategyData({
        targets_at_risk: data.targets_at_risk || '',
        data_governance_changes: data.data_governance_changes || '',
        pilot_kpis: data.pilot_kpis || '',
      });
    }
  };

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-strategy-insights', {
        body: {
          workshop_session_id: workshopId,
        }
      });

      if (error) throw error;

      if (data) {
        setStrategyData(prev => ({
          targets_at_risk: data.targets_at_risk || prev.targets_at_risk,
          data_governance_changes: data.data_governance || prev.data_governance_changes,
          pilot_kpis: data.pilot_metrics || prev.pilot_kpis,
        }));
        toast({ title: 'AI suggestions generated successfully!' });
      }
    } catch (error: any) {
      console.error('[PilotCharter] AI generation error:', error);
      toast({ 
        title: 'Error generating AI suggestions', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    const { error } = await supabase
      .from('pilot_charter')
      .upsert({
        workshop_session_id: workshopId,
        ...charter,
        pilot_budget: charter.pilot_budget ? parseFloat(charter.pilot_budget) : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'workshop_session_id',
        ignoreDuplicates: false
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
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'workshop_session_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('[PilotCharter] Autosave error:', error);
      throw error;
    }
  }, [workshopId, charter]);

  const saveStrategyAddendum = useCallback(async () => {
    const { error } = await supabase
      .from('strategy_addendum')
      .upsert({
        workshop_session_id: workshopId,
        ...strategyData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'workshop_session_id',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('[PilotCharter] Strategy autosave error:', error);
      throw error;
    }
  }, [workshopId, strategyData]);

  // Enable autosave with 1 second debounce
  const { isSaving, lastSaved } = useAutosave({
    data: charter,
    saveFunction: saveCharter,
    debounceMs: 1000,
    enabled: true,
  });

  useAutosave({
    data: strategyData,
    saveFunction: saveStrategyAddendum,
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-blue-500/30 hover:border-blue-500/60 transition-all bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <Label className="text-lg font-semibold">Pilot Owner</Label>
                </div>
                <Input
                  value={charter.pilot_owner}
                  onChange={(e) => setCharter({ ...charter, pilot_owner: e.target.value })}
                  placeholder="Name and role"
                  className="text-xl font-medium h-14 border-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Who will drive this pilot day-to-day?
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500/30 hover:border-blue-500/60 transition-all bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <Label className="text-lg font-semibold">Executive Sponsor</Label>
                </div>
                <Input
                  value={charter.executive_sponsor}
                  onChange={(e) => setCharter({ ...charter, executive_sponsor: e.target.value })}
                  placeholder="C-level sponsor"
                  className="text-xl font-medium h-14 border-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Who has executive authority and budget?
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/30 hover:border-green-500/60 transition-all bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <Label className="text-lg font-semibold">Pilot Budget (USD)</Label>
                </div>
                <Input
                  type="number"
                  value={charter.pilot_budget}
                  onChange={(e) => setCharter({ ...charter, pilot_budget: e.target.value })}
                  placeholder="50000"
                  className="text-xl font-medium h-14 border-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Total budget allocated for this pilot
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/30 hover:border-green-500/60 transition-all bg-green-500/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <Label className="text-lg font-semibold">Meeting Cadence</Label>
                </div>
                <Input
                  value={charter.meeting_cadence}
                  onChange={(e) => setCharter({ ...charter, meeting_cadence: e.target.value })}
                  placeholder="Weekly, Bi-weekly"
                  className="text-xl font-medium h-14 border-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  How often will the team check progress?
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-purple-500/30 bg-gradient-to-r from-purple-500/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-6 w-6 text-purple-600" />
                Milestone Gating (D10/D30/D60/D90)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="absolute top-8 left-8 right-8 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hidden md:block" />
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                  {[
                    { day: 'D10', label: 'Day 10', value: charter.milestone_d10, key: 'milestone_d10', placeholder: 'Team onboarded, data access secured...' },
                    { day: 'D30', label: 'Day 30', value: charter.milestone_d30, key: 'milestone_d30', placeholder: 'First prototype tested...' },
                    { day: 'D60', label: 'Day 60', value: charter.milestone_d60, key: 'milestone_d60', placeholder: 'User feedback incorporated, KPIs tracked...' },
                    { day: 'D90', label: 'Day 90', value: charter.milestone_d90, key: 'milestone_d90', placeholder: 'Final decision: Kill, Extend, or Scale...' },
                  ].map((milestone) => (
                    <div key={milestone.key} className="flex flex-col items-center">
                      <Badge className="mb-3 text-lg px-4 py-2 bg-purple-600 hover:bg-purple-700">{milestone.day}</Badge>
                      <Textarea
                        value={milestone.value}
                        onChange={(e) => setCharter({ ...charter, [milestone.key]: e.target.value })}
                        placeholder={milestone.placeholder}
                        className="min-h-[120px] text-base leading-relaxed"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-500/30 bg-gradient-to-r from-orange-500/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                Decision Gates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Card className="border-2 border-red-500/30 hover:border-red-500/50 transition-all">
                <CardContent className="pt-6">
                  <Label className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-red-500/20 text-red-700 text-sm rounded-full">KILL</span>
                    Stop the pilot
                  </Label>
                  <Textarea
                    value={charter.kill_criteria}
                    onChange={(e) => setCharter({ ...charter, kill_criteria: e.target.value })}
                    placeholder="No measurable improvement, budget overrun by 50%..."
                    className="min-h-[80px] text-base leading-relaxed"
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all">
                <CardContent className="pt-6">
                  <Label className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-700 text-sm rounded-full">EXTEND</span>
                    Continue testing
                  </Label>
                  <Textarea
                    value={charter.extend_criteria}
                    onChange={(e) => setCharter({ ...charter, extend_criteria: e.target.value })}
                    placeholder="Promising results but need more data..."
                    className="min-h-[80px] text-base leading-relaxed"
                  />
                </CardContent>
              </Card>

              <Card className="border-2 border-green-500/30 hover:border-green-500/50 transition-all">
                <CardContent className="pt-6">
                  <Label className="text-lg font-semibold flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-green-500/20 text-green-700 text-sm rounded-full">SCALE</span>
                    Roll out enterprise-wide
                  </Label>
                  <Textarea
                    value={charter.scale_criteria}
                    onChange={(e) => setCharter({ ...charter, scale_criteria: e.target.value })}
                    placeholder="ROI proven, user adoption >70%, compliance cleared..."
                    className="min-h-[80px] text-base leading-relaxed"
                  />
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Key Questions for Your Team</CardTitle>
                <AIGenerateButton
                  onClick={handleAIGenerate}
                  disabled={isGeneratingAI}
                  size="sm"
                >
                  {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                </AIGenerateButton>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: 'Strategic Targets at Risk',
                  field: 'targets_at_risk',
                  icon: <AlertTriangle className="h-5 w-5 text-orange-600" />,
                  prompt: 'Which 2026 strategic goals are threatened if we don\'t act now?',
                  placeholder: 'e.g., Revenue growth target, customer retention goals...'
                },
                {
                  title: 'Data & Governance Changes',
                  field: 'data_governance_changes',
                  icon: <Shield className="h-5 w-5 text-blue-600" />,
                  prompt: 'What data governance must be in place for AI adoption?',
                  placeholder: 'e.g., Data ownership policies, ethical AI guidelines...'
                },
                {
                  title: '90-Day Pilot Metrics',
                  field: 'pilot_kpis',
                  icon: <TrendingUp className="h-5 w-5 text-green-600" />,
                  prompt: 'How will we measure pilot success?',
                  placeholder: 'e.g., 15% faster processing, 20% cost reduction...'
                }
              ].map(({ title, field, icon, prompt, placeholder }) => (
                <Card key={field} className="border-2 hover:border-primary/50 transition-all">
                  <Collapsible defaultOpen={true}>
                    <CollapsibleTrigger className="w-full">
                      <CardHeader className="cursor-pointer hover:bg-muted/50">
                        <CardTitle className="flex items-center justify-between text-lg">
                          <div className="flex items-center gap-3">
                            {icon}
                            {title}
                          </div>
                          <ChevronDown className="h-5 w-5" />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3 italic">{prompt}</p>
                        <Textarea
                          value={strategyData[field as keyof typeof strategyData]}
                          onChange={(e) => setStrategyData({ ...strategyData, [field]: e.target.value })}
                          placeholder={placeholder}
                          className="min-h-[120px] text-base leading-relaxed"
                        />
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}
            </CardContent>
          </Card>

          <Button onClick={handleSave} className="w-full" size="lg" variant="outline">
            Manual Save Override
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
