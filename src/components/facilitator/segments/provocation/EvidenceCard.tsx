import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Quote, TrendingUp, Users } from 'lucide-react';

interface EvidenceItemProps {
  type: 'simulation' | 'participant' | 'metric';
  label: string;
  metrics?: { [key: string]: string | number };
  quote?: string;
  attribution?: string;
}

export const EvidenceItem: React.FC<EvidenceItemProps> = ({
  type,
  label,
  metrics,
  quote,
  attribution
}) => {
  const getIcon = () => {
    switch (type) {
      case 'simulation':
        return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'participant':
        return <Quote className="w-4 h-4 text-primary" />;
      case 'metric':
        return <Users className="w-4 h-4 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <div className="border-l-2 border-primary/30 pl-4 py-2">
      <div className="flex items-center gap-2 mb-2">
        {getIcon()}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      
      {metrics && (
        <div className="flex flex-wrap gap-2 mb-2">
          {Object.entries(metrics).map(([key, value]) => (
            <Badge key={key} variant="secondary" className="text-xs">
              {key}: {value}
            </Badge>
          ))}
        </div>
      )}
      
      {quote && (
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground italic">"{quote}"</p>
          {attribution && (
            <p className="text-xs text-muted-foreground">— {attribution}</p>
          )}
        </div>
      )}
    </div>
  );
};

interface EvidenceCardProps {
  children: React.ReactNode;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ children }) => {
  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">
        Evidence
      </div>
      {children}
    </div>
  );
};
