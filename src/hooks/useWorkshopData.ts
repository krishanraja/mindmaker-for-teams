/**
 * Workshop Data Hooks
 * 
 * Provides data fetching for workshop sessions, bootcamp plans, and activity sessions.
 * All hooks follow the standard return shape pattern for consistency.
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { WorkshopSession, BootcampPlan, ActivitySession } from '@/types/workshop';
import { createScopedLogger } from '@/lib/logger';

const log = createScopedLogger('useWorkshopData');

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
    
    log.info('Loading workshop session', { workshopId });
    
    try {
      const { data, error: fetchError } = await supabase
        .from('workshop_sessions')
        .select('*, exec_intakes(*)')
        .eq('id', workshopId)
        .single();

      if (fetchError) throw fetchError;
      setWorkshop(data as unknown as WorkshopSession);
      log.info('Workshop loaded successfully', { workshopId });
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj);
      log.error('Error loading workshop', { workshopId, error: errorObj.message });
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
    
    log.info('Loading bootcamp plan', { planId });
    
    try {
      const { data, error: fetchError } = await supabase
        .from('bootcamp_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (fetchError) throw fetchError;
      setBootcampPlan(data as unknown as BootcampPlan);
      log.info('Bootcamp plan loaded successfully', { planId });
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj);
      log.error('Error loading bootcamp plan', { planId, error: errorObj.message });
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
    
    log.info('Loading activity session', { workshopId, activityType });
    
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
      log.info('Activity session loaded', { workshopId, activityType, found: !!data });
    } catch (err) {
      const errorObj = err as Error;
      setError(errorObj);
      log.error('Error loading activity session', { workshopId, activityType, error: errorObj.message });
    } finally {
      setLoading(false);
    }
  };
  
  return { activitySession, setActivitySession, loading, error, loadActivitySession };
};
