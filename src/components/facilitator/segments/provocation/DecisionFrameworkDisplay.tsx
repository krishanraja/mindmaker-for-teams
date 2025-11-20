import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, AlertTriangle, Lightbulb, ChevronDown, ChevronUp, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DecisionFramework {
  decision_process: string;
  decision_criteria: string[];
  tension_map: {
    [key: string]: string;
  };
  key_concepts: Array<{
    title: string;
    description: string;
  }>;
  next_steps: string[];
}

interface DecisionFrameworkDisplayProps {
  framework: DecisionFramework;
  companyName: string;
  workshopDate: string;
  participantCount: number;
  workshopId: string;
}

export const DecisionFrameworkDisplay: React.FC<DecisionFrameworkDisplayProps> = ({
  framework,
  companyName,
  workshopDate,
  participantCount,
  workshopId
}) => {
  const [expandedTensions, setExpandedTensions] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loadingQR, setLoadingQR] = useState(false);

  const handleShowFeedbackQR = async () => {
    if (!workshopId) {
      toast({
        title: 'Error',
        description: 'Workshop ID is missing',
        variant: 'destructive'
      });
      return;
    }

    setLoadingQR(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-post-session-qr', {
        body: { workshop_session_id: workshopId }
      });

      if (error) throw error;

      setQrCodeUrl(data.qr_url);
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
      {/* Header */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/20">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">{companyName}</CardTitle>
              <p className="text-base text-muted-foreground mt-2">
                AI Alignment Sprint • {new Date(workshopDate).toLocaleDateString()} • {participantCount} People
              </p>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
              <Users className="h-4 w-4" />
              Decision Framework
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* How You Decide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Users className="h-6 w-6 text-primary" />
            What We Learned About How You Decide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-3">Your Decision Process</h3>
            <p className="text-base leading-relaxed">{framework.decision_process}</p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-3">What Really Matters to You</h3>
            <p className="text-sm text-muted-foreground mb-3">
              These aren't policies—they're the filters your team actually used when deciding:
            </p>
            <ul className="space-y-2">
              {framework.decision_criteria.map((criteria, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-primary font-semibold mt-1">→</span>
                  <span className="text-base">{criteria}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Tension Map */}
      <Card>
        <CardHeader>
          <Button
            variant="ghost"
            className="w-full flex items-center justify-between p-0 h-auto"
            onClick={() => setExpandedTensions(!expandedTensions)}
          >
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              Where You Agreed vs Where You Didn't
            </CardTitle>
            {expandedTensions ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
          {!expandedTensions && (
            <p className="text-sm text-muted-foreground mt-2">
              This is the most valuable part—knowing where tensions exist helps you navigate them.
            </p>
          )}
        </CardHeader>

        {expandedTensions && (
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Tension isn't bad—it means you're wrestling with real tradeoffs. Here's what we observed:
            </p>
            {Object.entries(framework.tension_map).map(([category, observation], idx) => (
              <Card key={idx} className="border-l-4 border-l-orange-500">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 capitalize">{category.replace(/_/g, ' ')}</h4>
                  <p className="text-sm">{observation}</p>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        )}
      </Card>

      {/* Key Concepts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="h-6 w-6 text-primary" />
            Mental Models You Need
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            These concepts will help you think clearly about AI decisions:
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {framework.key_concepts.map((concept, idx) => (
            <Card key={idx} className="border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-lg mb-2">{concept.title}</h4>
                <p className="text-sm">{concept.description}</p>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl">What to Do Next</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Use this framework in real life—don't let it sit on a shelf.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {framework.next_steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <span className="text-2xl font-bold text-primary">{idx + 1}</span>
                <p className="text-base mt-1">{step}</p>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <Button 
              onClick={handleShowFeedbackQR}
              disabled={loadingQR}
              className="w-full"
              size="lg"
            >
              <QrCode className="mr-2 h-5 w-5" />
              {loadingQR ? 'Generating QR Code...' : 'Get Participant Feedback'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Share this QR code with your team to collect their reflections
            </p>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Participant Feedback QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code with participants to collect their feedback
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg">
                <QRCodeSVG value={qrCodeUrl} size={200} />
              </div>
            )}
            <p className="text-sm text-center text-muted-foreground">
              Scan to share your reflections on today's session
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
