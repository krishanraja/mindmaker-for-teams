import React, { useState } from 'react';
import jsPDF from 'jspdf';
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
    const { canvasData } = state;
    const avgAnxiety = Object.values(canvasData.anxietyLevels).reduce((a, b) => a + b, 0) / 5;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('AI TRANSFORMATION CANVAS', 20, 20);
    
    // Add organization info
    doc.setFontSize(12);
    let y = 40;
    doc.text(`Organization: ${canvasData.businessName || 'N/A'}`, 20, y);
    y += 10;
    doc.text(`Contact: ${canvasData.userName || 'N/A'}`, 20, y);
    y += 10;
    doc.text(`Email: ${canvasData.businessEmail || 'N/A'}`, 20, y);
    y += 20;
    
    // Organization snapshot
    doc.setFontSize(14);
    doc.text('ORGANIZATION SNAPSHOT', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Team Size: ${canvasData.employeeCount} employees`, 20, y);
    y += 8;
    doc.text(`Functions: ${canvasData.businessFunctions.join(', ')}`, 20, y);
    y += 8;
    doc.text(`AI Maturity: ${canvasData.aiAdoption}`, 20, y);
    y += 15;
    
    // Anxiety levels
    doc.setFontSize(14);
    doc.text(`ANXIETY LEVELS (Average: ${avgAnxiety.toFixed(1)}%)`, 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Executives: ${canvasData.anxietyLevels.executives}%`, 20, y);
    y += 8;
    doc.text(`Middle Management: ${canvasData.anxietyLevels.middleManagement}%`, 20, y);
    y += 8;
    doc.text(`Frontline Staff: ${canvasData.anxietyLevels.frontlineStaff}%`, 20, y);
    y += 8;
    doc.text(`Tech Team: ${canvasData.anxietyLevels.techTeam}%`, 20, y);
    y += 8;
    doc.text(`Non-Tech Team: ${canvasData.anxietyLevels.nonTechTeam}%`, 20, y);
    y += 15;
    
    // Capabilities
    doc.setFontSize(14);
    doc.text('CAPABILITIES', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`AI Skills: ${canvasData.aiSkills.join(', ')}`, 20, y);
    y += 8;
    doc.text(`Automation Risks: ${canvasData.automationRisks.join(', ')}`, 20, y);
    y += 15;
    
    // Learning and change
    doc.setFontSize(14);
    doc.text('LEARNING & CHANGE', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Learning Preference: ${canvasData.learningModality || 'Not specified'}`, 20, y);
    y += 8;
    
    // Split change narrative into multiple lines if too long
    const changeText = canvasData.changeNarrative || 'Not provided';
    const maxWidth = 170;
    const changeLines = doc.splitTextToSize(`Change Experience: ${changeText}`, maxWidth);
    doc.text(changeLines, 20, y);
    y += changeLines.length * 6 + 10;
    
    // Success targets
    doc.setFontSize(14);
    doc.text('SUCCESS TARGETS', 20, y);
    y += 10;
    doc.setFontSize(10);
    canvasData.successTargets.forEach(target => {
      doc.text(`• ${target}`, 20, y);
      y += 8;
    });
    y += 10;
    
    // AI Recommendation
    doc.setFontSize(14);
    doc.text('AI RECOMMENDATION', 20, y);
    y += 10;
    doc.setFontSize(10);
    const recommendation = getAIRecommendation();
    const recLines = doc.splitTextToSize(recommendation, maxWidth);
    doc.text(recLines, 20, y);
    y += recLines.length * 6 + 15;
    
    // Footer
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, y);
    
    // Save the PDF
    doc.save(`ai-transformation-canvas-${canvasData.businessName || 'canvas'}.pdf`);
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
    const teamSize = canvasData.employeeCount;
    const hasChangeExp = canvasData.changeNarrative.length > 0;
    const learningStyle = canvasData.learningModality;
    const aiMaturity = canvasData.aiAdoption;
    
    let recommendation = `Based on your ${teamSize}-person team's ${avgAnxiety.toFixed(0)}% average anxiety level and ${aiMaturity} AI maturity, `;
    
    if (avgAnxiety > 60) {
      recommendation += `we recommend starting with comprehensive change management and ${learningStyle} training to build confidence before implementing AI tools. `;
    } else if (avgAnxiety > 30) {
      recommendation += `a balanced approach with ${learningStyle} training and gradual AI tool introduction will work best for your team. `;
    } else {
      recommendation += `your team is ready for accelerated AI adoption through ${learningStyle} programs and rapid deployment strategies. `;
    }
    
    if (hasChangeExp) {
      recommendation += `Given your previous transformation experience, we'll leverage those learnings to customize your AI journey.`;
    } else {
      recommendation += `We'll provide extra change management support to ensure smooth adoption across your organization.`;
    }
    
    return recommendation;
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