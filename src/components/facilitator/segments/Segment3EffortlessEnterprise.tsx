import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, QrCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Segment 3: The Time Machine - Effortless Enterprise (60 minutes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <strong>Objective:</strong> Map current friction points and envision an AI-augmented future state.
          </p>

          <div className="flex gap-4">
            <Button onClick={generateMapQR} disabled={!!activitySession}>
              <QrCode className="mr-2 h-4 w-4" />
              Generate Mapping QR
            </Button>
            <Button onClick={generateVotingQR} disabled={!items.length || !!votingSession} variant="secondary">
              <QrCode className="mr-2 h-4 w-4" />
              Start Dot Voting
            </Button>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            {LANES.map(lane => (
              <Card key={lane.id} className={`border-2 ${lane.color}`}>
                <CardHeader>
                  <CardTitle className="text-base">{lane.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getItemsByLane(lane.id).map(item => (
                      <div key={item.id} className="p-2 bg-card rounded border">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.item_text}</p>
                            <p className="text-xs text-muted-foreground">by {item.participant_name}</p>
                          </div>
                          <div className="text-sm font-bold text-primary ml-2">
                            {item.vote_count} votes
                          </div>
                        </div>
                        {item.sponsor_name && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Sponsor: {item.sponsor_name}
                          </p>
                        )}
                      </div>
                    ))}
                    {getItemsByLane(lane.id).length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
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
