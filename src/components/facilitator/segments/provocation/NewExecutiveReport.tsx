import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { DecisionFrameworkDisplay } from './DecisionFrameworkDisplay';

interface NewExecutiveReportProps {
  workshopId: string;
}

export const NewExecutiveReport: React.FC<NewExecutiveReportProps> = ({ workshopId }) => {
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [framework, setFramework] = useState<any>(null);
  const [workshop, setWorkshop] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFramework();
  }, [workshopId]);

  const loadFramework = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch workshop details
      const { data: workshopData, error: workshopError } = await supabase
        .from('workshop_sessions')
        .select('*, exec_intakes(*)')
        .eq('id', workshopId)
        .single();

      if (workshopError) throw workshopError;
      setWorkshop(workshopData);

      // Try to load existing framework
      const { data: existingFramework } = await supabase
        .from('decision_frameworks')
        .select('*')
        .eq('workshop_session_id', workshopId)
        .maybeSingle();

      if (existingFramework) {
        console.log('[NewExecutiveReport] Loaded existing framework:', existingFramework);
        setFramework(existingFramework);
        setLoading(false);
        return;
      }

      // No existing framework - generate new one
      await generateFramework();
    } catch (err) {
      console.error('[NewExecutiveReport] Error loading framework:', err);
      setError(err instanceof Error ? err.message : 'Failed to load framework');
      toast({
        title: 'Error loading framework',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const generateFramework = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[NewExecutiveReport] Generating framework for workshop:', workshopId);
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-decision-framework', {
        body: { workshop_session_id: workshopId }
      });

      if (functionError) throw functionError;
      if (!data || !data.framework) throw new Error('No framework data returned');

      console.log('[NewExecutiveReport] Framework generated successfully');
      setFramework(data.framework);

      toast({
        title: 'Framework generated!',
        description: 'Your decision framework is ready'
      });
    } catch (err) {
      console.error('[NewExecutiveReport] Error generating framework:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate framework');
      toast({
        title: 'Error generating framework',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await generateFramework();
    setRegenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Building your decision framework...</p>
          <p className="text-sm text-muted-foreground">Analyzing how your team decides together</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-destructive font-semibold">Failed to load framework</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={loadFramework} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!framework) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No framework available</p>
            <Button onClick={generateFramework}>
              Generate Framework
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Your Decision Framework</h1>
          <p className="text-base text-muted-foreground">How your team makes AI decisions together</p>
        </div>
        <Button
          onClick={handleRegenerate}
          disabled={regenerating}
          variant="outline"
          size="sm"
        >
          {regenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Regenerate Framework
            </>
          )}
        </Button>
      </div>

      <DecisionFrameworkDisplay
        framework={framework}
        companyName={workshop?.exec_intakes?.company_name || 'Organization'}
        workshopDate={workshop?.workshop_date || new Date().toISOString()}
        participantCount={Array.isArray(workshop?.exec_intakes?.participants) ? workshop.exec_intakes.participants.length : 0}
        workshopId={workshopId}
      />
    </div>
  );
};
