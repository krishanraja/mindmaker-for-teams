import React from 'react';
import { TrendingUp, AlertTriangle, Target, Lightbulb } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BenchmarkComparisonChart } from './provocation/BenchmarkComparisonChart';
import { CostFramingChart } from './provocation/CostFramingChart';
import { ExecutiveReportCard } from './provocation/ExecutiveReportCard';
import { SectionHeader } from './provocation/SectionHeader';

interface Segment7ProvocationProps {
  workshopId: string;
}

export const Segment7Provocation: React.FC<Segment7ProvocationProps> = ({ workshopId }) => {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-6">
        
        {/* CEO HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Executive Leadership Dashboard</h1>
          <p className="text-base text-muted-foreground">Strategic AI Readiness Assessment & Recommendations</p>
        </div>

        {/* MAIN REPORT CARD - AI Generated using workshop data */}
        <ExecutiveReportCard workshopId={workshopId} />

        {/* Benchmark Comparison */}
        <div className="space-y-3">
          <SectionHeader 
            icon={<TrendingUp className="h-5 w-5" />}
            title="Industry Benchmark Analysis"
            subtitle="How your AI readiness compares to peers"
          />
          <BenchmarkComparisonChart />
        </div>

        {/* Investment Analysis */}
        <div className="space-y-3">
          <SectionHeader 
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Cost of Inaction Analysis"
            subtitle="Competitive risk and opportunity cost projections"
          />
          <CostFramingChart />
        </div>

        {/* Strategic Recommendations */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              Next Steps & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-bold text-lg text-foreground mb-2">Immediate Actions (Next 30 Days)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">1.</span>
                    <span>Formalize executive sponsor commitment for pilot initiative</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">2.</span>
                    <span>Establish cross-functional pilot team with defined roles</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">3.</span>
                    <span>Document baseline metrics for selected use case</span>
                  </li>
                </ul>
              </div>
              
              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-bold text-lg text-foreground mb-2">Pilot Phase (90 Days)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">1.</span>
                    <span>Deploy initial AI solution in controlled environment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">2.</span>
                    <span>Implement weekly progress reviews with kill/extend criteria</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">3.</span>
                    <span>Capture learnings for organizational playbook</span>
                  </li>
                </ul>
              </div>

              <div className="border-l-4 border-primary pl-4">
                <h3 className="font-bold text-lg text-foreground mb-2">Scale Preparation (6-12 Months)</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">1.</span>
                    <span>Develop organizational AI governance framework</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">2.</span>
                    <span>Build internal capability through targeted upskilling</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold mt-1">3.</span>
                    <span>Establish pipeline of next-wave use cases</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};
