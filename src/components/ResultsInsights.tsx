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
  Shield,
  ChevronDown
} from 'lucide-react';

interface ResultsInsightsProps {
  insights: any;
}

export const ResultsInsights: React.FC<ResultsInsightsProps> = ({ insights }) => {
  const [expandedSection, setExpandedSection] = React.useState<string | null>(null);
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
    <div className="space-y-2 sm:space-y-3">
      {/* Score Dashboard - Ultra Compact */}
      <div className="grid grid-cols-3 gap-2">
        {insights?.aiMaturityScore !== undefined && (
          <Card className="glass-card text-center">
            <div className="p-2">
              <BarChart3 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className={`text-xl font-bold ${getScoreColor(insights.aiMaturityScore)}`}>
                {insights.aiMaturityScore}
              </div>
              <div className="text-[10px] text-muted-foreground">Maturity</div>
            </div>
          </Card>
        )}

        {insights?.revenueImpactPotential !== undefined && (
          <Card className="glass-card text-center">
            <div className="p-2">
              <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <div className={`text-xl font-bold ${getScoreColor(insights.revenueImpactPotential)}`}>
                {insights.revenueImpactPotential}
              </div>
              <div className="text-[10px] text-muted-foreground">Revenue</div>
            </div>
          </Card>
        )}

        {insights?.implementationReadiness !== undefined && (
          <Card className="glass-card text-center">
            <div className="p-2">
              <Shield className="w-4 h-4 text-purple-600 mx-auto mb-1" />
              <div className={`text-xl font-bold ${getScoreColor(insights.implementationReadiness)}`}>
                {insights.implementationReadiness}
              </div>
              <div className="text-[10px] text-muted-foreground">Readiness</div>
            </div>
          </Card>
        )}
      </div>

      {/* Collapsible Detailed Insights */}
      {(insights?.strategicSummary || insights?.recommendations || insights?.riskFactors || insights?.investmentInsight) && (
        <Card className="glass-card">
          <button 
            onClick={() => setExpandedSection(expandedSection === 'details' ? null : 'details')}
            className="w-full p-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Detailed Analysis</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSection === 'details' ? 'rotate-180' : ''}`} />
          </button>
          
          {expandedSection === 'details' && (
            <div className="px-3 pb-3 space-y-3 border-t pt-3">
              {insights?.recommendations && insights.recommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <h4 className="text-xs font-semibold">Opportunities</h4>
                  </div>
                  <ul className="space-y-1.5 pl-6">
                    {insights.recommendations.slice(0, 3).map((rec: string, index: number) => (
                      <li key={index} className="text-xs text-muted-foreground list-disc">
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {insights?.riskFactors && insights.riskFactors.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-orange-600" />
                    <h4 className="text-xs font-semibold">Watch For</h4>
                  </div>
                  <ul className="space-y-1.5 pl-6">
                    {insights.riskFactors.slice(0, 3).map((risk: string, index: number) => (
                      <li key={index} className="text-xs text-muted-foreground list-disc">
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};