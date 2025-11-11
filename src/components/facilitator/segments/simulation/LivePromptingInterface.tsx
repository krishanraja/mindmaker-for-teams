import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, ThumbsUp, ThumbsDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface PromptIteration {
  prompt: string;
  response: string;
  rating?: number;
  feedback?: string;
  timestamp: string;
}

interface LivePromptingInterfaceProps {
  scenarioContext: any;
  onIterationComplete: (iteration: PromptIteration) => void;
  iterations: PromptIteration[];
}

export const LivePromptingInterface = ({ 
  scenarioContext, 
  onIterationComplete,
  iterations 
}: LivePromptingInterfaceProps) => {
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [showRating, setShowRating] = useState(false);

  const handleSendPrompt = async () => {
    if (!currentPrompt.trim() || streaming) return;

    setStreaming(true);
    setCurrentResponse("");
    setShowRating(false);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulation-ai-experiment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            scenarioContext,
            userPrompt: currentPrompt,
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to start AI stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              fullResponse += content;
              setCurrentResponse(fullResponse);
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      setShowRating(true);
      
    } catch (error) {
      console.error('Prompting error:', error);
      setCurrentResponse("Error: Failed to get AI response. Please try again.");
    } finally {
      setStreaming(false);
    }
  };

  const handleSaveIteration = () => {
    onIterationComplete({
      prompt: currentPrompt,
      response: currentResponse,
      rating,
      timestamp: new Date().toISOString(),
    });
    
    setCurrentPrompt("");
    setCurrentResponse("");
    setShowRating(false);
    setRating(5);
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Live AI Prompting</h3>
            <p className="text-sm text-muted-foreground">
              Craft prompts together and see AI's response in real-time
            </p>
          </div>
          <Badge variant="outline">
            Iteration {iterations.length + 1}
          </Badge>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="prompt">Team's Prompt</Label>
            <Textarea
              id="prompt"
              value={currentPrompt}
              onChange={(e) => setCurrentPrompt(e.target.value)}
              placeholder="What would you ask AI to help with? Be specific about what you need..."
              rows={4}
              disabled={streaming}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Tip: Include context, desired format, and any constraints
            </p>
          </div>

          <Button 
            onClick={handleSendPrompt}
            disabled={!currentPrompt.trim() || streaming}
            className="w-full"
          >
            {streaming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                AI is responding...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send to AI
              </>
            )}
          </Button>

          {currentResponse && (
            <div className="mt-4 space-y-3">
              <Label>AI Response</Label>
              <Card className="p-4 bg-accent/20">
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-sm">{currentResponse}</p>
                </div>
              </Card>

              {showRating && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label>How useful is this output? (1-10)</Label>
                    <span className="text-2xl font-bold">{rating}</span>
                  </div>
                  <Slider
                    value={[rating]}
                    onValueChange={(v) => setRating(v[0])}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveIteration}
                      className="flex-1"
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Save & Iterate
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {iterations.length > 0 && (
        <Card className="p-6">
          <h4 className="font-semibold mb-3">Previous Iterations</h4>
          <div className="space-y-3">
            {iterations.map((iteration, idx) => (
              <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    Attempt #{idx + 1}
                  </Badge>
                  {iteration.rating && (
                    <Badge variant={iteration.rating >= 7 ? "default" : "outline"}>
                      {iteration.rating}/10
                    </Badge>
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground line-clamp-2">
                  {iteration.prompt}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};