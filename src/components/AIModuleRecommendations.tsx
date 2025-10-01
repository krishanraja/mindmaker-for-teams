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
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Your Personalized AI Literacy Roadmap
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Based on your assessment, these modules will deliver maximum impact for your team
        </p>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {modules.map((module, index) => (
          <Card 
            key={module.id} 
            className={`glass-card relative overflow-hidden group hover:shadow-lg transition-all duration-300 ${
              index === 0 ? 'border-2 border-primary shadow-primary/20 shadow-lg' : ''
            }`}
          >
            <div className="p-6 space-y-4">
              {/* Header */}
              <div className="space-y-3">
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
                  {index === 0 && (
                    <Badge className="bg-purple-100 text-purple-800 border-purple-300" variant="outline">
                      <Star className="w-3 h-3 mr-1" />
                      Top Pick
                    </Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    {module.title}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {module.credits} credits
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {module.description}
              </p>

              {/* Rationale */}
              {module.rationale && (
                <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                  <p className="text-xs font-medium text-primary mb-1">Why this module?</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {module.rationale}
                  </p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Summary & CTA */}
      <Card className="glass-card bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="p-8 text-center space-y-6">
          <div>
            <h3 className="text-2xl font-bold mb-2">Your Complete Package</h3>
            <div className="flex items-center justify-center gap-8 mt-4">
              <div>
                <div className="text-3xl font-bold text-primary">{totalCredits}</div>
                <div className="text-sm text-muted-foreground">Total Credits</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">{modules.length}</div>
                <div className="text-sm text-muted-foreground">Modules</div>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            This roadmap is tailored to your team's current AI maturity, growth goals, and implementation timeline. 
            Let's discuss how to transform these insights into measurable results.
          </p>

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