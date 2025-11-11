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

      {/* Strengths & Gaps - Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Strengths */}
        {strengths && (
          <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 border border-emerald-200/60 dark:border-emerald-800/40 shadow-md">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">
                  Strengths Identified
                </h3>
              </div>
              <div className="space-y-4">
                {renderContent(strengths)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gaps */}
        {gaps && (
          <Card className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 border border-amber-200/60 dark:border-amber-800/40 shadow-md">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground">
                  Critical Gaps
                </h3>
              </div>
              <div className="space-y-4">
                {renderContent(gaps)}
              </div>
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
