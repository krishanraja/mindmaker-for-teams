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
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Header - Compact on mobile */}
      <div className="text-center space-y-1 sm:space-y-2 md:space-y-3">
        <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-foreground">
          Your Personalized Roadmap
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto px-4">
          Modules tailored to deliver maximum impact
        </p>
      </div>

      {/* Module Cards - Compact on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
        {modules.map((module, index) => (
          <Card 
            key={module.id} 
            className={`glass-card relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${
              index === 0 ? 'border-2 border-primary shadow-primary/20 shadow-lg' : ''
            }`}
          >
            <div className="p-3 sm:p-4 md:p-6 space-y-2 sm:space-y-3 md:space-y-4">
              {/* Header */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-base sm:text-lg md:text-xl">{module.icon}</span>
                    </div>
                    <div className="flex flex-col gap-1 sm:gap-2">
                      <Badge className={`${getTierColor(module.tier)} text-xs`} variant="outline">
                        {module.tier}
                      </Badge>
                      <Badge className={`${getCategoryColor(module.category)} text-xs`} variant="outline">
                        {module.category}
                      </Badge>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300 text-xs" variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      Top
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <h3 className="text-sm sm:text-base md:text-lg font-bold text-foreground">
                    {module.title}
                  </h3>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    {module.credits} credits
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {module.description}
              </p>

              {/* Rationale */}
              {module.rationale && (
                <div className="bg-primary/5 rounded-lg p-2 sm:p-3 border border-primary/10">
                  <p className="text-xs font-medium text-primary mb-1">Why this?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {module.rationale}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary & CTA - Compact on mobile */}
      <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="p-4 sm:p-6 md:p-8 text-center space-y-3 sm:space-y-4 md:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3">Complete Package</h3>
            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-8 mt-2 sm:mt-3 md:mt-4">
              <div>
                <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-primary">{totalCredits}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Credits</div>
              </div>
              <div>
                <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-primary">{modules.length}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Modules</div>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto px-2 sm:px-4">
            Tailored roadmap for measurable results
          </p>

          <Button 
            size="lg" 
            className="btn-primary w-full sm:w-auto text-sm sm:text-base" 
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