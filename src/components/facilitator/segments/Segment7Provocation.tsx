import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { BenchmarkComparisonChart } from './provocation/BenchmarkComparisonChart';
import { CostFramingChart } from './provocation/CostFramingChart';
import { ExecutiveReportCard } from './provocation/ExecutiveReportCard';

interface Segment7ProvocationProps {
  workshopId: string;
}

export const Segment7Provocation: React.FC<Segment7ProvocationProps> = ({ workshopId }) => {
  return (
    <div className="space-y-12 p-8 max-w-7xl mx-auto">
      {/* Hero Section - Provocative Question */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 shadow-xl">
        <CardHeader className="text-center py-16">
          <CardTitle className="text-4xl md:text-6xl font-bold leading-tight text-foreground mb-8">
            If an AI-native startup launched tomorrow with your data...
          </CardTitle>
          <p className="text-3xl md:text-5xl font-semibold text-primary mb-6">
            Would they beat you?
          </p>
          <div className="flex items-center justify-center gap-3 text-muted-foreground mt-8">
            <AlertTriangle className="h-6 w-6" />
            <p className="text-xl">The urgency is real. The window is closing.</p>
          </div>
        </CardHeader>
      </Card>

      {/* AI-Powered Executive Report Card */}
      <ExecutiveReportCard workshopId={workshopId} />

      {/* Competitive Benchmark */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">How AI-Native Peers Operate</h2>
        </div>

        <BenchmarkComparisonChart />
      </div>

      {/* Cost Analysis */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground">Cost of Learning vs. Cost of Waiting</h2>
        </div>

        <CostFramingChart />

        <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <p className="text-2xl font-bold text-foreground">
                Every 90 days of delay = 15% advantage to AI-native competitors
              </p>
              <p className="text-lg text-muted-foreground">
                The question isn't "Should we experiment?" — it's "Can we afford not to?"
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Closing Reflection */}
      <Card className="border-2 border-border bg-gradient-to-br from-background to-accent/5">
        <CardContent className="p-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-2xl md:text-3xl font-semibold text-foreground leading-relaxed">
              The question isn't if AI will transform your industry.
            </p>
            <p className="text-2xl md:text-3xl font-semibold text-primary leading-relaxed">
              It's whether you'll lead or follow that transformation.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
