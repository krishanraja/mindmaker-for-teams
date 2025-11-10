import { Card } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export const DiscussionPrompts = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="p-4 bg-accent/50">
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h4 className="font-semibold">Facilitator Discussion Guide</h4>
          </div>
          <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4 space-y-3 text-sm">
          <div>
            <p className="font-medium mb-1">1. READ the customer context aloud (30 sec)</p>
            <p className="text-muted-foreground text-xs">Set the scene for everyone in the room</p>
          </div>

          <div>
            <p className="font-medium mb-1">2. ASK the room: "Who here has dealt with this scenario?"</p>
            <p className="text-muted-foreground text-xs">Build relatability and get buy-in</p>
          </div>

          <div>
            <p className="font-medium mb-1">3. DISCUSS current state (5-7 min):</p>
            <ul className="text-muted-foreground text-xs list-disc list-inside space-y-1 ml-2">
              <li>"Walk me through the current process step-by-step"</li>
              <li>"How many people get pulled into this?"</li>
              <li>"What percentage of time is spent on revisions or rework?"</li>
              <li>"How satisfied are stakeholders with the current output?"</li>
            </ul>
          </div>

          <div>
            <p className="font-medium mb-1">4. INTRODUCE AI augmentation (3-5 min):</p>
            <ul className="text-muted-foreground text-xs list-disc list-inside space-y-1 ml-2">
              <li>"What if AI could draft the first version?"</li>
              <li>"What if AI could analyze patterns from past examples?"</li>
              <li>"What human judgment would still be critical?"</li>
            </ul>
          </div>

          <div>
            <p className="font-medium mb-1">5. QUANTIFY the after state together (5 min)</p>
            <p className="text-muted-foreground text-xs">Collaboratively estimate the AI-augmented metrics</p>
          </div>

          <div>
            <p className="font-medium mb-1">6. CAPTURE qualitative insights (3 min)</p>
            <p className="text-muted-foreground text-xs">What changes? What risks? What org changes needed?</p>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
