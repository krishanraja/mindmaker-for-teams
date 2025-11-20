import React, { useEffect, useState } from 'react';
import { useExecTeams } from '@/contexts/ExecTeamsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SIMULATIONS = [
  { id: 'gtm-pivot', title: 'Go-To-Market Pivot' },
  { id: 'board-deck-crisis', title: 'Board Deck Crisis' },
  { id: 'competitive-response', title: 'Competitive Response' },
  { id: 'ma-due-diligence', title: 'M&A Due Diligence' },
  { id: 'talent-retention', title: 'Talent Retention' },
  { id: 'pricing-strategy', title: 'Pricing Strategy Overhaul' },
];

const CALENDLY_URL = 'https://calendly.com/your-calendly-link';

export const BootcampBookingSummary: React.FC = () => {
  const { state } = useExecTeams();
  const [bootcampPlan, setBootcampPlan] = useState<any>(null);

  useEffect(() => {
    loadBootcampPlan();
  }, []);

  const loadBootcampPlan = async () => {
    if (!state.bootcampPlanId) return;

    try {
      const { data, error } = await supabase
        .from('bootcamp_plans')
        .select('*')
        .eq('id', state.bootcampPlanId)
        .single();

      if (error) throw error;
      setBootcampPlan(data);
    } catch (error) {
      console.error('Error loading bootcamp plan:', error);
    }
  };

  const getSim = (id: string) => SIMULATIONS.find(s => s.id === id);

  const calendlyUrl = `${CALENDLY_URL}?name=${encodeURIComponent(state.intakeData.organizerName)}&email=${encodeURIComponent(state.intakeData.organizerEmail)}&a1=${encodeURIComponent(state.intakeData.companyName)}`;

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background via-background to-accent/5">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-primary/10">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">Your Bootcamp Plan is Ready</CardTitle>
            <CardDescription className="text-lg">
              Review your custom agenda and book your half-day strategic session
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {bootcampPlan && (
              <>
                <Card className="bg-accent/5">
                  <CardHeader>
                    <CardTitle className="text-xl">Selected Simulations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold text-lg">
                          1. {getSim(bootcampPlan.simulation_1_id)?.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current State: {bootcampPlan.simulation_1_snapshot?.currentState}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Desired Outcome: {bootcampPlan.simulation_1_snapshot?.desiredOutcome}
                        </p>
                      </div>

                      <div className="border-l-4 border-primary pl-4">
                        <h4 className="font-semibold text-lg">
                          2. {getSim(bootcampPlan.simulation_2_id)?.title}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Current State: {bootcampPlan.simulation_2_snapshot?.currentState}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Desired Outcome: {bootcampPlan.simulation_2_snapshot?.desiredOutcome}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/5">
            <CardHeader>
              <CardTitle className="text-xl">Agenda Timeline</CardTitle>
            </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {bootcampPlan.agenda_config?.segments?.map((segment: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-3 rounded-lg bg-background border"
                        >
                          <span className="font-medium">{segment.name}</span>
                          <span className="text-muted-foreground">{segment.duration} min</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-accent/5">
                  <CardHeader>
                    <CardTitle className="text-xl">Required Pre-Work</CardTitle>
                    <CardDescription>
                      Please prepare these materials before your session
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {bootcampPlan.required_prework?.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-accent/5">
                  <CardHeader>
                    <CardTitle className="text-xl">Proposed Artifacts</CardTitle>
                    <CardDescription>
                      You'll receive these deliverables during the live bootcamp
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Executive Summary</strong> - Strategic insights from both simulations
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>Team Cognitive Baseline Radar</strong> - 4-axis assessment visualization
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>
                          <strong>90-Day Pilot Charter</strong> - Actionable next steps and implementation roadmap
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 bg-gradient-to-br from-primary/5 to-accent/10">
                  <CardHeader className="text-center space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 rounded-full bg-primary/10">
                        <CheckCircle2 className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                    <CardTitle className="text-3xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      🎉 You're All Set!
                    </CardTitle>
                    <CardDescription className="text-lg text-foreground/80 max-w-2xl mx-auto">
                      Thanks for setting up your AI Leadership Bootcamp! Your prep pack and calendar invite will arrive within 48 hours.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-4">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button
                        asChild
                        size="lg"
                        className="text-lg px-8 py-6 w-full sm:w-auto"
                      >
                        <a
                          href="https://calendly.com/krish-raja/mindmaker-meeting"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Book Pre-Bootcamp Call
                        </a>
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="text-lg px-8 py-6 w-full sm:w-auto"
                        onClick={() => window.close()}
                      >
                        Close Window
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground text-center">
                      Want to discuss the finer details? Book a quick call to align on your strategic priorities.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
