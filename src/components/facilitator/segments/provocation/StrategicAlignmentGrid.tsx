import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, AlertCircle, Zap, Calendar } from 'lucide-react';

interface StrategicAlignmentGridProps {
  strategicGoals?: string; // Legacy
  strategicGoalsArray?: string[]; // NEW: Clean extracted goals array
  derivedGoalsFromWorkshop?: string[];
  aiLeveragePoints?: any[];
  derivedLeveragePoints?: any[];
  pilotMilestones?: {
    d10?: string;
    d30?: string;
    d60?: string;
    d90?: string;
  };
  realisticNextSteps?: string[];
  bottleneckClusters: string[];
}

export const StrategicAlignmentGrid: React.FC<StrategicAlignmentGridProps> = ({
  strategicGoals,
  strategicGoalsArray = [],
  derivedGoalsFromWorkshop = [],
  aiLeveragePoints = [],
  derivedLeveragePoints = [],
  pilotMilestones = {},
  realisticNextSteps = [],
  bottleneckClusters
}) => {
  // Build display goals from clean data
  const displayGoals = React.useMemo(() => {
    // Priority 1: Use strategicGoalsArray if available (clean extracted goals)
    if (strategicGoalsArray && strategicGoalsArray.length > 0) {
      return strategicGoalsArray.slice(0, 3);
    }
    
    // Priority 2: Use derivedGoalsFromWorkshop
    if (derivedGoalsFromWorkshop && derivedGoalsFromWorkshop.length > 0) {
      return derivedGoalsFromWorkshop.slice(0, 3);
    }
    
    // Priority 3: Try to parse legacy strategicGoals string (for backward compat)
    if (strategicGoals && strategicGoals !== 'Not specified') {
      const parsed = strategicGoals.split(/[,;]/).map(g => g.trim()).filter(g => g.length > 10);
      if (parsed.length > 0) return parsed.slice(0, 3);
    }
    
    return [];
  }, [strategicGoalsArray, derivedGoalsFromWorkshop, strategicGoals]);
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Strategic Alignment Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground">How AI opportunities connect to strategic goals</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-4 gap-6">
          {/* Column 1: Strategic Goals */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              2026 Strategic Goals
            </h4>
            {displayGoals.length > 0 ? (
              <div className="space-y-2">
                {displayGoals.map((goal, idx) => (
                  <div key={idx} className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg">
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      {goal}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No strategic goals captured
              </div>
            )}
          </div>

          {/* Column 2: Key Bottlenecks */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Key Bottlenecks
            </h4>
            <div className="space-y-2">
              {bottleneckClusters.length > 0 ? (
                bottleneckClusters.slice(0, 4).map((cluster, idx) => (
                  <Badge key={idx} variant="outline" className="w-full justify-start py-2 px-3 text-sm">
                    {cluster}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic">
                  No bottlenecks clustered yet
                </div>
              )}
            </div>
          </div>

          {/* Column 3: AI Leverage Points */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              AI Leverage Points
            </h4>
            {aiLeveragePoints.length > 0 ? (
              <div className="space-y-2">
                {aiLeveragePoints.slice(0, 4).map((point, idx) => (
                  <div key={idx} className="p-2 bg-accent/10 border border-accent/30 rounded text-sm text-foreground">
                    {typeof point === 'string' ? point : point.description || point.title}
                  </div>
                ))}
              </div>
            ) : derivedLeveragePoints.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground italic mb-2">
                  High-impact opportunities from simulations:
                </div>
                {derivedLeveragePoints.map((point, idx) => (
                  <div key={idx} className="p-2 bg-accent/10 border border-accent/20 rounded text-sm">
                    <div className="font-medium text-foreground">{point.scenario}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {point.timeSavings} • {point.qualityRating}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Complete simulations to identify leverage points
              </div>
            )}
          </div>

          {/* Column 4: 90-Day Milestones */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              90-Day Milestones
            </h4>
            {(pilotMilestones.d10 || pilotMilestones.d30 || pilotMilestones.d60 || pilotMilestones.d90) ? (
              <div className="space-y-2">
                {pilotMilestones.d10 && (
                  <div className="p-2 bg-primary/5 border border-primary/20 rounded text-sm">
                    <span className="font-semibold text-primary">D10:</span> {pilotMilestones.d10}
                  </div>
                )}
                {pilotMilestones.d30 && (
                  <div className="p-2 bg-primary/5 border border-primary/20 rounded text-sm">
                    <span className="font-semibold text-primary">D30:</span> {pilotMilestones.d30}
                  </div>
                )}
                {pilotMilestones.d60 && (
                  <div className="p-2 bg-primary/5 border border-primary/20 rounded text-sm">
                    <span className="font-semibold text-primary">D60:</span> {pilotMilestones.d60}
                  </div>
                )}
                {pilotMilestones.d90 && (
                  <div className="p-2 bg-primary/5 border border-primary/20 rounded text-sm">
                    <span className="font-semibold text-primary">D90:</span> {pilotMilestones.d90}
                  </div>
                )}
              </div>
            ) : realisticNextSteps.length > 0 ? (
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground italic mb-2">
                  Recommended next steps:
                </div>
                {realisticNextSteps.map((step, idx) => (
                  <div key={idx} className="p-2 bg-primary/5 border border-primary/10 rounded text-sm text-foreground">
                    {step}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                Complete pilot charter to define milestones
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
