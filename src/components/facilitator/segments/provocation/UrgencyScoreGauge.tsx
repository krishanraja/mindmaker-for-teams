import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

interface UrgencyScoreGaugeProps {
  score: number; // 0-100
}

export const UrgencyScoreGauge: React.FC<UrgencyScoreGaugeProps> = ({ score }) => {
  const getZone = (score: number) => {
    if (score >= 70) return { zone: 'critical', color: 'rose', icon: AlertTriangle, label: 'Critical' };
    if (score >= 40) return { zone: 'caution', color: 'amber', icon: TrendingUp, label: 'Caution' };
    return { zone: 'safe', color: 'emerald', icon: CheckCircle2, label: 'Safe' };
  };

  const { zone, color, icon: Icon, label } = getZone(score);
  const rotation = (score / 100) * 180 - 90;

  const zoneColors = {
    critical: { bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-800', text: 'text-rose-600 dark:text-rose-400' },
    caution: { bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400' },
    safe: { bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400' }
  };

  return (
    <Card className="border border-border/60 shadow-lg">
      <CardContent className="p-10">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-semibold mb-3 text-foreground">Urgency Index</h3>
          <p className="text-muted-foreground text-base">Based on competitive landscape, timeline pressure, and AI readiness</p>
        </div>

        <div className="relative w-72 h-36 mx-auto mb-8">
          {/* Gauge background arcs */}
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Safe zone (emerald) */}
            <path
              d="M 20 95 A 80 80 0 0 1 73 23"
              fill="none"
              stroke="rgb(16, 185, 129)"
              strokeWidth="14"
              opacity="0.25"
            />
            {/* Caution zone (amber) */}
            <path
              d="M 73 23 A 80 80 0 0 1 127 23"
              fill="none"
              stroke="rgb(245, 158, 11)"
              strokeWidth="14"
              opacity="0.25"
            />
            {/* Critical zone (rose) */}
            <path
              d="M 127 23 A 80 80 0 0 1 180 95"
              fill="none"
              stroke="rgb(244, 63, 94)"
              strokeWidth="14"
              opacity="0.25"
            />
            
            {/* Needle */}
            <g transform={`rotate(${rotation} 100 95)`}>
              <line
                x1="100"
                y1="95"
                x2="100"
                y2="25"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="text-foreground"
              />
              <circle cx="100" cy="95" r="7" fill="currentColor" className="text-foreground" />
            </g>
          </svg>

          {/* Score display */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
            <div className="text-6xl font-semibold text-foreground">{score}</div>
            <div className="text-sm text-muted-foreground font-medium">out of 100</div>
          </div>
        </div>

        {/* Zone indicator */}
        <div className={`flex items-center justify-center gap-3 p-5 rounded-xl border ${zoneColors[zone].bg} ${zoneColors[zone].border}`}>
          <Icon className={`h-6 w-6 ${zoneColors[zone].text}`} />
          <div className={`text-xl font-semibold ${zoneColors[zone].text}`}>{label} Zone</div>
        </div>
      </CardContent>
    </Card>
  );
};
