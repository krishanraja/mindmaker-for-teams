import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Shield, AlertTriangle, CheckCircle2, Plus, X, Loader2 } from "lucide-react";
import { AIGenerateButton } from "@/components/ui/ai-generate-button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Guardrail {
  riskIdentified: string;
  humanCheckpoint: string;
  validationRequired: string;
  redFlags: string[];
}

interface GuardrailDesignerProps {
  aiOutputQuality: number;
  onGuardrailsComplete: (guardrails: Guardrail) => void;
  initialGuardrail?: Guardrail;
  scenarioContext?: any;
  simulationResults?: any;
  workshopId?: string;
  simulationId?: string;
}

export const GuardrailDesigner = ({ 
  aiOutputQuality,
  onGuardrailsComplete,
  initialGuardrail,
  scenarioContext,
  simulationResults,
  workshopId,
  simulationId
}: GuardrailDesignerProps) => {
  const [guardrail, setGuardrail] = useState<Guardrail>(initialGuardrail || {
    riskIdentified: "",
    humanCheckpoint: "",
    validationRequired: "",
    redFlags: [],
  });
  const [newRedFlag, setNewRedFlag] = useState("");
  const [riskTolerance, setRiskTolerance] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);

  // Autosave guardrail changes
  useEffect(() => {
    if (!workshopId || !simulationId || !guardrail.riskIdentified) return;
    
    const saveGuardrails = async () => {
      await supabase
        .from('simulation_results')
        .update({ guardrails: guardrail as any })
        .eq('workshop_session_id', workshopId)
        .eq('id', simulationId);
    };
    
    const timer = setTimeout(saveGuardrails, 1000);
    return () => clearTimeout(timer);
  }, [guardrail, workshopId, simulationId]);

  const getRiskLabel = (value: number) => {
    if (value < 34) return 'Conservative (Maximum Oversight)';
    if (value < 67) return 'Balanced';
    return 'Aggressive (Trust AI Performance)';
  };

  const addRedFlag = () => {
    if (!newRedFlag.trim()) return;
    setGuardrail({
      ...guardrail,
      redFlags: [...guardrail.redFlags, newRedFlag],
    });
    setNewRedFlag("");
  };

  const removeRedFlag = (index: number) => {
    setGuardrail({
      ...guardrail,
      redFlags: guardrail.redFlags.filter((_, i) => i !== index),
    });
  };

  const handleGenerateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-guardrails', {
        body: {
          scenario_context: scenarioContext,
          simulation_results: simulationResults,
          ai_output_quality: aiOutputQuality,
          risk_tolerance: riskTolerance,
        },
      });

      if (error) throw error;

      if (data?.guardrail) {
        setGuardrail(data.guardrail);
        toast({ 
          title: 'AI generated guardrails!', 
          description: `Created ${data.guardrail.redFlags?.length || 0} red flags based on ${getRiskLabel(riskTolerance).toLowerCase()} approach` 
        });
      }
    } catch (error: any) {
      console.error('Error generating guardrails:', error);
      toast({ 
        title: 'Error generating guardrails', 
        description: error.message,
        variant: 'destructive' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    onGuardrailsComplete(guardrail);
  };

  const isComplete = guardrail.riskIdentified && guardrail.humanCheckpoint && guardrail.validationRequired;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Risk & Guardrail Design</h3>
      </div>

      {aiOutputQuality < 7 && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium">AI output quality was rated {aiOutputQuality}/10</p>
            <p className="text-muted-foreground text-xs mt-1">
              Extra care needed when designing guardrails - the team saw limitations firsthand
            </p>
          </div>
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-4">
        Based on what you observed, design safeguards to ensure AI is used responsibly
      </p>

      <div className="space-y-4 mb-6 p-4 bg-muted/50 rounded-lg border">
        <div className="space-y-2">
          <Label className="flex justify-between">
            <span>Risk Tolerance</span>
            <span className="text-sm font-medium">{getRiskLabel(riskTolerance)}</span>
          </Label>
          <Slider
            value={[riskTolerance]}
            onValueChange={(value) => setRiskTolerance(value[0])}
            min={0}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Conservative</span>
            <span>Aggressive</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {riskTolerance < 34 && "Maximum human oversight, comprehensive validation required"}
            {riskTolerance >= 34 && riskTolerance < 67 && "Balanced approach based on observed AI performance"}
            {riskTolerance >= 67 && "Trust AI capabilities, lighter oversight where appropriate"}
          </p>
        </div>
        
        <AIGenerateButton
          onClick={handleGenerateWithAI}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Guardrails...
            </>
          ) : (
            "Generate Guardrails with AI"
          )}
        </AIGenerateButton>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="risk">What could go wrong?</Label>
          <Textarea
            id="risk"
            value={guardrail.riskIdentified}
            onChange={(e) => setGuardrail({ ...guardrail, riskIdentified: e.target.value })}
            placeholder="List potential failure modes you observed or can anticipate..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Think about: accuracy issues, bias, missing context, over-reliance
          </p>
        </div>

        <div>
          <Label htmlFor="checkpoint">Required Human Checkpoints</Label>
          <Textarea
            id="checkpoint"
            value={guardrail.humanCheckpoint}
            onChange={(e) => setGuardrail({ ...guardrail, humanCheckpoint: e.target.value })}
            placeholder="Define where humans must review/approve before proceeding..."
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Example: "Senior analyst must review all financial projections before distribution"
          </p>
        </div>

        <div>
          <Label htmlFor="validation">Validation & Testing Requirements</Label>
          <Textarea
            id="validation"
            value={guardrail.validationRequired}
            onChange={(e) => setGuardrail({ ...guardrail, validationRequired: e.target.value })}
            placeholder="How will you verify AI output quality over time?"
            rows={3}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Example: "Spot-check 10% of outputs weekly, track error rates monthly"
          </p>
        </div>

        <div>
          <Label>Red Flags (When to override AI)</Label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newRedFlag}
              onChange={(e) => setNewRedFlag(e.target.value)}
              placeholder="e.g., Output contradicts known data"
              onKeyDown={(e) => e.key === 'Enter' && addRedFlag()}
            />
            <Button onClick={addRedFlag} size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {guardrail.redFlags.length > 0 && (
            <div className="space-y-2 mt-3">
              {guardrail.redFlags.map((flag, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-red-500/10 rounded">
                  <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm flex-1">{flag}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => removeRedFlag(idx)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Button 
        onClick={handleComplete}
        disabled={!isComplete}
        className="w-full mt-6"
      >
        {isComplete ? (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Save Guardrails
          </>
        ) : (
          "Complete all fields to continue"
        )}
      </Button>
    </Card>
  );
};