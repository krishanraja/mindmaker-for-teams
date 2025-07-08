import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { useCanvas } from '../../contexts/CanvasContext';
import { AI_SKILLS, AUTOMATION_RISKS } from '../../types/canvas';

export const Step4CapabilityMap: React.FC = () => {
  const { state, updateCanvasData, setCurrentStep, markStepCompleted } = useCanvas();
  
  const [aiSkills, setAiSkills] = useState<string[]>(state.canvasData.aiSkills);
  const [automationRisks, setAutomationRisks] = useState<string[]>(state.canvasData.automationRisks);

  useEffect(() => {
    updateCanvasData({ aiSkills, automationRisks });
  }, [aiSkills, automationRisks, updateCanvasData]);

  const toggleSkill = (skill: string) => {
    setAiSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const toggleRisk = (risk: string) => {
    setAutomationRisks(prev => 
      prev.includes(risk) 
        ? prev.filter(r => r !== risk)
        : [...prev, risk]
    );
  };

  const handleNext = () => {
    markStepCompleted(4);
    setCurrentStep(5);
  };

  const handlePrevious = () => {
    setCurrentStep(3);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-outfit font-bold text-3xl md:text-4xl mb-4">
          Capability Mapping
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Identify AI skills your team needs and tasks at risk of automation
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* AI Skills & Capabilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-brand-purple" />
              AI Skills & Capabilities
            </CardTitle>
            <CardDescription>
              Which AI capabilities would benefit your organization? Select all that apply.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AI_SKILLS.map((skill) => (
                <div key={skill} className="flex items-center space-x-3">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={aiSkills.includes(skill)}
                    onCheckedChange={() => toggleSkill(skill)}
                  />
                  <label
                    htmlFor={`skill-${skill}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {skill}
                  </label>
                </div>
              ))}
              
              {aiSkills.length > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected capabilities:</p>
                  <div className="flex flex-wrap gap-2">
                    {aiSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Automation Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Automation Risk Assessment
            </CardTitle>
            <CardDescription>
              Which routine tasks in your organization could be automated? This helps identify training priorities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AUTOMATION_RISKS.map((risk) => (
                <div key={risk} className="flex items-center space-x-3">
                  <Checkbox
                    id={`risk-${risk}`}
                    checked={automationRisks.includes(risk)}
                    onCheckedChange={() => toggleRisk(risk)}
                  />
                  <label
                    htmlFor={`risk-${risk}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {risk}
                  </label>
                </div>
              ))}
              
              {automationRisks.length > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">At-risk tasks:</p>
                  <div className="flex flex-wrap gap-2">
                    {automationRisks.map((risk) => (
                      <Badge key={risk} variant="outline" className="text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {risk}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Insights */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Capability Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-brand-purple mb-1">
                {aiSkills.length}
              </div>
              <div className="text-sm text-muted-foreground">
                AI Capabilities Selected
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning mb-1">
                {automationRisks.length}
              </div>
              <div className="text-sm text-muted-foreground">
                Tasks at Automation Risk
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success mb-1">
                {Math.max(0, aiSkills.length - automationRisks.length)}
              </div>
              <div className="text-sm text-muted-foreground">
                Net Skill Advantage
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
    </div>
  );
};