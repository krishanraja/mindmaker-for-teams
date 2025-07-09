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

  const handleDownloadPDF = async () => {
    // Mark step 7 as completed when user downloads PDF
    markStepCompleted(7);
    const { mindmakerData } = state;
    
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    
    // Set black background for entire page
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    
    const generateContent = () => {
      // Email below logo
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('krish@fractionl.ai', 20, 50);
      
      // Main Title
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      const businessName = mindmakerData.businessName || '{BUSINESS NAME}';
      const titleText = `AI TRANSFORMATION MINDMAKER FOR ${businessName.toUpperCase()}`;
      doc.text(titleText, 20, 90, { maxWidth: 170 });
      
      // AI Recommendation Section
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      const recommendation = getAIRecommendation();
      const recLines = doc.splitTextToSize(recommendation, 170);
      
      let startY = 120;
      recLines.forEach((line: string, index: number) => {
        doc.text(line, 20, startY + (index * 6));
      });
      
      // Why We're Different Section
      const sectionStartY = startY + (recLines.length * 6) + 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text("Why We're Different", 20, sectionStartY);
      
      // The 5 reasons from the template
      const reasons = [
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
      
      let currentY = sectionStartY + 20;
      
      reasons.forEach((reason, index) => {
        // Check if we need a new page
        if (currentY > pageHeight - 60) {
          doc.addPage();
          doc.setFillColor(0, 0, 0);
          doc.rect(0, 0, pageWidth, pageHeight, 'F');
          currentY = 30;
        }
        
        // Number and title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text(`${index + 1}. ${reason.title}`, 20, currentY);
        
        // Content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        const contentLines = doc.splitTextToSize(reason.content, 160);
        contentLines.forEach((line: string, lineIndex: number) => {
          doc.text(line, 30, currentY + 10 + (lineIndex * 5));
        });
        
        currentY += 10 + (contentLines.length * 5) + 15;
      });
      
      // Save the PDF
      doc.save(`ai-transformation-mindmaker-${mindmakerData.businessName || 'mindmaker'}.pdf`);
      
      // Send email notification
      sendEmailNotification();
    };
    
    // Header - Logo and Email (top left)
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = '/lovable-uploads/32cd84ff-f45d-4007-963c-592cf3554f70.png';
      img.onload = () => {
        doc.addImage(img, 'PNG', 20, 20, 20, 20);
        generateContent();
      };
      img.onerror = () => {
        // Logo fallback
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('FRACTIONL', 20, 35);
        generateContent();
      };
    } catch (error) {
      generateContent();
    }
    
    const sendEmailNotification = async () => {
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
  };

  const handleBookSession = () => {
    window.open('https://calendly.com/krish-raja/krish-raja', '_blank');
  };

  const handlePrevious = () => {
    setCurrentStep(6);
  };

  const handleStartOver = () => {
    // Reset all form data to initial state
    const initialData = {
      businessName: '',
      userName: '',
      businessEmail: '',
      company: '',
      country: '',
      ndaAccepted: false,
      employeeCount: 0,
      businessFunctions: [],
      aiAdoption: 'none' as const,
      anxietyLevels: {
        executives: 0,
        middleManagement: 0,
        frontlineStaff: 0,
        techTeam: 0,
        nonTechTeam: 0
      },
      aiSkills: [],
      automationRisks: [],
      learningModality: 'live-cohort' as const,
      changeNarrative: '',
      successTargets: [],
      logoFile: null
    };
    
    updateMindmakerData(initialData);
    setContactForm({
      businessName: '',
      userName: '',
      businessEmail: '',
      company: '',
      country: '',
      ndaAccepted: false,
    });
    
    // Navigate back to step 1
    setCurrentStep(1);
    
    toast({
      title: "Form Reset",
      description: "All data has been cleared. Starting over from the beginning.",
    });
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

      {/* Navigation Buttons */}
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
          variant="outline"
          onClick={handleStartOver}
          className="flex items-center gap-2"
        >
          Start Over
        </Button>
      </div>
    </div>
  );
};