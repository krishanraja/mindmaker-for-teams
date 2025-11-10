import React, { useState, useEffect } from 'react';
import { useExecTeams } from '@/contexts/ExecTeamsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Circle, ArrowRight, HelpCircle, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CognitiveBaselineRadar } from './CognitiveBaselineRadar';

const SIMULATIONS = [
  {
    id: 'gtm-pivot',
    title: 'Go-To-Market Pivot',
    description: 'Reposition a product for a new vertical in 90 days',
  },
  {
    id: 'board-deck-crisis',
    title: 'Board Deck Crisis',
    description: 'Draft quarterly results narrative under time pressure',
  },
  {
    id: 'competitive-response',
    title: 'Competitive Response',
    description: "Counter a disruptive competitor's launch announcement",
  },
  {
    id: 'ma-due-diligence',
    title: 'M&A Due Diligence',
    description: "Evaluate an acquisition target's tech stack",
  },
  {
    id: 'talent-retention',
    title: 'Talent Retention',
    description: 'Design a retention plan after losing 3 key engineers',
  },
  {
    id: 'pricing-strategy',
    title: 'Pricing Strategy Overhaul',
    description: 'Restructure pricing in response to market shift',
  },
];

const SIMULATION_PLACEHOLDERS: Record<string, {
  currentState: string;
  stakeholders: string;
  desiredOutcome: string;
  successCriteria: string;
}> = {
  'gtm-pivot': {
    currentState: "Our current GTM strategy targets SMBs but we're seeing more traction with enterprise buyers. Need to pivot messaging and sales approach.",
    stakeholders: 'CMO, VP Sales, Product Marketing',
    desiredOutcome: 'Complete repositioning with new messaging, collateral, and sales playbook ready for enterprise segment',
    successCriteria: 'Launch in new vertical within 90 days, 50% increase in enterprise deal pipeline, $2M ARR from new segment in 6 months',
  },
  'board-deck-crisis': {
    currentState: "We're struggling to create quarterly board narratives that tell a compelling story. Takes 3+ weeks of back-and-forth.",
    stakeholders: 'CFO, Board, Executive team',
    desiredOutcome: 'Board deck drafted in 2 days with AI assistance, compelling narrative that ties metrics to strategy',
    successCriteria: 'Reduce deck creation time by 80%, maintain board approval rate above 90%, improve narrative quality scores',
  },
  'competitive-response': {
    currentState: 'Major competitor just launched a feature that threatens our core differentiator. Team is scrambling for a response strategy.',
    stakeholders: 'CEO, Product, Marketing, Sales leadership',
    desiredOutcome: 'Clear competitive positioning and response plan within 72 hours, ready for immediate market execution',
    successCriteria: 'Counter-message in market within 1 week, maintain customer retention above 95%, win rate stays above 60%',
  },
  'ma-due-diligence': {
    currentState: 'Evaluating acquisition target but their tech stack is complex. Manual review would take 6 weeks - deal timeline is 3 weeks.',
    stakeholders: 'CTO, M&A team, Technical leads',
    desiredOutcome: 'Comprehensive tech due diligence report with risk assessment, integration plan, and cost projections',
    successCriteria: 'Complete assessment in 2 weeks, identify all critical risks, provide accurate integration cost estimate within 10%',
  },
  'talent-retention': {
    currentState: 'Lost 3 senior engineers to competitors in 2 months. Exit interviews cite growth opportunities and comp as main factors.',
    stakeholders: 'Head of Engineering, HR, Department leads',
    desiredOutcome: 'Data-driven retention plan with career paths, comp adjustments, and team engagement initiatives',
    successCriteria: 'Reduce engineering attrition to <10% annually, improve engagement scores by 30%, fill talent gaps within 90 days',
  },
  'pricing-strategy': {
    currentState: 'Current pricing model built 3 years ago. Market has shifted, competitors undercut us, customers asking for new packaging options.',
    stakeholders: 'CFO, Sales, Customer Success, Product',
    desiredOutcome: 'New pricing strategy aligned with current market, optimized for revenue growth and customer retention',
    successCriteria: 'Roll out new pricing within 60 days, achieve 20% increase in average deal size, maintain <5% churn during transition',
  },
};

const AI_MYTHS_OPTIONS = [
  'AI will replace our team',
  'AI is too expensive to implement',
  'We need data scientists to use AI',
  'AI is not ready for our industry',
  'AI will make too many mistakes',
  'AI projects take years to deliver value',
];

const BOTTLENECK_OPTIONS = [
  'Competing priorities',
  'Leadership alignment',
  'Resource constraints',
  'Change fatigue',
  'Technical debt',
  'Market uncertainty',
  'Slow decision-making',
  'Lack of AI expertise',
];

