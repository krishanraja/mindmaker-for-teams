import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Segment4SimulationLabProps {
  workshopId: string;
  bootcampPlanData?: any;
}

export const Segment4SimulationLab: React.FC<Segment4SimulationLabProps> = ({ workshopId, bootcampPlanData }) => {
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null);
  const [beforeData, setBeforeData] = useState({ time_hours: '', cost_usd: '', quality_score: '' });
  const [afterData, setAfterData] = useState({ time_hours: '', cost_usd: '', quality_score: '' });
  const [results, setResults] = useState<any[]>([]);

  // Get customer's selected simulations or use defaults
  const customerSimulations = React.useMemo(() => {
    const sims = [];
    if (bootcampPlanData?.simulation_1_id && bootcampPlanData?.simulation_1_snapshot) {
      sims.push({
        id: bootcampPlanData.simulation_1_id,
        name: bootcampPlanData.simulation_1_snapshot.name || bootcampPlanData.simulation_1_id,
        context: bootcampPlanData.simulation_1_snapshot
      });
    }
    if (bootcampPlanData?.simulation_2_id && bootcampPlanData?.simulation_2_snapshot) {
      sims.push({
        id: bootcampPlanData.simulation_2_id,
        name: bootcampPlanData.simulation_2_snapshot.name || bootcampPlanData.simulation_2_id,
        context: bootcampPlanData.simulation_2_snapshot
      });
    }
    return sims;
  }, [bootcampPlanData]);

  useEffect(() => {
    loadResults();
  }, [workshopId]);

  const loadResults = async () => {
    const { data } = await supabase
      .from('simulation_results')
      .select('*')
      .eq('workshop_session_id', workshopId)
      .order('created_at', { ascending: true });

    if (data) setResults(data);
  };

  const handleSaveSimulation = async () => {
    if (!selectedSimulation) return;

    const simulationName = customerSimulations.find(s => s.id === selectedSimulation)?.name || selectedSimulation;

    const before = {
      time_hours: parseFloat(beforeData.time_hours),
      cost_usd: parseFloat(beforeData.cost_usd),
      quality_score: parseFloat(beforeData.quality_score)
    };

    const after = {
      time_hours: parseFloat(afterData.time_hours),
      cost_usd: parseFloat(afterData.cost_usd),
      quality_score: parseFloat(afterData.quality_score)
    };

    const timeSavingsPct = ((before.time_hours - after.time_hours) / before.time_hours) * 100;
    const costSavingsUsd = before.cost_usd - after.cost_usd;
    const qualityImprovementPct = ((after.quality_score - before.quality_score) / before.quality_score) * 100;

    const { error } = await supabase
      .from('simulation_results')
      .insert({
        workshop_session_id: workshopId,
        simulation_id: selectedSimulation,
        simulation_name: simulationName,
        before_snapshot: before,
        after_snapshot: after,
        time_savings_pct: timeSavingsPct,
        cost_savings_usd: costSavingsUsd,
        quality_improvement_pct: qualityImprovementPct,
        is_selected: true
      });

    if (error) {
      toast({ title: 'Error saving simulation', variant: 'destructive' });
      return;
    }

    toast({ title: 'Simulation saved successfully!' });
    setBeforeData({ time_hours: '', cost_usd: '', quality_score: '' });
    setAfterData({ time_hours: '', cost_usd: '', quality_score: '' });
    setSelectedSimulation(null);
    loadResults();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            Segment 4: The Crystal Ball - AI Simulation Lab (45 minutes)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            <strong>Objective:</strong> Run before/after simulations to quantify AI impact on key workflows.
          </p>

          {customerSimulations.length > 0 && (
            <Card className="bg-primary/10 border-2 border-primary/30">
              <CardContent className="pt-4">
                <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">From Customer Intake</span>
                  Customer's Selected Simulations
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  These workflows were prioritized during the intake process. Run simulations to quantify AI impact.
                </p>
                {customerSimulations.map((sim, idx) => (
                  <div key={idx} className="mb-3 p-3 bg-card rounded-lg border border-border">
                    <div className="font-medium text-sm mb-1">{sim.name}</div>
                    {sim.context?.description && (
                      <div className="text-xs text-muted-foreground">{sim.context.description}</div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">{customerSimulations.length > 0 ? 'Run Simulations' : 'Select Simulation'}</h3>
            <div className="grid grid-cols-1 gap-2">
              {customerSimulations.length > 0 ? customerSimulations.map(sim => (
                <Button
                  key={sim.id}
                  variant={selectedSimulation === sim.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSimulation(sim.id)}
                  className="justify-start"
                >
                  {sim.name}
                </Button>
              )) : (
                <div className="p-6 bg-muted/50 rounded-lg border border-dashed border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    No simulations selected during intake. Contact customer to define workflows to simulate.
                  </p>
                </div>
              )}
            </div>
          </div>

          {selectedSimulation && (
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Before (Current State)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Time (hours)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={beforeData.time_hours}
                      onChange={(e) => setBeforeData({ ...beforeData, time_hours: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cost (USD)</Label>
                    <Input
                      type="number"
                      step="10"
                      value={beforeData.cost_usd}
                      onChange={(e) => setBeforeData({ ...beforeData, cost_usd: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Quality Score (1-10)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={beforeData.quality_score}
                      onChange={(e) => setBeforeData({ ...beforeData, quality_score: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">After (AI-Augmented)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label>Time (hours)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={afterData.time_hours}
                      onChange={(e) => setAfterData({ ...afterData, time_hours: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cost (USD)</Label>
                    <Input
                      type="number"
                      step="10"
                      value={afterData.cost_usd}
                      onChange={(e) => setAfterData({ ...afterData, cost_usd: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Quality Score (1-10)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={afterData.quality_score}
                      onChange={(e) => setAfterData({ ...afterData, quality_score: e.target.value })}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedSimulation && (
            <Button onClick={handleSaveSimulation} className="w-full">
              Save Simulation Results
            </Button>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">Completed Simulations</h3>
              {results.map(result => (
                <Card key={result.id}>
                  <CardContent className="pt-4">
                    <div className="font-medium mb-2">{result.simulation_name}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Time Saved:</span>
                        <div className="font-semibold text-green-600">{result.time_savings_pct?.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cost Saved:</span>
                        <div className="font-semibold text-green-600">${result.cost_savings_usd?.toFixed(0)}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Quality Δ:</span>
                        <div className="font-semibold text-blue-600">+{result.quality_improvement_pct?.toFixed(1)}%</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
