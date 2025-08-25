import React, { useState } from 'react';
import { ArrowLeft, Download, Sparkles, TrendingUp, Shield, Users, Zap, Target, CheckCircle2, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { getAnxietyLevel } from '../../types/canvas';
import { BackNavigationDialog } from '../ui/back-navigation-dialog';
import { trackEngagementEvent } from '../../lib/lead-capture';

export const Step8VisualSummary: React.FC = () => {
  const { state, setCurrentStep } = useMindmaker();
  const [showBackDialog, setShowBackDialog] = useState(false);
  const { mindmakerData } = state;

  // Silent tracking when summary is viewed
  React.useEffect(() => {
    trackEngagementEvent('visual_summary_viewed', { businessName: mindmakerData.businessName });
  }, [mindmakerData.businessName]);

  const calculateAIReadinessScore = () => {
    const factors = [
      mindmakerData.aiAdoption !== 'none' ? 20 : 0,
      mindmakerData.businessFunctions?.length > 2 ? 15 : 10,
      mindmakerData.aiSkills?.length > 3 ? 20 : 10,
      mindmakerData.learningModality ? 15 : 0,
      mindmakerData.successTargets?.length > 2 ? 20 : 10,
      Object.values(mindmakerData.anxietyLevels || {}).reduce((a, b) => a + b, 0) / 5 < 50 ? 10 : 5
    ];
    return Math.min(factors.reduce((a, b) => a + b, 0), 100);
  };

  const getReadinessLevel = (score: number) => {
    if (score >= 80) return { label: 'AI Pioneer', color: 'text-green-500', bg: 'bg-green-500/10' };
    if (score >= 60) return { label: 'AI Ready', color: 'text-blue-500', bg: 'bg-blue-500/10' };
    if (score >= 40) return { label: 'AI Explorer', color: 'text-orange-500', bg: 'bg-orange-500/10' };
    return { label: 'AI Beginner', color: 'text-purple-500', bg: 'bg-purple-500/10' };
  };

  const aiScore = calculateAIReadinessScore();
  const readinessLevel = getReadinessLevel(aiScore);

  const keyInsights = [
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Team Readiness',
      value: `${Math.round(100 - (Object.values(mindmakerData.anxietyLevels || {}).reduce((a, b) => a + b, 0) / 5))}%`,
      description: 'of your team is ready for AI transformation',
      color: 'text-blue-500'
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'AI Capabilities',
      value: mindmakerData.aiSkills?.length || 0,
      description: 'key AI skills identified for your team',
      color: 'text-purple-500'
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Success Targets',
      value: mindmakerData.successTargets?.length || 0,
      description: 'clear goals defined for AI adoption',
      color: 'text-green-500'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Implementation Risk',
      value: mindmakerData.automationRisks?.length > 3 ? 'Medium' : 'Low',
      description: 'based on current process automation risk',
      color: mindmakerData.automationRisks?.length > 3 ? 'text-orange-500' : 'text-green-500'
    }
  ];

  const recommendations = [
    {
      priority: 'High',
      title: 'Start with AI Literacy Workshops',
      description: 'Build foundational understanding across your team to reduce anxiety and increase adoption readiness.',
      timeframe: '2-4 weeks',
      impact: 'Foundation Building'
    },
    {
      priority: 'Medium',
      title: 'Pilot AI Tools in Low-Risk Areas',
      description: 'Begin with safe, high-value use cases to demonstrate ROI and build confidence.',
      timeframe: '1-2 months',
      impact: 'Quick Wins'
    },
    {
      priority: 'Medium',
      title: 'Develop AI Governance Framework',
      description: 'Establish guidelines and policies for responsible AI use across your organization.',
      timeframe: '2-3 months',
      impact: 'Risk Management'
    }
  ];

  const handlePrevious = () => {
    setShowBackDialog(true);
  };

  const handleConfirmBack = () => {
    setCurrentStep(7);
    setShowBackDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Your AI Transformation Canvas</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              {mindmakerData.businessName}'s AI Transformation Canvas
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Your personalized roadmap to AI success, designed specifically for your organization's needs and goals.
            </p>
          </div>
        </div>

        {/* AI Readiness Score */}
        <div className="mb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-card to-primary/5 shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-foreground flex items-center justify-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                AI Readiness Score
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="relative">
                <div className="w-32 h-32 mx-auto">
                  <svg className="transform -rotate-90 w-32 h-32">
                    <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-muted/20" />
                    <circle 
                      cx="64" 
                      cy="64" 
                      r="56" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={`${(aiScore / 100) * 351.86} 351.86`}
                      className="text-primary transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-foreground">{aiScore}</div>
                      <div className="text-sm text-muted-foreground">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Badge className={`${readinessLevel.bg} ${readinessLevel.color} text-lg px-4 py-2`}>
                  {readinessLevel.label}
                </Badge>
                <p className="text-muted-foreground">
                  Your organization shows strong potential for AI transformation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyInsights.map((insight, index) => (
            <Card key={index} className="border-border bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 ${insight.color}`}>
                  {insight.icon}
                </div>
                <div className="text-2xl font-bold text-foreground mb-1">{insight.value}</div>
                <div className="text-sm text-muted-foreground">{insight.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transformation Roadmap */}
        <div className="mb-8">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-foreground">
                <Target className="w-6 h-6 text-primary" />
                Your AI Transformation Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex-shrink-0">
                      <Badge 
                        variant={rec.priority === 'High' ? 'default' : 'secondary'}
                        className="min-w-16 justify-center"
                      >
                        {rec.priority}
                      </Badge>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-foreground">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground">{rec.description}</p>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>⏱️ {rec.timeframe}</span>
                        <span>📈 {rec.impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-card shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl text-foreground">
                <Star className="w-6 h-6 text-primary" />
                Ready to Transform?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-muted-foreground">
                Your AI transformation journey starts with the right foundation. Fractionl.ai can help you navigate this journey with confidence.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">What's Next?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Schedule a strategy session with our AI experts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Receive a detailed implementation plan
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Access to our AI transformation toolkit
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-foreground">Why Choose Fractionl.ai?</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Mindset before mechanics approach
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Tech-agnostic guardrails
                    </li>
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Fractional future lens
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setCurrentStep(7)}
              size="lg"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Generate PDF
            </Button>
            <Button
              onClick={() => window.print()}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Print Canvas
            </Button>
          </div>
        </div>
      </div>

      <BackNavigationDialog
        isOpen={showBackDialog}
        onClose={() => setShowBackDialog(false)}
        onConfirm={handleConfirmBack}
        title="Go Back to Previous Step"
        description="Are you sure you want to go back? This will not affect your saved responses."
      />
    </div>
  );
};