export const EnhancedSimulationConfigurator: React.FC = () => {
  const {
    state,
    selectSimulation,
    deselectSimulation,
    updateSimulation1Snapshot,
    updateSimulation2Snapshot,
    updateAIReadinessData,
    updateStrategicContextData,
    updatePilotExpectationsData,
    setCurrentStep,
    setBootcampPlanId,
    setCognitiveBaseline,
  } = useExecTeams();

  const [wizardStep, setWizardStep] = useState(1); // 1: AI Readiness, 2: Simulations, 3: Strategic Context, 4: Pilot Expectations
  const [loading, setLoading] = useState(false);
  const [cognitiveData, setCognitiveData] = useState<any>(null);

  // Initialize AI readiness data
  const aiReadiness = state.aiReadinessData || {
    aiMythsConcerns: [],
    currentBottlenecks: [],
    aiExperienceLevel: 'none' as const,
  };

  const strategicContext = state.strategicContextData || {
    strategicGoals2026: ['', '', ''],
    competitiveLandscape: '',
    riskTolerance: 3,
  };

  const pilotExpectations = state.pilotExpectationsData || {
    pilotDescription: '',
    pilotOwnerName: '',
    pilotOwnerRole: '',
    budgetRange: '',
  };

  useEffect(() => {
    loadCognitiveBaseline();
  }, []);

  const loadCognitiveBaseline = async () => {
    if (!state.intakeId) return;

    try {
      const { data: pulses, error } = await supabase
        .from('exec_pulses')
        .select('*')
        .eq('intake_id', state.intakeId)
        .not('completed_at', 'is', null);

      if (error) throw error;

      if (pulses && pulses.length > 0) {
        const baseline = {
          awareness: pulses.reduce((sum, p) => sum + (p.awareness_score || 0), 0) / pulses.length,
          application: pulses.reduce((sum, p) => sum + (p.application_score || 0), 0) / pulses.length,
          trust: pulses.reduce((sum, p) => sum + (p.trust_score || 0), 0) / pulses.length,
          governance: pulses.reduce((sum, p) => sum + (p.governance_score || 0), 0) / pulses.length,
          completedCount: pulses.length,
        };
        setCognitiveData(baseline);
        setCognitiveBaseline(baseline);
      }
    } catch (error) {
      console.error('Error loading cognitive baseline:', error);
    }
  };

  const handleSimulationClick = (simulationId: string) => {
    if (state.selectedSimulations.includes(simulationId)) {
      deselectSimulation(simulationId);
    } else if (state.selectedSimulations.length < 2) {
      selectSimulation(simulationId);
    } else {
      toast.error('You can select exactly 2 simulations');
    }
  };

  const getSimulationSnapshot = (index: number) => {
    return index === 0 ? state.simulation1Snapshot : state.simulation2Snapshot;
  };

  const updateSnapshot = (index: number, field: string, value: string) => {
    const snapshot = getSimulationSnapshot(index) || { id: state.selectedSimulations[index] };
    const updated = { ...snapshot, [field]: value };
    if (index === 0) {
      updateSimulation1Snapshot(updated);
    } else {
      updateSimulation2Snapshot(updated);
    }
  };

  const handleMythToggle = (myth: string) => {
    const current = aiReadiness.aiMythsConcerns;
    const updated = current.includes(myth)
      ? current.filter(m => m !== myth)
      : [...current, myth];
    updateAIReadinessData({ aiMythsConcerns: updated });
  };

  const handleBottleneckToggle = (bottleneck: string) => {
    const current = aiReadiness.currentBottlenecks;
    const updated = current.includes(bottleneck)
      ? current.filter(b => b !== bottleneck)
      : [...current, bottleneck];
    updateAIReadinessData({ currentBottlenecks: updated });
  };

  const handleStrategicGoalChange = (index: number, value: string) => {
    const updated = [...strategicContext.strategicGoals2026];
    updated[index] = value;
    updateStrategicContextData({ strategicGoals2026: updated });
  };

  const validateWizardStep = () => {
    if (wizardStep === 1) {
      if (aiReadiness.aiMythsConcerns.length === 0) {
        toast.error('Please select at least one AI concern to address');
        return false;
      }
      if (aiReadiness.currentBottlenecks.length === 0) {
        toast.error('Please identify at least one current bottleneck');
        return false;
      }
      if (!aiReadiness.aiExperienceLevel || aiReadiness.aiExperienceLevel === 'none') {
        toast.error('Please select your AI experience level');
        return false;
      }
    } else if (wizardStep === 2) {
      if (state.selectedSimulations.length !== 2) {
        toast.error('Please select exactly 2 simulations');
        return false;
      }
      const snapshot1 = state.simulation1Snapshot;
      const snapshot2 = state.simulation2Snapshot;
      if (!snapshot1?.currentState || !snapshot1?.desiredOutcome || !snapshot1?.successCriteria) {
        toast.error('Please complete all required fields for Simulation 1');
        return false;
      }
      if (!snapshot2?.currentState || !snapshot2?.desiredOutcome || !snapshot2?.successCriteria) {
        toast.error('Please complete all required fields for Simulation 2');
        return false;
      }
    } else if (wizardStep === 3) {
      const validGoals = strategicContext.strategicGoals2026.filter(g => g.trim() !== '');
      if (validGoals.length === 0) {
        toast.error('Please enter at least one strategic goal for 2026');
        return false;
      }
      if (!strategicContext.competitiveLandscape?.trim()) {
        toast.error('Please describe your competitive landscape');
        return false;
      }
    } else if (wizardStep === 4) {
      if (!pilotExpectations.pilotDescription?.trim()) {
        toast.error('Please describe what pilot you hope to launch');
        return false;
      }
      if (!pilotExpectations.pilotOwnerName?.trim() || !pilotExpectations.pilotOwnerRole?.trim()) {
        toast.error('Please specify who will own the pilot');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateWizardStep()) {
      setWizardStep(wizardStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateWizardStep()) return;

    setLoading(true);
    try {
      const { data: plan, error } = await supabase
        .from('bootcamp_plans')
        .insert([{
          intake_id: state.intakeId,
          simulation_1_id: state.selectedSimulations[0],
          simulation_1_snapshot: state.simulation1Snapshot as any,
          simulation_2_id: state.selectedSimulations[1],
          simulation_2_snapshot: state.simulation2Snapshot as any,
          ai_myths_concerns: aiReadiness.aiMythsConcerns as any,
          current_bottlenecks: aiReadiness.currentBottlenecks as any,
          ai_experience_level: aiReadiness.aiExperienceLevel,
          strategic_goals_2026: strategicContext.strategicGoals2026.filter(g => g.trim() !== '') as any,
          competitive_landscape: strategicContext.competitiveLandscape,
          risk_tolerance: strategicContext.riskTolerance,
          pilot_expectations: pilotExpectations as any,
          cognitive_baseline: cognitiveData,
          agenda_config: {
            segments: [
              { name: 'Mythbuster', duration: 15 },
              { name: 'The Mirror', duration: 45 },
              { name: 'The Time Machine', duration: 45 },
              { name: 'The Crystal Ball', duration: 60 },
              { name: 'The Rewrite', duration: 45 },
              { name: 'The Huddle', duration: 30 },
              { name: 'The Provocation', duration: 10 },
            ],
          },
          required_prework: [
            'Executive pulse completion',
            'Simulation context documents (1-pager per scenario)',
            'Organizational chart for stakeholder mapping',
            'Last 2 quarterly board decks',
          ],
        }])
        .select()
        .single();

      if (error) throw error;

      setBootcampPlanId(plan.id);
      toast.success('Bootcamp plan configured successfully!');
      setCurrentStep(4);
    } catch (error: any) {
      console.error('Error creating bootcamp plan:', error);
      toast.error(error.message || 'Failed to create bootcamp plan');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <div className="flex items-center justify-between mb-6">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center flex-1">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
              step < wizardStep
                ? 'bg-primary border-primary text-primary-foreground'
                : step === wizardStep
                ? 'border-primary text-primary font-semibold'
                : 'border-muted text-muted-foreground'
            }`}
          >
            {step < wizardStep ? <CheckCircle2 className="w-5 h-5" /> : step}
          </div>
          {step < 4 && (
            <div
              className={`h-1 flex-1 mx-2 transition-all ${
                step < wizardStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-6xl mx-auto space-y-8 py-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl">Configure Your Bootcamp Agenda</CardTitle>
            <CardDescription className="text-lg">
              Step {wizardStep} of 4 • Comprehensive workshop preparation
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {renderProgressBar()}

            {cognitiveData && wizardStep === 1 && (
              <Card className="bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-xl">Team Cognitive Baseline</CardTitle>
                  <CardDescription>
                    {cognitiveData.completedCount} participant{cognitiveData.completedCount !== 1 ? 's' : ''} completed the pulse
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CognitiveBaselineRadar data={cognitiveData} />
                </CardContent>
              </Card>
            )}

            {/* STEP 1: AI Readiness Assessment */}
            {wizardStep === 1 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle>AI Concerns & Myths</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">These will be directly addressed in the Mythbuster segment</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardDescription>What concerns does your team have about AI? (Select all that apply)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {AI_MYTHS_OPTIONS.map((myth) => (
                        <div key={myth} className="flex items-center space-x-2">
                          <Checkbox
                            id={myth}
                            checked={aiReadiness.aiMythsConcerns.includes(myth)}
                            onCheckedChange={() => handleMythToggle(myth)}
                          />
                          <label htmlFor={myth} className="text-sm font-medium leading-none cursor-pointer">
                            {myth}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle>Current Bottlenecks</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">These will populate The Mirror segment bottleneck board</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardDescription>What slows your team down most? (Select all that apply)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-3">
                      {BOTTLENECK_OPTIONS.map((bottleneck) => (
                        <div key={bottleneck} className="flex items-center space-x-2">
                          <Checkbox
                            id={bottleneck}
                            checked={aiReadiness.currentBottlenecks.includes(bottleneck)}
                            onCheckedChange={() => handleBottleneckToggle(bottleneck)}
                          />
                          <label htmlFor={bottleneck} className="text-sm font-medium leading-none cursor-pointer">
                            {bottleneck}
                          </label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Current AI Experience Level *</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Helps us calibrate workshop exercises to your team's baseline</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select
                    value={aiReadiness.aiExperienceLevel}
                    onValueChange={(value: any) => updateAIReadinessData({ aiExperienceLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your team's AI experience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No AI Experience</SelectItem>
                      <SelectItem value="experimenting">Experimenting (POCs & pilots)</SelectItem>
                      <SelectItem value="deploying">Deploying (Some production use)</SelectItem>
                      <SelectItem value="scaled">Scaled (Organization-wide adoption)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* STEP 2: Simulation Selection & Snapshots */}
            {wizardStep === 2 && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">Select Simulations</h3>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Choose 2 scenarios that mirror your actual business challenges</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="text-sm font-medium">
                      {state.selectedSimulations.length} of 2 selected
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {SIMULATIONS.map((sim) => {
                      const isSelected = state.selectedSimulations.includes(sim.id);
                      return (
                        <Card
                          key={sim.id}
                          className={`cursor-pointer transition-all ${
                            isSelected
                              ? 'border-2 border-primary bg-primary/5'
                              : 'border hover:border-primary/50'
                          }`}
                          onClick={() => handleSimulationClick(sim.id)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{sim.title}</CardTitle>
                                <CardDescription>{sim.description}</CardDescription>
                              </div>
                              {isSelected ? (
                                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                              ) : (
                                <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                              )}
                            </div>
                          </CardHeader>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {state.selectedSimulations.length === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                      <p className="text-sm text-foreground">
                        <strong>Important:</strong> Fill in all required fields below. This data will pre-populate your facilitator dashboard.
                      </p>
                    </div>

                    {state.selectedSimulations.map((simId, index) => {
                      const sim = SIMULATIONS.find(s => s.id === simId);
                      const snapshot = getSimulationSnapshot(index);
                      const placeholders = SIMULATION_PLACEHOLDERS[simId] || SIMULATION_PLACEHOLDERS['board-deck-crisis'];
                      return (
                        <Card key={simId} className="border-2">
                          <CardHeader className="bg-accent/5">
                            <CardTitle className="text-xl">{sim?.title} - Simulation Details</CardTitle>
                            <CardDescription>Describe the current state and desired outcomes for this scenario</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-6">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label>Current State Description * <span className="text-muted-foreground text-xs">(Max 150 chars)</span></Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">Describe your team's current pain point or challenge. Be specific about what's not working.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Textarea
                                value={snapshot?.currentState || ''}
                                onChange={(e) => updateSnapshot(index, 'currentState', e.target.value)}
                                placeholder={placeholders.currentState}
                                maxLength={150}
                                rows={3}
                              />
                              <p className="text-xs text-muted-foreground">
                                {(snapshot?.currentState || '').length}/150 characters
                              </p>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label>Key Stakeholders Involved</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">Who are the main decision-makers or people affected by this process?</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Input
                                value={snapshot?.stakeholders || ''}
                                onChange={(e) => updateSnapshot(index, 'stakeholders', e.target.value)}
                                placeholder={placeholders.stakeholders}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label>Desired Business Outcome *</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">What does the ideal end result look like? Focus on business impact, not just task completion.</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Input
                                value={snapshot?.desiredOutcome || ''}
                                onChange={(e) => updateSnapshot(index, 'desiredOutcome', e.target.value)}
                                placeholder={placeholders.desiredOutcome}
                              />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label>Time Constraint</Label>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">How quickly does this need to be completed? (e.g., 48 hours, 1 week)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <Input
                                  value={snapshot?.timeConstraint || ''}
                                  onChange={(e) => updateSnapshot(index, 'timeConstraint', e.target.value)}
                                  placeholder="e.g., 48 hours"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label>Budget Constraint</Label>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">What's your available budget for tools, resources, or consulting? (e.g., $10K, No budget)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <Input
                                  value={snapshot?.budgetConstraint || ''}
                                  onChange={(e) => updateSnapshot(index, 'budgetConstraint', e.target.value)}
                                  placeholder="e.g., $10K"
                                />
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Label>Data Availability</Label>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="max-w-xs">How accessible is the data needed? (e.g., Full access, Limited, None available)</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <Input
                                  value={snapshot?.dataAvailability || ''}
                                  onChange={(e) => updateSnapshot(index, 'dataAvailability', e.target.value)}
                                  placeholder="e.g., Full access"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Label>Success Criteria * <span className="text-muted-foreground text-xs">(How will you measure success?)</span></Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">Define specific, measurable outcomes that indicate success (e.g., time saved, quality improvement, cost reduction)</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              <Textarea
                                value={snapshot?.successCriteria || ''}
                                onChange={(e) => updateSnapshot(index, 'successCriteria', e.target.value)}
                                placeholder={placeholders.successCriteria}
                                rows={2}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: Strategic Context */}
            {wizardStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle>2026 Strategic Objectives</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">These will frame The Rewrite segment discussions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardDescription>What are your top 3 strategic priorities for 2026?</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[0, 1, 2].map((index) => (
                      <div key={index} className="space-y-2">
                        <Label>Strategic Goal #{index + 1} {index === 0 && '*'}</Label>
                        <Input
                          value={strategicContext.strategicGoals2026[index] || ''}
                          onChange={(e) => handleStrategicGoalChange(index, e.target.value)}
                          placeholder={`e.g., ${
                            index === 0
                              ? 'Achieve 40% revenue growth'
                              : index === 1
                              ? 'Launch in 3 new markets'
                              : 'Improve customer retention to 95%'
                          }`}
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Competitive Landscape *</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Used in The Provocation segment to create urgency</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    value={strategicContext.competitiveLandscape}
                    onChange={(e) => updateStrategicContextData({ competitiveLandscape: e.target.value })}
                    placeholder="Who's ahead on AI in your space? What threats do you see? e.g., 'Three AI-native startups launched in our category this year. Traditional competitors are forming AI partnerships.'"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Risk Tolerance</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="w-4 h-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">Helps calibrate governance discussions in The Rewrite</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Conservative</span>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={strategicContext.riskTolerance}
                      onChange={(e) => updateStrategicContextData({ riskTolerance: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground">Aggressive</span>
                    <div className="w-12 text-center font-semibold">{strategicContext.riskTolerance}/5</div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Pilot Expectations */}
            {wizardStep === 4 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle>Pilot Planning</CardTitle>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Pre-fills The Huddle pilot charter</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <CardDescription>Help us prepare a pilot charter tailored to your goals</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>What pilot are you hoping to launch? *</Label>
                      <Textarea
                        value={pilotExpectations.pilotDescription}
                        onChange={(e) => updatePilotExpectationsData({ pilotDescription: e.target.value })}
                        placeholder="Describe the AI pilot you envision. Example: 'An AI-powered board deck generator that cuts preparation time from 3 weeks to 3 days.'"
                        rows={4}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Pilot Owner Name *</Label>
                        <Input
                          value={pilotExpectations.pilotOwnerName}
                          onChange={(e) => updatePilotExpectationsData({ pilotOwnerName: e.target.value })}
                          placeholder="e.g., Sarah Johnson"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Pilot Owner Role *</Label>
                        <Input
                          value={pilotExpectations.pilotOwnerRole}
                          onChange={(e) => updatePilotExpectationsData({ pilotOwnerRole: e.target.value })}
                          placeholder="e.g., VP of Operations"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex justify-between pt-6 border-t">
              <Button
                onClick={() => setWizardStep(wizardStep - 1)}
                variant="outline"
                disabled={wizardStep === 1}
              >
                Previous
              </Button>

              {wizardStep < 4 ? (
                <Button onClick={handleNext}>
                  Next Step
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading} size="lg">
                  {loading ? 'Creating Plan...' : 'Complete & Generate Bootcamp Plan'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};