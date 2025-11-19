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

  // Enforce hard caps on AI synthesis display
  const limitedSynthesis = {
    ...synthesis,
    executiveSummary: synthesis.executiveSummary?.split(' ').slice(0, 140).join(' ') || '', // Hard 140 word cap
    strengths: (synthesis.strengths || []).slice(0, 3).map(s => ({ // Max 3
      ...s,
      title: s.title?.slice(0, 100) || '', // ~12 words
      evidence: s.evidence?.slice(0, 150) || '' // ~18 words
    })),
    gaps: (synthesis.gaps || []).slice(0, 3).map(g => ({ // Max 3
      ...g,
      title: g.title?.slice(0, 100) || '',
      evidence: g.evidence?.slice(0, 150) || ''
    }))
  };

  return (
    <div className="space-y-8">
      {/* Executive Summary - Condensed */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-foreground line-clamp-4">
            {limitedSynthesis.executiveSummary}
          </p>
        </CardContent>
      </Card>

      {/* Journey Insights */}
      {limitedSynthesis.journeyInsights && (
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Workshop Journey Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {limitedSynthesis.journeyInsights.mythsBusted && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Myths Busted</h4>
                <p className="text-sm text-muted-foreground">{limitedSynthesis.journeyInsights.mythsBusted}</p>
              </div>
            )}
            {limitedSynthesis.journeyInsights.surprisingFindings && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Surprising Findings</h4>
                <p className="text-sm text-muted-foreground">{limitedSynthesis.journeyInsights.surprisingFindings}</p>
              </div>
            )}
            {limitedSynthesis.journeyInsights.momentsOfClarity && (
              <div>
                <h4 className="font-semibold text-foreground mb-2">Moments of Clarity</h4>
                <p className="text-sm text-muted-foreground">{limitedSynthesis.journeyInsights.momentsOfClarity}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Strengths & Gaps - Compact Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Strengths ({limitedSynthesis.strengths.length})
          </h3>
          <div className="space-y-2">
            {limitedSynthesis.strengths.map((strength, idx) => (
              <Card key={idx} className="p-3 bg-green-50/50 dark:bg-green-950/10 border-green-200/50">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  {strength.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{strength.evidence}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Gaps */}
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Gaps ({limitedSynthesis.gaps.length})
          </h3>
          <div className="space-y-2">
            {limitedSynthesis.gaps.map((gap, idx) => (
              <Card key={idx} className="p-3 bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50">
                <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {gap.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">{gap.evidence}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Urgency Verdict - Compact */}
      <Card className={`border-2 ${urgencyColors.border}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className={`text-5xl font-black ${urgencyColors.text} tabular-nums`}>
              {Math.round(urgencyScore)}
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <div className="flex-1">
              <Badge 
                variant="outline" 
                className="px-3 py-1 text-base font-semibold mb-2"
              >
                {urgencyScore >= 80 ? 'Critical' : urgencyScore >= 60 ? 'High' : urgencyScore >= 40 ? 'Moderate' : 'Low'} Urgency
              </Badge>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {limitedSynthesis.urgencyVerdict}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
