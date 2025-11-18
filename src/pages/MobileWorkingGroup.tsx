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
import { Users, Send } from 'lucide-react';
import { useWorkshopParticipants } from '@/hooks/useWorkshopParticipants';

const CATEGORIES = [
  { 
    id: 'targets_at_risk', 
    name: 'Strategic Targets at Risk',
    prompt: 'Which 2026 goals are threatened by competitive AI adoption?',
    example: 'e.g., "Revenue growth target at risk if competitors automate pricing faster"'
  },
  { 
    id: 'data_governance', 
    name: 'Data & Governance Changes',
    prompt: 'What data policies need updating to enable AI pilots?',
    example: 'e.g., "Need clearer guidelines on customer data usage for AI training"'
  },
  { 
    id: 'pilot_kpis', 
    name: '90-Day Pilot Success Metrics',
    prompt: 'How will we measure pilot success in the first 90 days?',
    example: 'e.g., "Reduce approval time by 30% or process 2x more contracts"'
  },
];

export const MobileWorkingGroup: React.FC = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const { participants, loading: loadingParticipants } = useWorkshopParticipants(workshopId);
  const [participantName, setParticipantName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [category, setCategory] = useState('');
  const [inputText, setInputText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!participantName || !tableNumber || !category || !inputText) {
      toast({ title: 'Please fill all required fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('working_group_inputs')
      .insert({
        workshop_session_id: workshopId,
        participant_name: participantName,
        table_number: parseInt(tableNumber),
        input_category: category,
        input_text: inputText,
      });

    if (error) {
      console.error('Error submitting:', error);
      toast({ title: 'Error submitting', variant: 'destructive' });
      return;
    }

    setSubmitted(true);
    toast({ title: 'Input submitted successfully!' });
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
              Your input has been submitted and is now visible on the facilitator board.
            </p>
            <Button onClick={() => {
              setSubmitted(false);
              setParticipantName('');
              setTableNumber('');
              setCategory('');
              setInputText('');
            }} variant="outline">
              Submit Another Input
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
              <Users className="h-6 w-6 text-primary" />
              Working Group Input
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Contribute to your working group's strategy addendum.
            </p>

            <div>
              <Label>Your Name *</Label>
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

            <div>
              <Label>Table Number *</Label>
              <Input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>

            <div>
              <Label>Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {category && (
                <p className="text-xs text-muted-foreground mt-2">
                  {CATEGORIES.find(c => c.id === category)?.prompt}
                </p>
              )}
            </div>

            <div>
              <Label>Your Contribution *</Label>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={category ? CATEGORIES.find(c => c.id === category)?.example : "Select a category first..."}
                rows={6}
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              Submit Input
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
