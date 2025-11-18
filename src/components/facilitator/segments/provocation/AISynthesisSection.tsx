import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { EvidenceCard, EvidenceItem } from './EvidenceCard';

interface StrengthOrGap {
  title: string;
  evidence: string;
  impact?: string;
  recommendation?: string;
}

interface JourneyInsights {
  mythsBusted?: string;
  surprisingFindings?: string;
  momentsOfClarity?: string;
}

interface AISynthesisSectionProps {
  synthesis: {
    executiveSummary: string;
    strengths: StrengthOrGap[];
    gaps: StrengthOrGap[];
    journeyInsights?: JourneyInsights;
    urgencyVerdict: string;
  };
  urgencyScore: number;
}

const ExpandableCard: React.FC<{
  item: StrengthOrGap;
  type: 'strength' | 'gap';
}> = ({ item, type }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isStrength = type === 'strength';
  const Icon = isStrength ? CheckCircle : AlertTriangle;
  const colorClass = isStrength ? 'text-green-600' : 'text-amber-600';
  const bgClass = isStrength ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';

  // Extract metrics from evidence (look for percentages, numbers, dollar amounts)
  const extractMetrics = (text: string) => {
    const metrics: { [key: string]: string } = {};
    
    const percentMatch = text.match(/(\d+)%/);
    if (percentMatch) metrics['Impact'] = `${percentMatch[1]}%`;
    
    const ratingMatch = text.match(/(\d+\.?\d*)\/10/);
    if (ratingMatch) metrics['Rating'] = `${ratingMatch[1]}/10`;
    
    const dollarMatch = text.match(/\$(\d+[KkMm]?)/);
    if (dollarMatch) metrics['Value'] = `$${dollarMatch[1]}`;
    
    return Object.keys(metrics).length > 0 ? metrics : undefined;
  };

  const metrics = extractMetrics(item.evidence);

  return (
    <Card className={`border-2 transition-all ${isExpanded ? bgClass : 'bg-card'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={`w-6 h-6 ${colorClass} flex-shrink-0 mt-1`} />
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-foreground leading-tight">{item.title}</h4>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 space-y-4">
          <EvidenceCard>
            <EvidenceItem
              type={isStrength ? 'simulation' : 'metric'}
              label="Workshop Evidence"
              metrics={metrics}
              quote={item.evidence}
            />
          </EvidenceCard>

          {item.impact && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-1">
                    Strategic Impact
                  </div>
                  <p className="text-sm text-foreground">{item.impact}</p>
                </div>
              </div>
            </div>
          )}

          {item.recommendation && (
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">
                Recommended Action
              </div>
              <p className="text-sm text-foreground">{item.recommendation}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export const AISynthesisSection: React.FC<AISynthesisSectionProps> = ({
  synthesis,
  urgencyScore
}) => {
  const [expandedSection, setExpandedSection] = useState<'strengths' | 'gaps' | null>(null);

  const getUrgencyColor = (score: number) => {
    if (score >= 80) return { border: 'border-red-500', bg: 'bg-red-50 dark:bg-red-950/20', text: 'text-red-700 dark:text-red-400' };
    if (score >= 60) return { border: 'border-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/20', text: 'text-amber-700 dark:text-amber-400' };
    return { border: 'border-green-500', bg: 'bg-green-50 dark:bg-green-950/20', text: 'text-green-700 dark:text-green-400' };
  };

  const urgencyColors = getUrgencyColor(urgencyScore);

  const toggleSection = (section: 'strengths' | 'gaps') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-8">
      {/* Executive Summary */}
      <Card className="border shadow-sm bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
            {synthesis.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Journey Insights */}
      {synthesis.journeyInsights && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Workshop Journey Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {synthesis.journeyInsights.mythsBusted && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Myths Busted</h4>
                <p className="text-sm text-muted-foreground">{synthesis.journeyInsights.mythsBusted}</p>
              </div>
            )}
            {synthesis.journeyInsights.surprisingFindings && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Surprising Findings</h4>
                <p className="text-sm text-muted-foreground">{synthesis.journeyInsights.surprisingFindings}</p>
              </div>
            )}
            {synthesis.journeyInsights.momentsOfClarity && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Moments of Clarity</h4>
                <p className="text-sm text-muted-foreground">{synthesis.journeyInsights.momentsOfClarity}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strengths */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <CheckCircle className="w-7 h-7 text-green-600" />
            Strengths Identified ({synthesis.strengths.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSection('strengths')}
          >
            {expandedSection === 'strengths' ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>

        <div className="grid gap-4">
          {synthesis.strengths.map((strength, idx) => (
            <ExpandableCard
              key={idx}
              item={strength}
              type="strength"
            />
          ))}
        </div>
      </div>

      {/* Gaps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-amber-600" />
            Critical Gaps ({synthesis.gaps.length})
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSection('gaps')}
          >
            {expandedSection === 'gaps' ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>

        <div className="grid gap-4">
          {synthesis.gaps.map((gap, idx) => (
            <ExpandableCard
              key={idx}
              item={gap}
              type="gap"
            />
          ))}
        </div>
      </div>

      {/* Urgency Verdict */}
      <Card className={`border-2 ${urgencyColors.border} ${urgencyColors.bg}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">The Verdict: Urgency Assessment</CardTitle>
            <Badge variant="secondary" className={`text-lg px-4 py-1 ${urgencyColors.text}`}>
              {urgencyScore}/100
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base text-foreground leading-relaxed whitespace-pre-line">
            {synthesis.urgencyVerdict}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
