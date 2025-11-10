import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

interface AIInsightCardProps {
  insight: string;
  loading?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight, loading }) => {
  if (loading) {
    return (
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 animate-pulse">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/20 animate-pulse">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 animate-fade-in">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-primary/20">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
              AI Insight
            </div>
            <p className="text-base leading-relaxed text-foreground">{insight}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
