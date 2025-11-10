import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ContextCardProps {
  snapshot: {
    currentState?: string;
    stakeholders?: string;
    desiredOutcome?: string;
    constraints?: string;
    successCriteria?: string;
  };
}

export const ContextCard = ({ snapshot }: ContextCardProps) => {
  if (!snapshot.currentState && !snapshot.stakeholders && !snapshot.desiredOutcome) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📋</span>
        <h3 className="text-lg font-semibold">Scenario Context (From Customer Intake)</h3>
      </div>
      
      <div className="space-y-4">
        {snapshot.currentState && (
          <div>
            <Badge variant="outline" className="mb-2">Current Situation</Badge>
            <p className="text-sm text-muted-foreground italic">"{snapshot.currentState}"</p>
          </div>
        )}

        {snapshot.stakeholders && (
          <div>
            <Badge variant="outline" className="mb-2">Key Players</Badge>
            <p className="text-sm">{snapshot.stakeholders}</p>
          </div>
        )}

        {snapshot.desiredOutcome && (
          <div>
            <Badge variant="outline" className="mb-2">Desired Outcome</Badge>
            <p className="text-sm text-muted-foreground">{snapshot.desiredOutcome}</p>
          </div>
        )}

        {snapshot.constraints && (
          <div>
            <Badge variant="outline" className="mb-2">Constraints</Badge>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{snapshot.constraints}</p>
          </div>
        )}

        {snapshot.successCriteria && (
          <div>
            <Badge variant="outline" className="mb-2">Success Looks Like</Badge>
            <p className="text-sm text-muted-foreground">{snapshot.successCriteria}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
