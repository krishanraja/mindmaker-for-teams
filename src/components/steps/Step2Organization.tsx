import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Building, TrendingUp, X, Globe } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { COMPANIES, BUSINESS_FUNCTIONS } from '../../types/canvas';
import { BackNavigationDialog } from '../ui/back-navigation-dialog';

export const Step2Organization: React.FC = () => {
  const { state, updateMindmakerData, setCurrentStep, markStepCompleted, resetCurrentStepData } = useMindmaker();

  const [businessName, setBusinessName] = useState(state.mindmakerData.businessName);
  const [businessDescription, setBusinessDescription] = useState(state.mindmakerData.businessDescription);
  const [company, setCompany] = useState(state.mindmakerData.company);
  const [businessUrl, setBusinessUrl] = useState(state.mindmakerData.businessUrl);
  const [selectedFunctions, setSelectedFunctions] = useState<string[]>(state.mindmakerData.businessFunctions);
  const [aiAdoption, setAiAdoption] = useState(state.mindmakerData.aiAdoption);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showBackDialog, setShowBackDialog] = useState(false);
  
  // Define the true default values for comparison
  const defaultValues = {
    businessName: '',
    businessDescription: '',
    company: '',
    businessUrl: '',
    businessFunctions: [],
    aiAdoption: 'none',
  };

  useEffect(() => {
    updateMindmakerData({
      businessName,
      businessDescription,
      company,
      businessUrl,
      businessFunctions: selectedFunctions,
      aiAdoption,
    });
  }, [businessName, businessDescription, company, businessUrl, selectedFunctions, aiAdoption, updateMindmakerData]);

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
    
    if (!businessName.trim()) {
      newErrors.businessName = 'Please enter your business name';
    }
    
    if (!businessDescription.trim()) {
      newErrors.businessDescription = 'Please describe what your business does';
    }
    
    if (!company) {
      newErrors.company = 'Please select your business type';
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
    // Check if any form field has been changed from default values
    const hasChanged = (
      businessName !== defaultValues.businessName ||
      businessDescription !== defaultValues.businessDescription ||
      company !== defaultValues.company ||
      businessUrl !== defaultValues.businessUrl ||
      JSON.stringify(selectedFunctions) !== JSON.stringify(defaultValues.businessFunctions) ||
      aiAdoption !== defaultValues.aiAdoption
    );
    
    if (hasChanged) {
      setShowBackDialog(true);
    } else {
      setCurrentStep(1);
    }
  };

  const handleConfirmBack = () => {
    // Reset current step data in context
    resetCurrentStepData(2);
    // Reset local state to match context reset
    setBusinessName('');
    setBusinessDescription('');
    setCompany('');
    setBusinessUrl('');
    setSelectedFunctions([]);
    setAiAdoption('none');
    setCurrentStep(1);
    setShowBackDialog(false);
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
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4 md:px-6">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="font-heading font-bold text-xl md:text-2xl lg:text-3xl mb-3">
          Organization Snapshot
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto px-2">
          Help us understand your team structure and current AI readiness
        </p>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-brand-purple" />
            Business Information
          </CardTitle>
          <CardDescription>
            Tell us about your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                placeholder="Your company name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={errors.businessName ? 'border-error' : ''}
              />
              {errors.businessName && (
                <p className="text-sm text-error">{errors.businessName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Business Type *</Label>
              <Select value={company} onValueChange={setCompany}>
                <SelectTrigger className={errors.company ? 'border-error' : ''}>
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map((comp) => (
                    <SelectItem key={comp} value={comp}>
                      {comp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.company && (
                <p className="text-sm text-error">{errors.company}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="businessDescription">What does your business do? *</Label>
              <textarea
                id="businessDescription"
                placeholder="Describe your business in 1-2 sentences (e.g., We provide accounting services for small businesses, helping them manage their finances and stay compliant with tax regulations.)"
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                className={`w-full min-h-[80px] px-3 py-2 text-sm rounded-md border ${errors.businessDescription ? 'border-red-500' : 'border-input'} bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50`}
                rows={3}
              />
              {errors.businessDescription && (
                <p className="text-sm text-red-600">{errors.businessDescription}</p>
              )}
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="businessUrl">Business Website URL (optional)</Label>
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="businessUrl"
                  type="url"
                  placeholder="https://www.yourcompany.com"
                  value={businessUrl}
                  onChange={(e) => setBusinessUrl(e.target.value)}
                />
              </div>
            </div>
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
                <SelectItem value="none">No AI tools</SelectItem>
                <SelectItem value="pilots">Testing phase</SelectItem>
                <SelectItem value="team-level">Some teams using AI</SelectItem>
                <SelectItem value="enterprise-wide">Full adoption</SelectItem>
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
                  className={`h-auto p-3 text-sm ${selectedFunctions.includes(func) ? 'bg-brand-purple hover:bg-brand-purple/90' : ''}`}
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
      <div className="flex flex-col md:flex-row justify-between gap-4 pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center gap-2 w-full md:w-auto order-2 md:order-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          className="bg-gradient-purple hover:opacity-90 text-white flex items-center gap-2 w-full md:w-auto order-1 md:order-2"
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