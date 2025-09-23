import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  ArrowRight,
  Calendar,
  Star,
  Users,
  Clock
} from 'lucide-react';
import { useMindmaker } from '../contexts/MindmakerContext';
import { ModuleMatchingEngine, AILiteracyModule } from './ModuleMatchingEngine';

export const RecommendedModules: React.FC = () => {
  const { state } = useMindmaker();
  const { discoveryData } = state;
  
  const matchingResult = ModuleMatchingEngine.matchModules(discoveryData);
  const { recommendedModules, reasoning, totalCredits } = matchingResult;
  
  const handleBookModule = (module: AILiteracyModule) => {
    // Encode module info for the booking
    const moduleInfo = `Interested in: ${module.title} (${module.credits} credits) - ${module.description}`;
    const calendlyUrl = `https://calendly.com/krish-raja/mindmaker-teams?notes=${encodeURIComponent(moduleInfo)}`;
    window.open(calendlyUrl, '_blank');
  };
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Basic': return 'bg-green-100 text-green-800 border-green-200';
      case 'Advanced': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Expert': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const getCategoryColor = (category: string) => {
    return category === 'LEADERSHIP' 
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-indigo-100 text-indigo-800 border-indigo-200';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground">
          Recommended AI Literacy Modules
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Based on your team's profile and needs, here are the top 3 modules to build AI confidence and capability.
        </p>
        
        {/* Reasoning Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {reasoning.map((reason, index) => (
            <div key={index} className="glass-card p-3">
              <p className="text-xs text-muted-foreground">{reason}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {recommendedModules.map((module, index) => (
          <Card key={module.id} className={`glass-card relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full ${
            index === 0 ? 'border-2 border-purple-500 shadow-purple-500/20 shadow-lg' : ''
          }`}>
            
            {/* Card Content with Grid Layout for Alignment */}
            <div className="p-6 h-full grid grid-rows-[auto_auto_1fr_auto] gap-4">
              {/* Header Section - Fixed Height */}
              <div className="space-y-3">
                {/* Icon and Badges Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl">{module.icon}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getTierColor(module.tier)} variant="outline">
                        {module.tier}
                      </Badge>
                      <Badge className={getCategoryColor(module.category)} variant="outline">
                        {module.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {/* Title and Credits - Fixed Height */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between min-h-[3rem]">
                    <h3 className="text-lg font-bold text-foreground flex items-center">
                      {module.title}
                    </h3>
                    {index === 0 && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300" variant="outline">
                        <Star className="w-3 h-3 mr-1" />
                        Start Here
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {module.credits} credits
                  </div>
                </div>
              </div>
              
              {/* Description - Flexible Height */}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {module.description}
                </p>
              </div>
              
              {/* Target Audience - Fixed Height */}
              <div className="space-y-2 mt-auto">
                <p className="text-xs font-medium text-foreground">Perfect for:</p>
                <div className="flex flex-wrap gap-1">
                  {module.targetAudience.slice(0, 2).map((audience, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Summary Card */}
      <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="p-8 text-center space-y-6">
          <h3 className="text-2xl font-bold">Complete Module Package</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{totalCredits}</div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">6-12</div>
              <div className="text-sm text-muted-foreground">Weeks Delivery</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This comprehensive AI literacy package is tailored specifically for your team's needs and goals. 
              Schedule a consultation to discuss custom pricing based on your budget and requirements.
            </p>
            
            <Button 
              size="lg" 
              className="btn-primary" 
              onClick={() => window.open('https://calendly.com/krish-raja/mindmaker-teams', '_blank')}
            >
              <Calendar className="w-4 h-4" />
              Book Consultation for Custom Pricing
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};