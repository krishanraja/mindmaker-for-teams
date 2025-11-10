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

interface ExecutiveReportCardProps {
  workshopId: string;
}

export const ExecutiveReportCard: React.FC<ExecutiveReportCardProps> = ({ workshopId }) => {
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [aiSynthesis, setAiSynthesis] = useState<string>('');
  const { toast } = useToast();

  const fetchReport = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('generate-provocation-report', {
        body: { workshop_session_id: workshopId }
      });

      if (error) throw error;

      if (data?.reportData) {
        setReportData(data.reportData);
        setAiSynthesis(data.aiSynthesis || '');
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
    await fetchReport();
    setRegenerating(false);
    toast({
      title: 'Report Regenerated',
      description: 'AI synthesis has been updated with latest data',
    });
  };

  useEffect(() => {
    fetchReport();
  }, [workshopId]);

  if (loading) {
    return (
      <Card className="border-2">
        <CardContent className="p-12 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating executive report card...</p>
          <p className="text-sm text-muted-foreground mt-2">Analyzing workshop data with AI</p>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Unable to load report data</p>
          <Button onClick={fetchReport} className="mt-4">
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

  return (
    <div className="space-y-8">
      {/* Header with Company Context */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-3xl mb-2">
                {contextData.company.name} Executive Report
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{contextData.company.industry}</Badge>
                <Badge variant="outline">AI Experience: {contextData.preWorkshop.aiExperience}</Badge>
                <Badge variant="outline">{workshop.participant_count || 0} Participants</Badge>
              </div>
            </div>
            <Button
              onClick={handleRegenerate}
              disabled={regenerating}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {regenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Regenerate AI Insights
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Bottlenecks Identified</div>
              <div className="text-3xl font-bold text-primary">{contextData.workshop.bottlenecksIdentified}</div>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Opportunities Prioritized</div>
              <div className="text-3xl font-bold text-primary">{contextData.workshop.opportunitiesPrioritized}</div>
            </div>
            <div className="p-4 bg-background/50 rounded-lg border">
              <div className="text-sm text-muted-foreground mb-1">Simulations Completed</div>
              <div className="text-3xl font-bold text-primary">{contextData.workshop.simulationsRun}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Synthesis Section */}
      {aiSynthesis && (
        <AISynthesisSection synthesis={aiSynthesis} urgencyScore={urgencyScore} />
      )}

      {/* The Numbers That Matter - ROI Metrics */}
      {roiMetrics.length > 0 && (
        <Card className="border-2 border-success/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-success" />
              The Numbers That Matter
            </CardTitle>
            <p className="text-muted-foreground">Simulation-driven ROI from your selected scenarios</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {roiMetrics.map((metric: any, idx: number) => (
                <div key={idx} className="space-y-4">
                  <div className="font-semibold text-lg text-primary">{metric.name}</div>
                  
                  {metric.timeSavings && (
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-success" />
                        <div className="text-sm text-muted-foreground">Time Savings</div>
                      </div>
                      <div className="text-3xl font-bold text-success">{metric.timeSavings}%</div>
                      <div className="text-sm text-muted-foreground mt-1">Faster workflow execution</div>
                    </div>
                  )}
                  
                  {metric.costSavings && (
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-5 w-5 text-success" />
                        <div className="text-sm text-muted-foreground">Cost Savings</div>
                      </div>
                      <div className="text-3xl font-bold text-success">
                        ${metric.costSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Annual savings</div>
                    </div>
                  )}
                  
                  {metric.qualityImprovement && (
                    <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-5 w-5 text-success" />
                        <div className="text-sm text-muted-foreground">Quality Improvement</div>
                      </div>
                      <div className="text-3xl font-bold text-success">{metric.qualityImprovement}%</div>
                      <div className="text-sm text-muted-foreground mt-1">Better outcomes</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Urgency Score Gauge */}
      <UrgencyScoreGauge score={urgencyScore} />

      {/* Strategic Alignment Grid */}
      <StrategicAlignmentGrid
        strategicGoals={contextData.company.strategicGoals}
        bottleneckClusters={bottleneckClusters}
        aiLeveragePoints={strategy?.ai_leverage_points}
        pilotMilestones={{
          d10: charter?.milestone_d10,
          d30: charter?.milestone_d30,
          d60: charter?.milestone_d60,
          d90: charter?.milestone_d90,
        }}
      />

      {/* Pilot Charter Summary */}
      <PilotCharterCard charter={charter} />
    </div>
  );
};
