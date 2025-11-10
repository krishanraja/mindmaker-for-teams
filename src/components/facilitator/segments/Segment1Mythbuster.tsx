import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';

interface Segment1MythbusterProps {
  workshopId: string;
}

export const Segment1Mythbuster: React.FC<Segment1MythbusterProps> = () => {
  const myths = [
    {
      myth: 'AI will replace all jobs',
      reality: 'AI augments human work - the Doorman Theory shows AI handles routine tasks while humans focus on judgment and relationships'
    },
    {
      myth: 'We need to become coders',
      reality: 'Leadership is about directing AI, not programming it. Think CEO, not CTO.'
    },
    {
      myth: 'AI is too risky to use',
      reality: 'The real risk is falling behind. With proper guardrails, AI is your competitive advantage.'
    },
    {
      myth: 'AI is a silver bullet',
      reality: 'AI is a tool. Success requires clear objectives, proper training, and organizational readiness.'
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Segment 1: Mythbuster (30 minutes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            <strong>Objective:</strong> Debunk common AI misconceptions and establish a foundation of realistic expectations.
          </p>
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Key Talking Points:</h3>
            {myths.map((item, idx) => (
              <Card key={idx} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <div className="font-semibold text-foreground mb-2">
                    Myth: {item.myth}
                  </div>
                  <div className="text-muted-foreground">
                    Reality: {item.reality}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-primary/10">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">The Pendulum Theory</h4>
              <p className="text-sm text-muted-foreground">
                AI adoption follows a pendulum: Initial hype → Disappointment → Realistic integration. 
                Most organizations are moving from hype to practical application. Your goal is to skip the disappointment phase.
              </p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};
