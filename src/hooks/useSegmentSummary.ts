import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SegmentSummaryData {
  headline: string;
  key_points: string[];
  primary_metric?: number;
  primary_metric_label?: string;
  segment_data?: Record<string, any>;
}

export const useSegmentSummary = () => {
  const writeSegmentSummary = async (
    workshopId: string,
    segmentKey: 'mirror' | 'time_machine' | 'crystal_ball' | 'rewrite' | 'huddle' | 'draft',
    summaryData: SegmentSummaryData
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('write-segment-summary', {
        body: {
          workshop_session_id: workshopId,
          segment_key: segmentKey,
          ...summaryData
        }
      });

      if (error) throw error;

      console.log(`[useSegmentSummary] Saved ${segmentKey} summary for workshop ${workshopId}`);
      return data;
    } catch (error) {
      console.error('[useSegmentSummary] Error:', error);
      toast({
        title: 'Could not save segment summary',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      return null;
    }
  };

  return { writeSegmentSummary };
};
