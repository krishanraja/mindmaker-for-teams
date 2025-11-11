import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle, CheckCircle2, Plus, X } from "lucide-react";

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
}

export const GuardrailDesigner = ({ 
  aiOutputQuality,
  onGuardrailsComplete,
  initialGuardrail
}: GuardrailDesignerProps) => {
  const [guardrail, setGuardrail] = useState<Guardrail>(initialGuardrail || {
    riskIdentified: "",
    humanCheckpoint: "",
    validationRequired: "",
    redFlags: [],
  });
  const [newRedFlag, setNewRedFlag] = useState("");

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

      <p className="text-sm text-muted-foreground mb-6">
        Based on what you observed, design safeguards to ensure AI is used responsibly
      </p>

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