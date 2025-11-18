import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface MythVsRealityItem {
  myth: string;
  reality: string;
}

interface MythsVsRealityProps {
  items: MythVsRealityItem[];
}

export const MythsVsReality: React.FC<MythsVsRealityProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">Myths vs Reality</h3>
            <p className="text-sm text-muted-foreground">Pre-workshop concerns vs hands-on findings</p>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-center p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Pre-Workshop Concern
                  </div>
                  <p className="text-sm text-foreground">{item.myth}</p>
                </div>
              </div>

              <ArrowRight className="w-6 h-6 text-primary mx-auto hidden md:block" />

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-1">
                    Workshop Reality
                  </div>
                  <p className="text-sm text-foreground">{item.reality}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
