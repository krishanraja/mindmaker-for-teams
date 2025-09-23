import React from 'react';
import { Card } from './ui/card';
import { 
  Brain, 
  BookOpen, 
  Users, 
  Target 
} from 'lucide-react';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { useMindmaker } from '../contexts/MindmakerContext';

interface KeyInsight {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  color: string;
}

export const SwipeableResultsCards: React.FC = () => {
  const { state } = useMindmaker();
  const { discoveryData } = state;
  
  const readinessScore = discoveryData.aiInsights?.readinessScore || 65;
  const investmentRange = discoveryData.aiInsights?.investmentRange || '$25k-$45k';
  
  const keyInsights: KeyInsight[] = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: 'AI Readiness Score',
      value: `${readinessScore}/100`,
      description: readinessScore >= 80 ? 'Advanced - Ready for implementation' : 
                   readinessScore >= 60 ? 'Intermediate - Good foundation' : 
                   readinessScore >= 40 ? 'Beginner - High potential' :
                   'Early stage - Great opportunity',
      color: 'text-primary bg-primary/10'
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: 'Learning Format',
      value: discoveryData.learningPreferences?.includes('Live workshops') ? 'Live Workshops' :
             discoveryData.learningPreferences?.includes('Self-paced') ? 'Self-Paced' :
             discoveryData.learningPreferences?.includes('coaching') ? 'Coaching' :
             'Mixed Approach',
      description: 'Optimized for your team\'s preferences',
      color: 'text-accent bg-accent/10'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Team Size',
      value: `${discoveryData.employeeCount} employees`,
      description: discoveryData.employeeCount <= 50 ? 'Perfect for cohort training' :
                   discoveryData.employeeCount <= 200 ? 'Ideal for departmental rollout' :
                   'Requires enterprise approach',
      color: 'text-green-600 bg-green-500/10'
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: 'Investment Range',
      value: investmentRange,
      description: 'Based on scope and complexity',
      color: 'text-blue-600 bg-blue-500/10'
    }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {keyInsights.map((insight, index) => (
            <CarouselItem key={index} className="pl-2 md:pl-4 basis-full md:basis-1/2">
              <Card className="glass-card h-full">
                <div className="p-6 text-center space-y-4">
                  <div className={`w-16 h-16 ${insight.color} rounded-full flex items-center justify-center mx-auto`}>
                    {insight.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{insight.title}</h3>
                  <div className="text-2xl font-bold text-primary">
                    {insight.value}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
      
      {/* Mobile swipe indicator */}
      <div className="flex justify-center mt-4 md:hidden">
        <div className="flex space-x-2">
          {keyInsights.map((_, index) => (
            <div key={index} className="w-2 h-2 bg-muted rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
};