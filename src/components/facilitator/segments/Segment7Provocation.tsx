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

        {/* TOP PRIORITY: Executive Summaries Side-by-Side */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          
          {/* Business Summary */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Executive Summary: Business Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm leading-relaxed space-y-2">
                <p className="font-semibold text-foreground">Company Strategic Position</p>
                <p className="text-muted-foreground">
                  Based on pre-workshop assessments and live workshop participation, your organization demonstrates 
                  strong foundational awareness of AI opportunities with moderate implementation readiness.
                </p>
                
                <p className="font-semibold text-foreground mt-4">Key Strengths Identified</p>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Leadership alignment on AI as strategic priority</li>
                  <li>Existing technical infrastructure baseline</li>
                  <li>Clear business process documentation</li>
                </ul>
                
                <p className="font-semibold text-foreground mt-4">Critical Gaps</p>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Pilot execution framework undefined</li>
                  <li>Cross-functional coordination mechanisms</li>
                  <li>Success metrics and KPI alignment</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Session Summary */}
          <Card className="border-2 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Executive Summary: Workshop Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm leading-relaxed space-y-2">
                <p className="font-semibold text-foreground">Collective Intelligence Analysis</p>
                <p className="text-muted-foreground">
                  Your team demonstrated high engagement across simulation exercises, revealing both immediate 
                  opportunities and structural considerations for AI integration.
                </p>
                
                <p className="font-semibold text-foreground mt-4">Consensus Findings</p>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Decision velocity as primary competitive leverage point</li>
                  <li>Data accessibility barriers impacting 60% of workflows</li>
                  <li>Team readiness exceeds technical infrastructure readiness</li>
                </ul>
                
                <p className="font-semibold text-foreground mt-4">Divergence Points</p>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Risk tolerance thresholds vary by functional area</li>
                  <li>Budget allocation priorities require executive alignment</li>
                  <li>Timeline expectations need calibration</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Next Steps - PRIORITY */}
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Recommended Next Steps: 90-Day Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="font-bold text-foreground">Week 1-2: Foundation</div>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Finalize pilot charter & ownership</li>
                  <li>Establish steering committee</li>
                  <li>Define success metrics (3-5 KPIs)</li>
                  <li>Secure budget commitment</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="font-bold text-foreground">Week 3-8: Execution</div>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Launch pilot in controlled environment</li>
                  <li>Weekly progress reviews</li>
                  <li>Document learnings & iterations</li>
                  <li>Build internal case study</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <div className="font-bold text-foreground">Week 9-12: Scale Readiness</div>
                <ul className="text-muted-foreground space-y-1 ml-4 list-disc">
                  <li>Present results to executive team</li>
                  <li>Refine ROI model</li>
                  <li>Plan Phase 2 expansion</li>
                  <li>Schedule follow-up workshop</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI-Powered Executive Report Card */}
        <ExecutiveReportCard workshopId={workshopId} />

        {/* Supporting Data - Horizontal Layout */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Competitive Benchmark */}
          <div className="space-y-3">
            <SectionHeader 
              icon={<TrendingUp />}
              title="Competitive Benchmark"
              subtitle="AI-native peer operational velocity"
            />
            <div className="h-[400px]">
              <BenchmarkComparisonChart />
            </div>
          </div>

          {/* Investment Analysis */}
          <div className="space-y-3">
            <SectionHeader 
              icon={<AlertTriangle />}
              title="Investment Analysis"
              subtitle="Cost of learning vs. cost of waiting"
            />
            <div className="h-[400px]">
              <CostFramingChart />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
