import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Sparkles, MessageSquare, Check } from 'lucide-react';
import { SimulationSection, DiscussionPrompt } from '@/lib/ai-response-parser';
import { supabase } from '@/integrations/supabase/client';

interface StructuredSimulationDisplayProps {
  sections: SimulationSection[];
  simulationResultId?: string;
  initialSelections?: Record<number, number | string>;
}

const getSectionIcon = (type: string) => {
  switch (type) {
    case 'current_state': return <BarChart className="w-6 h-6" />;
    case 'ai_transformation': return <Sparkles className="w-6 h-6" />;
    case 'discussion': return <MessageSquare className="w-6 h-6" />;
    default: return null;
  }
};

const getSectionColor = (type: string) => {
  return 'text-primary';
};

export const StructuredSimulationDisplay: React.FC<StructuredSimulationDisplayProps> = ({ 
  sections,
  simulationResultId,
  initialSelections 
}) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number | string>>(initialSelections || {});
  const [customInputs, setCustomInputs] = useState<Record<number, string>>({});

  // Autosave selections
  useEffect(() => {
    if (!simulationResultId || Object.keys(selectedOptions).length === 0) return;
    
    const saveSelections = async () => {
      await supabase
        .from('simulation_results')
        .update({ selected_discussion_options: selectedOptions })
        .eq('id', simulationResultId);
    };
    
    const timer = setTimeout(saveSelections, 500);
    return () => clearTimeout(timer);
  }, [selectedOptions, simulationResultId]);

  const handleOptionSelect = (promptIndex: number, optionIndex: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [promptIndex]: optionIndex
    }));
  };

  const handleCustomInput = (promptIndex: number, value: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [promptIndex]: value
    }));
    if (value.trim()) {
      setSelectedOptions(prev => ({
        ...prev,
        [promptIndex]: `custom:${value}`
      }));
    }
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <Card key={index} className="border shadow-sm rounded-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <span className={getSectionColor(section.type)}>
                {getSectionIcon(section.type)}
              </span>
              <span>{section.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Insights */}
            {section.insights && section.insights.length > 0 && (
              <ul className="space-y-3">
                {section.insights.map((insight, i) => (
                  <li key={i} className="flex gap-3 text-base leading-relaxed">
                    <span className="text-primary mt-1 flex-shrink-0">•</span>
                    <span className="flex-1">{insight}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Metrics - clean and professional */}
            {section.metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
                {section.metrics.time_saved && (
                  <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Time Saved</div>
                    <div className="text-3xl font-bold text-foreground">{section.metrics.time_saved}</div>
                  </div>
                )}
                {section.metrics.cost_impact && (
                  <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Cost Impact</div>
                    <div className="text-3xl font-bold text-foreground">{section.metrics.cost_impact}</div>
                  </div>
                )}
                {section.metrics.quality_improvement && (
                  <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
                    <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Quality</div>
                    <div className="text-3xl font-bold text-foreground">{section.metrics.quality_improvement}</div>
                  </div>
                )}
              </div>
            )}

            {/* Discussion Prompts with Options */}
            {section.prompts && section.prompts.length > 0 && (
              <div className="space-y-6 mt-2">
                {section.prompts.map((prompt, i) => {
                  const isStructured = typeof prompt !== 'string' && 'question' in prompt;
                  const promptData = isStructured ? prompt as DiscussionPrompt : null;
                  const promptText = isStructured ? promptData!.question : prompt as string;
                  const ideas = promptData && (promptData.options || (promptData as any).ideas);

                  return (
                    <div key={i} className="p-4 bg-muted/30 border border-border rounded-lg">
                      <p className="text-base font-semibold text-foreground mb-4">{promptText}</p>
                      
                      {/* Interactive ideas if available */}
                      {ideas && (
                        <div className="space-y-3 mt-4">
                          <p className="text-xs text-muted-foreground mb-2">Ideas to consider:</p>
                          <div className="grid grid-cols-1 gap-3">
                            {ideas.map((idea: string, optionIdx: number) => {
                              const isSelected = selectedOptions[i] === optionIdx;
                              return (
                                <Button
                                  key={optionIdx}
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleOptionSelect(i, optionIdx)}
                                  className="h-auto py-3 px-4 text-left justify-start whitespace-normal rounded-md"
                                >
                                  <div className="flex items-center gap-2 w-full">
                                    <div className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                                      isSelected 
                                        ? 'bg-primary border-primary' 
                                        : 'border-muted-foreground/40'
                                    }`}>
                                      {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                    </div>
                                    <span className="flex-1 text-sm">{idea}</span>
                                  </div>
                                </Button>
                              );
                            })}
                          </div>

                          {/* Custom Input Option */}
                          <div className="mt-3 pt-3 border-t border-border">
                            <label className="text-xs text-muted-foreground mb-2 block">Or enter your own idea:</label>
                            <input
                              type="text"
                              value={customInputs[i] || ''}
                              onChange={(e) => handleCustomInput(i, e.target.value)}
                              placeholder="Type your custom approach here..."
                              className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
