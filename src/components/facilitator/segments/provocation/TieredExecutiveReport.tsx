import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { NextStepsCard } from './NextStepsCard';
import { 
  AlertCircle, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart3,
  Sparkles,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface ReportData {
  urgency: {
    score: number;
    label: string;
    reasoning: string;
  };
  executive_summary: string;
  strengths: string[];
  gaps: string[];
  pilot_charter: {
    exists: boolean;
    owner?: string;
    sponsor?: string;
    first_milestone?: string;
    d90_goal?: string;
  };
  appendix: {
    alignment: {
      strategic_goals: string[];
      bottlenecks: string[];
      ai_leverage_points: string[];
    };
    simulations: {
      count: number;
      median_time_saved: number | null;
      median_quality_gain: number | null;
      highlights: string[];
      surprises?: string[];
    };
    journey: string[];
  };
}

interface TieredExecutiveReportProps {
  report: ReportData;
  companyName: string;
  workshopDate: string;
  participantCount: number;
  workshopId: string;
}

export const TieredExecutiveReport: React.FC<TieredExecutiveReportProps> = ({
  report,
  companyName,
  workshopDate,
  participantCount,
  workshopId
}) => {
  const [expandedEvidence, setExpandedEvidence] = useState(false);
  const [expandedUrgency, setExpandedUrgency] = useState(false);
  const [expandedSummary, setExpandedSummary] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [loadingQR, setLoadingQR] = useState(false);

  // Debug logging for workshopId
  React.useEffect(() => {
    console.log('[TieredExecutiveReport] Component mounted with workshopId:', workshopId);
    console.log('[TieredExecutiveReport] WorkshopId type:', typeof workshopId);
    console.log('[TieredExecutiveReport] WorkshopId is undefined?', workshopId === undefined);
    console.log('[TieredExecutiveReport] WorkshopId is null?', workshopId === null);
  }, [workshopId]);

  // Safe access with fallbacks
  const urgency = report.urgency || { score: 50, label: 'Moderate', reasoning: 'Assessment in progress' };
  const executiveSummary = report.executive_summary || 'Analysis is being generated based on workshop data.';
  const strengths = report.strengths || [];
  const gaps = report.gaps || [];
  const pilotCharter = report.pilot_charter || { exists: false };
  const appendix = report.appendix || { 
    alignment: { strategic_goals: [], bottlenecks: [], ai_leverage_points: [] },
    simulations: { count: 0, median_time_saved: null, median_quality_gain: null, highlights: [], surprises: [] },
    journey: []
  };

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

  const handleShowFeedbackQR = async () => {
    if (!workshopId) {
      console.error('[TieredExecutiveReport] handleShowFeedbackQR called with undefined/null workshopId');
      console.error('[TieredExecutiveReport] All props received:', { report, companyName, workshopDate, participantCount, workshopId });
      toast({
        title: 'Error',
        description: 'Workshop ID is missing - unable to generate QR code',
        variant: 'destructive'
      });
      return;
    }

    setLoadingQR(true);
    try {
      console.log('[TieredExecutiveReport] Calling generate-post-session-qr with workshopId:', workshopId);
      
      const { data, error } = await supabase.functions.invoke('generate-post-session-qr', {
        body: { workshop_session_id: workshopId }
      });

      if (error) {
        console.error('[TieredExecutiveReport] Edge function error:', error);
        throw error;
      }

      console.log('[TieredExecutiveReport] QR generation response:', data);
      setQrCodeUrl(data.qr_url);
      setReviewStats(data.review_stats);
      setShowQRDialog(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({ title: 'Failed to generate QR code', variant: 'destructive' });
    } finally {
      setLoadingQR(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TIER 1: Executive Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/20">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">{companyName}</CardTitle>
              <CardDescription className="text-base mt-2">
                AI Leadership Workshop • {new Date(workshopDate).toLocaleDateString()} • {participantCount} Participants
              </CardDescription>
            </div>
            <Badge variant={getUrgencyColor(urgency.label)} className="flex items-center gap-2 px-4 py-2">
              {getUrgencyIcon(urgency.label)}
              <span className="font-semibold">{urgency.label} Urgency</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Urgency Score</span>
                <span className="text-2xl font-bold text-primary">{urgency.score}/100</span>
              </div>
              <Progress value={urgency.score} className="h-3" />
              <div className="mt-2">
                {urgency.reasoning.length > 150 && !expandedUrgency ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      {urgency.reasoning.substring(0, 150)}...
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setExpandedUrgency(true)}
                      className="mt-1 h-auto p-0 text-primary hover:bg-transparent"
                    >
                      Read More <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">{urgency.reasoning}</p>
                    {urgency.reasoning.length > 150 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setExpandedUrgency(false)}
                        className="mt-1 h-auto p-0 text-primary hover:bg-transparent"
                      >
                        Show Less <ChevronUp className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TIER 2: Synthesized Story */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            {executiveSummary.length > 200 && !expandedSummary ? (
              <>
                <p className="text-lg leading-relaxed">
                  {executiveSummary.substring(0, 200)}...
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setExpandedSummary(true)}
                  className="mt-2 h-auto p-0 text-primary hover:bg-transparent"
                >
                  Read More <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </>
            ) : (
              <>
                <p className="text-lg leading-relaxed">{executiveSummary}</p>
                {executiveSummary.length > 200 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setExpandedSummary(false)}
                    className="mt-2 h-auto p-0 text-primary hover:bg-transparent"
                  >
                    Show Less <ChevronUp className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Key Strengths
              </h4>
              <ul className="space-y-2">
                {strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Priority Gaps
              </h4>
              <ul className="space-y-2">
                {gaps.map((gap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-600 mt-0.5">△</span>
                    <span className="text-sm">{gap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pilot Charter */}
          {pilotCharter.exists && (
            <Card className="bg-muted/30 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  90-Day Pilot Charter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {pilotCharter.owner && (
                    <div>
                      <span className="font-medium">Pilot Owner:</span> {pilotCharter.owner}
                    </div>
                  )}
                  {pilotCharter.sponsor && (
                    <div>
                      <span className="font-medium">Executive Sponsor:</span> {pilotCharter.sponsor}
                    </div>
                  )}
                </div>
                {pilotCharter.first_milestone && (
                  <p className="text-sm"><span className="font-medium">First Milestone:</span> {pilotCharter.first_milestone}</p>
                )}
                {pilotCharter.d90_goal && (
                  <p className="text-sm"><span className="font-medium">90-Day Goal:</span> {pilotCharter.d90_goal}</p>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Next Steps Card */}
      <NextStepsCard companyName={companyName} />

      {/* TIER 3: Evidence Appendix */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto"
            onClick={() => setExpandedEvidence(!expandedEvidence)}
          >
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Detailed Evidence & Analysis
            </CardTitle>
            {expandedEvidence ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </CardHeader>

        {expandedEvidence && (
          <CardContent className="space-y-6">
            {/* Strategic Alignment - Card Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Strategic Alignment</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-base">Strategic Goals</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {appendix.alignment.strategic_goals.map((goal, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{goal}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-base">Bottlenecks</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {appendix.alignment.bottlenecks.map((bottleneck, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-orange-500 text-sm mt-0.5">●</span>
                        <p className="text-sm">{bottleneck}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-green-500" />
                      <CardTitle className="text-base">AI Leverage Points</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {appendix.alignment.ai_leverage_points.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{point}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Simulation Performance - Visual Metrics */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Simulation Performance</h3>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="text-3xl font-bold text-primary">{appendix.simulations.count}</div>
                    <p className="text-sm text-muted-foreground mt-1">Simulations Run</p>
                  </CardContent>
                </Card>

                {appendix.simulations.median_time_saved !== null && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-green-600">{appendix.simulations.median_time_saved}%</div>
                      <Progress value={appendix.simulations.median_time_saved} className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-1">Median Time Saved</p>
                    </CardContent>
                  </Card>
                )}

                {appendix.simulations.median_quality_gain !== null && (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl font-bold text-blue-600">{appendix.simulations.median_quality_gain}%</div>
                      <Progress value={appendix.simulations.median_quality_gain} className="mt-2" />
                      <p className="text-sm text-muted-foreground mt-1">Quality Improvement</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Key Insights
                </h4>
                <div className="flex flex-wrap gap-2">
                  {appendix.simulations.highlights.map((highlight, idx) => (
                    <Badge key={idx} variant="secondary">{highlight}</Badge>
                  ))}
                </div>
              </div>

              {/* Surprises Section */}
              {appendix.simulations.surprises && appendix.simulations.surprises.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold flex items-center gap-2 text-amber-600 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    Surprises & Anomalies
                  </h4>
                  <ul className="space-y-2">
                    {appendix.simulations.surprises.map((surprise, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-amber-600 text-lg">⚠️</span>
                        <span className="italic">{surprise}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Workshop Journey */}
            {appendix.journey.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Workshop Journey</h3>
                <div className="space-y-2">
                  {appendix.journey.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{idx + 1}</span>
                      </div>
                      <p className="text-sm pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Post-Session Feedback QR Button */}
            <div className="mt-6 pt-6 border-t">
              <Button 
                variant="outline" 
                onClick={handleShowFeedbackQR}
                className="w-full"
                disabled={loadingQR}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {loadingQR ? 'Loading...' : 'Share Feedback QR Code'}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participant Feedback</DialogTitle>
            <DialogDescription>
              Scan this QR code to share your thoughts on the session
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={qrCodeUrl} size={256} />
              </div>
            )}
            {reviewStats && reviewStats.count > 0 && (
              <div className="text-sm text-center space-y-1">
                <p className="font-semibold">Current Averages ({reviewStats.count} responses):</p>
                <p>AI Leadership Confidence: <span className="font-bold text-primary">{reviewStats.avg_confidence}/10</span></p>
                <p>Session Enjoyment: <span className="font-bold text-primary">{reviewStats.avg_enjoyment}/10</span></p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};