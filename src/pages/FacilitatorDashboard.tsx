import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SegmentNavigator } from '@/components/facilitator/SegmentNavigator';
import { Segment1Mythbuster } from '@/components/facilitator/segments/Segment1Mythbuster';
import { Segment2BottleneckBoard } from '@/components/facilitator/segments/Segment2BottleneckBoard';
import { Segment3EffortlessEnterprise } from '@/components/facilitator/segments/Segment3EffortlessEnterprise';
import { Segment4SimulationLab } from '@/components/facilitator/segments/Segment4SimulationLab';
import { Segment5StrategyAddendum } from '@/components/facilitator/segments/Segment5StrategyAddendum';
import { Segment6PilotCharter } from '@/components/facilitator/segments/Segment6PilotCharter';
import { Segment7Provocation } from '@/components/facilitator/segments/Segment7Provocation';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PreWorkProgressCard } from '@/components/exec-teams/PreWorkProgressCard';
import { PreWorkResponsesModal } from '@/components/facilitator/PreWorkResponsesModal';

export const FacilitatorDashboard: React.FC = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<any>(null);
  const [bootcampPlan, setBootcampPlan] = useState<any>(null);
  const [currentSegment, setCurrentSegment] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showResponsesModal, setShowResponsesModal] = useState(false);

  useEffect(() => {
    loadWorkshop();
  }, [workshopId]);

  const loadWorkshop = async () => {
    if (!workshopId) return;

    const { data, error } = await supabase
      .from('workshop_sessions')
      .select('*, exec_intakes(*)')
      .eq('id', workshopId)
      .single();

    if (error) {
      toast({ title: 'Error loading workshop', variant: 'destructive' });
      return;
    }

    setWorkshop(data);
    setCurrentSegment(data.current_segment || 1);

    // Load bootcamp plan data for auto-population
    if (data.bootcamp_plan_id) {
      const { data: planData } = await supabase
        .from('bootcamp_plans')
        .select('*')
        .eq('id', data.bootcamp_plan_id)
        .single();
      
      setBootcampPlan(planData);
    }

    setLoading(false);
  };

  const handleSegmentChange = async (segment: number) => {
    setCurrentSegment(segment);
    await supabase
      .from('workshop_sessions')
      .update({ current_segment: segment })
      .eq('id', workshopId);
  };

  const handleGeneratePDF = async () => {
    toast({ title: 'Generating executive PDF report...' });
    
    const { data, error } = await supabase.functions.invoke('generate-executive-pdf', {
      body: { workshop_session_id: workshopId }
    });

    if (error) {
      toast({ title: 'Error generating PDF', variant: 'destructive' });
      return;
    }

    // Create download link
    const link = document.createElement('a');
    link.href = `data:application/pdf;base64,${data.pdf}`;
    link.download = `MINDMAKER_Workshop_Report_${workshop?.exec_intakes?.company_name || 'Report'}.pdf`;
    link.click();

    toast({ title: 'PDF report downloaded successfully!' });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const renderSegment = () => {
    const baseProps = {
      workshopId: workshopId!,
      bootcampPlanData: bootcampPlan,
    };

    switch (currentSegment) {
      case 1: return <Segment1Mythbuster {...baseProps} />;
      case 2: return <Segment2BottleneckBoard {...baseProps} />;
      case 3: return <Segment3EffortlessEnterprise {...baseProps} />;
      case 4: return <Segment4SimulationLab {...baseProps} />;
      case 5: return <Segment5StrategyAddendum {...baseProps} />;
      case 6: return <Segment6PilotCharter {...baseProps} />;
      case 7: return <Segment7Provocation {...baseProps} />;
      default: return <Segment1Mythbuster {...baseProps} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SegmentNavigator
        currentSegment={currentSegment}
        onSegmentChange={handleSegmentChange}
      />

      <div className="flex-1 flex flex-col">
        <header className="border-b bg-gradient-to-r from-card via-primary/5 to-card px-8 py-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {workshop?.exec_intakes?.company_name} Leadership Bootcamp
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  Facilitator: {workshop?.facilitator_name}
                </span>
                {bootcampPlan?.ai_experience_level && (
                  <span className="px-2 py-1 bg-muted rounded text-xs">
                    AI Experience: {bootcampPlan.ai_experience_level}
                  </span>
                )}
                {workshop?.exec_intakes?.industry && (
                  <span className="px-2 py-1 bg-muted rounded text-xs">
                    {workshop.exec_intakes.industry}
                  </span>
                )}
                {workshop?.participant_count > 0 && (
                  <span className="px-2 py-1 bg-muted rounded text-xs">
                    {workshop.participant_count} participants
                  </span>
                )}
              </div>
            </div>
            <Button onClick={handleGeneratePDF} size="lg" className="shadow-lg">
              <Download className="mr-2 h-5 w-5" />
              Generate PDF Report
            </Button>
          </div>

          {/* Pre-Work Progress Card */}
          {workshop?.exec_intakes?.id && (
            <div className="mt-4">
              <PreWorkProgressCard
                intakeId={workshop.exec_intakes.id}
                onViewResponses={() => setShowResponsesModal(true)}
              />
            </div>
          )}
        </header>

        <main className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-background via-background to-muted/10">
          {renderSegment()}
        </main>

        {/* Pre-Work Responses Modal */}
        {workshop?.exec_intakes?.id && (
          <PreWorkResponsesModal
            open={showResponsesModal}
            onOpenChange={setShowResponsesModal}
            intakeId={workshop.exec_intakes.id}
          />
        )}
      </div>
    </div>
  );
};
