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
  Zap,
  AlertTriangle,
  TrendingUp,
  Shield,
  Brain
} from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import { supabase } from '../integrations/supabase/client';

export const ResultsScreen: React.FC = () => {
  const { state, resetMindmaker } = useMindmaker();
  const { discoveryData } = state;

  const getReadinessScore = () => {
    return discoveryData.aiInsights?.readinessScore || 65;
  };

  const getInvestmentRange = () => {
    return discoveryData.aiInsights?.investmentRange || '$25k-$45k';
  };

  const getRecommendedProgram = () => {
    const size = discoveryData.employeeCount;
    const urgency = discoveryData.implementationTimeline;
    
    if (size <= 50 && urgency?.includes('ASAP')) {
      return 'Executive Sprint + Intensive Bootcamp';
    } else if (size > 200) {
      return 'Enterprise AI Transformation Program';
    } else {
      return 'AI Literacy & Confidence Bootcamp';
    }
  };

  const handleScheduleConsultation = async () => {
    try {
      // Send comprehensive assessment notification to krish@fractionl.ai
      const { error } = await supabase.functions.invoke('send-assessment-notification', {
        body: {
          assessmentData: {
            // Contact Information
            businessName: discoveryData.businessName,
            contactName: discoveryData.contactName,
            contactEmail: discoveryData.contactEmail,
            contactRole: discoveryData.contactRole,
            
            // Business Details
            industry: discoveryData.industry,
            employeeCount: discoveryData.employeeCount,
            currentAIUse: discoveryData.currentAIUse,
            
            // Assessment Inputs
            biggestChallenges: discoveryData.biggestChallenges || [],
            leadershipVision: discoveryData.leadershipVision,
            successMetrics: discoveryData.successMetrics || [],
            learningPreferences: discoveryData.learningPreferences || [],
            implementationTimeline: discoveryData.implementationTimeline,
            
            // AI Generated Insights
            aiInsights: discoveryData.aiInsights
          }
        }
      });

      if (error) {
        console.error('Error sending assessment notification:', error);
      } else {
        console.log('Assessment notification sent successfully');
      }
    } catch (error) {
      console.error('Failed to send assessment notification:', error);
    }
    
    // Always open Calendly regardless of email success/failure
    window.open('https://calendly.com/krish-raja/mindmaker-teams', '_blank');
  };

  const handleDownloadSummary = () => {
    const summary = {
      company: discoveryData.businessName,
      industry: discoveryData.industry,
      employeeCount: discoveryData.employeeCount,
      readinessScore: getReadinessScore(),
      recommendedProgram: getRecommendedProgram(),
      investmentRange: getInvestmentRange(),
      aiInsights: discoveryData.aiInsights,
      contactInfo: {
        name: discoveryData.contactName,
        email: discoveryData.contactEmail,
        role: discoveryData.contactRole
      },
      nextSteps: [
        'Schedule strategic consultation call',
        'Receive detailed proposal within 48 hours',
        'Begin with executive alignment session'
      ],
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${discoveryData.businessName}-ai-assessment-report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const readinessScore = getReadinessScore();
  const investmentRange = getInvestmentRange();
  const recommendedProgram = getRecommendedProgram();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5">

      <div className="container-width py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="headline-lg text-foreground">
              AI Readiness Assessment Results
              <span className="block text-primary">{discoveryData.businessName}</span>
            </h1>
            <p className="body-md text-muted-foreground max-w-2xl mx-auto">
              Your personalized AI transformation roadmap based on strategic assessment and industry expertise.
            </p>
            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
              <Brain className="w-3 h-3 mr-1" />
              AI-Powered Analysis Complete
            </Badge>
          </div>

          {/* Key Insights Grid */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="glass-card card-grid">
              <div className="card-header text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI Readiness Score</h3>
              </div>
              <div className="card-content text-center">
                <div className="text-3xl font-bold text-primary mb-2">{readinessScore}/100</div>
                <p className="text-sm text-muted-foreground">
                  {readinessScore >= 80 ? 'Advanced - Ready for implementation' : 
                   readinessScore >= 60 ? 'Intermediate - Good foundation' : 
                   readinessScore >= 40 ? 'Beginner - High potential' :
                   'Early stage - Great opportunity'}
                </p>
              </div>
            </Card>

            <Card className="glass-card card-grid">
              <div className="card-header text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Learning Format</h3>
              </div>
              <div className="card-content text-center">
                <div className="text-lg font-semibold mb-2">
                  {discoveryData.learningPreferences?.includes('Live workshops') ? 'Live Workshops' :
                   discoveryData.learningPreferences?.includes('Self-paced') ? 'Self-Paced' :
                   discoveryData.learningPreferences?.includes('coaching') ? 'Coaching' :
                   'Mixed Approach'}
                </div>
                <p className="text-sm text-muted-foreground">
                  Optimized for your team's preferences
                </p>
              </div>
            </Card>

            <Card className="glass-card card-grid">
              <div className="card-header text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Team Size</h3>
              </div>
              <div className="card-content text-center">
                <div className="text-lg font-semibold mb-2">
                  {discoveryData.employeeCount} employees
                </div>
                <p className="text-sm text-muted-foreground">
                  {discoveryData.employeeCount <= 50 ? 'Perfect for cohort training' :
                   discoveryData.employeeCount <= 200 ? 'Ideal for departmental rollout' :
                   'Requires enterprise approach'}
                </p>
              </div>
            </Card>

            <Card className="glass-card card-grid">
              <div className="card-header text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Investment Range</h3>
              </div>
              <div className="card-content text-center">
                <div className="text-lg font-semibold text-primary mb-2">
                  {investmentRange}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on scope and complexity
                </p>
              </div>
            </Card>
          </div>

          {/* AI-Generated Analysis */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Recommendations */}
            <Card className="glass-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Strategic Recommendations
                </h3>
                <div className="space-y-3">
                  {(discoveryData.aiInsights?.recommendations || [
                    'Start with executive alignment sessions',
                    'Implement hands-on AI literacy training', 
                    'Establish governance framework'
                  ]).map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Risk Factors */}
            <Card className="glass-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Risk Mitigation
                </h3>
                <div className="space-y-3">
                  {(discoveryData.aiInsights?.riskFactors || [
                    'Change resistance from team members',
                    'Lack of clear measurement frameworks'
                  ]).map((risk, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Opportunity Areas */}
            <Card className="glass-card">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Opportunity Areas
                </h3>
                <div className="space-y-3">
                  {(discoveryData.aiInsights?.opportunityAreas || [
                    'Operational efficiency improvements',
                    'Competitive advantage through early adoption'
                  ]).map((opp, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                      <Star className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{opp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Recommended Program */}
          <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <div className="p-8">
              <div className="text-center space-y-6">
                <Badge className="bg-primary text-white px-4 py-2 text-lg">
                  Recommended Program for {discoveryData.businessName}
                </Badge>
                
                <h3 className="text-3xl font-bold">{recommendedProgram}</h3>
                
                <p className="body-md text-muted-foreground max-w-2xl mx-auto">
                  Tailored specifically for {discoveryData.industry} companies with {discoveryData.employeeCount} employees, 
                  focusing on {discoveryData.successMetrics?.slice(0, 2).join(' and ') || 'AI literacy and confidence'}.
                </p>

                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-left">Program Includes:</h4>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        Executive keynote & mindset transformation
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        Hands-on prompting & AI orchestration labs
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        Industry-specific use case workshops
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        Governance framework & guardrails setup
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        90-day implementation roadmap
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="w-4 h-4 text-primary" />
                        Post-training support & coaching
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-left">Investment Range:</h4>
                    <div className="space-y-2 text-left">
                      <div className="text-3xl font-bold text-primary">{investmentRange}</div>
                      <div className="text-sm text-muted-foreground">
                        Final pricing based on scope, duration, and customization
                      </div>
                      <div className="text-sm text-primary font-medium">
                        🎯 ROI typically 300-500% within 12 months
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Investment includes all materials, assessments, and follow-up support
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
              Schedule Strategy Call
              <Calendar className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              onClick={handleDownloadSummary}
              variant="outline"
              className="border-primary text-primary hover:bg-primary/10"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Assessment Report
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