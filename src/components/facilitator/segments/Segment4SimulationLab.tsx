import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { SIMULATIONS, getSimulationById } from "@/lib/simulation-constants";
import { ContextCard } from "./simulation/ContextCard";
import { LivePromptingInterface } from "./simulation/LivePromptingInterface";
import { TaskBreakdownCanvas } from "./simulation/TaskBreakdownCanvas";
import { GuardrailDesigner } from "./simulation/GuardrailDesigner";

interface Segment4SimulationLabProps {
  workshopId: string;
  bootcampPlanData?: any;
}

type Phase = 'setup' | 'prompting' | 'tasks' | 'guardrails' | 'complete';

export const Segment4SimulationLab = ({ workshopId, bootcampPlanData }: Segment4SimulationLabProps) => {
  const { toast } = useToast();
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase>('setup');
  const [scenarioContext, setScenarioContext] = useState<any>({});
  const [promptIterations, setPromptIterations] = useState<any[]>([]);
  const [taskBreakdown, setTaskBreakdown] = useState<any>(null);
  const [guardrails, setGuardrails] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const customerSimulations = useMemo(() => {
    if (!bootcampPlanData) return [];
    
    const sims = [];
    if (bootcampPlanData.simulation_1_id) {
      sims.push({
        id: bootcampPlanData.simulation_1_id,
        snapshot: bootcampPlanData.simulation_1_snapshot
      });
    }
    if (bootcampPlanData.simulation_2_id) {
      sims.push({
        id: bootcampPlanData.simulation_2_id,
        snapshot: bootcampPlanData.simulation_2_snapshot
      });
    }
    return sims;
  }, [bootcampPlanData]);

  const availableSimulations = useMemo(() => {
    if (customerSimulations.length > 0) {
      return customerSimulations;
    }
    
    // Fallback: show all simulations
    return SIMULATIONS.map(sim => ({
      id: sim.id,
      snapshot: null
    }));
  }, [customerSimulations]);

  const hasPreselectedSimulations = customerSimulations.length > 0;

  useEffect(() => {
    loadResults();
  }, [workshopId]);

  const loadResults = async () => {
    const { data, error } = await supabase
      .from("simulation_results")
      .select("*")
      .eq("workshop_session_id", workshopId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading simulation results:", error);
      return;
    }

    setResults(data || []);
  };

  const handleSaveSimulation = async () => {
    if (!selectedSimulation || !taskBreakdown || !guardrails) return;

    setLoading(true);
    try {
      const simulation = getSimulationById(selectedSimulation);
      const avgRating = promptIterations.length > 0
        ? promptIterations.reduce((sum, it) => sum + (it.rating || 0), 0) / promptIterations.length
        : 0;

      const { error } = await supabase.from("simulation_results").insert({
        workshop_session_id: workshopId,
        simulation_id: selectedSimulation,
        simulation_name: simulation?.title || selectedSimulation,
        scenario_context: scenarioContext,
        prompts_used: promptIterations,
        ai_outputs: promptIterations.map(it => ({ prompt: it.prompt, response: it.response })),
        output_quality_ratings: promptIterations.map(it => it.rating),
        task_breakdown: taskBreakdown,
        guardrails: guardrails,
        before_snapshot: {},
        after_snapshot: {},
        time_savings_pct: taskBreakdown.automationPct,
        quality_improvement_pct: avgRating * 10,
      });

      if (error) throw error;

      toast({
        title: "AI Experiment Saved",
        description: "Live simulation results captured successfully"
      });

      // Reset
      setSelectedSimulation(null);
      setCurrentPhase('setup');
      setScenarioContext({});
      setPromptIterations([]);
      setTaskBreakdown(null);
      setGuardrails(null);
      loadResults();
    } catch (error) {
      console.error("Error saving simulation:", error);
      toast({
        title: "Error",
        description: "Failed to save simulation results",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedSnapshot = useMemo(() => {
    if (!selectedSimulation) return null;
    const sim = customerSimulations.find(s => s.id === selectedSimulation);
    return sim?.snapshot || null;
  }, [selectedSimulation, customerSimulations]);

  const avgPromptRating = useMemo(() => {
    if (promptIterations.length === 0) return 0;
    return Math.round(promptIterations.reduce((sum, it) => sum + (it.rating || 0), 0) / promptIterations.length);
  }, [promptIterations]);

  const handleStartSimulation = () => {
    if (!selectedSimulation) return;
    const sim = customerSimulations.find(s => s.id === selectedSimulation);
    setScenarioContext(sim?.snapshot || {});
    setCurrentPhase('prompting');
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3 mb-3">
          <Sparkles className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Interactive AI Lab</h2>
        </div>
        <p className="text-muted-foreground mb-4">
          Test AI capabilities live with your team. See what AI can actually do, then design guardrails based on real observations—not guesses.
        </p>
        <div className="flex gap-2">
          <Badge variant="outline">Live AI Testing</Badge>
          <Badge variant="outline">Task Decomposition</Badge>
          <Badge variant="outline">Risk Assessment</Badge>
        </div>
      </Card>

      {currentPhase === 'setup' && (
        <Card className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-semibold">
                {hasPreselectedSimulations ? "Customer Pre-Selected Simulations" : "Available Simulations"}
              </h3>
              <Badge variant={hasPreselectedSimulations ? "default" : "outline"}>
                {hasPreselectedSimulations ? "From Bootcamp Plan" : "Choose During Workshop"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Select a business scenario to test with live AI. The team will see AI work in real-time.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {availableSimulations.map((sim) => {
                const simInfo = getSimulationById(sim.id);
                return (
                  <Button
                    key={sim.id}
                    variant={selectedSimulation === sim.id ? "default" : "outline"}
                    className="h-auto py-4 px-4 justify-start text-left"
                    onClick={() => setSelectedSimulation(sim.id)}
                  >
                    <div>
                      <div className="font-semibold">{simInfo?.title || sim.id}</div>
                      <div className="text-xs opacity-80 mt-1">{simInfo?.description}</div>
                    </div>
                  </Button>
                );
              })}
            </div>
          </div>

          {selectedSimulation && (
            <>
              {selectedSnapshot && <ContextCard snapshot={selectedSnapshot} />}
              
              <Button 
                onClick={handleStartSimulation}
                size="lg"
                className="w-full"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Interactive AI Experiment
              </Button>
            </>
          )}
        </Card>
      )}

      {currentPhase === 'prompting' && (
        <div className="space-y-6">
          {selectedSnapshot && <ContextCard snapshot={selectedSnapshot} />}
          
          <LivePromptingInterface
            scenarioContext={scenarioContext}
            iterations={promptIterations}
            onIterationComplete={(iteration) => {
              setPromptIterations([...promptIterations, iteration]);
            }}
          />

          <Button
            onClick={() => setCurrentPhase('tasks')}
            disabled={promptIterations.length === 0}
            size="lg"
            className="w-full"
          >
            Continue to Task Breakdown ({promptIterations.length} iterations completed)
          </Button>
        </div>
      )}

      {currentPhase === 'tasks' && (
        <div className="space-y-6">
          <Card className="p-4 bg-primary/5">
            <p className="text-sm">
              <strong>Reflection:</strong> You completed {promptIterations.length} prompt iteration(s) with an average quality rating of {avgPromptRating}/10. 
              Now let's break down which tasks AI can handle based on what you observed.
            </p>
          </Card>

          <TaskBreakdownCanvas
            onBreakdownComplete={(breakdown) => {
              setTaskBreakdown(breakdown);
              setCurrentPhase('guardrails');
            }}
          />
        </div>
      )}

      {currentPhase === 'guardrails' && (
        <div className="space-y-6">
          <Card className="p-4 bg-primary/5">
            <p className="text-sm">
              <strong>Progress:</strong> Based on task decomposition, ~{taskBreakdown?.automationPct}% of this workflow could be AI-augmented. 
              Now design the safeguards needed to deploy this responsibly.
            </p>
          </Card>

          <GuardrailDesigner
            aiOutputQuality={avgPromptRating}
            onGuardrailsComplete={(guardrailData) => {
              setGuardrails(guardrailData);
              setCurrentPhase('complete');
            }}
          />
        </div>
      )}

      {currentPhase === 'complete' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Experiment Complete!</h3>
          
          <div className="space-y-4 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">AI Output Quality</p>
                <p className="text-2xl font-bold">{avgPromptRating}/10</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Automation Potential</p>
                <p className="text-2xl font-bold">{taskBreakdown?.automationPct}%</p>
              </Card>
              <Card className="p-4">
                <p className="text-sm text-muted-foreground mb-1">Tasks Analyzed</p>
                <p className="text-2xl font-bold">{taskBreakdown?.tasks.length}</p>
              </Card>
            </div>

            <Card className="p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">Key Learnings</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Team tested AI with {promptIterations.length} real prompts</li>
                <li>✓ Decomposed workflow into {taskBreakdown?.tasks.length} discrete tasks</li>
                <li>✓ Designed guardrails based on observed AI behavior</li>
                <li>✓ Estimates grounded in actual experimentation, not guesses</li>
              </ul>
            </Card>
          </div>

          <Button
            onClick={handleSaveSimulation}
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Experiment Results"
            )}
          </Button>

          <Button
            onClick={() => {
              setSelectedSimulation(null);
              setCurrentPhase('setup');
              setPromptIterations([]);
              setTaskBreakdown(null);
              setGuardrails(null);
            }}
            variant="outline"
            className="w-full mt-2"
          >
            Run Another Experiment
          </Button>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Completed Experiments</h3>
          <div className="space-y-3">
            {results.map((result) => (
              <Card key={result.id} className="p-4 bg-muted/30">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{result.simulation_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {new Date(result.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {result.prompts_used?.length || 0} prompts
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">AI Quality</p>
                    <p className="text-lg font-bold">
                      {result.output_quality_ratings?.length > 0 
                        ? Math.round(result.output_quality_ratings.reduce((a: number, b: number) => a + b, 0) / result.output_quality_ratings.length)
                        : 0}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Automation</p>
                    <p className="text-lg font-bold text-green-600">{result.time_savings_pct?.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Tasks</p>
                    <p className="text-lg font-bold">{result.task_breakdown?.tasks?.length || 0}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
