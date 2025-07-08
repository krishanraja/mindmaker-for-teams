import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Users, Building, TrendingUp, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useCanvas } from '../../contexts/CanvasContext';
import { BUSINESS_FUNCTIONS } from '../../types/canvas';

export const Step2Organization: React.FC = () => {
  const { state, updateCanvasData, setCurrentStep, markStepCompleted } = useCanvas();
  
  const [employeeCount, setEmployeeCount] = useState(state.canvasData.employeeCount);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(state.canvasData.businessFunctions);
  const [aiAdoption, setAiAdoption] = useState(state.canvasData.aiAdoption);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    updateCanvasData({
      employeeCount,
      businessFunctions: selectedFunctions,
      aiAdoption,
    });
  }, [employeeCount, selectedFunctions, aiAdoption, updateCanvasData]);

  const toggleFunction = (func: string) => {
    setSelectedFunctions(prev => 
      prev.includes(func) 
        ? prev.filter(f => f !== func)
        : [...prev, func]
    );
  };

  const removeFunction = (func: string) => {
    setSelectedFunctions(prev => prev.filter(f => f !== func));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (employeeCount <= 0) {
      newErrors.employeeCount = 'Please enter a valid number of employees';
    }
    
    if (selectedFunctions.length === 0) {
      newErrors.functions = 'Please select at least one business function';
    }
    
    if (!aiAdoption) {
      newErrors.aiAdoption = 'Please select your current AI adoption level';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      markStepCompleted(2);
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(1);
  };

  const getAiAdoptionDescription = (level: string) => {
    switch (level) {
      case 'none': return 'No current AI tools in use';
      case 'pilots': return 'Testing AI tools in small groups';
      case 'team-level': return 'Some teams actively using AI';
      case 'enterprise-wide': return 'Organization-wide AI adoption';
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-outfit font-bold text-3xl md:text-4xl mb-4">
          Organization Snapshot
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Help us understand your team structure and current AI readiness
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Team Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-brand-purple" />
              Team Size
            </CardTitle>
            <CardDescription>
              How many full-time employees does your organization have?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="employeeCount">Number of employees</Label>
              <Input
                id="employeeCount"
                type="number"
                min="1"
                placeholder="e.g., 50"
                value={employeeCount || ''}
                onChange={(e) => setEmployeeCount(parseInt(e.target.value) || 0)}
                className={errors.employeeCount ? 'border-error' : ''}
              />
              {errors.employeeCount && (
                <p className="text-sm text-error">{errors.employeeCount}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Adoption Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-blue" />
              AI Adoption Level
            </CardTitle>
            <CardDescription>
              What's your current level of AI adoption?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Current AI adoption</Label>
              <Select
                value={aiAdoption}
                onValueChange={(value: any) => setAiAdoption(value)}
              >
                <SelectTrigger className={errors.aiAdoption ? 'border-error' : ''}>
                  <SelectValue placeholder="Select adoption level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None - No AI tools</SelectItem>
                  <SelectItem value="pilots">Pilots - Testing phase</SelectItem>
                  <SelectItem value="team-level">Team-level - Some teams using AI</SelectItem>
                  <SelectItem value="enterprise-wide">Enterprise-wide - Full adoption</SelectItem>
                </SelectContent>
              </Select>
              {aiAdoption && (
                <p className="text-sm text-muted-foreground">
                  {getAiAdoptionDescription(aiAdoption)}
                </p>
              )}
              {errors.aiAdoption && (
                <p className="text-sm text-error">{errors.aiAdoption}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Functions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-success" />
            Business Functions
          </CardTitle>
          <CardDescription>
            Which business functions are part of your organization? Select all that apply.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Function Selection Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {BUSINESS_FUNCTIONS.map((func) => (
                <Button
                  key={func}
                  variant={selectedFunctions.includes(func) ? "default" : "outline"}
                  className={`h-auto p-4 ${selectedFunctions.includes(func) ? 'bg-brand-purple hover:bg-brand-purple/90' : ''}`}
                  onClick={() => toggleFunction(func)}
                >
                  {func}
                </Button>
              ))}
            </div>

            {/* Selected Functions Display */}
            {selectedFunctions.length > 0 && (
              <div className="space-y-2">
                <Label>Selected functions:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedFunctions.map((func) => (
                    <Badge
                      key={func}
                      variant="secondary"
                      className="px-3 py-1 flex items-center gap-2"
                    >
                      {func}
                      <button
                        onClick={() => removeFunction(func)}
                        className="hover:text-error transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {errors.functions && (
              <p className="text-sm text-error">{errors.functions}</p>
            )}
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
    </div>
  );
};