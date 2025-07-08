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
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../ui/use-toast';

export const Step7Canvas: React.FC = () => {
  const { state, updateCanvasData, setCurrentStep, markStepCompleted } = useCanvas();
  const { toast } = useToast();
  
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
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 20;
    
    // Set black background for entire page
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    // Function to check if we need a new page and add one if needed
    const checkNewPage = (requiredHeight: number) => {
      if (currentY + requiredHeight > pageHeight - 20) {
        doc.addPage();
        // Set black background for new page
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        currentY = 20;
        return true;
      }
      return false;
    };
    
    // Add logo and email
    const loadLogoAndGenerate = async () => {
      try {
        // Load the logo image
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          // Set base font to helvetica (closest to Inter)
          doc.setFont('helvetica', 'normal');
          
          // Add logo (30x30 pixels)
          doc.addImage(img, 'PNG', 20, currentY, 30, 30);
          
          // Add email beneath logo
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text('krish@fractionl.ai', 20, currentY + 40);
          currentY += 55;
          
          // Continue with the rest of the PDF generation
          generatePDFContent();
        };
        img.onerror = () => {
          // Fallback if logo doesn't load
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(12);
          doc.text('FRACTIONL', 20, currentY);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          doc.text('krish@fractionl.ai', 20, currentY + 15);
          currentY += 30;
          generatePDFContent();
        };
        img.src = '/lovable-uploads/32cd84ff-f45d-4007-963c-592cf3554f70.png';
      } catch (error) {
        // Fallback
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text('FRACTIONL', 20, currentY);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('krish@fractionl.ai', 20, currentY + 15);
        currentY += 30;
        generatePDFContent();
      }
    };
    
    const generatePDFContent = async () => {
    
      // Add title
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold'); // Bold for main title (like font-outfit)
      doc.setTextColor(138, 43, 226); // Purple color
      doc.text('AI TRANSFORMATION CANVAS', 20, currentY);
      currentY += 25;
    
    // Organization info section
      checkNewPage(40);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold'); // Bold for section headings
      doc.setTextColor(138, 43, 226);
      doc.text('CONTACT INFORMATION', 20, currentY);
      currentY += 15;
    
      doc.setFont('helvetica', 'normal'); // Normal for body text
      doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
      doc.text(`Organization: ${canvasData.businessName || 'N/A'}`, 20, currentY);
      currentY += 10;
      doc.text(`Contact: ${canvasData.userName || 'N/A'}`, 20, currentY);
      currentY += 10;
      doc.text(`Email: ${canvasData.businessEmail || 'N/A'}`, 20, currentY);
      currentY += 25;
    
    // Organization snapshot section
    checkNewPage(60);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold'); // Bold for section headings
    doc.setTextColor(138, 43, 226);
    doc.text('ORGANIZATION SNAPSHOT', 20, currentY);
    currentY += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal'); // Normal for body text
    doc.setTextColor(255, 255, 255);
    doc.text(`Team Size: ${canvasData.employeeCount} employees`, 20, currentY);
    currentY += 10;
    doc.text(`Functions: ${canvasData.businessFunctions.join(', ')}`, 20, currentY);
    currentY += 10;
    doc.text(`AI Maturity: ${canvasData.aiAdoption}`, 20, currentY);
    currentY += 25;
    
    // Anxiety levels section
    checkNewPage(80);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold'); // Bold for section headings
    doc.setTextColor(138, 43, 226);
    doc.text(`ANXIETY LEVELS (Average: ${avgAnxiety.toFixed(1)}%)`, 20, currentY);
    currentY += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal'); // Normal for body text
    doc.setTextColor(255, 255, 255);
    doc.text(`Executives: ${canvasData.anxietyLevels.executives}%`, 20, currentY);
    currentY += 10;
    doc.text(`Middle Management: ${canvasData.anxietyLevels.middleManagement}%`, 20, currentY);
    currentY += 10;
    doc.text(`Frontline Staff: ${canvasData.anxietyLevels.frontlineStaff}%`, 20, currentY);
    currentY += 10;
    doc.text(`Tech Team: ${canvasData.anxietyLevels.techTeam}%`, 20, currentY);
    currentY += 10;
    doc.text(`Non-Tech Team: ${canvasData.anxietyLevels.nonTechTeam}%`, 20, currentY);
    currentY += 25;
    
    // Capabilities section
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold'); // Bold for section headings
    doc.setTextColor(138, 43, 226);
    doc.text('CAPABILITIES', 20, currentY);
    currentY += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal'); // Normal for body text
    doc.setTextColor(255, 255, 255);
    const skillsText = `AI Skills: ${canvasData.aiSkills.join(', ')}`;
    const skillsLines = doc.splitTextToSize(skillsText, 170);
    doc.text(skillsLines, 20, currentY);
    currentY += skillsLines.length * 6 + 5;
    
    const risksText = `Automation Risks: ${canvasData.automationRisks.join(', ')}`;
    const risksLines = doc.splitTextToSize(risksText, 170);
    doc.text(risksLines, 20, currentY);
    currentY += risksLines.length * 6 + 25;
    
    // Learning and change section
    const changeText = canvasData.changeNarrative || 'Not provided';
    const changeLines = doc.splitTextToSize(`Change Experience: ${changeText}`, 170);
    checkNewPage(40 + changeLines.length * 6);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold'); // Bold for section headings
    doc.setTextColor(138, 43, 226);
    doc.text('LEARNING & CHANGE', 20, currentY);
    currentY += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal'); // Normal for body text
    doc.setTextColor(255, 255, 255);
    doc.text(`Learning Preference: ${canvasData.learningModality || 'Not specified'}`, 20, currentY);
    currentY += 15;
    
    doc.text(changeLines, 20, currentY);
    currentY += changeLines.length * 6 + 25;
    
    // Success targets section
    checkNewPage(30 + canvasData.successTargets.length * 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold'); // Bold for section headings
    doc.setTextColor(138, 43, 226);
    doc.text('SUCCESS TARGETS', 20, currentY);
    currentY += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal'); // Normal for body text
    doc.setTextColor(255, 255, 255);
    canvasData.successTargets.forEach(target => {
      doc.text(`• ${target}`, 20, currentY);
      currentY += 8;
    });
    currentY += 20;
    
    // AI Recommendation section
    const recommendation = getAIRecommendation();
    const recLines = doc.splitTextToSize(recommendation, 170);
    checkNewPage(30 + recLines.length * 6);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold'); // Bold for section headings
    doc.setTextColor(138, 43, 226);
    doc.text('AI RECOMMENDATION', 20, currentY);
    currentY += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal'); // Normal for body text
    doc.setTextColor(255, 255, 255);
    doc.text(recLines, 20, currentY);
    currentY += recLines.length * 6 + 25;
    
    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal'); // Normal for footer text
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, currentY);
    
      // Save the PDF
      doc.save(`ai-transformation-canvas-${canvasData.businessName || 'canvas'}.pdf`);
      
      // Send email notification
      try {
        const { error } = await supabase.functions.invoke('send-canvas-email', {
          body: {
            businessName: contactForm.businessName,
            userName: contactForm.userName,
            businessEmail: contactForm.businessEmail
          }
        });
        
        if (error) {
          console.error('Email sending error:', error);
          toast({
            title: "PDF Downloaded",
            description: "Your canvas has been downloaded, but we couldn't send the email notification.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success!",
            description: "Your canvas has been downloaded and emailed to our team.",
          });
        }
      } catch (error) {
        console.error('Email function error:', error);
        toast({
          title: "PDF Downloaded",
          description: "Your canvas has been downloaded, but we couldn't send the email notification.",
          variant: "destructive"
        });
      }
    };
    
    // Start the process
    loadLogoAndGenerate();
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