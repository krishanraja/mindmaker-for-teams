import React, { useState } from 'react';
import { ArrowLeft, Download, Calendar, Mail, Building, User, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { useCanvas } from '../../contexts/CanvasContext';
import { Badge } from '../ui/badge';
import { getAnxietyLevel } from '../../types/canvas';

export const Step7Canvas: React.FC = () => {
  const { state, updateCanvasData, setCurrentStep, markStepCompleted } = useCanvas();
  
  const [contactForm, setContactForm] = useState({
    businessName: state.canvasData.businessName,
    userName: state.canvasData.userName,
    businessEmail: state.canvasData.businessEmail,
    ndaAccepted: state.canvasData.ndaAccepted,
  });

  const handleContactFormChange = (field: string, value: string | boolean) => {
    const newForm = { ...contactForm, [field]: value };
    setContactForm(newForm);
    updateCanvasData(newForm);
  };

  const handleDownloadPDF = () => {
    // Create PDF content
    const { canvasData } = state;
    const avgAnxiety = Object.values(canvasData.anxietyLevels).reduce((a, b) => a + b, 0) / 5;
    
    const pdfContent = `
AI TRANSFORMATION CANVAS
========================

Organization: ${canvasData.businessName || 'N/A'}
Contact: ${canvasData.userName || 'N/A'}
Email: ${canvasData.businessEmail || 'N/A'}

ORGANIZATION SNAPSHOT
- Team Size: ${canvasData.employeeCount} employees
- Business Functions: ${canvasData.businessFunctions.join(', ')}
- AI Maturity: ${canvasData.aiAdoption}

ANXIETY LEVELS (Average: ${avgAnxiety.toFixed(1)}%)
- Executives: ${canvasData.anxietyLevels.executives}%
- Middle Management: ${canvasData.anxietyLevels.middleManagement}%
- Frontline Staff: ${canvasData.anxietyLevels.frontlineStaff}%
- Tech Team: ${canvasData.anxietyLevels.techTeam}%
- Non-Tech Team: ${canvasData.anxietyLevels.nonTechTeam}%

CAPABILITIES
- AI Skills: ${canvasData.aiSkills.join(', ')}
- Automation Risks: ${canvasData.automationRisks.join(', ')}

LEARNING PREFERENCE
${canvasData.learningModality || 'Not specified'}

CHANGE MANAGEMENT EXPERIENCE
${canvasData.changeNarrative || 'Not provided'}

SUCCESS TARGETS
${canvasData.successTargets.map(target => `- ${target}`).join('\n')}

AI RECOMMENDATION
${getAIRecommendation()}

Generated on: ${new Date().toLocaleDateString()}
    `;
    
    // Create and download the file
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-transformation-canvas-${canvasData.businessName || 'canvas'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBookSession = () => {
    window.open('https://calendly.com/krish-raja/krish-raja', '_blank');
  };

  const handlePrevious = () => {
    setCurrentStep(6);
  };

  const getAIRecommendation = () => {
    const { canvasData } = state;
    const avgAnxiety = Object.values(canvasData.anxietyLevels).reduce((a, b) => a + b, 0) / 5;
    
    if (avgAnxiety > 70) {
      return "Focus on anxiety reduction through gradual exposure and comprehensive training programs.";
    } else if (avgAnxiety > 40) {
      return "Implement balanced approach with strong change management and skill development.";
    } else {
      return "Accelerate AI adoption with advanced training and rapid deployment strategies.";
    }
  };

  const isFormValid = contactForm.businessName && contactForm.userName && 
                     contactForm.businessEmail && contactForm.ndaAccepted;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-outfit font-bold text-3xl md:text-4xl mb-4">
          Your AI Transformation Canvas
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Here's your personalized roadmap to AI success
        </p>
      </div>

      {/* AI Recommendation */}
      <Card className="bg-gradient-purple text-white">
        <CardHeader>
          <CardTitle className="text-xl">AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4">{getAIRecommendation()}</p>
          <Button 
            onClick={handleBookSession}
            className="bg-white text-brand-purple hover:bg-white/90"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Book Strategy Session
          </Button>
        </CardContent>
      </Card>

      {/* Canvas Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Organization Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Team Size:</strong> {state.canvasData.employeeCount} employees</p>
              <p><strong>Functions:</strong> {state.canvasData.businessFunctions.length}</p>
              <p><strong>AI Maturity:</strong> {state.canvasData.aiAdoption}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {state.canvasData.successTargets.slice(0, 3).map((target, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">{target}</span>
                </div>
              ))}
              {state.canvasData.successTargets.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{state.canvasData.successTargets.length - 3} more targets
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Get Your Canvas</CardTitle>
          <CardDescription>Complete your details to download your personalized canvas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={contactForm.businessName}
                onChange={(e) => handleContactFormChange('businessName', e.target.value)}
                placeholder="Your company name"
              />
            </div>
            <div>
              <Label htmlFor="userName">Your Name *</Label>
              <Input
                id="userName"
                value={contactForm.userName}
                onChange={(e) => handleContactFormChange('userName', e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="businessEmail">Business Email *</Label>
              <Input
                id="businessEmail"
                type="email"
                value={contactForm.businessEmail}
                onChange={(e) => handleContactFormChange('businessEmail', e.target.value)}
                placeholder="your.email@company.com"
              />
            </div>
          </div>
          
          <div className="mt-4 flex items-center space-x-2">
            <Checkbox
              id="nda"
              checked={contactForm.ndaAccepted}
              onCheckedChange={(checked) => handleContactFormChange('ndaAccepted', checked)}
            />
            <Label htmlFor="nda" className="text-sm">
              I am willing to sign/provide a Mutual NDA. *
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        <Button
          onClick={handleDownloadPDF}
          disabled={!isFormValid}
          className="bg-gradient-purple hover:opacity-90 text-white flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Download Canvas PDF
        </Button>
      </div>
    </div>
  );
};