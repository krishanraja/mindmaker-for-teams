import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Sparkles } from 'lucide-react';

export const WhyNowSlide: React.FC = () => {
  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-background">
      <CardContent className="p-8">
        {/* Co-Branded Header */}
        <div className="flex items-center justify-center gap-8 mb-8 pb-8 border-b-2 border-border">
          <div className="text-center">
            <div className="h-20 w-20 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">Mindmaker</div>
            <div className="text-sm text-muted-foreground">AI Literacy & Confidence</div>
          </div>
          
          <div className="text-4xl font-bold text-muted-foreground">×</div>
          
          <div className="text-center">
            <div className="h-20 w-20 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground">Meliora</div>
            <div className="text-sm text-muted-foreground">Transformation Partner</div>
          </div>
        </div>

        <h3 className="text-3xl font-bold text-center mb-8 text-foreground">Why Now / Why Us</h3>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Why Now */}
          <div className="space-y-4">
            <h4 className="text-2xl font-bold text-primary mb-4">Why Now</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">AI-Native Competitors Are Here</div>
                  <div className="text-sm text-muted-foreground">Media startups with 1/10th staff, 10x output</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">90-Day Advantage Window</div>
                  <div className="text-sm text-muted-foreground">First movers building 15% competitive lead per quarter</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Technology Maturity Point</div>
                  <div className="text-sm text-muted-foreground">AI tools proven in production at enterprise scale</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Talent Expectations Shifting</div>
                  <div className="text-sm text-muted-foreground">Best hires expect AI-augmented workflows</div>
                </div>
              </div>
            </div>
          </div>

          {/* Why Us */}
          <div className="space-y-4">
            <h4 className="text-2xl font-bold text-primary mb-4">Why Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Media Sector Expertise</div>
                  <div className="text-sm text-muted-foreground">Deep domain knowledge in newsroom & publishing workflows</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Dual-Track Approach</div>
                  <div className="text-sm text-muted-foreground">Literacy + implementation = sustainable transformation</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Embedded Technologist</div>
                  <div className="text-sm text-muted-foreground">Krish: teacher-founder who bridges code & boardroom</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-foreground">Risk-First Philosophy</div>
                  <div className="text-sm text-muted-foreground">De-risk before scale, pilot before platform</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Track Record */}
        <div className="mt-8 p-6 bg-primary/10 rounded-lg border border-primary/20">
          <h4 className="text-xl font-bold text-center mb-4 text-foreground">Proven Track Record</h4>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">40%</div>
              <div className="text-sm text-muted-foreground">Avg. Efficiency Gain</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">30 Days</div>
              <div className="text-sm text-muted-foreground">To Measurable ROI</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">12+</div>
              <div className="text-sm text-muted-foreground">Media Orgs Transformed</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
