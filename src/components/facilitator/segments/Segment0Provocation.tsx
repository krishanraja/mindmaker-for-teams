import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, TrendingUp, Users, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Segment0ProvocationProps {
  workshopId: string;
}

export const Segment0Provocation: React.FC<Segment0ProvocationProps> = () => {
  const provocations = [
    {
      icon: TrendingUp,
      title: 'The AI Pendulum',
      content: 'We\'re past the hype, before the plateau. This is your window to lead—not follow.',
      color: 'bg-blue-500/10 text-blue-600 border-blue-500/30'
    },
    {
      icon: Users,
      title: 'Doorman Theory',
      content: 'AI doesn\'t replace humans—it handles the routine so you can focus on judgment, strategy, and relationships.',
      color: 'bg-purple-500/10 text-purple-600 border-purple-500/30'
    },
    {
      icon: Target,
      title: 'Fractional Future',
      content: 'Work is becoming outcome-driven, not time-based. AI enables you to deliver more value in less time.',
      color: 'bg-green-500/10 text-green-600 border-green-500/30'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-2xl bg-primary/20">
              <Lightbulb className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1">
              <Badge variant="secondary" className="mb-2 text-xs">Opening • 15 Minutes</Badge>
              <CardTitle className="text-4xl font-bold text-foreground">
                The Provocation
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-xl text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Objective:</strong> Establish a bold, realistic vision of AI's role in your organization. Challenge assumptions and inspire proactive leadership.
          </p>
        </CardContent>
      </Card>

      {/* Core Frameworks */}
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <span className="h-1 w-12 bg-primary rounded-full"></span>
          Core Frameworks
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {provocations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Card key={idx} className={`border-2 ${item.color} transition-all hover:scale-105 hover:shadow-lg`}>
                <CardContent className="p-6">
                  <div className="mb-4 p-3 rounded-xl bg-background/50 w-fit">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                  <p className="text-sm leading-relaxed text-foreground/90">{item.content}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Key Messages */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Key Messages for Your Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">1</span>
              </div>
              <p className="text-base leading-relaxed">
                <strong className="text-foreground">Mindset beats mechanics.</strong> Your job isn't to code—it's to see AI as a leadership coach that amplifies your decision-making.
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">2</span>
              </div>
              <p className="text-base leading-relaxed">
                <strong className="text-foreground">The real risk is inaction.</strong> With proper guardrails, AI is your competitive advantage—not your threat.
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-sm font-bold text-primary">3</span>
              </div>
              <p className="text-base leading-relaxed">
                <strong className="text-foreground">Start small, think big.</strong> Pilot one process, learn fast, and scale intelligently. No silver bullets—just strategic bets.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Facilitator Notes */}
      <Card className="bg-accent/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">💡</span>
            Facilitator Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            • Keep energy high—this sets the tone for the entire workshop
          </p>
          <p className="text-muted-foreground">
            • Use stories from their industry to make concepts tangible
          </p>
          <p className="text-muted-foreground">
            • Challenge pessimists gently, but don't let skepticism dominate the room
          </p>
          <p className="text-muted-foreground">
            • End with a clear transition: "Now let's find YOUR bottlenecks..."
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
