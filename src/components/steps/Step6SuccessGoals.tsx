import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Target, Plus, X, Lightbulb } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { SUCCESS_TARGETS_SUGGESTIONS } from '../../types/canvas';
import { BackNavigationDialog } from '../ui/back-navigation-dialog';

export const Step6SuccessGoals: React.FC = () => {
  const { state, updateMindmakerData, setCurrentStep, markStepCompleted, resetCurrentStepData } = useMindmaker();
  
  const [successTargets, setSuccessTargets] = useState<string[]>(state.mindmakerData.successTargets);
  const [customTarget, setCustomTarget] = useState('');
  const [showBackDialog, setShowBackDialog] = useState(false);

  useEffect(() => {
    updateMindmakerData({ successTargets });
  }, [successTargets, updateMindmakerData]);

  const addTarget = () => {
    if (customTarget.trim() && !successTargets.includes(customTarget.trim())) {
      setSuccessTargets(prev => [...prev, customTarget.trim()]);
      setCustomTarget('');
    }
  };

  const addSuggestion = (suggestion: string) => {
    if (!successTargets.includes(suggestion)) {
      setSuccessTargets(prev => [...prev, suggestion]);
    }
  };

  const removeTarget = (target: string) => {
    setSuccessTargets(prev => prev.filter(t => t !== target));
  };

  const handleNext = () => {
    markStepCompleted(6);
    setCurrentStep(7);
  };

  const handlePrevious = () => {
    setShowBackDialog(true);
  };

  const handleConfirmBack = () => {
    // Reset current step data
    setSuccessTargets([]);
    setCustomTarget('');
    setShowBackDialog(false);
    setCurrentStep(5);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTarget();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl mb-3">
          Success North-Star Goals
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Define what success looks like for your AI transformation journey
        </p>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto mt-2 italic">
          Don't worry, this is just a draft - we'll finesse these later!
        </p>
      </div>

      {/* Current Success Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand-purple" />
            Your Success Targets
          </CardTitle>
          <CardDescription>
            Add specific, measurable goals for your AI transformation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add New Target */}
            <div className="flex gap-2">
              <Input
                placeholder="e.g., 75% of team using AI tools daily within 6 months"
                value={customTarget}
                onChange={(e) => setCustomTarget(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button
                onClick={addTarget}
                disabled={!customTarget.trim()}
                className="bg-brand-purple hover:bg-brand-purple/90 text-white px-4"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Current Targets */}
            {successTargets.length > 0 && (
              <div className="space-y-2">
                <Label>Current success targets:</Label>
                <div className="space-y-2">
                  {successTargets.map((target, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg"
                    >
                      <span className="flex-1 text-sm">{target}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTarget(target)}
                        className="text-error hover:text-error/80 h-8 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {successTargets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No success targets added yet</p>
                <p className="text-sm">Use the suggestions below or create your own</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-warning" />
            Suggested Success Targets
          </CardTitle>
          <CardDescription>
            Click to add these common AI transformation goals to your list
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SUCCESS_TARGETS_SUGGESTIONS.filter(suggestion => !successTargets.includes(suggestion)).map((suggestion) => (
              <div
                key={suggestion}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <span className="text-sm flex-1">{suggestion}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSuggestion(suggestion)}
                  className="ml-2"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
            ))}
            
            {SUCCESS_TARGETS_SUGGESTIONS.every(suggestion => successTargets.includes(suggestion)) && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">All suggestions have been added to your targets!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Success Summary */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Success Framework Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-purple mb-1">
                {successTargets.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Success Targets Defined
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success mb-1">
                {successTargets.filter(target => 
                  target.toLowerCase().includes('%') || 
                  target.toLowerCase().includes('increase') ||
                  target.toLowerCase().includes('reduce')
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Quantitative Goals
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-brand-blue mb-1">
                {successTargets.filter(target => 
                  target.toLowerCase().includes('month') || 
                  target.toLowerCase().includes('week') ||
                  target.toLowerCase().includes('quarter')
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Time-Bound Goals
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          className="bg-gradient-purple hover:opacity-90 text-white flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <BackNavigationDialog
        isOpen={showBackDialog}
        onClose={() => setShowBackDialog(false)}
        onConfirm={handleConfirmBack}
      />
    </div>
  );
};