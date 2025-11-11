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
        
        {/* Header Section */}
        <div className="border-b border-border/20 pb-12 mb-4">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-4xl font-semibold text-foreground">
              Strategic Readiness Assessment
            </h1>
            <p className="text-xl text-muted-foreground">
              Data-driven insights from your AI Leadership Bootcamp
            </p>
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

          <div className="border border-border bg-card rounded-lg p-8 shadow-sm">
            <div className="text-center space-y-3">
              <p className="text-2xl md:text-3xl font-semibold text-foreground">
                Every 90 days of delay = 15% advantage to AI-native competitors
              </p>
              <p className="text-base text-muted-foreground">
                The competitive landscape is evolving rapidly.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
