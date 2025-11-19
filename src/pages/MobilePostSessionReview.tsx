import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Star, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const MobilePostSessionReview: React.FC = () => {
  const { workshopId } = useParams<{ workshopId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [workshop, setWorkshop] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    participantName: '',
    participantEmail: '',
    aiLeadershipConfidence: [5],
    sessionEnjoyment: [5],
    optionalFeedback: ''
  });

  useEffect(() => {
    loadWorkshopData();
  }, [workshopId]);

  const loadWorkshopData = async () => {
    try {
      const { data, error } = await supabase
        .from('workshop_sessions')
        .select('*, exec_intakes(company_name)')
        .eq('id', workshopId)
        .single();
      
      if (error) throw error;
      
      setWorkshop(data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading workshop:', error);
      toast({ title: 'Invalid feedback link', variant: 'destructive' });
      navigate('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.participantName.trim()) {
      toast({ title: 'Please enter your name', variant: 'destructive' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('post_session_reviews')
        .insert({
          workshop_session_id: workshopId,
          participant_name: formData.participantName.trim(),
          participant_email: formData.participantEmail.trim() || null,
          ai_leadership_confidence: formData.aiLeadershipConfidence[0],
          session_enjoyment: formData.sessionEnjoyment[0],
          optional_feedback: formData.optionalFeedback.trim() || null
        });
      
      if (error) throw error;
      
      setSubmitted(true);
      toast({ title: 'Thank you for your feedback!', description: 'Your input helps us improve.' });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({ title: 'Submission failed', description: 'Please try again.', variant: 'destructive' });
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feedback form...</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-12 pb-8 text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold">Thank You!</h2>
            <p className="text-muted-foreground">
              Your feedback has been submitted. We appreciate you taking the time to share your thoughts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const companyName = workshop?.exec_intakes?.company_name || 'Organization';

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Session Feedback</CardTitle>
            <CardDescription className="text-base">
              {companyName} AI Leadership Workshop
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={formData.participantName}
                  onChange={(e) => setFormData({ ...formData, participantName: e.target.value })}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Email Field (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="email">Your Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.participantEmail}
                  onChange={(e) => setFormData({ ...formData, participantEmail: e.target.value })}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* AI Leadership Confidence Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    AI Leadership Confidence
                  </Label>
                  <span className="text-2xl font-bold text-primary">
                    {formData.aiLeadershipConfidence[0]}/10
                  </span>
                </div>
                <p className="text-sm text-muted-foreground -mt-2">
                  How confident do you feel in your AI leadership skills now?
                </p>
                <Slider
                  value={formData.aiLeadershipConfidence}
                  onValueChange={(value) => setFormData({ ...formData, aiLeadershipConfidence: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not Confident</span>
                  <span>Very Confident</span>
                </div>
              </div>

              {/* Session Enjoyment Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Session Enjoyment
                  </Label>
                  <span className="text-2xl font-bold text-primary">
                    {formData.sessionEnjoyment[0]}/10
                  </span>
                </div>
                <p className="text-sm text-muted-foreground -mt-2">
                  How much did you enjoy this session?
                </p>
                <Slider
                  value={formData.sessionEnjoyment}
                  onValueChange={(value) => setFormData({ ...formData, sessionEnjoyment: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Not Enjoyable</span>
                  <span>Highly Enjoyable</span>
                </div>
              </div>

              {/* Optional Feedback */}
              <div className="space-y-2">
                <Label htmlFor="feedback">Additional Thoughts (optional)</Label>
                <Textarea
                  id="feedback"
                  value={formData.optionalFeedback}
                  onChange={(e) => setFormData({ ...formData, optionalFeedback: e.target.value })}
                  placeholder="Any other feedback, surprises, or suggestions?"
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};