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
}

const SIMULATIONS = [
  { id: 'analyst-brief', name: 'Analyst Brief (Tedious Research → AI-Augmented Insights)' },
  { id: 'contract-review', name: 'Contract Review (Manual Red-lining → AI First-Pass)' },
  { id: 'customer-support', name: 'Customer Support Ticket Triage' },
  { id: 'sales-proposal', name: 'Sales Proposal Generation' },
  { id: 'compliance-audit', name: 'Compliance Audit Pre-Check' },
];

export const Segment4SimulationLab: React.FC<Segment4SimulationLabProps> = ({ workshopId }) => {
  const [selectedSimulation, setSelectedSimulation] = useState<string | null>(null);
  const [beforeData, setBeforeData] = useState({ time_hours: '', cost_usd: '', quality_score: '' });
  const [afterData, setAfterData] = useState({ time_hours: '', cost_usd: '', quality_score: '' });
  const [results, setResults] = useState<any[]>([]);

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

    const simulationName = SIMULATIONS.find(s => s.id === selectedSimulation)?.name || '';

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

          <div className="space-y-4">
            <h3 className="font-semibold">Select Simulation</h3>
            <div className="grid grid-cols-1 gap-2">
              {SIMULATIONS.map(sim => (
                <Button
                  key={sim.id}
                  variant={selectedSimulation === sim.id ? 'default' : 'outline'}
                  onClick={() => setSelectedSimulation(sim.id)}
                  className="justify-start"
                >
                  {sim.name}
                </Button>
              ))}
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
