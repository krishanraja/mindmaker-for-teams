import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Clock, Target, Sparkles } from 'lucide-react';
import { parseAIContent } from '@/lib/text-formatting';

interface AISynthesisSectionProps {
  synthesis: string;
  urgencyScore: number;
}

export const AISynthesisSection: React.FC<AISynthesisSectionProps> = ({ synthesis, urgencyScore }) => {
  // Parse sections from AI synthesis
  const parseSection = (label: string): string => {
    const regex = new RegExp(`${label}:?\\s*([\\s\\S]*?)(?=\\n\\n[A-Z]|$)`, 'i');
    const match = synthesis.match(regex);
    return match ? match[1].trim() : '';
  };

  const executiveSummary = parseSection('Executive Summary');
  const strengths = parseSection('Strengths');
  const gaps = parseSection('Gaps');
  const theWindow = parseSection('The Window');
  const verdict = parseSection('The Verdict');

  const renderContent = (text: string) => {
    const blocks = parseAIContent(text);
    return blocks.map((block, idx) => (
      block.type === 'list' ? (
        <ul key={idx} className="space-y-2 pl-6 my-4">
          {block.items.map((item, i) => (
            <li key={i} className="text-base leading-relaxed text-foreground/90 relative before:content-['•'] before:absolute before:-left-4 before:text-primary before:font-bold">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p key={idx} className="text-base leading-relaxed text-foreground/90 mb-4">
          {block.content}
        </p>
      )
    ));
  };

  const getUrgencyColor = (score: number) => {
    if (score >= 70) return { border: 'border-destructive/30', bg: 'from-destructive/10', text: 'text-destructive' };
    if (score >= 40) return { border: 'border-amber-500/30', bg: 'from-amber-500/10', text: 'text-amber-500' };
    return { border: 'border-emerald-500/30', bg: 'from-emerald-500/10', text: 'text-emerald-500' };
  };

  return (
    <div className="space-y-8">
      {/* Executive Summary - Full Width */}
      {executiveSummary && (
        <Card className="border border-border/60 shadow-lg">
          <CardContent className="p-10">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-3xl font-semibold text-foreground">
                Executive Summary
              </h3>
              <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 flex items-center gap-2 px-3 py-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Generated
              </Badge>
            </div>
            <div className="space-y-4">
              {renderContent(executiveSummary)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Gaps - Icon-Based Cards */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Strengths */}
        {strengths && (
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">
                  Strengths Identified
                </h3>
              </div>
              <ul className="space-y-3">
                {(() => {
                  const content = renderContent(strengths);
                  const firstBlock = content[0];
                  if (firstBlock && typeof firstBlock === 'object' && 'type' in firstBlock && firstBlock.type === 'list' && 'items' in firstBlock) {
                    return (firstBlock.items as string[]).slice(0, 3).map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-primary mt-1 flex-shrink-0">•</span>
                        <span className="text-sm leading-relaxed">
                          {item.length > 60 ? item.slice(0, 60) + '...' : item}
                        </span>
                      </li>
                    ));
                  }
                  return <li className="text-sm">{strengths.slice(0, 180)}...</li>;
                })()}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Gaps */}
        {gaps && (
          <Card className="bg-card border border-border shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">
                  Critical Gaps
                </h3>
              </div>
              <ul className="space-y-3">
                {(() => {
                  const content = renderContent(gaps);
                  const firstBlock = content[0];
                  if (firstBlock && typeof firstBlock === 'object' && 'type' in firstBlock && firstBlock.type === 'list' && 'items' in firstBlock) {
                    return (firstBlock.items as string[]).slice(0, 3).map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-primary mt-1 flex-shrink-0">•</span>
                        <span className="text-sm leading-relaxed">
                          {item.length > 60 ? item.slice(0, 60) + '...' : item}
                        </span>
                      </li>
                    ));
                  }
                  return <li className="text-sm">{gaps.slice(0, 180)}...</li>;
                })()}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* The Window */}
      {theWindow && (
        <Card className={`border ${getUrgencyColor(urgencyScore).border} bg-gradient-to-br ${getUrgencyColor(urgencyScore).bg} to-background shadow-md`}>
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <Clock className={`h-6 w-6 ${getUrgencyColor(urgencyScore).text}`} />
              <h3 className="text-2xl font-semibold text-foreground">The Window</h3>
              <Badge variant={urgencyScore >= 70 ? 'destructive' : 'default'} className="ml-auto">
                Urgency: {urgencyScore}/100
              </Badge>
            </div>
            <div className="space-y-4">
              {renderContent(theWindow)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* The Verdict */}
      {verdict && (
        <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-background shadow-xl">
          <CardContent className="p-10">
            <h3 className="text-3xl font-bold text-center text-foreground mb-6">The Verdict</h3>
            <div className="text-center space-y-4 text-lg">
              {renderContent(verdict)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback if no sections parsed */}
      {!executiveSummary && !strengths && !gaps && !theWindow && !verdict && (
        <Card className="border border-border/60 shadow-md">
          <CardContent className="p-8">
            <div className="space-y-4">
              {renderContent(synthesis)}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
