import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

interface AISynthesisSectionProps {
  synthesis: string;
  urgencyScore: number;
}

export const AISynthesisSection: React.FC<AISynthesisSectionProps> = ({ synthesis, urgencyScore }) => {
  // Parse the AI synthesis to extract structured sections
  const parseSection = (text: string, marker: string) => {
    const regex = new RegExp(`${marker}[:\\s]*([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  };

  const executiveSummary = parseSection(synthesis, 'Executive [Ss]ummary') || 
                          parseSection(synthesis, '^(.+?)(?=Strengths|Gaps|Window|Verdict)');
  const strengths = parseSection(synthesis, '✅ Strengths Identified') ||
                   parseSection(synthesis, 'Strengths');
  const gaps = parseSection(synthesis, '⚠️ Gaps to Close') ||
              parseSection(synthesis, 'Gaps');
  const window = parseSection(synthesis, '⏰ The Window');
  const verdict = parseSection(synthesis, '🎯 The Verdict') ||
                 parseSection(synthesis, 'Verdict') ||
                 parseSection(synthesis, 'Urgency [Vv]erdict');

  const getUrgencyColor = (score: number) => {
    if (score >= 70) return 'destructive';
    if (score >= 40) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      {executiveSummary && (
        <Card className="border-2 border-primary/30">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Generated Insight
              </Badge>
            </div>
            <div className="text-lg leading-relaxed text-foreground whitespace-pre-line">
              {executiveSummary}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Strengths & Gaps Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {strengths && (
          <Card className="border-2 border-success/30 bg-success/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <h3 className="text-xl font-bold">Strengths Identified</h3>
              </div>
              <div className="space-y-2 text-foreground whitespace-pre-line">
                {strengths}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gaps */}
        {gaps && (
          <Card className="border-2 border-warning/30 bg-warning/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <h3 className="text-xl font-bold">Gaps to Close</h3>
              </div>
              <div className="space-y-2 text-foreground whitespace-pre-line">
                {gaps}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* The Window */}
      {window && (
        <Card className={`border-2 border-${getUrgencyColor(urgencyScore)}/30 bg-${getUrgencyColor(urgencyScore)}/5`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" />
              <h3 className="text-xl font-bold">The Window</h3>
            </div>
            <div className="text-foreground whitespace-pre-line">
              {window}
            </div>
          </CardContent>
        </Card>
      )}

      {/* The Verdict */}
      {verdict && (
        <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="text-lg py-2 px-4">🎯 The Verdict</Badge>
            </div>
            <div className="text-xl font-semibold leading-relaxed text-foreground whitespace-pre-line">
              {verdict}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fallback: show raw synthesis if parsing fails */}
      {!executiveSummary && !strengths && !gaps && !verdict && (
        <Card className="border-2 border-primary/30">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              <Badge variant="outline" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI-Generated Analysis
              </Badge>
            </div>
            <div className="text-lg leading-relaxed text-foreground whitespace-pre-line">
              {synthesis}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
