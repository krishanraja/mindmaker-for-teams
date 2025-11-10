import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, QrCode, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import { AIInsightCard } from '../AIInsightCard';

interface Segment3EffortlessEnterpriseProps {
  workshopId: string;
}

const LANES = [
  { id: 'customers', name: 'Customers', color: 'bg-blue-500/20 border-blue-500' },
  { id: 'content', name: 'Content', color: 'bg-purple-500/20 border-purple-500' },
  { id: 'operations', name: 'Operations', color: 'bg-green-500/20 border-green-500' },
  { id: 'risk', name: 'Risk', color: 'bg-red-500/20 border-red-500' },
];

export const Segment3EffortlessEnterprise: React.FC<Segment3EffortlessEnterpriseProps> = ({ workshopId }) => {
  const [activitySession, setActivitySession] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [votingSession, setVotingSession] = useState<any>(null);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(false);

  useEffect(() => {
    loadItems();
    subscribeToItems();
  }, [workshopId]);

  const generateMapQR = async () => {
    const activityUrl = `${window.location.origin}/mobile/effortless-map/${workshopId}`;
    
    const { data, error } = await supabase
      .from('activity_sessions')
      .insert({
        workshop_session_id: workshopId,
        activity_type: 'effortless_map',
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
    toast({ title: 'QR Code generated! Participants can map items.' });
  };

  const generateVotingQR = async () => {
    const votingUrl = `${window.location.origin}/mobile/voting/${workshopId}`;
    
    const { data, error } = await supabase
      .from('activity_sessions')
      .insert({
        workshop_session_id: workshopId,
        activity_type: 'dot_voting',
        qr_code_url: votingUrl,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Error generating voting QR', variant: 'destructive' });
      return;
    }

    setVotingSession(data);
    toast({ title: 'Voting session started!' });
    if (items.length > 0) {
      generateInsight();
    }
  };

  const generateInsight = async () => {
    if (items.length === 0) return;
    
    setLoadingInsight(true);
    const { data, error } = await supabase.functions.invoke('generate-workshop-insights', {
      body: { 
        segment: 'effortless_map',
        data: items.map(i => ({ lane: i.lane, text: i.item_text, votes: i.vote_count }))
      }
    });

    setLoadingInsight(false);
    if (!error && data?.insight) {
      setAiInsight(data.insight);
    }
  };

  const loadItems = async () => {
    const { data } = await supabase
      .from('effortless_map_items')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .order('vote_count', { ascending: false });

    if (data) setItems(data);
  };

  const subscribeToItems = () => {
    const channel = supabase
      .channel('effortless-map-items')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'effortless_map_items',
          filter: `workshop_session_id=eq.${workshopId}`
        },
        () => loadItems()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getItemsByLane = (laneId: string) => {
    return items.filter(item => item.lane === laneId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card className="border-2 border-green-500/30 bg-gradient-to-br from-green-500/5 via-background to-green-500/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-2xl bg-green-500/20">
              <Clock className="h-10 w-10 text-green-600" />
            </div>
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2 text-xs">60 Minutes</Badge>
              <CardTitle className="text-4xl font-bold text-foreground">
                The Time Machine: Effortless Enterprise
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xl text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Objective:</strong> Map current friction points and envision an AI-augmented future state across key business areas.
          </p>

          <div className="flex gap-4 flex-wrap">
            <Button onClick={generateMapQR} disabled={!!activitySession} size="lg" className="gap-2">
              <QrCode className="h-5 w-5" />
              Generate Mapping QR
            </Button>
            <Button onClick={generateVotingQR} disabled={!items.length || !!votingSession} variant="secondary" size="lg" className="gap-2">
              <QrCode className="h-5 w-5" />
              Start Dot Voting
            </Button>
            {items.length > 0 && (
              <Button onClick={generateInsight} disabled={loadingInsight} variant="outline" size="lg" className="gap-2">
                <Sparkles className="h-5 w-5" />
                Generate AI Insight
              </Button>
            )}
          </div>

          {(aiInsight || loadingInsight) && (
            <AIInsightCard insight={aiInsight} loading={loadingInsight} />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activitySession && (
              <Card className="p-8 flex flex-col items-center bg-card border-2">
                <h4 className="font-semibold text-lg mb-4">Map Items QR Code</h4>
                <QRCodeSVG value={activitySession.qr_code_url} size={256} />
                <p className="text-xs text-muted-foreground mt-4 text-center break-all max-w-xs">
                  {activitySession.qr_code_url}
                </p>
              </Card>
            )}
            {votingSession && (
              <Card className="p-8 flex flex-col items-center bg-card border-2">
                <h4 className="font-semibold text-lg mb-4">Dot Voting QR Code</h4>
                <QRCodeSVG value={votingSession.qr_code_url} size={256} />
                <p className="text-xs text-muted-foreground mt-4 text-center break-all max-w-xs">
                  {votingSession.qr_code_url}
                </p>
              </Card>
            )}
          </div>

          <div className="grid gap-6">
            {LANES.map(lane => (
              <Card key={lane.id} className={`border-2 ${lane.color} hover:shadow-lg transition-all`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>{lane.name}</span>
                    <Badge variant="secondary">{getItemsByLane(lane.id).length} items</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getItemsByLane(lane.id).map(item => (
                      <div key={item.id} className="p-4 bg-card rounded-lg border border-border/50 hover:border-green-500/30 transition-colors">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <p className="text-base font-medium text-foreground mb-1">{item.item_text}</p>
                            <p className="text-sm text-muted-foreground">by {item.participant_name}</p>
                            {item.sponsor_name && (
                              <p className="text-sm text-green-600 mt-1">
                                💼 Sponsor: {item.sponsor_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-lg font-bold">
                              {item.vote_count} 
                            </Badge>
                            <span className="text-xs text-muted-foreground">votes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {getItemsByLane(lane.id).length === 0 && (
                      <p className="text-center py-8 text-muted-foreground">
                        No items yet
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
