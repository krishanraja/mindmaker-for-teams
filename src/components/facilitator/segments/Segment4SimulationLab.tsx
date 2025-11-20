import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Zap, Users, UserCheck, UserX, MessageSquare, Clock, Trash2, AlertCircle } from 'lucide-react';
import { SimulationInterface } from './simulation/SimulationInterface';
import { TeamReaction } from '@/types/alignment';

interface Segment4SimulationLabProps {
  workshopId: string;
  bootcampPlanData?: any;
}

interface SimulationResult {
  id: string;
  simulation_id: string;
  team_reactions?: TeamReaction;
  disagreement_points?: string[];
  created_at: string;
  [key: string]: any;
}

export const Segment4SimulationLab: React.FC<Segment4SimulationLabProps> = ({ 
  workshopId,
  bootcampPlanData 
}) => {
  const [currentPhase, setCurrentPhase] = useState<'setup' | 'simulation' | 'team_reaction' | 'complete'>('setup');
  const [selectedSimulation, setSelectedSimulation] = useState<any>(null);
  const [scenarioContext, setScenarioContext] = useState<any>(null);
  const [generatedSimulation, setGeneratedSimulation] = useState<any>(null);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  // Battle Test #1: Team Reaction Tracking
  const [impressed, setImpressed] = useState<string[]>([]);
  const [skeptical, setSkeptical] = useState<string[]>([]);
  const [neutral, setNeutral] = useState<string[]>([]);
  const [disagreements, setDisagreements] = useState<string>('');
  const [reviewTime, setReviewTime] = useState<number>(0);

  // Simulation library
  const customerSimulations = useMemo(() => {
    if (!bootcampPlanData?.simulation_1_snapshot && !bootcampPlanData?.simulation_2_snapshot) return [];
    return [
      bootcampPlanData.simulation_1_snapshot,
      bootcampPlanData.simulation_2_snapshot
    ].filter(Boolean);
  }, [bootcampPlanData]);

  const defaultSimulations = [
    {
      title: "Contract Review Acceleration",
      currentState: "Legal team manually reviews 50+ vendor contracts monthly, taking 2-3 weeks per complex agreement",
      challenge: "Board wants faster deal closure without compromising risk assessment",
      constraints: ["Must maintain compliance standards", "Senior counsel approval still required"],
      successCriteria: ["Reduce review time by 60%", "Zero missed compliance flags"]
    }
  ];

  const availableSimulations = customerSimulations.length > 0 ? customerSimulations : defaultSimulations;

  useEffect(() => {
    loadResults();
  }, [workshopId]);

  const loadResults = async () => {
    try {
      const { data, error } = await supabase
        .from('simulation_results')
        .select('*')
        .eq('workshop_session_id', workshopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExperiment = async (resultId: string) => {
    try {
      const { error } = await supabase
        .from('simulation_results')
        .delete()
        .eq('id', resultId);

      if (error) throw error;

      toast({ title: 'Experiment deleted' });
      loadResults();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({ title: 'Failed to delete', variant: 'destructive' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleStartSimulation = (simulation: any) => {
    setSelectedSimulation(simulation);
    setScenarioContext({
      simulationId: `sim-${Date.now()}`,
      title: simulation.title,
      currentState: simulation.currentState,
      challenge: simulation.challenge,
      constraints: simulation.constraints || [],
      successCriteria: simulation.successCriteria || []
    });
    setCurrentPhase('simulation');
  };

  const handleSimulationGenerated = (simulation: any) => {
    setGeneratedSimulation(simulation);
    setCurrentPhase('team_reaction');
  };

  const handleSaveReaction = async () => {
    if (!scenarioContext || !generatedSimulation) return;

    try {
      const teamReactions: TeamReaction = {
        impressed: impressed,
        skeptical: skeptical,
        neutral: neutral,
        key_disagreements: disagreements.split('\n').filter(d => d.trim())
      };

      const { data, error } = await supabase
        .from('simulation_results')
        .insert({
          workshop_session_id: workshopId,
          simulation_id: scenarioContext.simulationId,
          team_reactions: teamReactions as any,
          disagreement_points: teamReactions.key_disagreements,
          scenario_context: scenarioContext
        })
        .select()
        .single();

      if (error) throw error;

      // Write segment summary
      await supabase.functions.invoke('write-segment-summary', {
        body: {
          workshop_session_id: workshopId,
          segment_number: 4,
          segment_name: 'Battle Test #1: AI Performance',
          summary_data: {
            simulation_title: scenarioContext.title,
            team_split: {
              impressed: impressed.length,
              skeptical: skeptical.length,
              neutral: neutral.length
            },
            disagreement_count: teamReactions.key_disagreements.length,
            review_time_minutes: reviewTime
          }
        }
      });

      toast({ title: 'Battle test results saved!' });
      loadResults();
      resetForm();
    } catch (error) {
      console.error('Error saving reaction:', error);
      toast({ title: 'Failed to save', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setCurrentPhase('setup');
    setSelectedSimulation(null);
    setScenarioContext(null);
    setGeneratedSimulation(null);
    setImpressed([]);
    setSkeptical([]);
    setNeutral([]);
    setDisagreements('');
    setReviewTime(0);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Battle Test #1: Can Your Team Agree on What AI Can Do?
          </CardTitle>
          <CardDescription className="text-base">
            Run live AI simulations and observe how your team reacts. The goal isn't to produce a perfect output—it's to surface where your team aligns or disagrees on AI performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Card className="bg-muted/50 border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Facilitator Note
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>Your job: <strong>Observe, don't solve</strong></p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Watch who's impressed vs. who's skeptical</li>
                <li>Note what triggers disagreement (accuracy? tone? speed?)</li>
                <li>Don't rush to consensus—tension is data</li>
                <li>Track time to review and key sticking points</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Setup Phase */}
      {currentPhase === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle>Select a Simulation to Run</CardTitle>
            <CardDescription>Choose a real workflow from your organization to test with AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {availableSimulations.map((sim, idx) => (
              <Card key={idx} className="p-4 hover:border-primary/50 cursor-pointer transition-colors" onClick={() => handleStartSimulation(sim)}>
                <h4 className="font-semibold mb-2">{sim.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">{sim.currentState}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">{sim.constraints?.length || 0} constraints</Badge>
                  <Badge variant="outline">{sim.successCriteria?.length || 0} success criteria</Badge>
                </div>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Simulation Phase */}
      {currentPhase === 'simulation' && scenarioContext && (
        <SimulationInterface
          workshopId={workshopId}
          simulationId={scenarioContext.simulationId}
          scenarioContext={scenarioContext}
          onSimulationGenerated={handleSimulationGenerated}
        />
      )}

      {/* Team Reaction Tracking */}
      {currentPhase === 'team_reaction' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Track Team Reactions
            </CardTitle>
            <CardDescription>
              Observe and record how your team responded to the AI output. Who was impressed? Who had concerns? What were the sticking points?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Review Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                How long did the team spend reviewing? (minutes)
              </Label>
              <Slider
                value={[reviewTime]}
                onValueChange={(val) => setReviewTime(val[0])}
                min={0}
                max={60}
                step={1}
              />
              <div className="text-right text-sm text-muted-foreground">{reviewTime} minutes</div>
            </div>

            {/* Impressed */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-green-600" />
                Who was impressed or positive about the output?
              </Label>
              <Textarea
                value={impressed.join('\n')}
                onChange={(e) => setImpressed(e.target.value.split('\n').filter(n => n.trim()))}
                placeholder="Enter names (one per line)&#10;e.g., Sarah (CFO)&#10;John (Head of Ops)"
                rows={3}
              />
            </div>

            {/* Skeptical */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <UserX className="h-4 w-4 text-red-600" />
                Who was skeptical or raised concerns?
              </Label>
              <Textarea
                value={skeptical.join('\n')}
                onChange={(e) => setSkeptical(e.target.value.split('\n').filter(n => n.trim()))}
                placeholder="Enter names (one per line)"
                rows={3}
              />
            </div>

            {/* Neutral */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                Who stayed neutral or reserved judgment?
              </Label>
              <Textarea
                value={neutral.join('\n')}
                onChange={(e) => setNeutral(e.target.value.split('\n').filter(n => n.trim()))}
                placeholder="Enter names (one per line)"
                rows={3}
              />
            </div>

            {/* Disagreements */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-600" />
                What specific disagreements surfaced?
              </Label>
              <Textarea
                value={disagreements}
                onChange={(e) => setDisagreements(e.target.value)}
                placeholder="Note specific points of disagreement (one per line)&#10;e.g., CFO questioned accuracy of financial projections&#10;Head of Legal concerned about compliance language"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveReaction} className="flex-1">
                Save Battle Test Results
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Run Another Test
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Battle Tests */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Completed Battle Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{result.simulation_title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(result.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteConfirm(result.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {result.team_reactions && (
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span>{result.team_reactions.impressed?.length || 0} impressed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserX className="h-4 w-4 text-red-600" />
                      <span>{result.team_reactions.skeptical?.length || 0} skeptical</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-orange-600" />
                      <span>{result.disagreement_points?.length || 0} disagreements</span>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this battle test?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this simulation and team reaction data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteConfirm && handleDeleteExperiment(deleteConfirm)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
