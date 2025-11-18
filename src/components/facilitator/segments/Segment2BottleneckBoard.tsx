import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Eye, QrCode, Sparkles, Loader2, Lightbulb, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { AIInsightCard } from '../AIInsightCard';
import { AIGenerateButton } from '@/components/ui/ai-generate-button';

interface Segment2BottleneckBoardProps {
  workshopId: string;
  bootcampPlanData?: any;
}

export const Segment2BottleneckBoard: React.FC<Segment2BottleneckBoardProps> = ({ workshopId, bootcampPlanData }) => {
  const [activitySession, setActivitySession] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [clusteredSubmissions, setClusteredSubmissions] = useState<any[]>([]);
  const [isClustering, setIsClustering] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [synthesis, setSynthesis] = useState<any>(null);
  const [loadingSynthesis, setLoadingSynthesis] = useState(false);

  useEffect(() => {
    loadSubmissions();
    loadSynthesis();
    const channel = subscribeToSubmissions();
    
    return () => {
      channel.unsubscribe();
    };
  }, [workshopId]);

  const generateQRCode = async () => {
    const { data, error } = await supabase.functions.invoke('generate-activity-qr', {
      body: {
        workshop_session_id: workshopId,
        activity_type: 'bottleneck',
      },
    });

    if (error) {
      toast({ title: 'Error generating QR code', variant: 'destructive' });
      return;
    }

    setActivitySession(data.activity_session);
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
      .channel('bottleneck-submissions-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bottleneck_submissions',
          filter: `workshop_session_id=eq.${workshopId}`
        },
        async (payload) => {
          console.log('Real-time bottleneck update:', payload);
          if (payload.eventType === 'INSERT') {
            toast({ title: `New submission from ${payload.new.participant_name}` });
          }
          await loadSubmissions();
        }
      )
      .subscribe();
    
    return channel;
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
    generateInsight();
  };

  const generateInsight = async () => {
    if (submissions.length === 0) return;
    
    setLoadingInsight(true);
    const { data, error } = await supabase.functions.invoke('generate-workshop-insights', {
      body: { 
        segment: 'bottleneck',
        data: submissions.map(s => ({ text: s.bottleneck_text, cluster: s.cluster_name }))
      }
    });

    setLoadingInsight(false);
    if (!error && data?.insight) {
      setAiInsight(data.insight);
    }
  };

  const loadSynthesis = async () => {
    const { data } = await supabase
      .from('huddle_synthesis')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .maybeSingle();
    
    if (data) {
      setSynthesis(data);
    }
  };

  const handleGenerateSynthesis = async () => {
    if (submissions.length === 0) {
      toast({ title: 'No bottlenecks to synthesize', description: 'Wait for participants to submit bottlenecks first', variant: 'destructive' });
      return;
    }

    setLoadingSynthesis(true);
    toast({ title: 'AI is generating synthesis...', description: 'This may take a moment' });

    const { data, error } = await supabase.functions.invoke('generate-huddle-synthesis', {
      body: { workshop_session_id: workshopId }
    });

    setLoadingSynthesis(false);

    if (error) {
      toast({ title: 'Error generating synthesis', description: error.message, variant: 'destructive' });
      return;
    }

    if (data?.synthesis) {
      setSynthesis(data.synthesis);
      toast({ title: 'Synthesis generated!', description: `Analyzed ${data.bottleneckCount} bottlenecks` });
    }
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
    <div className="space-y-8 animate-fade-in">
      <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-500/5 via-background to-purple-500/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-2xl bg-purple-500/20">
              <Eye className="h-10 w-10 text-purple-600" />
            </div>
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2 text-xs">45 Minutes</Badge>
              <CardTitle className="text-4xl font-bold text-foreground">
                The Mirror: Bottleneck Board
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xl text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Objective:</strong> Surface and cluster the organizational friction points that slow your team down.
          </p>

          {bootcampPlanData?.current_bottlenecks && bootcampPlanData.current_bottlenecks.length > 0 && (
            <Card className="bg-primary/10 border-2 border-primary/30">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">From Customer Intake</span>
                  Pre-Identified Bottlenecks
                </h4>
                <p className="text-sm text-muted-foreground mb-2">These bottlenecks were identified during intake - use as conversation starters:</p>
                <ul className="space-y-2">
                  {bootcampPlanData.current_bottlenecks.map((bottleneck: string, idx: number) => (
                    <li key={idx} className="text-sm text-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{bottleneck}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

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
            <Card className="p-8 flex flex-col items-center bg-card border-2">
              <h3 className="font-semibold text-lg mb-4">Scan to Submit Bottlenecks</h3>
              <QRCodeSVG value={activitySession.qr_code_url} size={512} />
            </Card>
          )}

          {(aiInsight || loadingInsight) && (
            <AIInsightCard insight={aiInsight} loading={loadingInsight} />
          )}

          {/* AI Synthesis Section */}
          <Card className="border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-500/5 to-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Lightbulb className="w-6 h-6 text-indigo-600" />
                  Executive Synthesis
                </CardTitle>
                <AIGenerateButton
                  onClick={handleGenerateSynthesis}
                  disabled={loadingSynthesis || submissions.length === 0}
                >
                  {loadingSynthesis && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {loadingSynthesis ? 'Synthesizing...' : 'Generate Synthesis'}
                </AIGenerateButton>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {synthesis ? (
                <>
                  <div>
                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                      Executive Summary
                    </h4>
                    <Textarea
                      value={synthesis.synthesis_text}
                      onChange={(e) => setSynthesis({ ...synthesis, synthesis_text: e.target.value })}
                      className="min-h-[120px] text-base leading-relaxed"
                      placeholder="AI-generated executive summary will appear here..."
                    />
                  </div>

                  {synthesis.key_themes && synthesis.key_themes.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        Key Themes
                      </h4>
                      <div className="space-y-2">
                        {synthesis.key_themes.map((theme: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                            <Badge variant="outline" className="mt-1">{idx + 1}</Badge>
                            <p className="text-sm">{theme}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {synthesis.priority_actions && synthesis.priority_actions.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                        Priority Actions
                      </h4>
                      <div className="space-y-2">
                        {synthesis.priority_actions.map((action: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                            <Trophy className="w-5 h-5 text-primary mt-0.5" />
                            <p className="text-sm font-medium">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-lg">Generate AI synthesis to create an executive summary of all bottlenecks</p>
                  <p className="text-sm mt-2">Click "Generate Synthesis" after participants have submitted</p>
                </div>
              )}
            </CardContent>
          </Card>

          {clusteredSubmissions.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <span className="h-1 w-16 bg-purple-500 rounded-full"></span>
                <h3 className="font-bold text-2xl">Clustered Bottlenecks</h3>
              </div>
              <div className="grid gap-6">
                {getClusters().map(([clusterId, items]) => (
                  <Card key={clusterId} className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{items.length} items</Badge>
                        {items[0]?.cluster_name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.id} className="text-base p-4 bg-muted/50 rounded-lg border border-border/50 hover:border-purple-500/30 transition-colors">
                            <span className="font-semibold text-purple-600">{item.participant_name}:</span>{' '}
                            <span className="text-foreground">{item.bottleneck_text}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
