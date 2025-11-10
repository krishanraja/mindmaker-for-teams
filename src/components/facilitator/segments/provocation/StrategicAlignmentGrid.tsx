import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, AlertCircle, Lightbulb, Calendar } from 'lucide-react';

interface StrategicAlignmentGridProps {
  strategicGoals?: string;
  bottleneckClusters: string[];
  aiLeveragePoints?: any[];
  pilotMilestones?: {
    d10?: string;
    d30?: string;
    d60?: string;
    d90?: string;
  };
}

export const StrategicAlignmentGrid: React.FC<StrategicAlignmentGridProps> = ({
  strategicGoals,
  bottleneckClusters,
  aiLeveragePoints = [],
  pilotMilestones = {}
}) => {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-6 w-6" />
          Strategic Alignment Dashboard
        </CardTitle>
        <p className="text-muted-foreground">How your pilot connects to strategic goals</p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-6">
          {/* Column 1: Strategic Goals */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">2026 Strategic Goals</h3>
            </div>
            <div className="space-y-2">
              {strategicGoals ? (
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                  {strategicGoals}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No strategic goals specified</div>
              )}
            </div>
          </div>

          {/* Column 2: Bottlenecks */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold">Key Bottlenecks</h3>
            </div>
            <div className="space-y-2">
              {bottleneckClusters.length > 0 ? (
                bottleneckClusters.slice(0, 5).map((cluster, idx) => (
                  <Badge key={idx} variant="outline" className="w-full justify-start py-2 px-3 text-sm">
                    {cluster}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic">No bottlenecks clustered yet</div>
              )}
            </div>
          </div>

          {/* Column 3: AI Leverage Points */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-warning" />
              <h3 className="font-semibold">AI Leverage Points</h3>
            </div>
            <div className="space-y-2">
              {aiLeveragePoints.length > 0 ? (
                aiLeveragePoints.slice(0, 5).map((point: any, idx) => (
                  <div key={idx} className="p-3 bg-warning/5 border border-warning/20 rounded-lg text-sm">
                    {point.description || point.title || 'Leverage point identified'}
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic">Define in Strategy Addendum</div>
              )}
            </div>
          </div>

          {/* Column 4: Pilot Milestones */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-success" />
              <h3 className="font-semibold">90-Day Milestones</h3>
            </div>
            <div className="space-y-3">
              {pilotMilestones.d10 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">Day 10</div>
                  <div className="text-sm p-2 bg-success/5 border border-success/20 rounded">
                    {pilotMilestones.d10}
                  </div>
                </div>
              )}
              {pilotMilestones.d30 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">Day 30</div>
                  <div className="text-sm p-2 bg-success/5 border border-success/20 rounded">
                    {pilotMilestones.d30}
                  </div>
                </div>
              )}
              {pilotMilestones.d60 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">Day 60</div>
                  <div className="text-sm p-2 bg-success/5 border border-success/20 rounded">
                    {pilotMilestones.d60}
                  </div>
                </div>
              )}
              {pilotMilestones.d90 && (
                <div className="space-y-1">
                  <div className="text-xs font-semibold text-muted-foreground">Day 90</div>
                  <div className="text-sm p-2 bg-success/5 border border-success/20 rounded">
                    {pilotMilestones.d90}
                  </div>
                </div>
              )}
              {!pilotMilestones.d10 && !pilotMilestones.d30 && (
                <div className="text-sm text-muted-foreground italic">Define in Pilot Charter</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
