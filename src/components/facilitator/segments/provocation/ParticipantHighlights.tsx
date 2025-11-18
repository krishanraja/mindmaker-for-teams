import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

interface ParticipantHighlight {
  quote: string;
  attribution: string;
  context: string;
}

interface ParticipantHighlightsProps {
  highlights: ParticipantHighlight[];
}

export const ParticipantHighlights: React.FC<ParticipantHighlightsProps> = ({ highlights }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <Card className="border shadow-sm bg-primary/5">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Quote className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Participant Highlights</h3>
            <p className="text-sm text-muted-foreground">Key insights from the team</p>
          </div>
        </div>

        <div className="space-y-6">
          {highlights.map((highlight, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-primary/30">
              <Quote className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 text-primary bg-background" />
              <div className="space-y-2">
                <p className="text-base text-foreground italic leading-relaxed">
                  "{highlight.quote}"
                </p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-medium text-primary">— {highlight.attribution}</span>
                  <span className="text-muted-foreground">• {highlight.context}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
