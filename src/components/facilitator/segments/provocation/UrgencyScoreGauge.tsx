import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

interface UrgencyScoreGaugeProps {
  score: number; // 0-100
}

export const UrgencyScoreGauge: React.FC<UrgencyScoreGaugeProps> = ({ score }) => {
  const getZone = (score: number) => {
    if (score >= 70) return { zone: 'critical', color: 'destructive', icon: AlertTriangle, label: 'Critical' };
    if (score >= 40) return { zone: 'caution', color: 'warning', icon: TrendingUp, label: 'Caution' };
    return { zone: 'safe', color: 'success', icon: CheckCircle2, label: 'Safe' };
  };

  const { zone, color, icon: Icon, label } = getZone(score);
  const rotation = (score / 100) * 180 - 90; // -90deg to 90deg

  return (
    <Card className="border-2">
      <CardContent className="p-8">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold mb-2">Urgency Index</h3>
          <p className="text-muted-foreground">Based on competitive landscape, timeline pressure, and AI readiness</p>
        </div>

        <div className="relative w-64 h-32 mx-auto mb-6">
          {/* Gauge background arcs */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Safe zone (green) */}
            <path
              d="M 20 95 A 80 80 0 0 1 73 23"
              fill="none"
              stroke="hsl(var(--success))"
              strokeWidth="12"
              opacity="0.3"
            />
            {/* Caution zone (yellow) */}
            <path
              d="M 73 23 A 80 80 0 0 1 127 23"
              fill="none"
              stroke="hsl(var(--warning))"
              strokeWidth="12"
              opacity="0.3"
            />
            {/* Critical zone (red) */}
            <path
              d="M 127 23 A 80 80 0 0 1 180 95"
              fill="none"
              stroke="hsl(var(--destructive))"
              strokeWidth="12"
              opacity="0.3"
            />
            
            {/* Needle */}
            <g transform={`rotate(${rotation} 100 95)`}>
              <line
                x1="100"
                y1="95"
                x2="100"
                y2="25"
                stroke="hsl(var(--foreground))"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="100" cy="95" r="6" fill="hsl(var(--foreground))" />
            </g>
          </svg>

          {/* Score display */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-5xl font-bold text-foreground">{score}</div>
            <div className="text-sm text-muted-foreground">out of 100</div>
          </div>
        </div>

        {/* Zone indicator */}
        <div className={`flex items-center justify-center gap-3 p-4 rounded-lg ${
          zone === 'critical' ? 'bg-destructive/10 text-destructive' :
          zone === 'caution' ? 'bg-warning/10 text-warning' :
          'bg-success/10 text-success'
        }`}>
          <Icon className="h-6 w-6" />
          <div className="text-lg font-semibold">{label} Zone</div>
        </div>

        {/* Score breakdown */}
        <div className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Timeline Pressure</span>
            <span className="font-medium">Strategic goals at 2026</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Competitive Threat</span>
            <span className="font-medium">Active competitors advancing</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">AI Readiness Gap</span>
            <span className="font-medium">Early experimentation stage</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
