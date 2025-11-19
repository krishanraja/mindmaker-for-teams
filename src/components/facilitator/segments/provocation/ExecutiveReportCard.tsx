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
  const [workshopConfig, setWorkshopConfig] = useState<{
    duration: number;
    completedSegments: string[];
  }>({ duration: 4, completedSegments: [] });
  const { toast } = useToast();

  const loadExistingReport = async () => {
    const { data, error } = await supabase
      .from('provocation_reports')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && !error) {
      const reportDataObj = data.report_data as any;
      console.log('[ExecutiveReportCard] Loaded report_data structure:', {
        hasContextData: !!reportDataObj?.contextData,
        hasPreWorkshop: !!reportDataObj?.contextData?.preWorkshop,
        hasWorkshop: !!reportDataObj?.workshop,
        keys: Object.keys(reportDataObj || {})
      });
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

      // Fetch workshop duration config for conditional rendering
      const { data: workshopData } = await supabase
        .from('workshop_sessions')
        .select('planned_duration_hours, segments_completed')
        .eq('id', workshopId)
        .single();

      if (workshopData) {
        setWorkshopConfig({
          duration: workshopData.planned_duration_hours || 4,
          completedSegments: workshopData.segments_completed || []
        });
      }

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

  // Safe accessor to prevent crashes from null/undefined nested properties
  const safeGet = (obj: any, path: string, defaultValue: any = null) => {
    try {
      return path.split('.').reduce((acc, part) => acc?.[part], obj) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Validate reportData structure before proceeding
  if (!reportData || typeof reportData !== 'object') {
    return (
      <Card className="border-destructive">
        <CardContent className="p-8 text-center space-y-4">
          <div>
            <p className="font-semibold text-foreground">Invalid Report Data</p>
            <p className="text-sm text-muted-foreground">The report structure is corrupted or incomplete.</p>
          </div>
          <Button onClick={() => fetchReport(true)} variant="destructive">
            Regenerate Report
          </Button>
        </CardContent>
      </Card>
    );
  }

  const {
    urgencyScore = 0,
    roiMetrics = {},
    contextData = {},
    workshop = {},
    charter,
    strategy,
    bottlenecks = []
  } = reportData;

  // Comprehensive structure validation
  console.log('[ExecutiveReportCard] Data structure validation:', {
    hasContextData: !!contextData,
    hasWorkshop: !!contextData?.workshop,
    hasPrework: !!contextData?.prework,
    hasCompany: !!contextData?.company,
    hasPreWorkshop: !!contextData?.preWorkshop,
    workshopKeys: contextData?.workshop ? Object.keys(contextData.workshop) : [],
    preworkKeys: contextData?.prework ? Object.keys(contextData.prework) : [],
    urgencyScore,
    roiMetricsCount: Object.keys(roiMetrics || {}).length
  });
  const bottleneckClusters: string[] = Array.from(
    new Set(
      (bottlenecks || [])
        .map((b: any) => b.cluster_name)
        .filter((name: any): name is string => typeof name === 'string' && name.length > 0)
    )
  );

  // Prepare data for journey map with safe accessors
  const journeyData = {
    preWorkData: {
      anticipatedBottlenecks: safeGet(contextData, 'preWorkshop.anticipatedBottlenecks', []).length,
      primaryConcerns: safeGet(contextData, 'preWorkshop.aiMyths', []).slice(0, 2),
      experienceLevel: safeGet(contextData, 'preWorkshop.aiExperience', 'experimenting')
    },
    discoveryData: {
      actualBottlenecks: safeGet(contextData, 'workshop.bottlenecksIdentified', 0),
      topClusters: safeGet(contextData, 'workshop.bottleneckClusters', []).slice(0, 2),
      mythsBusted: safeGet(aiSynthesis, 'journeyInsights.mythsBusted') ? [aiSynthesis.journeyInsights.mythsBusted] : []
    },
    experimentData: {
      simulationsRun: safeGet(contextData, 'workshop.simulationsRun', 0),
      avgTimeSavings: safeGet(contextData, 'simulations.avgTimeSavings', 0),
      avgQualityRating: safeGet(contextData, 'simulations.avgQualityRating', 0),
      keyFindings: safeGet(aiSynthesis, 'journeyInsights.surprisingFindings') ? [aiSynthesis.journeyInsights.surprisingFindings] : []
    },
    riskData: safeGet(contextData, 'enrichedData.riskData', null) || {
      guardrailsCount: 0,
      riskTolerance: 50,
      riskLabel: 'Balanced',
      redFlagsCount: 0,
      topGuardrail: 'Guardrails to be designed'
    },
    taskData: safeGet(contextData, 'enrichedData.taskData', null) || {
      totalTasks: 0,
      aiCapable: 0,
      aiCapablePct: 0,
      humanOnly: 0,
      humanOnlyPct: 0,
      topAutomation: 'Task analysis to be completed'
    },
    strategyData: {
      topOpportunities: safeGet(contextData, 'workshop.opportunitiesPrioritized', 0),
      workingGroupInputs: safeGet(contextData, 'strategy.workingGroupInputs', []).length,
      consensusArea: safeGet(contextData, 'enrichedData.strategyData.consensusArea', 'Strategic alignment'),
      addendum: safeGet(contextData, 'strategy') ? {
        targetsAtRisk: safeGet(contextData, 'strategy.targetsAtRisk'),
        dataGovernance: safeGet(contextData, 'strategy.dataGovernance'),
        pilotKPIs: safeGet(contextData, 'strategy.pilotKPIs'),
      } : undefined,
      charter: safeGet(contextData, 'charter.pilotOwner') || safeGet(contextData, 'charter.executiveSponsor') ? {
        pilotOwner: safeGet(contextData, 'charter.pilotOwner'),
        executiveSponsor: safeGet(contextData, 'charter.executiveSponsor'),
        milestones: {
          d90: safeGet(contextData, 'charter.milestones.d90')
        }
      } : undefined,
      huddleSynthesis: safeGet(contextData, 'enrichedData.huddleInsights.actions', []).length ? {
        priorityActions: contextData.enrichedData.huddleInsights.actions
      } : undefined
    }
  };

  // Prepare myths vs reality data
  const mythsVsRealityData = contextData.preWorkshop.aiMyths?.slice(0, 3).map((myth: string, idx: number) => ({
    myth,
    reality: aiSynthesis?.strengths?.[idx]?.title || 'Team validated AI capabilities through hands-on experimentation'
  })) || [];

  // Conditional rendering flags based on duration and completed segments
  const showFullPilotCharter = workshopConfig.duration >= 3 && 
    workshopConfig.completedSegments.includes('draft');
  const showSimulationDetails = workshopConfig.completedSegments.includes('crystal_ball') ||
    workshopConfig.completedSegments.includes('simulation');
  const showStrategicAlignment = workshopConfig.duration >= 2;

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

      {/* Hero Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="text-center p-6 bg-primary/5 hover:bg-primary/10 transition-colors">
          <div className="text-6xl font-black text-primary tabular-nums">
            {safeGet(contextData, 'workshop.bottlenecksIdentified', 0)}
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-2">
            Bottlenecks
          </div>
        </Card>
        <Card className="text-center p-6 bg-primary/5 hover:bg-primary/10 transition-colors">
          <div className="text-6xl font-black text-primary tabular-nums">
            {safeGet(contextData, 'workshop.opportunitiesPrioritized', 0)}
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-2">
            Opportunities
          </div>
        </Card>
        <Card className="text-center p-6 bg-primary/5 hover:bg-primary/10 transition-colors">
          <div className="text-6xl font-black text-primary tabular-nums">
            {safeGet(contextData, 'workshop.simulationsRun', 0)}
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-2">
            Simulations
          </div>
        </Card>
        <Card className="text-center p-6 bg-primary/5 hover:bg-primary/10 transition-colors">
          <div className="text-6xl font-black text-primary tabular-nums">
            {safeGet(contextData, 'workshop.participantCount', 0)}
          </div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-2">
            Participants
          </div>
        </Card>
        <Card className="text-center p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-2 border-orange-500/30">
          <div className="text-6xl font-black text-orange-600 tabular-nums">
            {Math.round(urgencyScore)}
          </div>
          <div className="text-xs uppercase tracking-widest text-orange-600 font-bold mt-2">
            Urgency
          </div>
        </Card>
      </div>

      {/* Company Context - Compact */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <div>
              <span className="font-bold text-foreground">{safeGet(contextData, 'company.name', 'Company Name')}</span>
              <span className="text-muted-foreground"> | {safeGet(contextData, 'company.industry', 'Industry')}</span>
            </div>
            <Badge variant="outline" className="font-normal">
              AI Experience: {safeGet(contextData, 'preWorkshop.aiExperience', 'Not specified')}
            </Badge>
            <Badge variant="outline" className="font-normal">
              2026 Goals: {safeGet(contextData, 'company.strategicGoals', 'Not specified') !== 'Not specified' 
                ? safeGet(contextData, 'company.strategicGoals', 'TBD') 
                : 'TBD'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Workshop Journey Map */}
      <WorkshopJourneyMap {...journeyData} />

      {/* AI Synthesis Section */}
      {aiSynthesis && (
        <AISynthesisSection synthesis={aiSynthesis} urgencyScore={urgencyScore} />
      )}

      {/* Participant Highlights - REMOVED: Cannot fabricate quotes in front of participants */}

      {/* Myths vs Reality */}
      {mythsVsRealityData.length > 0 && (
        <MythsVsReality items={mythsVsRealityData} />
      )}

      {/* Strategic Alignment Grid - Only show if >=2 hour session */}
      {showStrategicAlignment && (
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
      )}

      {/* Simulation Performance - Aggregated View - Only show if simulation ran */}
      {showSimulationDetails && reportData.simulationMetrics?.count > 0 && (
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-foreground">Simulation Performance</h3>
          
          {/* Aggregate Summary Card */}
          <Card className="bg-primary/5 border-2 border-primary/20">
            <CardContent className="p-8">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-5xl font-black text-primary tabular-nums">
                    {reportData.simulationMetrics.count}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium mt-2">
                    Simulations Run
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-black text-primary tabular-nums">
                    {reportData.simulationMetrics.medianTimeSavings}%
                  </div>
                  <div className="text-sm text-muted-foreground font-medium mt-2">
                    Median Time Saved
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-black text-primary tabular-nums">
                    {reportData.simulationMetrics.medianQuality}/10
                  </div>
                  <div className="text-sm text-muted-foreground font-medium mt-2">
                    Median Quality Rating
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Highlight Cards (Max 3) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {reportData.simulationMetrics.highlights.map((sim: any, idx: number) => {
              const labels = ['Best Result', 'Typical Result', 'Edge Case'];
              return (
                <Card key={idx} className="border shadow-sm">
                  <CardHeader className="pb-3">
                    <Badge variant={idx === 0 ? 'default' : 'outline'} className="w-fit">
                      {labels[idx]}
                    </Badge>
                    <CardTitle className="text-lg mt-2">{sim.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Time Saved</span>
                        <span className="text-2xl font-bold text-foreground">{sim.timeSavings}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Quality</span>
                        <span className="text-2xl font-bold text-foreground">{sim.qualityRating}/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Urgency Score Gauge */}
      <UrgencyScoreGauge score={urgencyScore} />

      {/* Pilot Charter Card - Conditional rendering based on session duration */}
      {showFullPilotCharter && charter && <PilotCharterCard charter={charter} />}
      
      {/* Show simplified pilot recommendation for shorter sessions */}
      {!showFullPilotCharter && charter && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Recommended Next Step
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-2">
                {charter.pilot_owner ? `Pilot: ${charter.pilot_owner}` : 'Define 90-Day Pilot'}
              </h4>
              {charter.executive_sponsor && (
                <p className="text-sm text-muted-foreground">
                  Sponsor: {charter.executive_sponsor}
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Schedule a follow-up session to develop full pilot charter with milestones and success criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
