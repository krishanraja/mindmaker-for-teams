import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles } from "lucide-react";
import { SIMULATIONS, getSimulationById } from "@/lib/simulation-constants";
import { ContextCard } from "./simulation/ContextCard";
import { SimulationInterface } from "./simulation/SimulationInterface";
import { TaskBreakdownCanvas, Task } from "./simulation/TaskBreakdownCanvas";
import { GuardrailDesigner, Guardrail } from "./simulation/GuardrailDesigner";
import { ParsedSimulation, extractTasksFromSimulation, extractGuardrailsFromSimulation } from "@/lib/ai-response-parser";

interface Segment4SimulationLabProps {
  workshopId: string;
  bootcampPlanData?: any;
}

type Phase = 'setup' | 'simulation' | 'tasks' | 'guardrails' | 'complete';

export const Segment4SimulationLab = ({ workshopId, bootcampPlanData }: Segment4SimulationLabProps) => {
  const { toast } = useToast();
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null);
  const [currentPhase, setCurrentPhase] = useState<Phase>('setup');
  const [scenarioContext, setScenarioContext] = useState<any>({});
  const [generatedSimulation, setGeneratedSimulation] = useState<ParsedSimulation | null>(null);
  const [taskBreakdown, setTaskBreakdown] = useState<Task[]>([]);
  const [guardrails, setGuardrails] = useState<Guardrail | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [jargonLevel, setJargonLevel] = useState(33); // Default to plain English

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
    if (!selectedSimulation || !generatedSimulation || !taskBreakdown || !guardrails) return;

    setLoading(true);
    try {
      const simulation = getSimulationById(selectedSimulation);
      const automationPct = taskBreakdown.length > 0 
        ? Math.round(((taskBreakdown.filter(t => t.category === 'ai-capable').length + taskBreakdown.filter(t => t.category === 'ai-human').length * 0.5) / taskBreakdown.length) * 100)
        : 0;

      const { error } = await supabase.from("simulation_results").insert([{
        workshop_session_id: workshopId,
        simulation_id: selectedSimulation,
        simulation_name: getSimulationById(selectedSimulation)?.title || selectedSimulation,
        scenario_context: scenarioContext as any,
        ai_outputs: generatedSimulation.sections as any,
        task_breakdown: taskBreakdown as any,
        guardrails: guardrails as any,
        before_snapshot: {},
        after_snapshot: {},
        time_savings_pct: automationPct,
        quality_improvement_pct: 70,
      }]);

      if (error) throw error;

      toast({
        title: "Simulation Saved",
        description: "AI simulation results captured successfully"
      });

      // Reset
      setSelectedSimulation(null);
      setCurrentPhase('setup');
      setScenarioContext({});
      setGeneratedSimulation(null);
      setTaskBreakdown([]);
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

  const handleStartSimulation = () => {
    if (!selectedSimulation) return;
    const sim = customerSimulations.find(s => s.id === selectedSimulation);
    setScenarioContext(sim?.snapshot || {});
    setCurrentPhase('simulation');
  };

  const handleSimulationGenerated = (simulation: ParsedSimulation) => {
    setGeneratedSimulation(simulation);
    
    // Pre-populate task breakdown
    const tasks = extractTasksFromSimulation(simulation);
    setTaskBreakdown(tasks);
    
    // Pre-populate guardrails
    const extractedGuardrails = extractGuardrailsFromSimulation(simulation);
    if (extractedGuardrails) {
      setGuardrails(extractedGuardrails);
    }
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
        <div className="flex gap-2 mb-6">
          <Badge variant="outline">Live AI Testing</Badge>
          <Badge variant="outline">Task Decomposition</Badge>
          <Badge variant="outline">Risk Assessment</Badge>
        </div>

        {/* Content Complexity controlled via context - set during session selection */}
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

      {currentPhase === 'simulation' && (
        <div className="space-y-6">
          {selectedSnapshot && <ContextCard snapshot={selectedSnapshot} />}
          
          <SimulationInterface
            scenarioContext={scenarioContext}
            onSimulationGenerated={handleSimulationGenerated}
            generatedSimulation={generatedSimulation || undefined}
            jargonLevel={jargonLevel}
          />

          <Button
            onClick={() => setCurrentPhase('tasks')}
            disabled={!generatedSimulation}
            size="lg"
            className="w-full"
          >
            Continue to Task Breakdown
          </Button>
        </div>
      )}

      {currentPhase === 'tasks' && (
        <div className="space-y-6">
          <Card className="p-4 bg-primary/5">
            <p className="text-sm">
              <strong>Review & Adjust:</strong> Tasks have been pre-populated from the Mindmaker AI simulation. Review and adjust as needed.
            </p>
          </Card>

          <TaskBreakdownCanvas
            initialTasks={taskBreakdown}
            onBreakdownComplete={(breakdown) => {
              setTaskBreakdown(breakdown.tasks);
              setCurrentPhase('guardrails');
            }}
          />
        </div>
      )}

      {currentPhase === 'guardrails' && (
        <div className="space-y-6">
          <Card className="p-4 bg-primary/5">
            <p className="text-sm">
              <strong>Review & Refine:</strong> Guardrails have been pre-populated from the Mindmaker AI simulation. Review and refine as needed.
            </p>
          </Card>

          <GuardrailDesigner
            aiOutputQuality={7}
            initialGuardrail={guardrails || undefined}
            onGuardrailsComplete={(guardrailData) => {
              setGuardrails(guardrailData);
              handleSaveSimulation();
            }}
          />
        </div>
      )}

      {currentPhase === 'complete' && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Simulation Complete!</h3>
          
          <div className="space-y-4 mb-6">
            <Card className="p-4 bg-muted/50">
              <h4 className="font-semibold mb-2">Simulation Summary</h4>
              <ul className="text-sm space-y-1">
                <li>✓ Generated AI-powered simulation with Mindmaker AI</li>
                <li>✓ Analyzed {taskBreakdown.length} discrete tasks</li>
                <li>✓ Designed comprehensive guardrails</li>
                <li>✓ Results based on AI analysis of your specific scenario</li>
              </ul>
            </Card>
          </div>

          <Button
            onClick={() => {
              setSelectedSimulation(null);
              setCurrentPhase('setup');
              setGeneratedSimulation(null);
              setTaskBreakdown([]);
              setGuardrails(null);
            }}
            variant="outline"
            className="w-full mt-2"
          >
            Run Another Simulation
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
