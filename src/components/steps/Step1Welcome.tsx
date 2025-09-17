import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, MessageCircle, Brain, Target, Users } from 'lucide-react';
import { useMindmaker } from '@/contexts/MindmakerContext';

export const Step1Welcome = () => {
  const { setCurrentStep, markStepCompleted } = useMindmaker();

  const handleStartDiscovery = () => {
    setCurrentStep(2); // Go to AI flow
    markStepCompleted(1);
  };

  return (
    <>
      {/* Full Screen Hero */}
      <div className="hero-clouds relative overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-40 right-32 w-96 h-96 bg-white/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white/30 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>
        </div>

        {/* Navigation Header */}
        <div className="glass-nav relative z-20 px-6 py-4">
          <div className="container-width flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png" alt="MindMaker" className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">MindMaker</h1>
                <p className="text-sm text-muted-foreground">AI Literacy & Confidence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-20 container-width flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
          {/* Logo & Branding */}
          <div className="fade-in-up mb-8">
            <img src="/lovable-uploads/65494d8c-e78a-466b-9d7b-a29a3de74da9.png" alt="MindMaker AI" className="h-20 w-20 mx-auto mb-6" />
          </div>

          {/* Hero Title */}
          <h1 className="hero-title fade-in-up mb-6">
            Transform How You
            <br />
            <span className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Think About AI</span>
          </h1>

          {/* Subtitle */}
          <p className="body-lg fade-in-up mb-12 max-w-2xl">
            AI-powered discovery conversation that reveals your organization's unique transformation path. Get personalized insights and a direct connection to expert workshop solutions.
          </p>

          {/* Single Action Button */}
          <div className="flex justify-center mb-16">
            <Button 
              onClick={handleStartDiscovery}
              size="lg"
              className="button-hero bg-primary hover:bg-primary/90 text-white font-semibold px-12 py-6 text-xl h-auto shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <MessageCircle className="w-7 h-7 mr-4" />
              Start AI Transformation Discovery
              <ArrowRight className="w-7 h-7 ml-4" />
            </Button>
          </div>

          {/* Value Proposition Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <Card className="glass-card border-primary/20 hover:scale-105 transition-all duration-300 text-center">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Intelligent Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI-powered conversation that adapts to your unique business context and uncovers hidden opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-accent/20 hover:scale-105 transition-all duration-300 text-center">
              <CardHeader>
                <div className="p-3 bg-accent/10 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Target className="w-8 h-8 text-accent" />
                </div>
                <CardTitle className="text-xl text-foreground">Personalized Roadmap</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Custom transformation plan based on your team's readiness, industry, and specific challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20 hover:scale-105 transition-all duration-300 text-center">
              <CardHeader>
                <div className="p-3 bg-primary/10 rounded-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl text-foreground">Expert Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Direct path to Fractionl.ai's proven workshop methodology and executive training programs.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          <div className="fade-in-up mt-16 text-center">
            <p className="text-white/60 text-sm mb-4">Trusted by professionals at</p>
            <div className="flex items-center justify-center gap-8 opacity-60">
              <span className="text-white font-medium">Fortune 500</span>
              <div className="w-px h-4 bg-white/30"></div>
              <span className="text-white font-medium">Scale-ups</span>
              <div className="w-px h-4 bg-white/30"></div>
              <span className="text-white font-medium">Consultancies</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};