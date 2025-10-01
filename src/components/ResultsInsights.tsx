import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  Zap,
  Shield
} from 'lucide-react';

interface ResultsInsightsProps {
  insights: any;
}

export const ResultsInsights: React.FC<ResultsInsightsProps> = ({ insights }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Developing';
    return 'Getting Started';
  };

  return (
    <div className="space-y-6">
      {/* Strategic Summary */}
      {insights?.strategicSummary && (
        <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Strategic Assessment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {insights.strategicSummary}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Score Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI Maturity */}
        {insights?.aiMaturityScore !== undefined && (
          <Card className="glass-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">AI Maturity</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insights.aiMaturityScore)}`}>
                    {insights.aiMaturityScore}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {getScoreLabel(insights.aiMaturityScore)}
              </Badge>
            </div>
          </Card>
        )}

        {/* Revenue Impact */}
        {insights?.revenueImpactPotential !== undefined && (
          <Card className="glass-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revenue Impact</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insights.revenueImpactPotential)}`}>
                    {insights.revenueImpactPotential}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {getScoreLabel(insights.revenueImpactPotential)}
              </Badge>
            </div>
          </Card>
        )}

        {/* Implementation Readiness */}
        {insights?.implementationReadiness !== undefined && (
          <Card className="glass-card">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Readiness</p>
                  <p className={`text-2xl font-bold ${getScoreColor(insights.implementationReadiness)}`}>
                    {insights.implementationReadiness}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                {getScoreLabel(insights.implementationReadiness)}
              </Badge>
            </div>
          </Card>
        )}
      </div>

      {/* Key Opportunities */}
      {insights?.recommendations && insights.recommendations.length > 0 && (
        <Card className="glass-card">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-bold">Key Opportunities</h3>
            </div>
            <ul className="space-y-3">
              {insights.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Risk Factors */}
      {insights?.riskFactors && insights.riskFactors.length > 0 && (
        <Card className="glass-card border-orange-200/50">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold">Risk Factors to Address</h3>
            </div>
            <ul className="space-y-3">
              {insights.riskFactors.map((risk: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground leading-relaxed">{risk}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Investment Insight */}
      {insights?.investmentInsight && (
        <Card className="glass-card bg-gradient-to-r from-muted/30 to-muted/10">
          <div className="p-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Investment Insight
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insights.investmentInsight}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};