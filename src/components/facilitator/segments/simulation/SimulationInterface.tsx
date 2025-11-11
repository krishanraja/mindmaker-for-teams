import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StructuredSimulationDisplay } from './StructuredSimulationDisplay';
import { parseSimulationResponse, ParsedSimulation } from '@/lib/ai-response-parser';

interface SimulationInterfaceProps {
  scenarioContext: any;
  onSimulationGenerated: (simulation: ParsedSimulation) => void;
  generatedSimulation?: ParsedSimulation;
}

export const SimulationInterface: React.FC<SimulationInterfaceProps> = ({
  scenarioContext,
  onSimulationGenerated,
  generatedSimulation
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [followUpPrompt, setFollowUpPrompt] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [followUpResponse, setFollowUpResponse] = useState('');

  const handleGenerateSimulation = async () => {
    setIsGenerating(true);
    setElapsedTime(0);
    setLoadingStage('Analyzing scenario...');

    const timer = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 1;
        if (next === 2) setLoadingStage('Generating executive insights...');
        if (next === 4) setLoadingStage('Almost there...');
        return next;
      });
    }, 1000);

    try {
      const { data, error } = await supabase.functions.invoke('simulation-ai-experiment', {
        body: {
          scenarioContext,
          mode: 'generate_simulation'
        }
      });

      if (error) throw error;

      const parsed = parseSimulationResponse(data.content);
      onSimulationGenerated(parsed);
      toast.success('Discussion guide ready');
    } catch (error) {
      console.error('Error generating simulation:', error);
      toast.error('Failed to generate simulation');
    } finally {
      clearInterval(timer);
      setIsGenerating(false);
      setLoadingStage('');
    }
  };

  const handleAskFollowUp = async () => {
    if (!followUpPrompt.trim()) return;

    setIsAsking(true);
    setFollowUpResponse('');

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/simulation-ai-experiment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({
            scenarioContext,
            userPrompt: followUpPrompt,
            mode: 'iterate'
          })
        }
      );

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                setFollowUpResponse(prev => prev + content);
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      toast.success('Response received');
    } catch (error) {
      console.error('Error asking follow-up:', error);
      toast.error('Failed to get response');
    } finally {
      setIsAsking(false);
    }
  };

  if (!generatedSimulation) {
    return (
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate AI Simulation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Scenario Context:</h4>
            <p className="text-sm text-muted-foreground">{scenarioContext.currentState}</p>
          </div>

          <Button
            onClick={handleGenerateSimulation}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <div className="flex flex-col items-center gap-1 py-1">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{loadingStage}</span>
                </div>
                <span className="text-xs opacity-70">{elapsedTime}s</span>
              </div>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Executive Discussion Guide
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <StructuredSimulationDisplay sections={generatedSimulation.sections} />

      {/* Follow-up Questions */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Ask Mindmaker AI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={followUpPrompt}
            onChange={(e) => setFollowUpPrompt(e.target.value)}
            placeholder="Ask a follow-up question about this simulation..."
            rows={3}
            disabled={isAsking}
          />
          
          <Button
            onClick={handleAskFollowUp}
            disabled={isAsking || !followUpPrompt.trim()}
          >
            {isAsking ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Asking...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Ask Mindmaker AI
              </>
            )}
          </Button>

          {followUpResponse && (
            <div className="bg-accent/20 p-4 rounded-lg mt-4">
              <p className="text-sm whitespace-pre-wrap">{followUpResponse}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
