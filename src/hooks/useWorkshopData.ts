import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkshopSession, BootcampPlan, ActivitySession } from '@/types/workshop';

export const useWorkshopSession = (workshopId: string | undefined) => {
  const [workshop, setWorkshop] = useState<WorkshopSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!workshopId) {
      setLoading(false);
      return;
    }
    loadWorkshop();
  }, [workshopId]);
  
  const loadWorkshop = async () => {
    if (!workshopId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('workshop_sessions')
        .select('*, exec_intakes(*)')
        .eq('id', workshopId)
        .single();

      if (fetchError) throw fetchError;
      setWorkshop(data as unknown as WorkshopSession);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading workshop:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return { workshop, loading, error, reload: loadWorkshop };
};

export const useBootcampPlan = (planId: string | undefined) => {
  const [bootcampPlan, setBootcampPlan] = useState<BootcampPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    if (!planId) {
      setLoading(false);
      return;
    }
    loadBootcampPlan();
  }, [planId]);
  
  const loadBootcampPlan = async () => {
    if (!planId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('bootcamp_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (fetchError) throw fetchError;
      setBootcampPlan(data as unknown as BootcampPlan);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading bootcamp plan:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return { bootcampPlan, loading, error, reload: loadBootcampPlan };
};

export const useActivitySession = (workshopId: string | undefined, activityType: string) => {
  const [activitySession, setActivitySession] = useState<ActivitySession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const loadActivitySession = async () => {
    if (!workshopId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('activity_sessions')
        .select('*')
        .eq('workshop_session_id', workshopId)
        .eq('activity_type', activityType)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setActivitySession(data as unknown as ActivitySession | null);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading activity session:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return { activitySession, setActivitySession, loading, error, loadActivitySession };
};
