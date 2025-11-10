import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, QrCode, Sparkles, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface Segment2BottleneckBoardProps {
  workshopId: string;
}

export const Segment2BottleneckBoard: React.FC<Segment2BottleneckBoardProps> = ({ workshopId }) => {
  const [activitySession, setActivitySession] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [clusteredSubmissions, setClusteredSubmissions] = useState<any[]>([]);
  const [isClustering, setIsClustering] = useState(false);

  useEffect(() => {
    loadSubmissions();
    subscribeToSubmissions();
  }, [workshopId]);

  const generateQRCode = async () => {
    const activityUrl = `${window.location.origin}/mobile/bottleneck/${workshopId}`;
    
    const { data, error } = await supabase
      .from('activity_sessions')
      .insert({
        workshop_session_id: workshopId,
        activity_type: 'bottleneck',
        qr_code_url: activityUrl,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error generating QR code', variant: 'destructive' });
      return;
    }

    setActivitySession(data);
    toast({ title: 'QR Code generated! Participants can now submit.' });
  };

  const loadSubmissions = async () => {
    const { data } = await supabase
      .from('bottleneck_submissions')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .order('created_at', { ascending: true });

    if (data) {
      setSubmissions(data);
      const clustered = data.filter(s => s.cluster_id);
      setClusteredSubmissions(clustered);
    }
  };

  const subscribeToSubmissions = () => {
    const channel = supabase
      .channel('bottleneck-submissions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bottleneck_submissions',
          filter: `workshop_session_id=eq.${workshopId}`
        },
        (payload) => {
          setSubmissions(prev => [...prev, payload.new]);
          toast({ title: `New submission from ${payload.new.participant_name}` });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAICluster = async () => {
    setIsClustering(true);
    toast({ title: 'AI is clustering bottlenecks...' });

    const { data, error } = await supabase.functions.invoke('cluster-bottleneck-inputs', {
      body: { workshop_session_id: workshopId }
    });

    setIsClustering(false);

    if (error) {
      toast({ title: 'Error clustering submissions', variant: 'destructive' });
      return;
    }

    toast({ title: 'Bottlenecks clustered successfully!' });
    loadSubmissions();
  };

  const getClusters = () => {
    const clusters = new Map<string, any[]>();
    clusteredSubmissions.forEach(sub => {
      if (!clusters.has(sub.cluster_id)) {
        clusters.set(sub.cluster_id, []);
      }
      clusters.get(sub.cluster_id)?.push(sub);
    });
    return Array.from(clusters.entries());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-6 w-6 text-primary" />
            Segment 2: The Mirror - Bottleneck Board (45 minutes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <strong>Objective:</strong> Identify and cluster organizational bottlenecks through team input.
          </p>

          <div className="flex gap-4">
            <Button onClick={generateQRCode} disabled={!!activitySession}>
              <QrCode className="mr-2 h-4 w-4" />
              Generate QR Code
            </Button>
            <Button 
              onClick={handleAICluster} 
              disabled={submissions.length === 0 || isClustering}
              variant="secondary"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI Cluster ({submissions.length} submissions)
            </Button>
          </div>

          {activitySession && (
            <Card className="p-6 flex flex-col items-center bg-card">
              <h3 className="font-semibold mb-4">Scan to Submit Bottlenecks</h3>
              <QRCodeSVG value={activitySession.qr_code_url} size={256} />
              <p className="text-sm text-muted-foreground mt-4">
                {activitySession.qr_code_url}
              </p>
            </Card>
          )}

          {clusteredSubmissions.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Clustered Bottlenecks</h3>
              {getClusters().map(([clusterId, items]) => (
                <Card key={clusterId} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="text-base">{items[0]?.cluster_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="text-sm p-2 bg-muted rounded">
                          <span className="font-medium">{item.participant_name}:</span> {item.bottleneck_text}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">
                {submissions.length === 0 
                  ? 'Waiting for participant submissions...'
                  : 'Click "AI Cluster" to group bottlenecks by theme'}
              </p>
              {submissions.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Unclustered Submissions ({submissions.length})</h4>
                  {submissions.map((sub) => (
                    <div key={sub.id} className="text-sm p-2 bg-muted rounded text-left">
                      <span className="font-medium">{sub.participant_name}:</span> {sub.bottleneck_text}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
