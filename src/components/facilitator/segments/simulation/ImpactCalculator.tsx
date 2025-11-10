import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ImpactCalculatorProps {
  beforeData: {
    time: number;
    cost: number;
    peopleInvolved: number;
    errorRate: number;
    satisfaction: number;
  };
  afterData: {
    time: number;
    cost: number;
    peopleInvolved: number;
    errorRate: number;
    satisfaction: number;
  };
}

export const ImpactCalculator = ({ beforeData, afterData }: ImpactCalculatorProps) => {
  const timeSavings = beforeData.time > 0 
    ? Math.round(((beforeData.time - afterData.time) / beforeData.time) * 100) 
    : 0;
  
  const costSavings = beforeData.cost > 0
    ? Math.round(beforeData.cost - afterData.cost)
    : 0;
  
  const errorReduction = beforeData.errorRate > 0
    ? Math.round(beforeData.errorRate - afterData.errorRate)
    : 0;
  
  const satisfactionImprovement = afterData.satisfaction - beforeData.satisfaction;

  const getImpactColor = (value: number) => {
    if (value > 30) return "text-green-600 dark:text-green-400";
    if (value > 10) return "text-yellow-600 dark:text-yellow-400";
    return "text-muted-foreground";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>📊</span> Live Impact Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Badge variant="outline" className="mb-2">Time Savings</Badge>
          <p className={`text-3xl font-bold ${getImpactColor(timeSavings)}`}>
            {timeSavings}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(beforeData.time - afterData.time)} hours saved
          </p>
        </div>

        <div>
          <Badge variant="outline" className="mb-2">Cost Savings</Badge>
          <p className={`text-3xl font-bold ${costSavings > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            ${costSavings.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">per occurrence</p>
        </div>

        <div>
          <Badge variant="outline" className="mb-2">Error Reduction</Badge>
          <p className={`text-3xl font-bold ${getImpactColor(errorReduction)}`}>
            {errorReduction}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">fewer revisions</p>
        </div>

        <div>
          <Badge variant="outline" className="mb-2">Satisfaction Gain</Badge>
          <p className={`text-3xl font-bold ${satisfactionImprovement > 0 ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
            +{satisfactionImprovement.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">stakeholder rating</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-muted-foreground">
          💡 <strong>People Impact:</strong> {beforeData.peopleInvolved - afterData.peopleInvolved} fewer people required, freeing {Math.round((beforeData.peopleInvolved - afterData.peopleInvolved) * beforeData.time)} person-hours per occurrence
        </p>
      </div>
    </Card>
  );
};
