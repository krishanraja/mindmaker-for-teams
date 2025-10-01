import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Calendar, Star, Clock } from 'lucide-react';

interface AIModuleRecommendationsProps {
  modules: any[];
  onBookSession: () => void;
}

export const AIModuleRecommendations: React.FC<AIModuleRecommendationsProps> = ({ 
  modules,
  onBookSession
}) => {
  if (!modules || modules.length === 0) return null;

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

  const totalCredits = modules.reduce((sum, m) => sum + (m.credits || 0), 0);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header - Hero Focus */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
          🎯 Your AI Transformation Roadmap
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Designed for maximum impact
        </p>
      </div>

      {/* Module Cards - Prominent & Clean */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {modules.map((module, index) => (
          <Card 
            key={module.id} 
            className={`glass-card relative group hover:shadow-xl transition-all duration-300 ${
              index === 0 ? 'ring-2 ring-primary/50 shadow-lg scale-[1.02]' : ''
            }`}
          >
            {index === 0 && (
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                START HERE
              </div>
            )}
            <div className="p-3 sm:p-4 space-y-2">
              {/* Icon & Title */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl">{module.icon}</span>
                </div>
                <div className="flex-1">
                  <Badge className={`${getTierColor(module.tier)} text-[10px] mb-1`} variant="outline">
                    {module.tier}
                  </Badge>
                  <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                    {module.title}
                  </h3>
                </div>
              </div>

              {/* Description - Concise */}
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {module.description}
              </p>

              {/* Why This - Key Insight */}
              {module.rationale && (
                <div className="bg-primary/5 rounded p-2 border border-primary/10">
                  <p className="text-[10px] text-primary font-medium mb-0.5">Why this matters:</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {module.rationale}
                  </p>
                </div>
              )}

              {/* Credits */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                <Clock className="w-3 h-3" />
                {module.credits} credits
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* CTA - Simplified */}
      <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="p-4 sm:p-5 text-center space-y-3">
          <div className="flex items-center justify-center gap-4 text-sm">
            <div>
              <span className="text-2xl font-bold text-primary">{totalCredits}</span>
              <span className="text-muted-foreground ml-1">credits</span>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <span className="text-2xl font-bold text-primary">6-12</span>
              <span className="text-muted-foreground ml-1">weeks</span>
            </div>
          </div>

          <Button 
            size="lg" 
            className="btn-primary w-full sm:w-auto" 
            onClick={onBookSession}
          >
            <Calendar className="w-4 h-4" />
            Book Strategy Session
          </Button>
        </div>
      </Card>
    </div>
  );
};