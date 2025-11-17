import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Segment1MythbusterProps {
  workshopId: string;
  bootcampPlanData?: any;
}

export const Segment1Mythbuster: React.FC<Segment1MythbusterProps> = ({ workshopId, bootcampPlanData }) => {
  const [aiMyths, setAiMyths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAIMyths();
  }, [bootcampPlanData]);

  const loadAIMyths = async () => {
    if (!bootcampPlanData?.intake_id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('analyze-prework-myths', {
        body: { intake_id: bootcampPlanData.intake_id }
      });

      if (!error && data?.myths) {
        setAiMyths(data.myths);
      }
    } catch (error) {
      console.error('Error loading AI myths:', error);
    } finally {
      setLoading(false);
    }
  };

  const fallbackMyths = [
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

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Analyzing pre-workshop responses...</span>
            </div>
          ) : aiMyths.length > 0 ? (
            <Card className="bg-primary/10 border-2 border-primary/30">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">AI-Analyzed from Team Input</span>
                  Team-Specific Myths & Concerns
                </h4>
                <div className="space-y-4">
                  {aiMyths.map((item, idx) => (
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
              </CardContent>
            </Card>
          ) : null}

          {bootcampPlanData?.ai_myths_concerns && bootcampPlanData.ai_myths_concerns.length > 0 && (
            <Card className="bg-accent/10 border-2 border-accent/30">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded">From Organizer Intake</span>
                  Additional Concerns to Address
                </h4>
                <ul className="space-y-2">
                  {bootcampPlanData.ai_myths_concerns.map((concern: string, idx: number) => (
                    <li key={idx} className="text-foreground flex gap-2">
                      <span className="text-primary">•</span>
                      <span>{concern}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">General Talking Points:</h3>
            {fallbackMyths.map((item, idx) => (
              <Card key={idx} className="border-l-4 border-l-muted">
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
