import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Clock, Send } from 'lucide-react';

const LANES = [
  { id: 'customers', name: 'Customers', description: 'Customer-facing processes' },
  { id: 'content', name: 'Content', description: 'Content creation & management' },
  { id: 'operations', name: 'Operations', description: 'Internal operations & systems' },
  { id: 'risk', name: 'Risk', description: 'Compliance & risk management' },
];

export const MobileEffortlessMap: React.FC = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const [participantName, setParticipantName] = useState('');
  const [itemText, setItemText] = useState('');
  const [selectedLane, setSelectedLane] = useState('');
  const [sponsorName, setSponsorName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!participantName || !itemText || !selectedLane) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('effortless_map_items')
      .insert({
        workshop_session_id: workshopId,
        participant_name: participantName,
        item_text: itemText,
        lane: selectedLane,
        sponsor_name: sponsorName || null,
        vote_count: 0,
      });

    if (error) {
      toast({ title: 'Error submitting', variant: 'destructive' });
      return;
    }

    setSubmitted(true);
    toast({ title: 'Item mapped successfully!' });
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
              Your item has been mapped and is now visible on the facilitator board.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Submit Another Item
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              Map an Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Identify a friction point or process that could be AI-augmented in the future state.
            </p>

            <div>
              <Label>Your Name *</Label>
              <Input
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label>Item Description *</Label>
              <Textarea
                rows={4}
                value={itemText}
                onChange={(e) => setItemText(e.target.value)}
                placeholder="Manual invoice processing, customer onboarding friction..."
              />
            </div>

            <div>
              <Label>Category *</Label>
              <Select value={selectedLane} onValueChange={setSelectedLane}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {LANES.map((lane) => (
                    <SelectItem key={lane.id} value={lane.id}>
                      <div>
                        <div className="font-medium">{lane.name}</div>
                        <div className="text-xs text-muted-foreground">{lane.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Executive Sponsor (Optional)</Label>
              <Input
                value={sponsorName}
                onChange={(e) => setSponsorName(e.target.value)}
                placeholder="Executive who could champion this"
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              Submit Item
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
