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
      
      // Why We're Different Section - Start new page
      doc.addPage();
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      
      const sectionStartY = 30;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
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
      businessDescription: '',
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
    
    // Helper function to intelligently paraphrase business description
    const getBusinessContext = (description: string) => {
      if (!description || description.trim() === '') return 'operates in their industry';
      
      // Extract key business activities and paraphrase naturally
      const desc = description.toLowerCase().trim();
      
      // Handle different input formats
      if (desc.includes('consulting') || desc.includes('advisory')) {
        return 'provides consulting and advisory services';
      } else if (desc.includes('software') || desc.includes('tech') || desc.includes('app')) {
        return 'operates in the technology sector';
      } else if (desc.includes('retail') || desc.includes('sell') || desc.includes('store')) {
        return 'operates in retail and sales';
      } else if (desc.includes('manufacturing') || desc.includes('production')) {
        return 'operates in manufacturing and production';
      } else if (desc.includes('healthcare') || desc.includes('medical')) {
        return 'operates in the healthcare industry';
      } else if (desc.includes('finance') || desc.includes('banking') || desc.includes('investment')) {
        return 'operates in financial services';
      } else if (desc.includes('education') || desc.includes('training') || desc.includes('learning')) {
        return 'operates in education and training';
      } else if (desc.includes('marketing') || desc.includes('advertising')) {
        return 'operates in marketing and communications';
      } else if (desc.includes('service') || desc.includes('support')) {
        return 'provides professional services';
      } else {
        // For other cases, create a natural paraphrase
        const words = desc.split(' ');
        if (words.length > 8) {
          return 'operates in a specialized industry sector';
        } else {
          return `specializes in ${desc.replace(/^(we|our|the company|this business)/i, '').trim()}`;
        }
      }
    };
    
    // Helper function to analyze change narrative and create appropriate response
    const getChangeContext = (narrative: string) => {
      if (!narrative || narrative.trim() === '') return '';
      
      const text = narrative.toLowerCase();
      
      // Detect if it's about negative past experiences
      const hasNegativeExperience = text.includes('failed') || text.includes('disaster') || 
                                   text.includes('bad') || text.includes('terrible') || 
                                   text.includes('awful') || text.includes('chaos') || 
                                   text.includes('mess') || text.includes('nightmare') ||
                                   text.includes('struggled') || text.includes('difficult');
      
      // Detect if it's about positive past experiences  
      const hasPositiveExperience = text.includes('successful') || text.includes('good') ||
                                   text.includes('smooth') || text.includes('effective') ||
                                   text.includes('well') || text.includes('positive');
      
      if (hasNegativeExperience) {
        return 'Drawing from previous organizational change experiences, this program will address common implementation challenges with a structured, gradual approach that prioritizes team confidence and practical skill development.';
      } else if (hasPositiveExperience) {
        return 'Building on your organization\'s previous success with change initiatives, this program will leverage proven methodologies while adapting to the unique aspects of AI adoption.';
      } else {
        return 'Understanding that change management is crucial for AI adoption success, this program incorporates proven change management principles throughout the learning journey.';
      }
    };
    
    // Calculate anxiety context
    const avgAnxiety = Object.values(mindmakerData.anxietyLevels).reduce((sum, val) => sum + val, 0) / 5;
    const anxietyContext = avgAnxiety > 60 ? 'significant concerns about AI implementation' : 
                          avgAnxiety > 40 ? 'some hesitation around AI adoption' : 
                          'readiness to embrace AI transformation';
    
    // Get business functions context
    const functionsContext = mindmakerData.businessFunctions.length > 0 ? 
      `across ${mindmakerData.businessFunctions.join(', ')} functions` : 
      'across multiple business functions';
    
    // Get learning modality recommendation
    const getModalityRecommendation = (modality: string) => {
      switch (modality) {
        case 'live-cohort': 
          return 'live cohort training sessions that foster collaboration and peer learning, creating a supportive environment for skill development';
        case 'self-paced': 
          return 'self-paced learning modules that allow team members to progress at their own speed while maintaining consistency in outcomes';
        case 'coaching': 
          return 'personalized one-on-one coaching sessions that provide targeted support and accelerate individual development';
        case 'chatbot': 
          return 'AI-powered learning assistant that provides immediate support and answers, enabling continuous learning and problem-solving';
        case 'blended': 
          return 'blended learning approach that combines multiple training methods to maximize engagement and retention';
        default: 
          return 'structured training program tailored to your team\'s learning preferences';
      }
    };
    
    // Get AI adoption context
    const getAdoptionContext = (adoption: string) => {
      switch (adoption) {
        case 'none': 
          return 'With no current AI tools in use, this presents an ideal opportunity to establish a strong foundation using the Fractionl AI methodology—focusing on mindset before mechanics to ensure sustainable adoption.';
        case 'pilots': 
          return 'Building on existing AI pilot programs, we\'ll help standardize successful practices while expanding capabilities through practical, hands-on learning experiences.';
        case 'team-level': 
          return 'With some teams already using AI tools, we\'ll work to democratize AI literacy across the organization while establishing governance frameworks and best practices.';
        case 'enterprise-wide': 
          return 'Given your existing AI adoption, the focus will be on optimization, advanced skill development, and creating agentic workflows that amplify human capabilities.';
        default: 
          return 'We\'ll meet your organization where it is in the AI journey, providing the right level of support for sustainable growth.';
      }
    };
    
    // Build the intelligent recommendation
    const businessName = mindmakerData.businessName || 'Your organization';
    const businessContext = getBusinessContext(mindmakerData.businessDescription);
    const changeContext = getChangeContext(mindmakerData.changeNarrative);
    const modalityRecommendation = getModalityRecommendation(mindmakerData.learningModality);
    const adoptionContext = getAdoptionContext(mindmakerData.aiAdoption);
    
    const recommendation = `${businessName} ${businessContext} ${functionsContext} and demonstrates ${anxietyContext}. ${adoptionContext}

Our recommendation centers on ${modalityRecommendation}. This approach emphasizes the core Fractionl AI principle of "mindset before mechanics"—ensuring your team develops both the confidence and practical skills needed for effective AI integration.

${changeContext}

The program will focus on developing practical AI literacy that directly supports your business operations, with particular emphasis on spotting agentic opportunities and understanding how AI can augment rather than replace human capabilities. Expected outcomes include enhanced team confidence with AI tools, improved workflow efficiency, and sustainable adoption practices that align with your business goals.`;

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
              <p><strong>Description:</strong> {state.mindmakerData.businessDescription}</p>
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