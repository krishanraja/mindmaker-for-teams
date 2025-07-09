import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { ArrowLeft, Download, Calendar, Mail, Building, User, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { Badge } from '../ui/badge';
import { getAnxietyLevel, COMPANIES, COUNTRIES } from '../../types/canvas';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';

export const Step7Mindmaker: React.FC = () => {
  const { state, updateMindmakerData, setCurrentStep, markStepCompleted } = useMindmaker();
  const { toast } = useToast();
  
  const [contactForm, setContactForm] = useState({
    businessName: state.mindmakerData.businessName,
    userName: state.mindmakerData.userName,
    businessEmail: state.mindmakerData.businessEmail,
    company: state.mindmakerData.company,
    country: state.mindmakerData.country,
    ndaAccepted: state.mindmakerData.ndaAccepted,
  });

  const handleContactFormChange = (field: string, value: string | boolean) => {
    const newForm = { ...contactForm, [field]: value };
    setContactForm(newForm);
    updateMindmakerData(newForm);
  };

  const handleDownloadPDF = () => {
    // Mark step 7 as completed when user downloads PDF
    markStepCompleted(7);
    const { mindmakerData } = state;
    const avgAnxiety = Object.values(mindmakerData.anxietyLevels).reduce((a, b) => a + b, 0) / 5;
    
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
      doc.text('AI TRANSFORMATION MINDMAKER', 20, currentY);
      currentY += 25;

      // AI Recommendation section (moved to top) - Enhanced layout
      const recommendation = getAIRecommendation();
      const maxWidth = pageWidth - 40; // 20px margin on each side
      const recLines = doc.splitTextToSize(recommendation, maxWidth - 20); // Additional margin for content
      checkNewPage(50 + recLines.length * 7);
      
      // Create a styled background box for the recommendation header
      doc.setFillColor(88, 28, 135); // Darker purple background
      doc.roundedRect(20, currentY - 5, maxWidth, 25, 3, 3, 'F');
      
      // Section heading centered vertically and horizontally
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold'); // Using helvetica as closest to Outfit
      doc.setTextColor(255, 255, 255);
      const headerText = 'AI RECOMMENDATION';
      const textWidth = doc.getTextWidth(headerText);
      const centerX = 20 + (maxWidth - textWidth) / 2;
      doc.text(headerText, centerX, currentY + 14); // Centered vertically in 25px header
      currentY += 35;
      
      // Recommendation content with better formatting and proper spacing
      doc.setFillColor(40, 40, 45); // Dark background for content
      const contentHeight = recLines.length * 7 + 30; // More spacing between lines
      doc.roundedRect(20, currentY - 15, maxWidth, contentHeight, 5, 5, 'F');
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal'); // Using helvetica as closest to Inter
      doc.setTextColor(255, 255, 255);
      doc.text(recLines, 30, currentY, { lineHeightFactor: 1.4 }); // Better line spacing
      currentY += recLines.length * 7 + 25;
    
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
      doc.text(`Organization: ${mindmakerData.businessName || 'N/A'}`, 20, currentY);
      currentY += 10;
      doc.text(`Contact: ${mindmakerData.userName || 'N/A'}`, 20, currentY);
      currentY += 10;
      doc.text(`Email: ${mindmakerData.businessEmail || 'N/A'}`, 20, currentY);
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
    doc.text(`Team Size: ${mindmakerData.employeeCount} employees`, 20, currentY);
    currentY += 10;
    doc.text(`Functions: ${mindmakerData.businessFunctions.join(', ')}`, 20, currentY);
    currentY += 10;
    doc.text(`AI Maturity: ${mindmakerData.aiAdoption}`, 20, currentY);
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
    doc.text(`Executives: ${mindmakerData.anxietyLevels.executives}%`, 20, currentY);
    currentY += 10;
    doc.text(`Middle Management: ${mindmakerData.anxietyLevels.middleManagement}%`, 20, currentY);
    currentY += 10;
    doc.text(`Frontline Staff: ${mindmakerData.anxietyLevels.frontlineStaff}%`, 20, currentY);
    currentY += 10;
    doc.text(`Tech Team: ${mindmakerData.anxietyLevels.techTeam}%`, 20, currentY);
    currentY += 10;
    doc.text(`Non-Tech Team: ${mindmakerData.anxietyLevels.nonTechTeam}%`, 20, currentY);
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
    const skillsText = `AI Skills: ${mindmakerData.aiSkills.join(', ')}`;
    const skillsLines = doc.splitTextToSize(skillsText, 170);
    doc.text(skillsLines, 20, currentY);
    currentY += skillsLines.length * 6 + 5;
    
    const risksText = `Automation Risks: ${mindmakerData.automationRisks.join(', ')}`;
    const risksLines = doc.splitTextToSize(risksText, 170);
    doc.text(risksLines, 20, currentY);
    currentY += risksLines.length * 6 + 25;
    
    // Learning and change section
    const changeText = mindmakerData.changeNarrative || 'Not provided';
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
    doc.text(`Learning Preference: ${mindmakerData.learningModality || 'Not specified'}`, 20, currentY);
    currentY += 15;
    
    doc.text(changeLines, 20, currentY);
    currentY += changeLines.length * 6 + 25;
    
    // Success targets section
    checkNewPage(30 + mindmakerData.successTargets.length * 8);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold'); // Bold for section headings
    doc.setTextColor(138, 43, 226);
    doc.text('SUCCESS TARGETS', 20, currentY);
    currentY += 15;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal'); // Normal for body text
    doc.setTextColor(255, 255, 255);
    mindmakerData.successTargets.forEach(target => {
      doc.text(`• ${target}`, 20, currentY);
      currentY += 8;
    });
    currentY += 25;
    
    // Why Us? section on new page
    doc.addPage();
    // Set black background for new page
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    currentY = 30;
    
    // Why Us? section header
    doc.setFillColor(88, 28, 135); // Darker purple background
    doc.roundedRect(20, currentY - 5, maxWidth, 25, 3, 3, 'F');
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    const whyUsText = 'WHY US?';
    const whyUsWidth = doc.getTextWidth(whyUsText);
    const whyUsCenterX = 20 + (maxWidth - whyUsWidth) / 2;
    doc.text(whyUsText, whyUsCenterX, currentY + 14);
    currentY += 40;
    
    // Why Us reasons
    const whyUsReasons = [
      {
        title: "Mindset before mechanics",
        content: "The focus is on cognitive reframing & \"agent opportunity spotting,\" using linguistic techniques for better prompting, learning what APIs / other technical elements actually are in plain English, and why they'll need to know it in the future."
      },
      {
        title: "Practicality and learning",
        content: "Most workshops show off the speaker's knowledge. Fractionl AI gets you on the ramp to self education with wireframes and examples that everyone can relate to and pick up."
      },
      {
        title: "Fractional future lens",
        content: "Heavy focus on creating value as a stand-alone micro-service. Monetize your mind and amplify with agents to ensure a healthy future for your people & business."
      },
      {
        title: "Tech-agnostic guard-rails",
        content: "With decades long background in data privacy and AI automation, Fractional AI advises on how to protect your IP & assess vendor-risk so clients aren't trapped by short-lived hype platforms and can build an agentic future that survives any one AI tool."
      },
      {
        title: "Teacher-founder",
        content: "Krish's qualified-teacher background + coder mindset + business acumen translates complex agent concepts into plain-language, high-retention learning."
      }
    ];
    
    whyUsReasons.forEach((reason, index) => {
      // Check if we need a new page
      const reasonLines = doc.splitTextToSize(reason.content, maxWidth - 40);
      checkNewPage(20 + reasonLines.length * 6);
      
      // Reason title
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(138, 43, 226);
      doc.text(`${index + 1}. ${reason.title}`, 20, currentY);
      currentY += 15;
      
      // Reason content
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.text(reasonLines, 30, currentY, { lineHeightFactor: 1.3 });
      currentY += reasonLines.length * 6 + 20;
    });
    
    // Footer
    currentY += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal'); // Normal for footer text
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, currentY);
    
      // Save the PDF locally
      doc.save(`ai-transformation-mindmaker-${mindmakerData.businessName || 'mindmaker'}.pdf`);
      
      // Get PDF as base64 for email attachment
      const pdfBlob = doc.output('blob');
      const pdfBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(pdfBlob);
      });
      
      // Send email notification with canvas data
      try {
        const { error } = await supabase.functions.invoke('send-canvas-email', {
          body: {
            businessName: contactForm.businessName,
            userName: contactForm.userName,
            businessEmail: contactForm.businessEmail,
            mindmakerData,
            aiRecommendation: getAIRecommendation()
          }
        });
        
        if (error) {
          console.error('Email sending error:', error);
          toast({
            title: "PDF Downloaded",
            description: "Your mindmaker has been downloaded, but we couldn't send the email notification.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Success!",
            description: "Your mindmaker has been downloaded and emailed to our team.",
          });
        }
      } catch (error) {
        console.error('Email function error:', error);
        toast({
          title: "PDF Downloaded",
          description: "Your mindmaker has been downloaded, but we couldn't send the email notification.",
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
    const { mindmakerData } = state;
    const avgAnxiety = Object.values(mindmakerData.anxietyLevels).reduce((a, b) => a + b, 0) / 5;
    const teamSize = mindmakerData.employeeCount;
    const hasChangeExp = mindmakerData.changeNarrative.length > 0;
    const learningStyle = mindmakerData.learningModality;
    const aiMaturity = mindmakerData.aiAdoption;
    const functions = mindmakerData.businessFunctions;
    const skills = mindmakerData.aiSkills;
    const targets = mindmakerData.successTargets;
    
    let recommendation = `For your ${teamSize}-person team across ${functions.join(', ')}, `;
    
    // Personalize based on anxiety and AI maturity
    if (avgAnxiety > 60) {
      recommendation += `we recommend starting with confidence-building sessions to address the ${avgAnxiety.toFixed(0)}% anxiety level. Given your ${aiMaturity} AI experience, `;
    } else if (avgAnxiety > 30) {
      recommendation += `with a ${avgAnxiety.toFixed(0)}% anxiety level and ${aiMaturity} AI maturity, `;
    } else {
      recommendation += `your team's low ${avgAnxiety.toFixed(0)}% anxiety and ${aiMaturity} experience positions you for `;
    }
    
    // Customize approach based on learning style and skills
    if (skills.includes('Data Analysis')) {
      recommendation += `we'll leverage your existing data analysis skills through ${learningStyle} workshops focusing on advanced AI applications. `;
    } else if (skills.includes('Digital Marketing')) {
      recommendation += `we'll build on your digital marketing expertise with ${learningStyle} sessions on AI-powered marketing automation. `;
    } else {
      recommendation += `we'll design ${learningStyle} workshops tailored to build foundational AI skills for your team. `;
    }
    
    // Include specific targets
    if (targets.length > 0) {
      recommendation += `To achieve your goals of ${targets.slice(0, 2).join(' and ')}, `;
    }
    
    // Final recommendation based on experience
    if (hasChangeExp) {
      recommendation += `we'll customize the workshop using your transformation experience and provide additional toolkits, plus enable you to select key employees for individual follow-up sessions.`;
    } else {
      recommendation += `we'll provide comprehensive practical learning materials, implementation toolkits, and enable you to choose specific employees for targeted follow-up workshops to maximize adoption.`;
    }
    
    return recommendation;
  };

  const isFormValid = contactForm.businessName && contactForm.userName && 
                     contactForm.businessEmail && contactForm.company && 
                     contactForm.country && contactForm.ndaAccepted;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-heading font-bold text-2xl md:text-3xl mb-3">
          Your AI Transformation Mindmaker
        </h1>
        <p className="text-base text-muted-foreground max-w-2xl mx-auto">
          Here's an initial draft proposal for your corporate workshop. Book a call to continue planning the perfect upskilling program for your team.
        </p>
      </div>


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
              <p><strong>Team Size:</strong> {state.mindmakerData.employeeCount} employees</p>
              <p><strong>Functions:</strong> {state.mindmakerData.businessFunctions.length}</p>
              <p><strong>AI Maturity:</strong> {state.mindmakerData.aiAdoption}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {state.mindmakerData.successTargets.slice(0, 3).map((target, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-sm">{target}</span>
                </div>
              ))}
              {state.mindmakerData.successTargets.length > 3 && (
                <p className="text-sm text-muted-foreground">
                  +{state.mindmakerData.successTargets.length - 3} more targets
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Form */}
      <Card>
        <CardHeader>
          <CardTitle>Get Your Mindmaker</CardTitle>
          <CardDescription>Complete your details to download your personalized mindmaker</CardDescription>
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
            <div>
              <Label htmlFor="company">Business Type *</Label>
              <Select value={contactForm.company} onValueChange={(value) => handleContactFormChange('company', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANIES.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="country">Country *</Label>
              <Select value={contactForm.country} onValueChange={(value) => handleContactFormChange('country', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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


      {/* AI Recommendation */}
      <Card className="bg-gradient-purple text-white">
        <CardHeader>
          <CardTitle className="text-xl">AI Recommendation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base mb-6">{getAIRecommendation()}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleBookSession}
              className="bg-white text-brand-purple hover:bg-white/90"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Plan Your Workshop
            </Button>
            <Button
              onClick={handleDownloadPDF}
              disabled={!isFormValid}
              className="bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Mindmaker PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Previous Button */}
      <div className="flex justify-start pt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
      </div>
    </div>
  );
};