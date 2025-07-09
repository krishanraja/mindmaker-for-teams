import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { ArrowLeft, Download, Calendar, User, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useMindmaker } from '../../contexts/MindmakerContext';
import { Badge } from '../ui/badge';
import { COUNTRIES } from '../../types/canvas';
import { supabase } from '../../integrations/supabase/client';
import { useToast } from '../../hooks/use-toast';
import { LoadingScreen } from '../LoadingScreen';

export const Step7Mindmaker: React.FC = () => {
  const { state, updateMindmakerData, setCurrentStep, markStepCompleted } = useMindmaker();
  const { toast } = useToast();
  const [recommendation, setRecommendation] = useState<string>('');
  const [showLoading, setShowLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  
  const [contactForm, setContactForm] = useState({
    userName: state.mindmakerData.userName,
    userEmail: state.mindmakerData.businessEmail,
    country: state.mindmakerData.country,
    ndaAccepted: state.mindmakerData.ndaAccepted,
  });

  const handleContactFormChange = (field: string, value: string | boolean) => {
    const newForm = { ...contactForm, [field]: value };
    setContactForm(newForm);
    updateMindmakerData({ 
      userName: newForm.userName,
      businessEmail: newForm.userEmail,
      country: newForm.country,
      ndaAccepted: newForm.ndaAccepted
    });
  };

  const generateRecommendation = async () => {
    const rec = await getAIRecommendation();
    setRecommendation(rec);
  };

  const handleLoadingComplete = () => {
    setShowLoading(false);
    setShowResults(true);
  };

  // Generate initial recommendation when component mounts
  React.useEffect(() => {
    generateRecommendation();
  }, []);

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
    
    const generateContent = async () => {
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
      const recommendation = await getAIRecommendation();
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
      img.onload = async () => {
        doc.addImage(img, 'PNG', 20, 20, 20, 20);
        await generateContent();
      };
      img.onerror = async () => {
        // Logo fallback
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.text('FRACTIONL', 20, 35);
        await generateContent();
      };
    } catch (error) {
      await generateContent();
    }
    
    const sendEmailNotification = async () => {
      try {
        const emailRecommendation = await getAIRecommendation();
        const { error } = await supabase.functions.invoke('send-canvas-email', {
          body: {
            businessName: state.mindmakerData.businessName,
            userName: contactForm.userName,
            businessEmail: contactForm.userEmail,
            businessUrl: state.mindmakerData.businessUrl,
            mindmakerData,
            aiRecommendation: emailRecommendation
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
      businessUrl: '',
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
      userName: '',
      userEmail: '',
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

  const getAIRecommendation = async () => {
    const { mindmakerData } = state;
    const avgAnxiety = Object.values(mindmakerData.anxietyLevels).reduce((a, b) => a + b, 0) / 5;
    const hasChangeExp = mindmakerData.changeNarrative.length > 0;
    const learningStyle = mindmakerData.learningModality;
    const aiMaturity = mindmakerData.aiAdoption;
    const functions = mindmakerData.businessFunctions;
    const skills = mindmakerData.aiSkills;
    const risks = mindmakerData.automationRisks;
    const targets = mindmakerData.successTargets;
    const businessName = mindmakerData.businessName || '{BUSINESS NAME}';
    
    // Get business information from website
    let businessInfo = null;
    if (state.mindmakerData.businessUrl) {
      try {
        const { data } = await supabase.functions.invoke('analyze-business-website', {
          body: { businessUrl: state.mindmakerData.businessUrl }
        });
        businessInfo = data?.businessInfo;
      } catch (error) {
        console.log('Could not analyze business website:', error);
      }
    }
    
    // Build personalized recommendation
    let recommendation = `For ${businessName}`;
    
    if (businessInfo) {
      recommendation += `, a ${businessInfo.companyDescription} in the ${businessInfo.industry} sector,`;
    }
    
    recommendation += ` with your team spanning ${functions.join(', ')}, `;
    
    // Address specific AI skills and capabilities
    if (skills.length > 0) {
      const topSkills = skills.slice(0, 3);
      recommendation += `we'll build upon your existing strengths in ${topSkills.join(' and ')} while `;
    }
    
    // Address automation risks with empathy
    if (risks.length > 0 && avgAnxiety > 40) {
      recommendation += `addressing team concerns about automation in areas like ${risks.slice(0, 2).join(' and ')}. `;
    }
    
    // Anxiety-informed approach
    if (avgAnxiety > 60) {
      recommendation += `Given the ${avgAnxiety.toFixed(0)}% anxiety level across your organization, we recommend starting with confidence-building sessions that demonstrate AI as an enhancement tool rather than replacement. `;
    } else if (avgAnxiety > 30) {
      recommendation += `With a ${avgAnxiety.toFixed(0)}% team anxiety level, we'll balance practical AI implementation with change management support. `;
    } else {
      recommendation += `Your team's low ${avgAnxiety.toFixed(0)}% anxiety level positions you for accelerated AI adoption. `;
    }
    
    // AI maturity and learning approach
    if (aiMaturity === 'none') {
      recommendation += `Starting from ground zero, our ${learningStyle} approach will establish foundational AI literacy through `;
    } else if (aiMaturity === 'pilots') {
      recommendation += `Building on your pilot experience, we'll scale successful initiatives through ${learningStyle} workshops that `;
    } else {
      recommendation += `Leveraging your ${aiMaturity} AI maturity, we'll optimize existing systems via ${learningStyle} sessions that `;
    }
    
    // Business-specific recommendations based on functions
    if (functions.includes('Sales')) {
      recommendation += `focus on AI-powered lead qualification and customer engagement, `;
    }
    if (functions.includes('Ops')) {
      recommendation += `emphasize workflow automation and process optimization, `;
    }
    if (functions.includes('HR')) {
      recommendation += `introduce AI for talent acquisition and employee experience enhancement, `;
    }
    if (functions.includes('CX')) {
      recommendation += `implement intelligent customer service and personalization tools, `;
    }
    
    // Specific skill development
    if (skills.includes('Data Analysis')) {
      recommendation += `advancing your analytical capabilities with predictive modeling and automated insights. `;
    } else if (skills.includes('Content Creation')) {
      recommendation += `scaling your content operations with AI-assisted writing and creative workflows. `;
    } else {
      recommendation += `developing core AI competencies tailored to your industry needs. `;
    }
    
    // Success targets integration
    if (targets.length > 0) {
      recommendation += `To achieve your goals of ${targets.slice(0, 2).join(' and ')}, `;
    }
    
    // Business context from website
    if (businessInfo?.services) {
      recommendation += `we'll create AI applications specifically for ${businessInfo.services.slice(0, 2).join(' and ')} that align with your `;
    }
    
    // Closing with change experience consideration
    if (hasChangeExp) {
      recommendation += `proven transformation experience. Our program includes executive briefings, hands-on workshops, and personalized coaching to ensure sustainable adoption across your ${businessName} team.`;
    } else {
      recommendation += `business objectives. We'll provide comprehensive change management support, practical implementation toolkits, and ongoing mentorship to drive lasting transformation at ${businessName}.`;
    }
    
    return recommendation;
  };

  const isFormValid = contactForm.userName && contactForm.userEmail && 
                     contactForm.country && contactForm.ndaAccepted;

  // Show loading screen first
  if (showLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

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
              <User className="w-5 h-5" />
              Organization Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Business:</strong> {state.mindmakerData.businessName}</p>
              <p><strong>Type:</strong> {state.mindmakerData.company}</p>
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
          <CardTitle>Complete Your Details</CardTitle>
          <CardDescription>Provide your contact information to receive your personalized mindmaker</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
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
              <Label htmlFor="userEmail">Your Email *</Label>
              <Input
                id="userEmail"
                type="email"
                value={contactForm.userEmail}
                onChange={(e) => handleContactFormChange('userEmail', e.target.value)}
                placeholder="your.email@company.com"
              />
            </div>
            <div className="md:col-span-2">
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
          <p className="text-base mb-6">{recommendation || 'Generating personalized recommendation...'}</p>
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