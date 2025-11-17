import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ThumbsUp, Send } from 'lucide-react';
import { useWorkshopParticipants } from '@/hooks/useWorkshopParticipants';

export const MobileDotVoting: React.FC = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const { participants, loading: loadingParticipants } = useWorkshopParticipants(workshopId);
  const [participantName, setParticipantName] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [votes, setVotes] = useState<{ [key: string]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const MAX_VOTES = 3;

  useEffect(() => {
    loadItems();
  }, [workshopId]);

  const loadItems = async () => {
    const { data } = await supabase
      .from('effortless_map_items')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .order('created_at', { ascending: true });

    if (data) setItems(data);
  };

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0);

  const handleVote = (itemId: string, increment: number) => {
    const currentVotes = votes[itemId] || 0;
    const newVotes = currentVotes + increment;

    if (newVotes < 0) return;
    if (totalVotes + increment > MAX_VOTES) {
      toast({ title: `You only have ${MAX_VOTES} votes total`, variant: 'destructive' });
      return;
    }

    setVotes({ ...votes, [itemId]: newVotes });
  };

  const handleSubmit = async () => {
    if (!participantName) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }

    if (totalVotes === 0) {
      toast({ title: 'Please cast at least one vote', variant: 'destructive' });
      return;
    }

    // Update vote counts for each item
    for (const [itemId, voteCount] of Object.entries(votes)) {
      if (voteCount > 0) {
        const item = items.find((i) => i.id === itemId);
        await supabase
          .from('effortless_map_items')
          .update({ vote_count: (item?.vote_count || 0) + voteCount })
          .eq('id', itemId);
      }
    }

    setSubmitted(true);
    toast({ title: 'Votes submitted!' });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Thank you!</h2>
            <p className="text-muted-foreground mb-4">
              Your votes have been recorded and are now reflected on the facilitator board.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ThumbsUp className="h-6 w-6 text-primary" />
              Dot Voting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                You have <strong>{MAX_VOTES - totalVotes}</strong> votes remaining out of {MAX_VOTES}.
              </p>
              <p className="text-xs text-muted-foreground">
                Vote for the items you think are most important to prioritize.
              </p>
            </div>

            <div>
              <Label>Your Name</Label>
              <Select value={participantName} onValueChange={setParticipantName}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingParticipants ? "Loading..." : "Select your name"} />
                </SelectTrigger>
                <SelectContent>
                  {participants.map((p) => (
                    <SelectItem key={p.email} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {items.map((item) => {
            const myVotes = votes[item.id] || 0;
            return (
              <Card key={item.id} className="border-2">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="capitalize">
                          {item.lane}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          by {item.participant_name}
                        </span>
                      </div>
                      <p className="text-sm">{item.item_text}</p>
                      {item.sponsor_name && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Sponsor: {item.sponsor_name}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(item.id, 1)}
                        disabled={totalVotes >= MAX_VOTES}
                      >
                        +
                      </Button>
                      <div className="text-lg font-bold">{myVotes}</div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(item.id, -1)}
                        disabled={myVotes === 0}
                      >
                        -
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button onClick={handleSubmit} className="w-full" size="lg">
          <Send className="mr-2 h-4 w-4" />
          Submit {totalVotes} Vote{totalVotes !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
};
