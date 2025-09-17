import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  Users, 
  Target, 
  BookOpen, 
  Calendar,
  Download,
  CheckCircle,
  Star,
  ArrowRight,
  Zap
} from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';

export const ResultsScreen: React.FC = () => {
  const { state, resetMindmaker } = useMindmaker();
  const { discoveryData } = state;

  const calculateReadinessScore = () => {
    let score = 50; // Base score
    
    if (discoveryData.currentAIUse.includes('pilot') || discoveryData.currentAIUse.includes('tool')) score += 20;
    if (discoveryData.employeeCount > 100) score += 10;
    if (discoveryData.successTargets.length >= 2) score += 10;
    if (discoveryData.learningModality === 'live-cohort') score += 10;
    
    return Math.min(score, 95);
  };

  const getPersonalizedInsights = () => {
    const insights = [];
    
    if (discoveryData.employeeCount < 50) {
      insights.push("🎯 Perfect size for cohort-based learning with direct executive involvement");
    } else if (discoveryData.employeeCount > 500) {
      insights.push("🏢 Enterprise-scale approach with train-the-trainer methodology recommended");
    }
    
    if (discoveryData.currentAIUse.includes('none') || discoveryData.currentAIUse.includes('limited')) {
      insights.push("🌱 Green field opportunity - can establish best practices from the start");
    } else {
      insights.push("⚡ Building on existing foundation - focus on governance and optimization");
    }
    
    insights.push(`🎓 ${discoveryData.learningModality} learning style aligns perfectly with our methodology`);
    
    return insights;
  };

  const handleScheduleConsultation = () => {
    window.open('https://calendly.com/fractionl-ai/ai-literacy-consultation', '_blank');
  };

  const handleDownloadSummary = () => {
    const summary = {
      company: discoveryData.businessName,
      industry: discoveryData.industry,
      readinessScore: calculateReadinessScore(),
      recommendedApproach: 'AI Literacy & Confidence Bootcamp',
      keyInsights: getPersonalizedInsights(),
      nextSteps: [
        'Schedule 30-min consultation call',
        'Receive detailed proposal within 48 hours',
        'Begin with executive alignment session'
      ],
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${discoveryData.businessName}-ai-transformation-summary.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const readinessScore = calculateReadinessScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">
      {/* Header */}
      <div className="glass-nav border-b">
        <div className="container-width">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-primary" />
              <span className="text-xl font-semibold">Fractionl.ai</span>
            </div>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Discovery Complete
            </Badge>
          </div>
        </div>
      </div>

      <div className="container-width py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="headline-lg text-foreground">
              Your AI Transformation Roadmap
              <span className="block text-primary">{discoveryData.businessName}</span>
            </h1>
            <p className="body-md text-muted-foreground max-w-2xl mx-auto">
              Based on our conversation, here's your personalized approach to building AI literacy and confidence across your organization.
            </p>
          </div>

          {/* Key Insights Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="glass-card card-grid">
              <div className="card-header text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Team Readiness</h3>
              </div>
              <div className="card-content text-center">
                <div className="text-3xl font-bold text-primary mb-2">{readinessScore}%</div>
                <p className="text-sm text-muted-foreground">
                  {readinessScore >= 80 ? 'Excellent foundation for AI adoption' : 
                   readinessScore >= 60 ? 'Good potential with targeted support' : 
                   'Strong opportunity for transformation'}
                </p>
              </div>
            </Card>

            <Card className="glass-card card-grid">
              <div className="card-header text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Optimal Learning</h3>
              </div>
              <div className="card-content text-center">
                <div className="text-lg font-semibold mb-2">
                  {discoveryData.learningModality === 'live-cohort' ? 'Live Workshops' :
                   discoveryData.learningModality === 'self-paced' ? 'Self-Paced Modules' :
                   'Blended Approach'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Matched to your team's preferred learning style
                </p>
              </div>
            </Card>

            <Card className="glass-card card-grid">
              <div className="card-header text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Focus Areas</h3>
              </div>
              <div className="card-content text-center">
                <div className="text-sm font-medium mb-2">
                  {discoveryData.successTargets.slice(0, 2).join(' & ')}
                </div>
                <p className="text-sm text-muted-foreground">
                  Priority outcomes for your transformation
                </p>
              </div>
            </Card>
          </div>

          {/* Personalized Insights */}
          <Card className="glass-card">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Personalized Insights for {discoveryData.businessName}
              </h3>
              <div className="space-y-3">
                {getPersonalizedInsights().map((insight, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Recommended Package */}
          <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="p-8">
              <div className="text-center space-y-6">
                <Badge className="bg-primary text-white px-4 py-2">
                  Recommended for {discoveryData.businessName}
                </Badge>
                
                <h3 className="text-2xl font-bold">AI Literacy & Confidence Bootcamp</h3>
                
                <p className="body-md text-muted-foreground max-w-2xl mx-auto">
                  A comprehensive program designed to transform your team from overwhelmed & anxious about AI 
                  to literate, confident, and proactive in an AI-augmented workplace.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-left">What's Included:</h4>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        Executive keynote & mindset reset
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        Hands-on prompting & orchestration
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        Agentic thinking framework
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        Governance & guardrails setup
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-left">Your Investment:</h4>
                    <div className="space-y-2 text-left">
                      <div className="text-2xl font-bold text-primary">$25,000</div>
                      <div className="text-sm text-muted-foreground">
                        Half-day workshop for up to 30 participants
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Includes playbooks, templates & 30-day follow-up
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleScheduleConsultation}
              className="button-hero text-lg px-8 py-4 group"
              size="lg"
            >
              Schedule Consultation
              <Calendar className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              onClick={handleDownloadSummary}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Summary
            </Button>
          </div>

          {/* Trust & Social Proof */}
          <Card className="glass-card bg-gradient-to-r from-muted/30 to-muted/10">
            <div className="p-6 text-center">
              <h4 className="font-semibold mb-4">Join leaders who've transformed their teams</h4>
              <div className="grid md:grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-2xl font-bold text-primary">500+</div>
                  <div className="text-muted-foreground">Executives trained</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">95%</div>
                  <div className="text-muted-foreground">Confidence increase</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">30 days</div>
                  <div className="text-muted-foreground">To see results</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Footer Action */}
          <div className="text-center pt-8">
            <Button 
              onClick={resetMindmaker}
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
            >
              Start Over with New Assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};