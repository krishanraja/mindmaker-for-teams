import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { SIMULATIONS, getSimulationById } from "@/lib/simulation-constants";
import { ContextCard } from "./simulation/ContextCard";
import { DiscussionPrompts } from "./simulation/DiscussionPrompts";
import { ImpactCalculator } from "./simulation/ImpactCalculator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Segment4SimulationLabProps {
  workshopId: string;
  bootcampPlanData?: any;
}

export const Segment4SimulationLab = ({ workshopId, bootcampPlanData }: Segment4SimulationLabProps) => {
  const { toast } = useToast();
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null);
  const [beforeData, setBeforeData] = useState({
    time: 0,
    cost: 0,
    peopleInvolved: 0,
    errorRate: 0,
    satisfaction: 5
  });
  const [afterData, setAfterData] = useState({
    time: 0,
    cost: 0,
    peopleInvolved: 0,
    errorRate: 0,
    satisfaction: 5
  });
  const [qualitativeData, setQualitativeData] = useState({
    changes: "",
    risks: "",
    orgChanges: [] as string[]
  });
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
    if (!selectedSimulation) return;

    setLoading(true);
    try {
      const simulation = getSimulationById(selectedSimulation);
      const timeSavingsPct = beforeData.time > 0 
        ? ((beforeData.time - afterData.time) / beforeData.time) * 100 
        : 0;
      const costSavingsUsd = beforeData.cost - afterData.cost;
      const errorReductionPct = beforeData.errorRate - afterData.errorRate;

      const { error } = await supabase.from("simulation_results").insert({
        workshop_session_id: workshopId,
        simulation_id: selectedSimulation,
        simulation_name: simulation?.title || selectedSimulation,
        before_snapshot: {
          time: beforeData.time,
          cost: beforeData.cost,
          peopleInvolved: beforeData.peopleInvolved,
          errorRate: beforeData.errorRate,
          satisfaction: beforeData.satisfaction
        },
        after_snapshot: {
          time: afterData.time,
          cost: afterData.cost,
          peopleInvolved: afterData.peopleInvolved,
          errorRate: afterData.errorRate,
          satisfaction: afterData.satisfaction,
          qualitativeChanges: qualitativeData.changes,
          risksIntroduced: qualitativeData.risks,
          orgChangesRequired: qualitativeData.orgChanges
        },
        time_savings_pct: timeSavingsPct,
        cost_savings_usd: costSavingsUsd,
        quality_improvement_pct: errorReductionPct,
        people_involved_before: beforeData.peopleInvolved,
        people_involved_after: afterData.peopleInvolved,
        error_rate_before_pct: beforeData.errorRate,
        error_rate_after_pct: afterData.errorRate,
        satisfaction_before: beforeData.satisfaction,
        satisfaction_after: afterData.satisfaction,
        qualitative_changes: qualitativeData.changes,
        risks_introduced: qualitativeData.risks,
        org_changes_required: qualitativeData.orgChanges
      });

      if (error) throw error;

      toast({
        title: "Simulation Saved",
        description: "Results captured successfully"
      });

      // Reset form
      setSelectedSimulation(null);
      setBeforeData({ time: 0, cost: 0, peopleInvolved: 0, errorRate: 0, satisfaction: 5 });
      setAfterData({ time: 0, cost: 0, peopleInvolved: 0, errorRate: 0, satisfaction: 5 });
      setQualitativeData({ changes: "", risks: "", orgChanges: [] });
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

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Simulation Lab: Quantify the Impact</h2>
        <p className="text-muted-foreground mb-6">
          Run guided simulations based on your customer's real scenarios. Lead a structured discussion to quantify AI's potential impact.
        </p>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-semibold">
              {hasPreselectedSimulations ? "Customer Pre-Selected Simulations" : "Available Simulations"}
            </h3>
            <Badge variant={hasPreselectedSimulations ? "default" : "outline"}>
              {hasPreselectedSimulations ? "From Bootcamp Plan" : "Choose During Workshop"}
            </Badge>
          </div>
          {!hasPreselectedSimulations && (
            <p className="text-sm text-muted-foreground mb-4">
              Select a simulation scenario to run with your team. You'll define the context together.
            </p>
          )}
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
          <div className="space-y-6">
            {selectedSnapshot ? (
              <ContextCard snapshot={selectedSnapshot} />
            ) : (
              <Card className="p-6 bg-muted/50">
                <h3 className="font-semibold mb-3">📋 Define Your Scenario</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Work with your team to describe the specific scenario you want to simulate.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label>Current State</Label>
                    <Textarea 
                      placeholder="Describe the current process/challenge..."
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Desired Outcome</Label>
                    <Textarea 
                      placeholder="What would success look like?"
                      rows={2}
                    />
                  </div>
                  <div>
                    <Label>Key Stakeholders</Label>
                    <Input placeholder="Who is impacted?" />
                  </div>
                </div>
              </Card>
            )}
            
            <DiscussionPrompts />

            <Tabs defaultValue="before" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="before">Current State</TabsTrigger>
                <TabsTrigger value="after">AI-Augmented State</TabsTrigger>
                <TabsTrigger value="impact">Impact Summary</TabsTrigger>
              </TabsList>

              <TabsContent value="before" className="space-y-4 mt-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-lg">Current/Manual Process</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="before-time">Time Investment (hours)</Label>
                      <Input
                        id="before-time"
                        type="number"
                        value={beforeData.time}
                        onChange={(e) => setBeforeData({ ...beforeData, time: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 8"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="before-cost">Resource Cost (USD)</Label>
                      <Input
                        id="before-cost"
                        type="number"
                        value={beforeData.cost}
                        onChange={(e) => setBeforeData({ ...beforeData, cost: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 2000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="before-people">People Involved</Label>
                      <Input
                        id="before-people"
                        type="number"
                        value={beforeData.peopleInvolved}
                        onChange={(e) => setBeforeData({ ...beforeData, peopleInvolved: parseInt(e.target.value) || 0 })}
                        placeholder="e.g., 5"
                      />
                      <p className="text-xs text-muted-foreground">How many people touch this process?</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="before-error">Error/Revision Rate (%)</Label>
                      <Input
                        id="before-error"
                        type="number"
                        value={beforeData.errorRate}
                        onChange={(e) => setBeforeData({ ...beforeData, errorRate: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 30"
                      />
                      <p className="text-xs text-muted-foreground">What % needs rework or revisions?</p>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label htmlFor="before-satisfaction" className="cursor-help underline decoration-dotted">
                              Stakeholder Satisfaction (1-10)
                            </Label>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p>How happy are key stakeholders with the current output?</p>
                            <p className="text-xs mt-1">1 = needs major rework, 10 = exceeds expectations</p>
                            {selectedSnapshot.stakeholders && (
                              <p className="text-xs mt-2 font-semibold">Rating satisfaction for: {selectedSnapshot.stakeholders}</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Input
                        id="before-satisfaction"
                        type="number"
                        min="1"
                        max="10"
                        value={beforeData.satisfaction}
                        onChange={(e) => setBeforeData({ ...beforeData, satisfaction: parseFloat(e.target.value) || 5 })}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="after" className="space-y-4 mt-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 text-lg">AI-Augmented Process</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="after-time">Time Investment (hours)</Label>
                      <Input
                        id="after-time"
                        type="number"
                        value={afterData.time}
                        onChange={(e) => setAfterData({ ...afterData, time: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="after-cost">Resource Cost (USD)</Label>
                      <Input
                        id="after-cost"
                        type="number"
                        value={afterData.cost}
                        onChange={(e) => setAfterData({ ...afterData, cost: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="after-people">People Involved</Label>
                      <Input
                        id="after-people"
                        type="number"
                        value={afterData.peopleInvolved}
                        onChange={(e) => setAfterData({ ...afterData, peopleInvolved: parseInt(e.target.value) || 0 })}
                        placeholder="e.g., 2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="after-error">Error/Revision Rate (%)</Label>
                      <Input
                        id="after-error"
                        type="number"
                        value={afterData.errorRate}
                        onChange={(e) => setAfterData({ ...afterData, errorRate: parseFloat(e.target.value) || 0 })}
                        placeholder="e.g., 10"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="after-satisfaction">Stakeholder Satisfaction (1-10)</Label>
                      <Input
                        id="after-satisfaction"
                        type="number"
                        min="1"
                        max="10"
                        value={afterData.satisfaction}
                        onChange={(e) => setAfterData({ ...afterData, satisfaction: parseFloat(e.target.value) || 5 })}
                      />
                    </div>
                  </div>

                  <div className="mt-6 space-y-4 pt-6 border-t">
                    <h4 className="font-semibold">Qualitative Insights</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="changes">What changes in the workflow?</Label>
                      <Textarea
                        id="changes"
                        value={qualitativeData.changes}
                        onChange={(e) => setQualitativeData({ ...qualitativeData, changes: e.target.value })}
                        placeholder="Describe how the process transforms with AI..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="risks">Risks introduced by AI</Label>
                      <Textarea
                        id="risks"
                        value={qualitativeData.risks}
                        onChange={(e) => setQualitativeData({ ...qualitativeData, risks: e.target.value })}
                        placeholder="What could go wrong? What safeguards are needed?"
                        rows={3}
                      />
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="impact" className="mt-6">
                <ImpactCalculator beforeData={beforeData} afterData={afterData} />
              </TabsContent>
            </Tabs>

            <Button 
              onClick={handleSaveSimulation} 
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Simulation Results
            </Button>
          </div>
        )}
      </Card>

      {results.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Completed Simulations</h3>
          <div className="space-y-4">
            {results.map((result) => (
              <Card key={result.id} className="p-4">
                <h4 className="font-semibold mb-2">{result.simulation_name}</h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Time Savings</p>
                    <p className="text-lg font-bold text-green-600">{result.time_savings_pct?.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cost Savings</p>
                    <p className="text-lg font-bold text-green-600">${result.cost_savings_usd?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Error Reduction</p>
                    <p className="text-lg font-bold text-green-600">{result.quality_improvement_pct?.toFixed(1)}%</p>
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
