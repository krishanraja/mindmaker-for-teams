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
        </div>

      </div>
    </div>
  );
};
