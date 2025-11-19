import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertTriangle, CheckCircle2, Target, Clock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ReportData {
  urgency_score: number;
  urgency_label: 'Low' | 'Moderate' | 'High';
  exec_summary: string;
  strengths: string[];
  gaps: string[];
  pilot_charter: {
    title: string;
    owner: string;
    sponsor: string | null;
    linked_goal: string | null;
    expected_time_saving_percent: number | null;
    key_metrics: string[];
    milestones: {
      day_10: string;
      day_30: string;
      day_60: string;
      day_90: string;
    };
  } | null;
  appendix: {
    alignment: {
      goals: string[];
      bottlenecks: string[];
      leverage_points: string[];
    };
    simulations: {
      count: number;
      median_time_saved: number | null;
      median_quality_gain: number | null;
      highlights: string[];
    };
    journey: string[];
  };
}

interface TieredExecutiveReportProps {
  report: ReportData;
  companyName: string;
  workshopDate: string;
  participantCount: number;
}

export const TieredExecutiveReport: React.FC<TieredExecutiveReportProps> = ({
  report,
  companyName,
  workshopDate,
  participantCount
}) => {
  const getUrgencyColor = (label: string) => {
    switch (label) {
      case 'High': return 'destructive';
      case 'Moderate': return 'default';
      case 'Low': return 'secondary';
      default: return 'default';
    }
  };

  const getUrgencyIcon = (label: string) => {
    switch (label) {
      case 'High': return <AlertTriangle className="h-5 w-5" />;
      case 'Moderate': return <TrendingUp className="h-5 w-5" />;
      case 'Low': return <CheckCircle2 className="h-5 w-5" />;
      default: return <TrendingUp className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* TIER 1: Executive Header - Single screen, zero scrolling */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold mb-2">{companyName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                AI Readiness Workshop • {new Date(workshopDate).toLocaleDateString()} • {participantCount} participants
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Urgency Score</p>
                <p className="text-4xl font-bold text-primary">{report.urgency_score}</p>
              </div>
              <Badge variant={getUrgencyColor(report.urgency_label)} className="h-fit px-4 py-2 text-base">
                {getUrgencyIcon(report.urgency_label)}
                <span className="ml-2">{report.urgency_label}</span>
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* TIER 2: Synthesized Story - Max 3 cards */}
      <div className="space-y-4">
        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">{report.exec_summary}</p>
          </CardContent>
        </Card>

        {/* Strengths vs Gaps */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-green-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(report.strengths || []).map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400 font-bold mt-0.5">✓</span>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                Gaps to Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(report.gaps || []).map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-600 dark:text-orange-400 font-bold mt-0.5">!</span>
                    <span className="text-sm">{gap}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* 90-Day Pilot Charter (only if exists) */}
        {report.pilot_charter && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                90-Day Pilot Charter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-lg mb-2">{report.pilot_charter.title}</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Owner:</span> <span className="font-semibold">{report.pilot_charter.owner}</span>
                    </div>
                    {report.pilot_charter.sponsor && (
                      <div>
                        <span className="text-muted-foreground">Sponsor:</span> <span className="font-semibold">{report.pilot_charter.sponsor}</span>
                      </div>
                    )}
                    {report.pilot_charter.expected_time_saving_percent && (
                      <div>
                        <span className="text-muted-foreground">Expected Impact:</span> <span className="font-semibold text-primary">{report.pilot_charter.expected_time_saving_percent}% time saved</span>
                      </div>
                    )}
                    {report.pilot_charter.linked_goal && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Strategic Goal:</span> <span className="font-semibold">{report.pilot_charter.linked_goal}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Milestones */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h5 className="font-semibold text-sm mb-3">Milestones</h5>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-primary font-bold">Day 10:</span> {report.pilot_charter.milestones.day_10}
                    </div>
                    <div>
                      <span className="text-primary font-bold">Day 30:</span> {report.pilot_charter.milestones.day_30}
                    </div>
                    <div>
                      <span className="text-primary font-bold">Day 60:</span> {report.pilot_charter.milestones.day_60}
                    </div>
                    <div>
                      <span className="text-primary font-bold">Day 90:</span> {report.pilot_charter.milestones.day_90}
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                {report.pilot_charter.key_metrics && report.pilot_charter.key_metrics.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-sm mb-2">Success Metrics</h5>
                    <ul className="space-y-1 text-sm">
                      {(report.pilot_charter.key_metrics || []).map((metric, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{metric}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* TIER 3: Evidence Appendix - Collapsible */}
      <Collapsible>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between hover:bg-muted/50">
                <CardTitle className="text-lg">Detailed Evidence & Analysis</CardTitle>
                <ChevronDown className="h-5 w-5 transition-transform duration-200" />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              {/* Strategic Alignment */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Strategic Alignment
                </h4>
                <div className="space-y-3">
                  {(report.appendix?.alignment?.goals || []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Strategic Goals:</p>
                      <ul className="space-y-1">
                        {(report.appendix?.alignment?.goals || []).map((goal, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(report.appendix?.alignment?.bottlenecks || []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Key Bottlenecks:</p>
                      <ul className="space-y-1">
                        {(report.appendix?.alignment?.bottlenecks || []).map((bottleneck, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-orange-500">•</span>
                            <span>{bottleneck}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(report.appendix?.alignment?.leverage_points || []).length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">AI Leverage Points:</p>
                      <ul className="space-y-1">
                        {(report.appendix?.alignment?.leverage_points || []).map((point, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-green-500">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Simulation Performance */}
              {(report.appendix?.simulations?.count || 0) > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Simulation Performance
                  </h4>
                  <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Simulations Run:</span>
                      <span className="font-semibold">{report.appendix?.simulations?.count || 0}</span>
                    </div>
                    {report.appendix?.simulations?.median_time_saved && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Median Time Saved:</span>
                        <span className="font-semibold text-primary">{report.appendix.simulations.median_time_saved}%</span>
                      </div>
                    )}
                    {report.appendix?.simulations?.median_quality_gain && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Median Quality Gain:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">{report.appendix.simulations.median_quality_gain}%</span>
                      </div>
                    )}
                  </div>
                  {(report.appendix?.simulations?.highlights || []).length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Highlights:</p>
                      <ul className="space-y-1">
                        {(report.appendix?.simulations?.highlights || []).map((highlight, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-primary">→</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Workshop Journey */}
              {(report.appendix?.journey || []).length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Workshop Journey</h4>
                  <ul className="space-y-2">
                    {(report.appendix?.journey || []).map((step, idx) => (
                      <li key={idx} className="text-sm flex items-start gap-2">
                        <span className="text-primary font-bold">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
};
