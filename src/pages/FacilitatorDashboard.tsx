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
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const FacilitatorDashboard: React.FC = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const [workshop, setWorkshop] = useState<any>(null);
  const [currentSegment, setCurrentSegment] = useState(1);
  const [loading, setLoading] = useState(true);

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
    switch (currentSegment) {
      case 1: return <Segment1Mythbuster workshopId={workshopId!} />;
      case 2: return <Segment2BottleneckBoard workshopId={workshopId!} />;
      case 3: return <Segment3EffortlessEnterprise workshopId={workshopId!} />;
      case 4: return <Segment4SimulationLab workshopId={workshopId!} />;
      case 5: return <Segment5StrategyAddendum workshopId={workshopId!} />;
      case 6: return <Segment6PilotCharter workshopId={workshopId!} />;
      default: return <Segment1Mythbuster workshopId={workshopId!} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SegmentNavigator
        currentSegment={currentSegment}
        onSegmentChange={handleSegmentChange}
      />

      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {workshop?.exec_intakes?.company_name} Leadership Bootcamp
            </h1>
            <p className="text-sm text-muted-foreground">
              Facilitator: {workshop?.facilitator_name}
            </p>
          </div>
          <Button onClick={handleGeneratePDF} size="lg">
            <Download className="mr-2 h-4 w-4" />
            Generate Executive PDF
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {renderSegment()}
        </main>
      </div>
    </div>
  );
};
