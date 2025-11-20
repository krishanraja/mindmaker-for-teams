import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Target, AlertTriangle, Brain, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { TieredExecutiveReport } from './TieredExecutiveReport';

interface NewExecutiveReportProps {
  workshopId: string;
}

export const NewExecutiveReport: React.FC<NewExecutiveReportProps> = ({ workshopId }) => {
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [framework, setFramework] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [workshop, setWorkshop] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, [workshopId]);

  const loadReport = async () => {
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

      // Try to load existing report from reports table
      const { data: existingReport } = await supabase
        .from('provocation_reports')
        .select('*')
        .eq('workshop_session_id', workshopId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingReport?.report_data) {
        console.log('[NewExecutiveReport] Loaded existing report:', existingReport);
        setReport(existingReport.report_data);
        setLoading(false);
        return;
      }

      // No existing report - generate new one
      await generateReport();
    } catch (err) {
      console.error('[NewExecutiveReport] Error loading report:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report');
      toast({
        title: 'Error loading report',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
      setLoading(false);
    }
  };

  const generateReport = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[NewExecutiveReport] Generating report for workshop:', workshopId);
      
      const { data, error: functionError } = await supabase.functions.invoke('generate-final-report', {
        body: { workshop_session_id: workshopId }
      });

      if (functionError) throw functionError;
      if (!data || !data.report) throw new Error('No report data returned');

      console.log('[NewExecutiveReport] Report generated successfully');
      setReport(data.report);

      // Save report to database
      const { error: insertError } = await supabase
        .from('provocation_reports')
        .insert({
          workshop_session_id: workshopId,
          report_data: data.report,
          generated_at: data.generated_at
        });

      if (insertError) {
        console.error('[NewExecutiveReport] Error saving report:', insertError);
      } else {
        console.log('[NewExecutiveReport] Report saved to database');
      }

      toast({
        title: 'Report generated!',
        description: 'Your executive report is ready'
      });
    } catch (err) {
      console.error('[NewExecutiveReport] Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
      toast({
        title: 'Error generating report',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    await generateReport();
    setRegenerating(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Generating your executive report...</p>
          <p className="text-sm text-muted-foreground">This may take 15-30 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-destructive font-semibold">Failed to load report</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={loadReport} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!report) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">No report available</p>
            <Button onClick={generateReport}>
              Generate Report
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
          <h1 className="text-3xl font-bold text-foreground">Executive Leadership Dashboard</h1>
          <p className="text-base text-muted-foreground">Strategic AI Readiness Assessment & Recommendations</p>
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
              Regenerate Report
            </>
          )}
        </Button>
      </div>

        <TieredExecutiveReport
          report={report}
          companyName={workshop?.exec_intakes?.company_name || 'Organization'}
          workshopDate={workshop?.workshop_date || new Date().toISOString()}
          participantCount={Array.isArray(workshop?.exec_intakes?.participants) ? workshop.exec_intakes.participants.length : 0}
          workshopId={workshopId}
        />
    </div>
  );
};
