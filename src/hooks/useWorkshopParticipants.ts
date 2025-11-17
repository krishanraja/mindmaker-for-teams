import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Participant {
  name: string;
  email: string;
  role: string;
}

export const useWorkshopParticipants = (workshopId: string | undefined) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workshopId) {
      setLoading(false);
      return;
    }

    const fetchParticipants = async () => {
      setLoading(true);
      
      // Get workshop session
      const { data: workshop } = await supabase
        .from('workshop_sessions')
        .select('bootcamp_plan_id')
        .eq('id', workshopId)
        .single();

      if (!workshop?.bootcamp_plan_id) {
        setLoading(false);
        return;
      }

      // Get bootcamp plan
      const { data: bootcamp } = await supabase
        .from('bootcamp_plans')
        .select('intake_id')
        .eq('id', workshop.bootcamp_plan_id)
        .single();

      if (!bootcamp?.intake_id) {
        setLoading(false);
        return;
      }

      // Get intake with participants
      const { data: intake } = await supabase
        .from('exec_intakes')
        .select('participants')
        .eq('id', bootcamp.intake_id)
        .single();

      if (intake?.participants) {
        setParticipants(intake.participants as unknown as Participant[]);
      }
      
      setLoading(false);
    };

    fetchParticipants();
  }, [workshopId]);

  return { participants, loading };
};
