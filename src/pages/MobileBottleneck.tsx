import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Eye, Send, CheckCircle2 } from 'lucide-react';

export const MobileBottleneck: React.FC = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const [participantName, setParticipantName] = useState('');
  const [bottleneckText, setBottleneckText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!participantName || !bottleneckText) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('bottleneck_submissions')
      .insert({
        workshop_session_id: workshopId,
        participant_name: participantName,
        bottleneck_text: bottleneckText,
      });

    setLoading(false);

    if (error) {
      toast({ title: 'Error submitting', variant: 'destructive' });
      return;
    }

    setSubmitted(true);
    toast({ title: 'Bottleneck submitted!' });
  };

  if (submitted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4">
        <Card className="w-full max-w-md shadow-xl border-2 border-primary/20">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-3 text-foreground">Thank You!</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Your bottleneck has been submitted and is now visible on the facilitator board.
            </p>
            <Button 
              onClick={() => {
                setSubmitted(false);
                setParticipantName('');
                setBottleneckText('');
              }} 
              variant="outline"
              size="lg"
              className="w-full"
            >
              Submit Another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-background p-4 overflow-hidden">
      <Card className="w-full max-w-md shadow-2xl border-2 border-primary/20">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center mb-6">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 shadow-lg">
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-center text-foreground mb-2">
              The Mirror
            </h1>
            <p className="text-sm text-muted-foreground text-center leading-relaxed">
              What's the biggest organizational bottleneck preventing your team from being more effective?
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-semibold">Your Name</Label>
              <Input
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="John Doe"
                className="mt-1.5 h-11"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold">Describe the Bottleneck</Label>
              <Textarea
                rows={4}
                value={bottleneckText}
                onChange={(e) => setBottleneckText(e.target.value)}
                placeholder="Too many approval layers, manual data entry, unclear decision authority..."
                className="mt-1.5 resize-none"
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              className="w-full h-12 text-base font-semibold shadow-lg" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Submit Bottleneck
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
