import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, Calendar, Download } from 'lucide-react';
import { BenchmarkComparisonChart } from './provocation/BenchmarkComparisonChart';
import { CostFramingChart } from './provocation/CostFramingChart';
import { CalendarBookingEmbed } from './provocation/CalendarBookingEmbed';
import { WhyNowSlide } from './provocation/WhyNowSlide';

interface Segment7ProvocationProps {
  workshopId: string;
}

export const Segment7Provocation: React.FC<Segment7ProvocationProps> = ({ workshopId }) => {
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Hero Section - Provocative Question */}
      <Card className="border-4 border-destructive bg-gradient-to-br from-destructive/5 via-background to-destructive/10 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="inline-block px-4 py-2 bg-destructive/20 rounded-full mb-6">
            <span className="text-sm font-bold text-destructive">Closing • 10 Minutes</span>
          </div>
          <CardTitle className="text-5xl md:text-7xl font-black leading-tight text-foreground mb-6">
            If an AI-native startup launched tomorrow with your data...
          </CardTitle>
          <p className="text-4xl md:text-6xl font-bold text-destructive animate-pulse">
            Would they beat you?
          </p>
        </CardHeader>
        <CardContent className="text-center pb-12">
          <div className="flex items-center justify-center gap-3 text-muted-foreground">
            <AlertTriangle className="h-6 w-6" />
            <p className="text-xl">The urgency is real. The window is closing.</p>
          </div>
        </CardContent>
      </Card>

      {/* Part 1: Benchmark Slide (3 min) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">How AI-Native Peers Operate</h2>
            <p className="text-muted-foreground">3 minutes • Competitive Reality Check</p>
          </div>
        </div>

        <BenchmarkComparisonChart />

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-foreground">Facilitator Notes:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Walk through each metric slowly - let the gap sink in</li>
              <li>• Ask: "Where do you see your organization on this spectrum?"</li>
              <li>• Emphasize: AI-native isn't about tech budget, it's about operational DNA</li>
              <li>• Real example: Media startups launching with 1/10th the staff, 10x the experimentation rate</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Part 2: Risk/Return Framing (3 min) */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Cost of Learning vs. Cost of Waiting</h2>
            <p className="text-muted-foreground">3 minutes • The Real Risk Calculation</p>
          </div>
        </div>

        <CostFramingChart />

        <Card className="border-2 border-destructive/30 bg-destructive/5">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <p className="text-2xl font-bold text-foreground">
                Every 90 days of delay = 15% advantage to AI-native competitors
              </p>
              <p className="text-lg text-muted-foreground">
                The question isn't "Should we experiment?" — it's "Can we afford not to?"
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-foreground">Facilitator Notes:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Pause after revealing the "Cost of Waiting" column</li>
              <li>• Ask: "What's your cost of a 6-month delay in market position?"</li>
              <li>• Reframe: Learning is an investment, waiting is a liability</li>
              <li>• Controlled pilots de-risk the transformation journey</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Part 3: The Close (4 min) */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
            <Calendar className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-foreground">Your Next Step: De-Risk & Operationalize</h2>
            <p className="text-muted-foreground">4 minutes • Clear Path Forward</p>
          </div>
        </div>

        {/* Why Now / Why Us Slide */}
        <WhyNowSlide />

        {/* CTA Card */}
        <Card className="border-4 border-primary bg-gradient-to-br from-primary/10 to-background shadow-2xl">
          <CardHeader>
            <CardTitle className="text-4xl text-center text-foreground">
              2-Week Diagnostic Sprint with Meliora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="p-6 bg-background rounded-lg border-2 border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">30 Days</div>
                <div className="text-sm text-muted-foreground">To First Insight</div>
              </div>
              <div className="p-6 bg-background rounded-lg border-2 border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">$250/hr</div>
                <div className="text-sm text-muted-foreground">With Krish Embedded</div>
              </div>
              <div className="p-6 bg-background rounded-lg border-2 border-primary/20">
                <div className="text-4xl font-bold text-primary mb-2">100%</div>
                <div className="text-sm text-muted-foreground">Risk-Controlled Pilot</div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-center text-foreground">What You Get:</h3>
              <ul className="grid md:grid-cols-2 gap-3 text-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Embedded AI strategist & engineer (Krish)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Pilot chosen today, operationalized in 2 weeks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Real ROI measurement & risk mitigation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Transfer learning to your internal team</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col items-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="text-2xl px-12 py-8 h-auto"
                onClick={() => setShowCalendar(!showCalendar)}
              >
                <Calendar className="mr-3 h-8 w-8" />
                Book Your Diagnostic Sprint
              </Button>
              
              <Button variant="outline" size="lg" className="gap-2">
                <Download className="h-5 w-5" />
                Download "Why Now / Why Us" One-Pager
              </Button>
            </div>

            {showCalendar && <CalendarBookingEmbed />}
          </CardContent>
        </Card>

        {/* Facilitator Notes */}
        <Card className="bg-muted/50">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 text-foreground">Facilitator Closing Notes:</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Pause after the question</strong> - let silence create urgency</li>
              <li>• <strong>Name the pilot</strong> from earlier in the workshop - "Remember your newsroom workflow? That's week 1."</li>
              <li>• <strong>Address the CFO</strong> - "This isn't a tech expense, it's competitive insurance"</li>
              <li>• <strong>Create psychological safety</strong> - "You're not committing to a transformation, you're de-risking a decision"</li>
              <li>• <strong>Timeline anchor</strong> - "The teams that started 90 days ago already have data you don't"</li>
              <li>• <strong>Expected outcome</strong>: ≥40% book within 7 days</li>
            </ul>
          </CardContent>
        </Card>

        {/* Outcomes Banner */}
        <Card className="border-2 border-green-500/30 bg-green-500/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-2">Segment Outcome</h3>
            <p className="text-xl text-muted-foreground">
              Emotional anchor + clear next step into Meliora transformation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
