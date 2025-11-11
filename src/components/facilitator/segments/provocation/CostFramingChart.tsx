import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingDown, TrendingUp } from 'lucide-react';

export const CostFramingChart: React.FC = () => {
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-10">
        <div className="grid md:grid-cols-2 gap-10">
          {/* Cost of Learning */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <TrendingDown className="h-8 w-8 text-primary" />
              <h3 className="text-3xl font-bold text-foreground">Cost of Learning</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Investment Required</div>
                <div className="text-3xl font-bold text-foreground">$15-25K</div>
                <div className="text-sm text-muted-foreground mt-1">2-week diagnostic sprint</div>
              </div>

              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Time to First Insight</div>
                <div className="text-3xl font-bold text-foreground">30 Days</div>
                <div className="text-sm text-muted-foreground mt-1">Measurable ROI metrics</div>
              </div>

              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Risk Profile</div>
                <div className="text-3xl font-bold text-foreground">Controlled</div>
                <div className="text-sm text-muted-foreground mt-1">Scoped pilot, clear exit criteria</div>
              </div>

              <div className="p-4 bg-card border border-border rounded-lg">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Learning Transfer</div>
                <div className="text-3xl font-bold text-foreground">100%</div>
                <div className="text-sm text-muted-foreground mt-1">Internal team upskilled</div>
              </div>
            </div>

            <div className="p-6 bg-muted/30 border border-border rounded-lg text-center">
              <p className="text-lg font-bold text-foreground">
                Net Result: De-risked decision with data
              </p>
            </div>
          </div>

          {/* Cost of Waiting */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <TrendingUp className="h-8 w-8 text-destructive" />
              <h3 className="text-3xl font-bold text-destructive">Cost of Waiting</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-card border border-destructive/30 rounded-lg">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Market Share Erosion</div>
                <div className="text-3xl font-bold text-foreground">15% / Quarter</div>
                <div className="text-sm text-muted-foreground mt-1">To AI-native competitors</div>
              </div>

              <div className="p-4 bg-card border border-destructive/30 rounded-lg">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Competitor Advantage</div>
                <div className="text-3xl font-bold text-foreground">90 Days</div>
                <div className="text-sm text-muted-foreground mt-1">Of operational learning ahead</div>
              </div>

              <div className="p-4 bg-card border border-destructive/30 rounded-lg">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Opportunity Cost</div>
                <div className="text-3xl font-bold text-foreground">$250K-1M+</div>
                <div className="text-sm text-muted-foreground mt-1">Lost efficiency gains per year</div>
              </div>

              <div className="p-4 bg-card border border-destructive/30 rounded-lg">
                <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-semibold">Talent Risk</div>
                <div className="text-3xl font-bold text-foreground">High</div>
                <div className="text-sm text-muted-foreground mt-1">Best talent seeks AI-forward orgs</div>
              </div>
            </div>

            <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-lg text-center">
              <p className="text-lg font-bold text-foreground">
                Net Result: Widening competitive gap
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Formula */}
        <div className="mt-8 p-6 bg-muted border border-border rounded-lg">
          <p className="text-center text-2xl font-bold text-foreground">
            Every 90 Days of Delay = 15% Advantage to AI-Native Competitors
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
