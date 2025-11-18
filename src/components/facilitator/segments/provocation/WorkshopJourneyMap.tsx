import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Search, Beaker, Shield, Wrench, Target, ArrowRight } from 'lucide-react';

interface JourneyStageProps {
  phase: string;
  icon: React.ReactNode;
  insights: string[];
  isLast?: boolean;
}

const JourneyStage: React.FC<JourneyStageProps> = ({ phase, icon, insights, isLast }) => (
  <div className="relative">
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 pb-8">
        <h4 className="text-lg font-semibold text-foreground mb-2">{phase}</h4>
        <ul className="space-y-1.5">
          {insights.map((insight, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
    {!isLast && (
      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
    )}
  </div>
);

interface WorkshopJourneyMapProps {
  preWorkData: {
    anticipatedBottlenecks: number;
    primaryConcerns: string[];
    experienceLevel: string;
  };
  discoveryData: {
    actualBottlenecks: number;
    topClusters: string[];
    mythsBusted: string[];
  };
  experimentData: {
    simulationsRun: number;
    avgTimeSavings: number;
    avgQualityRating: number;
    keyFindings: string[];
  };
  strategyData: {
    pilotOwner?: string;
    budget?: number;
    topOpportunities: number;
  };
}

export const WorkshopJourneyMap: React.FC<WorkshopJourneyMapProps> = ({
  preWorkData,
  discoveryData,
  experimentData,
  strategyData
}) => {
  const stages = [
    {
      phase: 'Pre-Workshop',
      icon: <FileText className="w-6 h-6 text-primary" />,
      insights: [
        `Team anticipated ${preWorkData.anticipatedBottlenecks} bottlenecks`,
        `Primary concerns: ${preWorkData.primaryConcerns.join(', ')}`,
        `Experience level: ${preWorkData.experienceLevel}`
      ]
    },
    {
      phase: 'Discovery (Segment 1-2)',
      icon: <Search className="w-6 h-6 text-primary" />,
      insights: [
        `Actually identified ${discoveryData.actualBottlenecks} bottlenecks (${Math.round((discoveryData.actualBottlenecks - preWorkData.anticipatedBottlenecks) / preWorkData.anticipatedBottlenecks * 100)}% more)`,
        `Top clusters: ${discoveryData.topClusters.join(', ')}`,
        ...(discoveryData.mythsBusted.length > 0 ? [`Myths busted: ${discoveryData.mythsBusted[0]}`] : [])
      ]
    },
    {
      phase: 'Experimentation (Segment 3-4)',
      icon: <Beaker className="w-6 h-6 text-primary" />,
      insights: [
        `Ran ${experimentData.simulationsRun} live simulations with real scenarios`,
        `Average time savings: ${experimentData.avgTimeSavings}%`,
        `Average quality rating: ${experimentData.avgQualityRating}/10`,
        ...(experimentData.keyFindings.length > 0 ? [experimentData.keyFindings[0]] : [])
      ]
    },
    {
      phase: 'Risk Mitigation (Segment 4)',
      icon: <Shield className="w-6 h-6 text-primary" />,
      insights: [
        'Designed guardrails with clear human checkpoints',
        'Identified red flags and validation requirements',
        'Established risk tolerance frameworks'
      ]
    },
    {
      phase: 'Task Breakdown (Segment 4)',
      icon: <Wrench className="w-6 h-6 text-primary" />,
      insights: [
        'Analyzed AI vs human capabilities',
        'Mapped automation opportunities',
        'Defined human oversight requirements'
      ]
    },
    {
      phase: 'Strategic Planning (Segment 5-6)',
      icon: <Target className="w-6 h-6 text-primary" />,
      insights: [
        `Prioritized ${strategyData.topOpportunities} AI opportunities`,
        `Pilot owner: ${strategyData.pilotOwner || 'TBD - requires executive decision'}`,
        strategyData.budget ? `Budget allocated: $${strategyData.budget.toLocaleString()}` : 'Budget pending executive approval'
      ]
    }
  ];

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-foreground">The Workshop Journey</h3>
            <p className="text-sm text-muted-foreground">From assumptions to hands-on reality</p>
          </div>
        </div>

        <div className="space-y-2">
          {stages.map((stage, idx) => (
            <JourneyStage
              key={stage.phase}
              {...stage}
              isLast={idx === stages.length - 1}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
