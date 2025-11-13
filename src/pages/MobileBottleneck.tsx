import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Eye, Send } from 'lucide-react';

export const MobileBottleneck: React.FC = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  const [participantName, setParticipantName] = useState('');
  const [bottleneckText, setBottleneckText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!participantName || !bottleneckText) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase
      .from('bottleneck_submissions')
      .insert({
        workshop_session_id: workshopId,
        participant_name: participantName,
        bottleneck_text: bottleneckText,
      });

    if (error) {
      toast({ title: 'Error submitting', variant: 'destructive' });
      return;
    }

    setSubmitted(true);
    toast({ title: 'Bottleneck submitted!' });
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
              Your bottleneck has been submitted and is now visible on the facilitator board.
            </p>
            <Button onClick={() => {
              setSubmitted(false);
              setParticipantName('');
              setBottleneckText('');
            }} variant="outline">
              Submit Another
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
              <Eye className="h-6 w-6 text-primary" />
              Submit a Bottleneck
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              What's the biggest organizational bottleneck preventing your team from being more effective?
            </p>

            <div>
              <Label>Your Name</Label>
              <Input
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label>Describe the Bottleneck</Label>
              <Textarea
                rows={4}
                value={bottleneckText}
                onChange={(e) => setBottleneckText(e.target.value)}
                placeholder="Too many approval layers, manual data entry, unclear decision authority..."
              />
            </div>

            <Button onClick={handleSubmit} className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              Submit Bottleneck
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
