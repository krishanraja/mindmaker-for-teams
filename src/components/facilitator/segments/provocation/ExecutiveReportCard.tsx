import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, DollarSign, Clock, Target, RefreshCw } from 'lucide-react';
import { UrgencyScoreGauge } from './UrgencyScoreGauge';
import { StrategicAlignmentGrid } from './StrategicAlignmentGrid';
import { PilotCharterCard } from './PilotCharterCard';
import { AISynthesisSection } from './AISynthesisSection';
import { WorkshopJourneyMap } from './WorkshopJourneyMap';
import { ParticipantHighlights } from './ParticipantHighlights';
import { MythsVsReality } from './MythsVsReality';

interface ExecutiveReportCardProps {
  workshopId: string;
}

export const ExecutiveReportCard: React.FC<ExecutiveReportCardProps> = ({ workshopId }) => {
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [aiSynthesis, setAiSynthesis] = useState<any>(null);
  const [hasLoadedExisting, setHasLoadedExisting] = useState(false);
  const { toast } = useToast();

  const loadExistingReport = async () => {
    const { data, error } = await supabase
      .from('provocation_reports')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (data && !error) {
      setReportData(data.report_data);
      
      // Parse AI synthesis if it's a string
      try {
        const synthesis = typeof data.ai_synthesis === 'string' 
          ? JSON.parse(data.ai_synthesis) 
          : data.ai_synthesis;
        setAiSynthesis(synthesis);
      } catch (e) {
        console.error('Error parsing AI synthesis:', e);
        setAiSynthesis(null);
      }
      
      setHasLoadedExisting(true);
      return true;
    }
    return false;
  };

  const fetchReport = async (forceRegenerate = false) => {
    try {
      setLoading(true);

      // Check for existing report first
      if (!forceRegenerate) {
        const hasExisting = await loadExistingReport();
        if (hasExisting) {
          toast({ title: 'Loaded existing provocation report' });
          setLoading(false);
          return;
        }
      }

      // Generate new report
      const { data, error } = await supabase.functions.invoke('generate-provocation-report', {
        body: { workshop_session_id: workshopId }
      });

      if (error) throw error;

      if (data?.reportData && data?.aiSynthesis) {
        setReportData(data.reportData);
        setAiSynthesis(data.aiSynthesis);

        // Save to database
        await supabase.from('provocation_reports').insert({
          workshop_session_id: workshopId,
          report_data: data.reportData,
          ai_synthesis: JSON.stringify(data.aiSynthesis),
        });

        setHasLoadedExisting(true);
      }
    } catch (error: any) {
      console.error('Error fetching report:', error);
      toast({
        title: 'Error Loading Report',
        description: error.message || 'Failed to generate executive report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setHasLoadedExisting(false);
    await fetchReport(true);
    setRegenerating(false);
    toast({
      title: 'Report Regenerated',
      description: 'AI synthesis has been updated with latest workshop data',
    });
  };

  useEffect(() => {
    fetchReport(false);
  }, [workshopId]);

  if (loading) {
    return (
      <Card className="border border-border/60 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Custom spinner */}
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-border/40" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            </div>
            
            <div className="space-y-2">
              <p className="text-xl font-medium text-foreground">
                Generating Executive Report
              </p>
              <p className="text-sm text-muted-foreground">
                Analyzing comprehensive workshop data with AI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Unable to load report data</p>
          <Button onClick={() => fetchReport(false)} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { urgencyScore, roiMetrics, contextData, workshop, charter, strategy, bottlenecks } = reportData;
  const bottleneckClusters: string[] = Array.from(
    new Set(
      (bottlenecks || [])
        .map((b: any) => b.cluster_name)
        .filter((name: any): name is string => typeof name === 'string' && name.length > 0)
    )
  );

  // Prepare data for journey map
  const journeyData = {
    preWorkData: {
      anticipatedBottlenecks: contextData.preWorkshop.anticipatedBottlenecks?.length || 0,
      primaryConcerns: contextData.preWorkshop.aiMyths?.slice(0, 2) || [],
      experienceLevel: contextData.preWorkshop.aiExperience || 'experimenting'
    },
    discoveryData: {
      actualBottlenecks: contextData.workshop.bottlenecksIdentified || 0,
      topClusters: contextData.workshop.bottleneckClusters?.slice(0, 2) || [],
      mythsBusted: aiSynthesis?.journeyInsights?.mythsBusted ? [aiSynthesis.journeyInsights.mythsBusted] : []
    },
    experimentData: {
      simulationsRun: contextData.workshop.simulationsRun || 0,
      avgTimeSavings: contextData.simulations?.avgTimeSavings || 0,
      avgQualityRating: contextData.simulations?.avgQualityRating || 0,
      keyFindings: aiSynthesis?.journeyInsights?.surprisingFindings ? [aiSynthesis.journeyInsights.surprisingFindings] : []
    },
    riskData: contextData.enrichedData?.riskData || {
      guardrailsCount: 0,
      riskTolerance: 50,
      riskLabel: 'Balanced',
      redFlagsCount: 0,
      topGuardrail: 'Guardrails to be designed'
    },
    taskData: contextData.enrichedData?.taskData || {
      totalTasks: 0,
      aiCapable: 0,
      aiCapablePct: 0,
      humanOnly: 0,
      humanOnlyPct: 0,
      topAutomation: 'Task analysis to be completed'
    },
    strategyData: contextData.enrichedData?.strategyData || {
      topOpportunities: contextData.workshop.opportunitiesPrioritized || 0,
      workingGroupInputs: 0,
      consensusArea: 'Strategic alignment'
    }
  };

  // Prepare myths vs reality data
  const mythsVsRealityData = contextData.preWorkshop.aiMyths?.slice(0, 3).map((myth: string, idx: number) => ({
    myth,
    reality: aiSynthesis?.strengths?.[idx]?.title || 'Team validated AI capabilities through hands-on experimentation'
  })) || [];

  return (
    <div className="space-y-8">
      {/* Status indicator and regenerate button */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {hasLoadedExisting && '✓ Loaded from previous session'}
        </div>
        <Button
          onClick={() => handleRegenerate()}
          variant="outline"
          size="sm"
          disabled={regenerating}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
          Regenerate Report
        </Button>
      </div>

      {/* Header with Company Context */}
      <Card className="bg-card border shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex justify-between items-start">
            <div className="space-y-4">
              <div>
                <h1 className="text-4xl font-semibold text-foreground mb-2">
                  {contextData.company.name}
                </h1>
                <p className="text-muted-foreground text-lg">
                  AI Leadership Assessment
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-muted border border-border rounded-md text-sm font-medium">
                  {contextData.company.industry}
                </span>
                <span className="px-4 py-2 bg-muted border border-border rounded-md text-sm font-medium">
                  AI Experience: {contextData.preWorkshop.aiExperience}
                </span>
                <span className="px-4 py-2 bg-muted border border-border rounded-md text-sm font-medium">
                  {workshop.participant_count || 0} Participants
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">
                Bottlenecks Identified
              </div>
              <div className="text-5xl font-bold text-foreground">
                {contextData.workshop.bottlenecksIdentified}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">
                Opportunities Prioritized
              </div>
              <div className="text-5xl font-bold text-foreground">
                {contextData.workshop.opportunitiesPrioritized}
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-colors">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">
                Simulations Completed
              </div>
              <div className="text-5xl font-bold text-foreground">
                {contextData.workshop.simulationsRun}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workshop Journey Map */}
      <WorkshopJourneyMap {...journeyData} />

      {/* AI Synthesis Section */}
      {aiSynthesis && (
        <AISynthesisSection synthesis={aiSynthesis} urgencyScore={urgencyScore} />
      )}

      {/* Participant Highlights */}
      {aiSynthesis?.participantHighlights && (
        <ParticipantHighlights highlights={aiSynthesis.participantHighlights} />
      )}

      {/* Myths vs Reality */}
      {mythsVsRealityData.length > 0 && (
        <MythsVsReality items={mythsVsRealityData} />
      )}

      {/* Strategic Alignment Grid */}
            <StrategicAlignmentGrid
              strategicGoals={contextData.company.strategicGoals}
              derivedGoalsFromWorkshop={contextData.enrichedData?.derivedGoalsFromWorkshop}
              bottleneckClusters={bottleneckClusters}
              aiLeveragePoints={strategy?.ai_leverage_points}
              derivedLeveragePoints={contextData.enrichedData?.derivedLeveragePoints}
              pilotMilestones={{
                d10: charter?.milestone_d10,
                d30: charter?.milestone_d30,
                d60: charter?.milestone_d60,
                d90: charter?.milestone_d90,
              }}
              realisticNextSteps={contextData.enrichedData?.realisticNextSteps}
            />

      {/* The Numbers That Matter - ROI Metrics */}
      {roiMetrics.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Simulation Performance</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {roiMetrics.map((metric: any, idx: number) => (
              <Card key={idx} className="border shadow-sm">
                <CardContent className="p-8">
                  <h4 className="text-xl font-semibold text-foreground mb-6">
                    {metric.name}
                  </h4>
                  
                  <div className="space-y-5">
                    {metric.timeSavings && (
                      <div className="flex items-center justify-between pb-5 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                            <Clock className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">
                            Time Saved
                          </span>
                        </div>
                        <span className="text-3xl font-bold text-foreground">
                          {metric.timeSavings}%
                        </span>
                      </div>
                    )}
                    
                    {metric.costSavings && (
                      <div className="flex items-center justify-between pb-5 border-b border-border">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">
                            Cost Reduction
                          </span>
                        </div>
                        <span className="text-3xl font-bold text-foreground">
                          ${(metric.costSavings / 1000).toFixed(0)}K
                        </span>
                      </div>
                    )}
                    
                    {metric.qualityImprovement && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center">
                            <Target className="w-5 h-5 text-primary" />
                          </div>
                          <span className="text-sm text-muted-foreground font-medium">
                            Quality Gain
                          </span>
                        </div>
                        <span className="text-3xl font-bold text-foreground">
                          {metric.qualityImprovement}%
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Urgency Score Gauge */}
      <UrgencyScoreGauge score={urgencyScore} />

      {/* Pilot Charter Summary */}
      <PilotCharterCard charter={charter} />
    </div>
  );
};
