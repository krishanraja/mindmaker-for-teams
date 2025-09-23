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
  const investmentRange = ModuleMatchingEngine.calculateInvestmentRange(recommendedModules);
  
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
          <Card key={module.id} className="glass-card relative overflow-hidden group hover:shadow-lg transition-all duration-300">
            {/* Priority Badge */}
            {index === 0 && (
              <div className="absolute top-4 right-4 z-10">
                <Badge className="bg-primary text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Start Here
                </Badge>
              </div>
            )}
            
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{module.icon}</span>
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <Badge className={getTierColor(module.tier)}>
                        {module.tier}
                      </Badge>
                      <Badge className={getCategoryColor(module.category)}>
                        {module.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-foreground">
                  {module.title}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {module.credits} credits
                  </div>
                </div>
              </div>
              
              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {module.description}
              </p>
              
              {/* Target Audience */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">Perfect for:</p>
                <div className="flex flex-wrap gap-1">
                  {module.targetAudience.slice(0, 2).map((audience, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* CTA */}
              <Button 
                onClick={() => handleBookModule(module)}
                className="w-full group/btn"
                variant={index === 0 ? "default" : "outline"}
              >
                Book Session
                <Calendar className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Summary Card */}
      <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="p-8 text-center space-y-6">
          <h3 className="text-2xl font-bold">Complete Module Package</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{totalCredits}</div>
              <div className="text-sm text-muted-foreground">Total Credits</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">{investmentRange}</div>
              <div className="text-sm text-muted-foreground">Investment Range</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary">6-12</div>
              <div className="text-sm text-muted-foreground">Weeks Delivery</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground max-w-2xl mx-auto">
              This combination provides a comprehensive foundation for AI literacy across your organization, 
              building confidence and capability at every level.
            </p>
            
            <Button size="lg" className="group">
              Schedule Strategy Call
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};