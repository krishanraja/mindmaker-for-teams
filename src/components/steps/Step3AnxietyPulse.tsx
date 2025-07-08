import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Activity, Heart, Users, Code, UserCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { getAnxietyLevel } from '../../types/canvas';

interface AnxietySliderProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
}

const AnxietySlider: React.FC<AnxietySliderProps> = ({ label, description, icon, value, onChange }) => {
  const anxietyInfo = getAnxietyLevel(value);
  
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {label}
        </CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Anxiety Level</Label>
            <div className="flex items-center gap-2">
              <span className={`font-semibold ${anxietyInfo.color}`}>
                {value}%
              </span>
              <span className={`text-sm px-2 py-1 rounded-full ${anxietyInfo.bgColor} text-white`}>
                {anxietyInfo.label}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Slider
              value={[value]}
              onValueChange={(values) => onChange(values[0])}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
            
            {/* Visual indicator bar */}
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${anxietyInfo.bgColor}`}
                style={{ width: `${value}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Very Low</span>
              <span>Low</span>
              <span>Moderate</span>
              <span>High</span>
              <span>Very High</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Step3AnxietyPulse: React.FC = () => {
  const { state, updateMindmakerData, setCurrentStep, markStepCompleted } = useMindmaker();

  const [anxietyLevels, setAnxietyLevels] = useState(state.mindmakerData.anxietyLevels);

  useEffect(() => {
    updateMindmakerData({ anxietyLevels });
  }, [anxietyLevels, updateMindmakerData]);

  const updateAnxietyLevel = (cohort: keyof typeof anxietyLevels, value: number) => {
    setAnxietyLevels(prev => ({
      ...prev,
      [cohort]: value
    }));
  };

  const handleNext = () => {
    markStepCompleted(3);
    setCurrentStep(4);
  };

  const handlePrevious = () => {
    setCurrentStep(2);
  };

  const getOverallAnxietyLevel = () => {
    const total = Object.values(anxietyLevels).reduce((sum, level) => sum + level, 0);
    const average = total / Object.keys(anxietyLevels).length;
    return getAnxietyLevel(average);
  };

  const overallAnxiety = getOverallAnxietyLevel();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl mb-3">
          Anxiety Pulse Check
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Assess the current AI anxiety levels across different groups in your organization
        </p>
      </div>

      {/* Overall Anxiety Overview */}
      <Card className="bg-gradient-to-r from-card to-card/80 border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-purple" />
            Overall Anxiety Pulse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${overallAnxiety.bgColor}`}
                  style={{ width: `${Object.values(anxietyLevels).reduce((sum, level) => sum + level, 0) / Object.keys(anxietyLevels).length}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-lg ${overallAnxiety.color}`}>
                {Math.round(Object.values(anxietyLevels).reduce((sum, level) => sum + level, 0) / Object.keys(anxietyLevels).length)}%
              </span>
              <span className={`text-sm px-3 py-1 rounded-full ${overallAnxiety.bgColor} text-white`}>
                {overallAnxiety.label}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anxiety Sliders */}
      <div className="grid md:grid-cols-2 gap-6">
        <AnxietySlider
          label="Executives"
          description="C-suite and senior leadership team"
          icon={<Heart className="w-5 h-5 text-error" />}
          value={anxietyLevels.executives}
          onChange={(value) => updateAnxietyLevel('executives', value)}
        />

        <AnxietySlider
          label="Middle Management"
          description="Department heads and team leaders"
          icon={<Users className="w-5 h-5 text-warning" />}
          value={anxietyLevels.middleManagement}
          onChange={(value) => updateAnxietyLevel('middleManagement', value)}
        />

        <AnxietySlider
          label="Frontline Staff"
          description="Customer-facing and operational teams"
          icon={<UserCheck className="w-5 h-5 text-brand-blue" />}
          value={anxietyLevels.frontlineStaff}
          onChange={(value) => updateAnxietyLevel('frontlineStaff', value)}
        />

        <AnxietySlider
          label="Tech Team"
          description="Developers, engineers, and IT professionals"
          icon={<Code className="w-5 h-5 text-success" />}
          value={anxietyLevels.techTeam}
          onChange={(value) => updateAnxietyLevel('techTeam', value)}
        />

        <div className="md:col-span-2">
          <AnxietySlider
            label="Non-Tech Team"
            description="HR, marketing, sales, and other business functions"
            icon={<Users className="w-5 h-5 text-brand-purple" />}
            value={anxietyLevels.nonTechTeam}
            onChange={(value) => updateAnxietyLevel('nonTechTeam', value)}
          />
        </div>
      </div>

      {/* Insights */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Quick Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Highest Anxiety:</strong> {
                Object.entries(anxietyLevels).reduce((a, b) => 
                  anxietyLevels[a[0] as keyof typeof anxietyLevels] > anxietyLevels[b[0] as keyof typeof anxietyLevels] ? a : b
                )[0].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              } ({Math.max(...Object.values(anxietyLevels))}%)
            </div>
            <div>
              <strong>Lowest Anxiety:</strong> {
                Object.entries(anxietyLevels).reduce((a, b) => 
                  anxietyLevels[a[0] as keyof typeof anxietyLevels] < anxietyLevels[b[0] as keyof typeof anxietyLevels] ? a : b
                )[0].replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
              } ({Math.min(...Object.values(anxietyLevels))}%)
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