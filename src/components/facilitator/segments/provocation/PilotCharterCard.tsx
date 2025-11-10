import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Rocket, DollarSign, User, Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

interface PilotCharterCardProps {
  charter?: {
    pilot_owner?: string;
    executive_sponsor?: string;
    pilot_budget?: number;
    milestone_d10?: string;
    milestone_d30?: string;
    milestone_d60?: string;
    milestone_d90?: string;
    kill_criteria?: string;
    extend_criteria?: string;
    scale_criteria?: string;
  };
}

export const PilotCharterCard: React.FC<PilotCharterCardProps> = ({ charter }) => {
  if (!charter) {
    return (
      <Card className="border-2 border-dashed">
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Pilot charter not yet defined. Complete Segment 6.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          Pilot Charter Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Players */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-background rounded-lg border">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Pilot Owner</div>
              <div className="font-semibold text-lg">{charter.pilot_owner || 'TBD'}</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-background rounded-lg border">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Executive Sponsor</div>
              <div className="font-semibold text-lg">{charter.executive_sponsor || 'TBD'}</div>
            </div>
          </div>
        </div>

        {/* Budget */}
        {charter.pilot_budget && (
          <div className="flex items-center gap-3 p-4 bg-success/5 border border-success/20 rounded-lg">
            <DollarSign className="h-6 w-6 text-success" />
            <div>
              <div className="text-sm text-muted-foreground">Pilot Budget</div>
              <div className="text-2xl font-bold text-success">
                ${charter.pilot_budget.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-primary" />
            <h4 className="font-semibold">90-Day Roadmap</h4>
          </div>
          <div className="space-y-2">
            {charter.milestone_d10 && (
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                <Badge variant="outline" className="mt-0.5">D10</Badge>
                <div className="flex-1 text-sm">{charter.milestone_d10}</div>
              </div>
            )}
            {charter.milestone_d30 && (
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                <Badge variant="outline" className="mt-0.5">D30</Badge>
                <div className="flex-1 text-sm">{charter.milestone_d30}</div>
              </div>
            )}
            {charter.milestone_d60 && (
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                <Badge variant="outline" className="mt-0.5">D60</Badge>
                <div className="flex-1 text-sm">{charter.milestone_d60}</div>
              </div>
            )}
            {charter.milestone_d90 && (
              <div className="flex items-start gap-3 p-3 bg-background rounded-lg border">
                <Badge variant="outline" className="mt-0.5">D90</Badge>
                <div className="flex-1 text-sm">{charter.milestone_d90}</div>
              </div>
            )}
          </div>
        </div>

        {/* Decision Criteria */}
        <div className="grid md:grid-cols-3 gap-3">
          {charter.kill_criteria && (
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <div className="text-xs font-semibold text-destructive">Kill If</div>
              </div>
              <div className="text-sm">{charter.kill_criteria}</div>
            </div>
          )}
          {charter.extend_criteria && (
            <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-warning" />
                <div className="text-xs font-semibold text-warning">Extend If</div>
              </div>
              <div className="text-sm">{charter.extend_criteria}</div>
            </div>
          )}
          {charter.scale_criteria && (
            <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <div className="text-xs font-semibold text-success">Scale If</div>
              </div>
              <div className="text-sm">{charter.scale_criteria}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
