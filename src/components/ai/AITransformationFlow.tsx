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
  const { discoveryData } = state;

  const calculateTeamReadiness = () => {
    // Use actual data from conversation or calculate based on responses
    const hasAiExperience = discoveryData.aiAdoption !== 'none';
    const hasBusinessDescription = discoveryData.businessDescription.length > 10;
    const hasDefinedGoals = discoveryData.successTargets.length > 0;
    
    let readiness = 30; // Base readiness
    if (hasAiExperience) readiness += 25;
    if (hasBusinessDescription) readiness += 20;
    if (hasDefinedGoals) readiness += 25;
    
    if (readiness >= 80) return { level: 'High', color: 'text-green-600', bg: 'bg-green-100', description: 'Ready for advanced AI implementation' };
    if (readiness >= 60) return { level: 'Medium-High', color: 'text-blue-600', bg: 'bg-blue-100', description: 'Good foundation, needs structured approach' };
    if (readiness >= 40) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-100', description: 'Building readiness, ideal for literacy bootcamp' };
    return { level: 'Building', color: 'text-orange-600', bg: 'bg-orange-100', description: 'Early stage, perfect for foundational training' };
  };

  const formatLearningModality = (modality: string) => {
    const modalityMap = {
      'live-cohort': 'Live Cohort Learning',
      'self-paced': 'Self-Paced Learning', 
      'coaching': 'Executive Coaching',
      'chatbot': 'AI-Guided Learning',
      'blended': 'Blended Approach'
    };
    return modalityMap[modality as keyof typeof modalityMap] || 'Live Cohort Learning';
  };

  const getPersonalizedInsights = () => {
    const insights = [];
    
    if (discoveryData.businessName) {
      insights.push(`${discoveryData.businessName} is positioned for AI transformation`);
    }
    
    if (discoveryData.industry) {
      insights.push(`${discoveryData.industry} industry expertise will guide our approach`);
    }
    
    if (discoveryData.employeeCount > 0) {
      const sizeCategory = discoveryData.employeeCount > 500 ? 'Enterprise' : 
                          discoveryData.employeeCount > 50 ? 'Mid-market' : 'Growth-stage';
      insights.push(`${sizeCategory} company structure informs our methodology`);
    }
    
    return insights;
  };

  const handleScheduleConsultation = () => {
    // Open calendar booking (replace with actual calendar link)
    window.open('https://calendly.com/fractionl-ai/workshop-consultation', '_blank');
  };

  const handleDownloadSummary = () => {
    const teamReadiness = calculateTeamReadiness();
    const personalizedInsights = getPersonalizedInsights();
    
    const summary = {
      executiveSummary: {
        companyName: discoveryData.businessName || 'Your Organization',
        industry: discoveryData.industry || 'Technology',
        teamSize: discoveryData.employeeCount || 'Not specified',
        currentAIAdoption: discoveryData.aiAdoption,
        keyInsights: personalizedInsights
      },
      transformationRoadmap: {
        teamReadiness: {
          level: teamReadiness.level,
          description: teamReadiness.description,
          score: `${Math.round((discoveryData.teamReadiness || 50))}%`
        },
        recommendedApproach: {
          primaryProgram: 'AI Literacy & Confidence Bootcamp',
          learningStyle: formatLearningModality(discoveryData.learningModality),
          duration: '2-3 days intensive',
          focusAreas: discoveryData.successTargets.length > 0 ? discoveryData.successTargets : ['AI Strategy', 'Team Enablement', 'Practical Implementation']
        },
        nextSteps: [
          'Schedule discovery consultation with Fractionl.ai',
          'Assess current AI tools and processes',
          'Design custom workshop curriculum',
          'Execute AI literacy bootcamp',
          'Implement 90-day follow-up plan'
        ]
      },
      contactInformation: {
        userName: discoveryData.userName || 'Executive',
        businessEmail: discoveryData.businessEmail || 'Not provided',
        country: discoveryData.country || 'Not specified'
      },
      generatedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    };
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(discoveryData.businessName || 'organization').toLowerCase().replace(/\s+/g, '-')}-ai-transformation-roadmap.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const teamReadiness = calculateTeamReadiness();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
      </div>
      
      {/* Enhanced glass morphism navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/30 shadow-lg">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <span className="text-white font-semibold text-2xl tracking-tight">Fractionl.ai</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <span className="text-white/70 text-sm">Transformation Results</span>
          </div>
        </div>
      </nav>

      {/* Results Content */}
      <div className="relative z-10 px-6 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Header Section with Real Data */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              AI Discovery Complete - Analysis Ready
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {discoveryData.businessName ? `${discoveryData.businessName}'s` : 'Your'} AI Transformation Roadmap
            </h1>
            
            <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Based on our AI-powered conversation analysis, here's your personalized strategy for building AI literacy and confidence 
              {discoveryData.industry && ` in the ${discoveryData.industry} industry`}.
            </p>
            
            {/* Real-time insights from conversation */}
            {getPersonalizedInsights().length > 0 && (
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {getPersonalizedInsights().map((insight, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-white/10 text-white/80 rounded-lg text-sm backdrop-blur-sm border border-white/20"
                  >
                    {insight}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Insights Grid with Real Data */}
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-8 border-l-4 border-l-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Team Readiness Assessment</h3>
                  <p className="text-sm text-white/70">AI adoption maturity based on conversation analysis</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${teamReadiness.bg} ${teamReadiness.color} shadow-sm`}>
                  {teamReadiness.level} Readiness
                </div>
                <p className="text-white/90 text-base leading-relaxed">
                  {teamReadiness.description}. {discoveryData.aiAdoption !== 'none' ? 
                    `Your current ${discoveryData.aiAdoption} AI adoption provides a solid foundation.` :
                    'Perfect opportunity to establish AI literacy from the ground up.'
                  }
                </p>
                {discoveryData.businessFunctions.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-medium text-white/70 mb-2">Key areas for AI integration:</p>
                    <div className="flex flex-wrap gap-2">
                      {discoveryData.businessFunctions.slice(0, 3).map((func, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-200 text-xs rounded-md">
                          {func}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-8 border-l-4 border-l-purple-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Optimal Learning Approach</h3>
                  <p className="text-sm text-white/70">Custom-matched delivery format</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="font-semibold text-purple-200 text-lg">
                  {formatLearningModality(discoveryData.learningModality)}
                </div>
                <p className="text-white/90 text-base leading-relaxed">
                  {discoveryData.learningModality === 'live-cohort' && 
                    'Interactive group sessions with peer learning and real-time Q&A maximize engagement and knowledge retention.'}
                  {discoveryData.learningModality === 'coaching' && 
                    'One-on-one executive coaching provides personalized guidance and strategic alignment for your specific business context.'}
                  {discoveryData.learningModality === 'self-paced' && 
                    'Flexible self-guided modules allow team members to learn at their own pace while maintaining consistency in core concepts.'}
                  {discoveryData.learningModality === 'blended' && 
                    'Combination approach balances structured workshops with flexible self-study for maximum impact and convenience.'}
                  {!discoveryData.learningModality && 
                    'Interactive group sessions with peer learning and real-time Q&A maximize engagement and knowledge retention.'}
                </p>
                {discoveryData.successTargets.length > 0 && (
                  <div className="pt-2">
                    <p className="text-sm font-medium text-white/70 mb-2">Success targets we'll address:</p>
                    <ul className="text-sm text-white/90 space-y-1">
                      {discoveryData.successTargets.slice(0, 3).map((target, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          {target}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border border-white/20 text-white p-8 border-l-4 border-l-green-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Strategic Focus Areas</h3>
                  <p className="text-sm text-white/70">Priority outcomes tailored to your business</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-3">
                  {(discoveryData.successTargets.length > 0 ? discoveryData.successTargets : ['AI Strategy Development', 'Team Confidence Building', 'Practical Implementation']).map((target, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-500/20 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="text-white font-medium">{target}</span>
                        {index === 0 && (
                          <p className="text-xs text-white/70 mt-1">Develop clear AI roadmap aligned with business objectives</p>
                        )}
                        {index === 1 && (
                          <p className="text-xs text-white/70 mt-1">Build team confidence through hands-on learning and practical exercises</p>
                        )}
                        {index === 2 && (
                          <p className="text-xs text-white/70 mt-1">Create actionable frameworks for immediate implementation</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed">
                  Workshop curriculum will be customized to deliver measurable progress on these specific objectives 
                  {discoveryData.industry && ` within the ${discoveryData.industry} industry context`}.
                </p>
              </div>
            </Card>
          </div>

          {/* Enhanced Recommended Package with real data */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 mb-12 text-white">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold mb-4">
                <CheckCircle className="w-4 h-4" />
                Recommended for {discoveryData.businessName || 'Your Organization'}
              </div>
              <h2 className="text-3xl font-bold mb-4">AI Literacy & Confidence Bootcamp</h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Transform your people from overwhelmed & anxious about AI to literate, confident, and proactive
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  What You'll Get
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Mindset reset from AI anxiety to opportunity</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Hands-on prompting & AI orchestration skills</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Practical frameworks for spotting AI opportunities</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Industry-specific case studies and applications</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Perfect For Your Team
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>{discoveryData.industry || 'Your industry'} specific examples</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Sized for {discoveryData.employeeCount > 0 ? `${discoveryData.employeeCount} person team` : 'your team size'}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Addresses current {teamReadiness.level.toLowerCase()} readiness level</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5 text-green-400 flex-shrink-0" />
                    <span>Builds on your {discoveryData.aiAdoption !== 'none' ? discoveryData.aiAdoption : 'baseline'} AI experience</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <button
              onClick={handleScheduleConsultation}
              className="group bg-white text-purple-900 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-purple-500/25 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                Schedule Workshop Consultation
                <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={handleDownloadSummary}
              className="px-8 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-3"
            >
              <Download className="w-5 h-5" />
              Download Summary
            </button>
          </div>

          {/* Enhanced Trust Indicators */}
          <div className="text-center space-y-8">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-white mb-6">Join Organizations Already Transforming with Fractionl.ai</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-blue-300">500+</div>
                  <div className="text-white/70">Teams Transformed</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-purple-300">89%</div>
                  <div className="text-white/70">Anxiety Reduction</div>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl font-bold text-green-300">3x</div>
                  <div className="text-white/70">Faster AI Adoption</div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-white/70 text-lg mb-4">
                Ready to transform your team's relationship with AI?
              </p>
              <p className="text-white text-xl font-semibold">
                Schedule your consultation now and start building AI confidence tomorrow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};