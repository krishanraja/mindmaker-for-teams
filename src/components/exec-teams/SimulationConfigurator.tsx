import React, { useState, useEffect } from 'react';
import { useExecTeams } from '@/contexts/ExecTeamsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CognitiveBaselineRadar } from './CognitiveBaselineRadar';
import { SIMULATIONS } from '@/lib/simulation-constants';

const AGENDA_SEGMENTS = [
  { name: 'CEO Promise', duration: 10 },
  { name: 'Mirror', duration: 30 },
  { name: 'Simulation 1', duration: 60 },
  { name: 'Time Machine', duration: 20 },
  { name: 'Simulation 2', duration: 60 },
  { name: 'Crystal Ball', duration: 30 },
  { name: 'Rewrite', duration: 30 },
  { name: 'Huddle', duration: 20 },
  { name: 'Provocation', duration: 20 },
];

export const SimulationConfigurator: React.FC = () => {
  const {
    state,
    selectSimulation,
    deselectSimulation,
    updateSimulation1Snapshot,
    updateSimulation2Snapshot,
    setCurrentStep,
    setBootcampPlanId,
    setCognitiveBaseline,
  } = useExecTeams();

  const [loading, setLoading] = useState(false);
  const [cognitiveData, setCognitiveData] = useState<any>(null);

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

  const validateSnapshots = () => {
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
    return true;
  };

  const handleSubmit = async () => {
    if (state.selectedSimulations.length !== 2) {
      toast.error('Please select exactly 2 simulations');
      return;
    }

    if (!validateSnapshots()) return;

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
          agenda_config: { segments: AGENDA_SEGMENTS },
          cognitive_baseline: cognitiveData,
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
      toast.success('Bootcamp plan configured!');
      setCurrentStep(4);
    } catch (error: any) {
      console.error('Error creating bootcamp plan:', error);
      toast.error(error.message || 'Failed to create bootcamp plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-6xl mx-auto space-y-8 py-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl">Configure Your Bootcamp Agenda</CardTitle>
            <CardDescription className="text-lg">
              Choose exactly 2 scenarios that mirror your current challenges
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {cognitiveData && (
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

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Select Simulations</h3>
                <span className="text-sm font-medium">
                  {state.selectedSimulations.length} of 2 selected
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
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
              <Accordion type="multiple" className="w-full">
                {state.selectedSimulations.map((simId, index) => {
                  const sim = SIMULATIONS.find(s => s.id === simId);
                  const snapshot = getSimulationSnapshot(index);
                  return (
                    <AccordionItem key={simId} value={simId}>
                      <AccordionTrigger className="text-lg font-semibold">
                        {sim?.title} - Before Snapshot
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Current State Description *</Label>
                            <Textarea
                              value={snapshot?.currentState || ''}
                              onChange={(e) => updateSnapshot(index, 'currentState', e.target.value)}
                              placeholder="Describe the current situation..."
                              maxLength={150}
                              rows={3}
                            />
                            <p className="text-xs text-muted-foreground">
                              {(snapshot?.currentState || '').length}/150 characters
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label>Key Stakeholders Involved</Label>
                            <Input
                              value={snapshot?.stakeholders || ''}
                              onChange={(e) => updateSnapshot(index, 'stakeholders', e.target.value)}
                              placeholder="e.g., Sales team, Product, Engineering"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Desired Outcome *</Label>
                            <Input
                              value={snapshot?.desiredOutcome || ''}
                              onChange={(e) => updateSnapshot(index, 'desiredOutcome', e.target.value)}
                              placeholder="What does success look like?"
                            />
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Time Constraint</Label>
                              <Input
                                value={snapshot?.timeConstraint || ''}
                                onChange={(e) => updateSnapshot(index, 'timeConstraint', e.target.value)}
                                placeholder="e.g., 90 days"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Budget Constraint</Label>
                              <Input
                                value={snapshot?.budgetConstraint || ''}
                                onChange={(e) => updateSnapshot(index, 'budgetConstraint', e.target.value)}
                                placeholder="e.g., $50K"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Data Availability</Label>
                              <Input
                                value={snapshot?.dataAvailability || ''}
                                onChange={(e) => updateSnapshot(index, 'dataAvailability', e.target.value)}
                                placeholder="e.g., Limited"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Success Criteria *</Label>
                            <Textarea
                              value={snapshot?.successCriteria || ''}
                              onChange={(e) => updateSnapshot(index, 'successCriteria', e.target.value)}
                              placeholder="How will you measure success?"
                              rows={2}
                            />
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}

            {state.selectedSimulations.length === 2 && (
              <Card className="bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-xl">4-Hour Agenda (Locked Timeboxes)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {AGENDA_SEGMENTS.map((segment, index) => {
                      const simTitle = segment.name === 'Simulation 1'
                        ? SIMULATIONS.find(s => s.id === state.selectedSimulations[0])?.title
                        : segment.name === 'Simulation 2'
                        ? SIMULATIONS.find(s => s.id === state.selectedSimulations[1])?.title
                        : null;

                      return (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 rounded-lg bg-background border"
                        >
                          <span className="font-medium">
                            {segment.name}
                            {simTitle && (
                              <span className="text-sm text-muted-foreground ml-2">
                                ({simTitle})
                              </span>
                            )}
                          </span>
                          <span className="text-muted-foreground">{segment.duration} min</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="font-semibold">Total Duration</span>
                    <span className="font-semibold">
                      {AGENDA_SEGMENTS.reduce((sum, seg) => sum + seg.duration, 0)} minutes
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end pt-6">
              <Button
                onClick={handleSubmit}
                disabled={state.selectedSimulations.length !== 2 || loading}
                size="lg"
              >
                {loading ? 'Creating Plan...' : 'Continue to Booking'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
