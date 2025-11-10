import React from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { BenchmarkComparisonChart } from './provocation/BenchmarkComparisonChart';
import { CostFramingChart } from './provocation/CostFramingChart';
import { ExecutiveReportCard } from './provocation/ExecutiveReportCard';
import { SectionHeader } from './provocation/SectionHeader';

interface Segment7ProvocationProps {
  workshopId: string;
}

export const Segment7Provocation: React.FC<Segment7ProvocationProps> = ({ workshopId }) => {
  return (
    <div className="min-h-screen bg-background py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-20">
        
        {/* Hero Section - Provocative Question */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5 py-20 px-8 rounded-3xl border border-border/60 shadow-lg">
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, hsl(var(--border)) 1px, transparent 0)',
            backgroundSize: '32px 32px' 
          }} />
          
          <div className="relative max-w-5xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              If an AI-native startup launched tomorrow
              <br />
              <span className="text-primary">with your data...</span>
            </h1>
            
            <p className="text-4xl md:text-5xl font-semibold text-foreground/80">
              Would they beat you?
            </p>
            
            <div className="flex items-center justify-center gap-3 pt-6">
              <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
              <p className="text-lg text-muted-foreground font-medium">
                The urgency is real. The window is closing.
              </p>
            </div>
          </div>
        </div>

        {/* AI-Powered Executive Report Card */}
        <ExecutiveReportCard workshopId={workshopId} />

        {/* Competitive Benchmark */}
        <div className="space-y-8">
          <SectionHeader 
            icon={<TrendingUp />}
            title="How AI-Native Peers Operate"
            subtitle="Comparative analysis of operational velocity and efficiency"
          />
          <BenchmarkComparisonChart />
        </div>

        {/* Cost Analysis */}
        <div className="space-y-8">
          <SectionHeader 
            icon={<AlertTriangle />}
            title="Cost of Learning vs. Cost of Waiting"
            subtitle="Investment comparison and competitive impact analysis"
          />
          
          <CostFramingChart />

          <div className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-8 shadow-md">
            <div className="text-center space-y-4">
              <p className="text-2xl md:text-3xl font-bold text-foreground">
                Every 90 days of delay = 15% advantage to AI-native competitors
              </p>
              <p className="text-lg text-muted-foreground">
                The question isn't "Should we experiment?" — it's "Can we afford not to?"
              </p>
            </div>
          </div>
        </div>

        {/* Closing CTA */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 rounded-3xl p-16 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px' 
          }} />
          
          <div className="relative space-y-8 max-w-4xl mx-auto">
            <p className="text-3xl md:text-4xl font-semibold text-white/90 leading-relaxed">
              The question isn't if AI will transform your industry.
            </p>
            <p className="text-3xl md:text-4xl font-bold text-white leading-relaxed">
              It's whether you'll lead or follow that transformation.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
