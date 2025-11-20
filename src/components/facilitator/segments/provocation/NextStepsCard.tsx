import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Rocket, Users, User, ExternalLink } from 'lucide-react';
import leaderPreview from '@/assets/mindmaker-leaders-preview.png';

interface NextStepsCardProps {
  companyName?: string;
}

export const NextStepsCard: React.FC<NextStepsCardProps> = ({ companyName }) => {
  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/20">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Rocket className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-2xl mb-2">
              Sustain Decision Velocity Through AI Literacy
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              The pilot is your first step. AI literacy is the ongoing upskill that makes leaders—and organizations—genuinely accelerate.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* 90-Day Team Advisory Sprint */}
          <div className="space-y-4 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">90-Day Team Advisory Sprint</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Develop a specific change strategy with dedicated support through pilot execution.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Strategic change management framework</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Weekly team advisory sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Pilot execution support & refinement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Metrics tracking & adjustment protocols</span>
              </li>
            </ul>
            <Button className="w-full mt-4" variant="default">
              Explore Team Sprint
            </Button>
          </div>

          {/* 1-1 Individual Leader Track */}
          <div className="space-y-4 p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-lg">1-1 Individual Leader Track</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Continue your personal AI literacy journey with benchmarking and continuous upskilling.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <HoverCard openDelay={200}>
                  <HoverCardTrigger asChild>
                    <button className="text-left hover:text-primary transition-colors underline decoration-dotted">
                      Personal AI literacy co-pilot & benchmarking
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-[450px] p-0" align="start">
                    <div className="relative overflow-hidden rounded-lg">
                      <img 
                        src={leaderPreview} 
                        alt="Mindmaker Leaders Platform Preview" 
                        className="w-full h-auto"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/95 to-transparent p-4">
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          leaders.themindmaker.ai
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Personalized dimension-level insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Continuous skill development pathways</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">•</span>
                <span>Track your growth against peer benchmarks</span>
              </li>
            </ul>
            <Button className="w-full mt-4" variant="outline">
              Learn More
            </Button>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-muted">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-medium text-foreground">AI literacy is not a one-time skill.</span> It's the essential, ongoing upskill for leadership in the age of acceleration.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
