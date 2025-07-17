import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Activity, Heart, Users, Code, UserCheck, HelpCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { getAnxietyLevel } from '../../types/canvas';
import { BackNavigationDialog } from '../ui/back-navigation-dialog';

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
              className="w-full react-slider"
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

interface TutorialStep {
  title: string;
  description: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tutorialSteps: TutorialStep[] = [
  {
    title: "Welcome to Anxiety Pulse Check",
    description: "This tool helps you assess AI anxiety levels across different groups in your organization. Let's walk through how to use it.",
    target: "header",
    position: "bottom"
  },
  {
    title: "Overall Anxiety Pulse",
    description: "This bar shows your organization's overall anxiety level, calculated from all group assessments below.",
    target: "overall-pulse",
    position: "bottom"
  },
  {
    title: "Group Assessment Cards",
    description: "Each card represents a different group in your organization. Use the sliders to set their current AI anxiety level.",
    target: "sliders-grid",
    position: "top"
  },
  {
    title: "How to Use Sliders",
    description: "Drag the slider or click anywhere on the bar to set the anxiety level. The percentage and color will update automatically.",
    target: "first-slider",
    position: "right"
  },
  {
    title: "Quick Insights",
    description: "This section automatically shows which groups have the highest and lowest anxiety levels to help you identify patterns.",
    target: "insights",
    position: "top"
  }
];

const TutorialOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  steps: TutorialStep[];
}> = ({ isOpen, onClose, currentStep, onNext, onPrevious, steps }) => {
  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="mb-4">
          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
          <p className="text-muted-foreground text-sm">{step.description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-brand-purple' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={isFirstStep}
            >
              Previous
            </Button>
            <Button
              size="sm"
              onClick={isLastStep ? onClose : onNext}
              className="bg-gradient-purple hover:opacity-90 text-white"
            >
              {isLastStep ? 'Got it!' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Step3AnxietyPulse: React.FC = () => {
  const { state, updateMindmakerData, setCurrentStep, markStepCompleted, resetCurrentStepData } = useMindmaker();

  const [anxietyLevels, setAnxietyLevels] = useState(state.mindmakerData.anxietyLevels);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [initialAnxietyLevels] = useState(state.mindmakerData.anxietyLevels);
  const [showBackDialog, setShowBackDialog] = useState(false);

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
    // Check if all sliders are at 50%
    const allSlidersAt50 = Object.values(anxietyLevels).every(level => level === 50);
    
    if (allSlidersAt50) {
      // Show tutorial if all sliders are at 50%
      startTutorial();
      return;
    }
    
    markStepCompleted(3);
    setCurrentStep(4);
  };

  const handlePrevious = () => {
    // Check if any slider has been changed from initial values
    const hasChanged = Object.keys(anxietyLevels).some(
      key => anxietyLevels[key as keyof typeof anxietyLevels] !== initialAnxietyLevels[key as keyof typeof initialAnxietyLevels]
    );
    
    if (hasChanged) {
      setShowBackDialog(true);
    } else {
      setCurrentStep(2);
    }
  };

  const handleConfirmBack = () => {
    resetCurrentStepData(3);
    setCurrentStep(2);
    setShowBackDialog(false);
  };

  const getOverallAnxietyLevel = () => {
    const total = Object.values(anxietyLevels).reduce((sum, level) => sum + level, 0);
    const average = total / Object.keys(anxietyLevels).length;
    return getAnxietyLevel(average);
  };

  const overallAnxiety = getOverallAnxietyLevel();

  const handleTutorialNext = () => {
    if (tutorialStep < tutorialSteps.length - 1) {
      setTutorialStep(tutorialStep + 1);
    }
  };

  const handleTutorialPrevious = () => {
    if (tutorialStep > 0) {
      setTutorialStep(tutorialStep - 1);
    }
  };

  const handleTutorialClose = () => {
    setShowTutorial(false);
    setTutorialStep(0);
  };

  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div id="header" className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-3">
          <h1 className="font-heading font-bold text-2xl md:text-3xl">
            Anxiety Pulse Check
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={startTutorial}
            className="flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </Button>
        </div>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Assess the current AI anxiety levels across different groups in your organization
        </p>
      </div>

      {/* Overall Anxiety Overview */}
      <Card id="overall-pulse" className="bg-gradient-to-r from-card to-card/80 border-2">
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
      <div id="sliders-grid" className="grid md:grid-cols-2 gap-6">
        <div id="first-slider">
          <AnxietySlider
            label="Executives"
            description="C-suite and senior leadership team"
            icon={<Heart className="w-5 h-5 text-error" />}
            value={anxietyLevels.executives}
            onChange={(value) => updateAnxietyLevel('executives', value)}
          />
        </div>

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
      <Card id="insights" className="bg-gradient-to-r from-muted/50 to-muted/20">
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

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isOpen={showTutorial}
        onClose={handleTutorialClose}
        currentStep={tutorialStep}
        onNext={handleTutorialNext}
        onPrevious={handleTutorialPrevious}
        steps={tutorialSteps}
      />

      {/* Back Navigation Dialog */}
      <BackNavigationDialog
        isOpen={showBackDialog}
        onClose={() => setShowBackDialog(false)}
        onConfirm={handleConfirmBack}
      />
    </div>
  );
};