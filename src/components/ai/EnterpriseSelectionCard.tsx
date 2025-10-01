import React from 'react';
import { Card } from '../ui/card';
import { Check } from 'lucide-react';

interface EnterpriseSelectionCardProps {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const EnterpriseSelectionCard: React.FC<EnterpriseSelectionCardProps> = ({
  value,
  label,
  icon,
  description,
  isSelected,
  onSelect
}) => {
  return (
    <Card
      onClick={onSelect}
      className={`
        relative cursor-pointer transition-all duration-300 group
        hover:shadow-lg hover:scale-[1.02] hover:border-primary/50
        ${isSelected 
          ? 'border-2 border-primary bg-primary/5 shadow-md' 
          : 'border-2 border-border hover:bg-muted/30'
        }
      `}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          {icon && (
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors
              ${isSelected 
                ? 'bg-primary/20 text-primary' 
                : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
              }
            `}>
              {icon}
            </div>
          )}
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3 className={`font-semibold text-base transition-colors ${
                isSelected ? 'text-primary' : 'text-foreground'
              }`}>
                {label}
              </h3>
              
              {/* Checkmark */}
              <div className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all
                ${isSelected 
                  ? 'bg-primary text-primary-foreground scale-100' 
                  : 'bg-muted/50 text-transparent scale-0 group-hover:scale-100'
                }
              `}>
                <Check className="w-4 h-4" />
              </div>
            </div>
            
            {description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Animated border effect */}
      <div className={`
        absolute inset-0 rounded-lg transition-opacity
        bg-gradient-to-r from-primary/20 to-primary/10 opacity-0
        ${isSelected ? 'opacity-100' : 'group-hover:opacity-50'}
      `} style={{ mixBlendMode: 'overlay' }} />
    </Card>
  );
};