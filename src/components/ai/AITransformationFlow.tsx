import React from 'react';
import { useStreamlinedMindmaker } from '../../contexts/StreamlinedMindmakerContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { 
  Sparkles, 
  Brain, 
  Target, 
  Users, 
  Calendar, 
  Download, 
  ArrowRight, 
  CheckCircle,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';

export const AITransformationFlow: React.FC = () => {
  const { state } = useStreamlinedMindmaker();

  const calculateTeamReadiness = () => {
    const readiness = state.discoveryData.teamReadiness || 65;
    if (readiness >= 80) return { level: 'High', color: 'text-green-400', percentage: readiness };
    if (readiness >= 60) return { level: 'Medium', color: 'text-yellow-400', percentage: readiness };
    return { level: 'Low', color: 'text-red-400', percentage: readiness };
  };

  const formatLearningModality = (modality: string) => {
    if (!modality) return 'Interactive Workshops';
    switch (modality.toLowerCase()) {
      case 'hands-on': return 'Hands-On Learning Labs';
      case 'theoretical': return 'Strategic Deep Dives';
      case 'mixed': return 'Blended Learning Experience';
      default: return 'Interactive Workshops';
    }
  };

  const readiness = calculateTeamReadiness();
  const companyName = state.discoveryData.businessName || 'Your Organization';

  const handleScheduleConsultation = () => {
    // Open calendar booking (replace with actual calendar link)
    window.open('https://calendly.com/fractionl-ai/workshop-consultation', '_blank');
  };

  const handleDownloadSummary = () => {
    const summary = {
      company: companyName,
      readiness: readiness,
      recommendations: 'AI Literacy Bootcamp',
      focusAreas: state.discoveryData.successTargets || ['Team Confidence', 'Process Efficiency'],
      learningStyle: formatLearningModality(state.discoveryData.learningModality),
      nextSteps: 'Schedule workshop consultation'
    };
    
    const dataStr = JSON.stringify(summary, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `${companyName}-AI-Transformation-Summary.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-600 to-accent relative overflow-hidden">
      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
      <div className="absolute top-32 right-16 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '4s' }}></div>
      
      {/* Glass Navigation Header */}
      <div className="glass-nav fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="container-width">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground">Fractionl.ai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Content */}
      <div className="pt-24 pb-section section-padding">
        <div className="container-width">
          {/* Header */}
          <div className="text-center space-y-6 max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium animate-fade-in-up">
              <CheckCircle className="w-4 h-4" />
              Transformation Roadmap Complete
            </div>

            <h1 className="headline-xl text-white animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Your Personalized AI
              <br />
              <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Transformation Roadmap
              </span>
            </h1>

            <p className="body-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Based on our AI analysis of {companyName}, here's your custom transformation strategy to build AI confidence across your organization.
            </p>
          </div>

          {/* Insights Grid */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Team Readiness */}
            <Card className="glass-card-dark text-white border-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="card-header">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <span className={`text-2xl font-bold ${readiness.color}`}>{readiness.percentage}%</span>
                </div>
                <CardTitle className="text-lg font-semibold">Team AI Readiness</CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <CardDescription className="text-white/80">
                  Current readiness level: <span className={`font-semibold ${readiness.color}`}>{readiness.level}</span>
                  <br />
                  Primary focus: Building confidence and reducing AI anxiety through hands-on experience.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Learning Style */}
            <Card className="glass-card-dark text-white border-white/20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <CardHeader className="card-header">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-semibold">Optimal Learning Style</CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <CardDescription className="text-white/80">
                  Recommended approach: <span className="font-semibold text-white">{formatLearningModality(state.discoveryData.learningModality)}</span>
                  <br />
                  Perfect for your team's preferences and organizational culture.
                </CardDescription>
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card className="glass-card-dark text-white border-white/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader className="card-header">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <CardTitle className="text-lg font-semibold">Priority Focus Areas</CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <CardDescription className="text-white/80">
                  Key targets: {(state.discoveryData.successTargets || ['Team Confidence', 'Process Efficiency']).join(', ')}
                  <br />
                  These align perfectly with our proven transformation methodology.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Package */}
          <Card className="glass-card-dark text-white border-white/20 mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-full text-primary-100 text-sm font-medium mb-4">
                    <Sparkles className="w-4 h-4" />
                    Recommended for {companyName}
                  </div>
                  <CardTitle className="text-2xl font-bold mb-2">AI Literacy Bootcamp</CardTitle>
                  <CardDescription className="text-white/80 text-lg">
                    Transform your people from overwhelmed & anxious about AI to literate, confident, and proactive
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary-100">½ Day</div>
                  <div className="text-white/60">Interactive Workshop</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    What You'll Get
                  </h4>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      Mindset reset from AI anxiety to opportunity
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      Hands-on prompting & AI orchestration skills
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      Practical frameworks for spotting AI opportunities
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      Industry-specific case studies and applications
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Perfect For Your Team
                  </h4>
                  <ul className="space-y-2 text-white/80">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      {state.discoveryData.industry || 'Your industry'} specific examples
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      Sized for {state.discoveryData.employeeCount || 'your team size'}
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      Addresses current {readiness.level.toLowerCase()} readiness level
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                      Builds on your existing {state.discoveryData.aiAdoption || 'baseline'}
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <Button
              onClick={handleScheduleConsultation}
              variant="hero"
              size="lg"
              className="button-hero text-lg px-8 py-4 h-auto font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <Calendar className="w-5 h-5 mr-2" />
              Schedule Workshop Consultation
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button
              onClick={handleDownloadSummary}
              variant="glass"
              size="lg"
              className="text-lg px-8 py-4 h-auto font-semibold"
            >
              <Download className="w-5 h-5 mr-2" />
              Download Summary
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center space-y-6 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="max-w-3xl mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Join Organizations Already Transforming with Fractionl.ai</h3>
              <div className="grid md:grid-cols-3 gap-6 text-white/80">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary-100">500+</div>
                  <div className="text-sm">Teams Transformed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary-100">89%</div>
                  <div className="text-sm">Anxiety Reduction</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-primary-100">3x</div>
                  <div className="text-sm">Faster AI Adoption</div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-white/60 text-sm">
                Ready to transform your team's relationship with AI?
              </p>
              <p className="text-white/80 text-lg font-medium mt-2">
                Schedule your consultation now and start building AI confidence tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};