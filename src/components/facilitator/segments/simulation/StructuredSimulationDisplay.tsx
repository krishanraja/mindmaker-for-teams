import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Sparkles, MessageSquare, Check } from 'lucide-react';
import { SimulationSection, DiscussionPrompt } from '@/lib/ai-response-parser';

interface StructuredSimulationDisplayProps {
  sections: SimulationSection[];
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
  switch (type) {
    case 'current_state': return 'text-blue-600 dark:text-blue-400';
    case 'ai_transformation': return 'text-purple-600 dark:text-purple-400';
    case 'discussion': return 'text-orange-600 dark:text-orange-400';
    default: return 'text-foreground';
  }
};

export const StructuredSimulationDisplay: React.FC<StructuredSimulationDisplayProps> = ({ sections }) => {
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

  const handleOptionSelect = (promptIndex: number, optionIndex: number) => {
    setSelectedOptions(prev => ({
      ...prev,
      [promptIndex]: optionIndex
    }));
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => (
        <Card key={index} className="border-2 shadow-lg">
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
                    <span className="text-primary text-xl font-bold mt-0.5 flex-shrink-0">•</span>
                    <span className="flex-1">{insight}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Metrics - larger and more prominent */}
            {section.metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
                {section.metrics.time_saved && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide">Time Saved</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{section.metrics.time_saved}</div>
                  </div>
                )}
                {section.metrics.cost_impact && (
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2 uppercase tracking-wide">Cost Impact</div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{section.metrics.cost_impact}</div>
                  </div>
                )}
                {section.metrics.quality_improvement && (
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 uppercase tracking-wide">Quality</div>
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{section.metrics.quality_improvement}</div>
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

                  return (
                    <div key={i} className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-lg border-l-4 border-orange-500">
                      <p className="text-base font-semibold leading-relaxed mb-4">{promptText}</p>
                      
                      {/* Interactive options if available */}
                      {promptData && promptData.options && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                          {promptData.options.map((option, optionIdx) => {
                            const isSelected = selectedOptions[i] === optionIdx;
                            return (
                              <Button
                                key={optionIdx}
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                onClick={() => handleOptionSelect(i, optionIdx)}
                                className="h-auto py-3 px-4 text-left justify-start whitespace-normal"
                              >
                                <div className="flex items-start gap-2 w-full">
                                  <span className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                                    isSelected 
                                      ? 'bg-primary border-primary' 
                                      : 'border-muted-foreground'
                                  }`}>
                                    {isSelected && <Check className="w-3 h-3 text-primary-foreground" />}
                                  </span>
                                  <span className="flex-1 text-sm">{option}</span>
                                </div>
                              </Button>
                            );
                          })}
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
