import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Sparkles, CheckCircle2, MessageSquare, AlertTriangle } from 'lucide-react';
import { SimulationSection } from '@/lib/ai-response-parser';

interface StructuredSimulationDisplayProps {
  sections: SimulationSection[];
}

const getSectionIcon = (type: string) => {
  switch (type) {
    case 'analysis': return <BarChart className="w-5 h-5" />;
    case 'simulation': return <Sparkles className="w-5 h-5" />;
    case 'tasks': return <CheckCircle2 className="w-5 h-5" />;
    case 'discussion': return <MessageSquare className="w-5 h-5" />;
    case 'risks': return <AlertTriangle className="w-5 h-5" />;
    default: return null;
  }
};

const getSectionColor = (type: string) => {
  switch (type) {
    case 'analysis': return 'text-blue-600 dark:text-blue-400';
    case 'simulation': return 'text-purple-600 dark:text-purple-400';
    case 'tasks': return 'text-green-600 dark:text-green-400';
    case 'discussion': return 'text-orange-600 dark:text-orange-400';
    case 'risks': return 'text-red-600 dark:text-red-400';
    default: return 'text-foreground';
  }
};

export const StructuredSimulationDisplay: React.FC<StructuredSimulationDisplayProps> = ({ sections }) => {
  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <Card key={index} className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className={getSectionColor(section.type)}>
                {getSectionIcon(section.type)}
              </span>
              <span>{section.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Bullets */}
            {section.bullets && section.bullets.length > 0 && (
              <ul className="space-y-2">
                {section.bullets.map((bullet, i) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-primary mt-1">•</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Metrics */}
            {section.metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                {section.metrics.time_saved && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Time Saved</div>
                    <div className="font-semibold">{section.metrics.time_saved}</div>
                  </div>
                )}
                {section.metrics.cost_impact && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Cost Impact</div>
                    <div className="font-semibold">{section.metrics.cost_impact}</div>
                  </div>
                )}
                {section.metrics.quality_improvement && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <div className="text-xs text-muted-foreground mb-1">Quality</div>
                    <div className="font-semibold">{section.metrics.quality_improvement}</div>
                  </div>
                )}
              </div>
            )}

            {/* Task Items */}
            {section.type === 'tasks' && section.items && (
              <div className="space-y-2 mt-2">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.task}</div>
                      <div className="text-xs text-muted-foreground mt-1">{item.human_oversight}</div>
                    </div>
                    <Badge variant="secondary" className="ml-3">
                      {item.ai_capability}% AI
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Discussion Prompts */}
            {section.prompts && section.prompts.length > 0 && (
              <div className="space-y-2 mt-2">
                {section.prompts.map((prompt, i) => (
                  <div key={i} className="p-3 bg-accent/20 rounded-lg border-l-4 border-primary">
                    <p className="text-sm font-medium">{prompt}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Risk Items */}
            {section.type === 'risks' && section.items && (
              <div className="space-y-2 mt-2">
                {section.items.map((item, i) => (
                  <div key={i} className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
                    <div className="font-medium text-sm text-destructive mb-1">⚠️ {item.risk}</div>
                    <div className="text-xs text-muted-foreground">→ {item.guardrail}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
