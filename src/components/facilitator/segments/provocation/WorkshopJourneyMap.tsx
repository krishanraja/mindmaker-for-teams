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
  riskData: {
    guardrailsCount: number;
    riskTolerance: number;
    riskLabel: string;
    redFlagsCount: number;
    topGuardrail: string;
  };
  taskData: {
    totalTasks: number;
    aiCapable: number;
    aiCapablePct: number;
    humanOnly: number;
    humanOnlyPct: number;
    topAutomation: string;
  };
  strategyData: {
    topOpportunities: number;
    workingGroupInputs: number;
    consensusArea: string;
    addendum?: {
      targetsAtRisk?: string;
      dataGovernance?: string;
      pilotKPIs?: string;
    };
    charter?: {
      pilotOwner?: string;
      executiveSponsor?: string;
      milestones?: {
        d90?: string;
      };
    };
    huddleSynthesis?: {
      priorityActions?: string[];
    };
  };
}

const extractKeyInsight = (text: string | undefined, maxLength: number = 120): string => {
  if (!text) return '';
  const firstSentence = text.split('.')[0];
  return firstSentence.length > maxLength 
    ? firstSentence.substring(0, maxLength) + '...'
    : firstSentence;
};

export const WorkshopJourneyMap: React.FC<WorkshopJourneyMapProps> = ({
  preWorkData,
  discoveryData,
  experimentData,
  riskData,
  taskData,
  strategyData
}) => {
  const percentageChange = preWorkData.anticipatedBottlenecks > 0
    ? Math.round((discoveryData.actualBottlenecks - preWorkData.anticipatedBottlenecks) / preWorkData.anticipatedBottlenecks * 100)
    : discoveryData.actualBottlenecks > 0 ? 100 : 0;

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
        discoveryData.actualBottlenecks > 0
          ? `Actually identified ${discoveryData.actualBottlenecks} bottleneck${discoveryData.actualBottlenecks !== 1 ? 's' : ''}${
              preWorkData.anticipatedBottlenecks > 0
                ? ` (${Math.abs(percentageChange)}% ${percentageChange >= 0 ? 'more' : 'fewer'} than anticipated)`
                : preWorkData.anticipatedBottlenecks === 0 && discoveryData.actualBottlenecks > 0
                ? ' (team anticipated none)'
                : ''
            }`
          : 'Team explored organizational friction points and bottlenecks',
        discoveryData.topClusters.length > 0 ? `Top clusters: ${discoveryData.topClusters.join(', ')}` : 'Discussed patterns in operational constraints',
        ...(discoveryData.mythsBusted.length > 0 ? [`Myths busted: ${discoveryData.mythsBusted[0]}`] : ['Calibrated team expectations on AI capabilities'])
      ]
    },
    {
      phase: 'Experimentation (Segment 3-4)',
      icon: <Beaker className="w-6 h-6 text-primary" />,
      insights: [
        experimentData.simulationsRun > 0 
          ? `Ran ${experimentData.simulationsRun} live simulation${experimentData.simulationsRun !== 1 ? 's' : ''} with real scenarios`
          : 'Prepared simulation frameworks for AI-augmented workflows',
        experimentData.avgTimeSavings > 0 
          ? `Average time savings: ${experimentData.avgTimeSavings}%`
          : 'Explored potential efficiency gains from AI integration',
        experimentData.avgQualityRating > 0 
          ? `Average quality rating: ${experimentData.avgQualityRating}/10`
          : 'Assessed quality considerations for AI outputs',
        ...(experimentData.keyFindings.length > 0 ? [experimentData.keyFindings[0]] : ['Team identified high-impact automation opportunities'])
      ]
    },
    {
      phase: 'Risk Mitigation (Segment 4)',
      icon: <Shield className="w-6 h-6 text-primary" />,
      insights: [
        riskData.guardrailsCount > 0 
          ? `Designed ${riskData.guardrailsCount} guardrail framework${riskData.guardrailsCount !== 1 ? 's' : ''}`
          : 'Discussed guardrail requirements for safe AI deployment',
        `Risk tolerance: ${riskData.riskTolerance}/100 (${riskData.riskLabel})`,
        riskData.redFlagsCount > 0 
          ? `Red flags identified: ${riskData.redFlagsCount}`
          : 'Reviewed potential implementation risks',
        riskData.topGuardrail || 'Established safety principles for pilot phase'
      ]
    },
    {
      phase: 'Task Breakdown (Segment 4)',
      icon: <Wrench className="w-6 h-6 text-primary" />,
      insights: [
        taskData.totalTasks > 0 
          ? `Analyzed ${taskData.totalTasks} task${taskData.totalTasks !== 1 ? 's' : ''} across simulations`
          : 'Reviewed task decomposition approach for pilot workflows',
        taskData.aiCapable > 0 
          ? `AI-capable: ${taskData.aiCapable} (${taskData.aiCapablePct}%)`
          : 'Identified automation opportunities within pilot scope',
        taskData.humanOnly > 0 
          ? `Human-only: ${taskData.humanOnly} (${taskData.humanOnlyPct}%)`
          : 'Clarified human-in-the-loop requirements',
        taskData.topAutomation || 'Prioritized quick-win automation targets'
      ]
    },
    {
      phase: 'Strategic Planning (Segment 5-6)',
      icon: <Target className="w-6 h-6 text-primary" />,
      insights: (() => {
        const insights: string[] = [];
        
        // Strategy Addendum insights (highest priority)
        if (strategyData.addendum?.targetsAtRisk) {
          insights.push(`Strategic Risk: ${extractKeyInsight(strategyData.addendum.targetsAtRisk, 120)}`);
        }
        if (strategyData.addendum?.dataGovernance) {
          insights.push(`Data Governance: ${extractKeyInsight(strategyData.addendum.dataGovernance, 120)}`);
        }
        if (strategyData.addendum?.pilotKPIs) {
          insights.push(`Pilot KPIs: ${extractKeyInsight(strategyData.addendum.pilotKPIs, 120)}`);
        }
        
        // Huddle Synthesis insights (if available and no addendum)
        if (!strategyData.addendum && strategyData.huddleSynthesis?.priorityActions?.length) {
          insights.push(`Priority: ${strategyData.huddleSynthesis.priorityActions[0]}`);
        }
        
        // Pilot Charter insights
        if (strategyData.charter?.pilotOwner) {
          const charterParts = [strategyData.charter.pilotOwner];
          if (strategyData.charter.executiveSponsor) {
            charterParts.push(`sponsored by ${strategyData.charter.executiveSponsor}`);
          }
          if (strategyData.charter.milestones?.d90) {
            charterParts.push('leading 90-day pilot');
          }
          insights.push(`Charter: ${charterParts.join(', ')}`);
        } else if (insights.length > 0) {
          insights.push('Next step: Finalize pilot owner and executive sponsor');
        }
        
        // Fallback if no rich data at all
        if (insights.length === 0) {
          return [
            strategyData.topOpportunities > 0 
              ? `Prioritized ${strategyData.topOpportunities} AI opportunit${strategyData.topOpportunities !== 1 ? 'ies' : 'y'}`
              : 'Identified strategic AI opportunities during workshop discussion',
            'Team discussed strategic implications and pilot approach',
            `Consensus: ${strategyData.consensusArea}`,
            'Next step: Document strategic targets and pilot charter'
          ];
        }
        
        return insights.slice(0, 4); // Max 4 bullets
      })()
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
