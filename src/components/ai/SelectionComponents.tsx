import React from 'react';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/card';
import { CheckCircle, Circle, X } from 'lucide-react';

interface SelectionChoice {
  value: string;
  label: string;
  description?: string;
}

interface DropdownSelectionProps {
  title: string;
  description?: string;
  choices: SelectionChoice[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
}

export const DropdownSelection: React.FC<DropdownSelectionProps> = ({
  title,
  description,
  choices,
  value,
  placeholder = "Select an option",
  onSelect
}) => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Select value={value} onValueChange={onSelect}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="bg-card border border-border shadow-lg z-50">
            {choices.map((choice) => (
              <SelectItem key={choice.value} value={choice.value}>
                <div>
                  <div className="font-medium">{choice.label}</div>
                  {choice.description && (
                    <div className="text-xs text-muted-foreground">{choice.description}</div>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};

interface ButtonGridSelectionProps {
  title: string;
  description?: string;
  choices: SelectionChoice[];
  value?: string;
  onSelect: (value: string) => void;
  columns?: number;
}

export const ButtonGridSelection: React.FC<ButtonGridSelectionProps> = ({
  title,
  description,
  choices,
  value,
  onSelect,
  columns = 2
}) => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-2`}>
          {choices.map((choice) => (
            <button
              key={choice.value}
              onClick={() => onSelect(choice.value)}
              className={`h-auto p-3 text-left justify-start flex-col items-start ${
                value === choice.value ? "btn-primary" : "btn-outline"
              }`}
            >
              <div className="font-medium text-sm">{choice.label}</div>
              {choice.description && (
                <div className="text-xs opacity-80 mt-1">{choice.description}</div>
              )}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};

interface MultiSelectTagsProps {
  title: string;
  description?: string;
  choices: SelectionChoice[];
  values: string[];
  onSelectionChange: (values: string[]) => void;
  maxSelections?: number;
}

export const MultiSelectTags: React.FC<MultiSelectTagsProps> = ({
  title,
  description,
  choices,
  values,
  onSelectionChange,
  maxSelections
}) => {
  const toggleSelection = (value: string) => {
    if (values.includes(value)) {
      onSelectionChange(values.filter(v => v !== value));
    } else {
      if (!maxSelections || values.length < maxSelections) {
        onSelectionChange([...values, value]);
      }
    }
  };

  const removeSelection = (value: string) => {
    onSelectionChange(values.filter(v => v !== value));
  };

  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {maxSelections && (
            <p className="text-xs text-muted-foreground">
              Select up to {maxSelections} options ({values.length}/{maxSelections} selected)
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {choices.map((choice) => {
            const isSelected = values.includes(choice.value);
            const isDisabled = maxSelections && !isSelected && values.length >= maxSelections;
            
            return (
              <button
                key={choice.value}
                onClick={() => toggleSelection(choice.value)}
                disabled={isDisabled}
                className={`btn-outline h-auto p-2 text-left justify-start ${
                  isSelected ? 'bg-primary text-primary-foreground' : ''
                } ${isDisabled ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start gap-2 w-full">
                  {isSelected ? (
                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-xs truncate">{choice.label}</div>
                    {choice.description && (
                      <div className="text-xs opacity-80 mt-1">{choice.description}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {values.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">Selected:</div>
            <div className="flex flex-wrap gap-1">
              {values.map((value) => {
                const choice = choices.find(c => c.value === value);
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="px-2 py-1 text-xs flex items-center gap-1"
                  >
                    {choice?.label || value}
                    <button
                      onClick={() => removeSelection(value)}
                      className="hover:text-destructive transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

interface RadioSelectionProps {
  title: string;
  description?: string;
  choices: SelectionChoice[];
  value?: string;
  onSelect: (value: string) => void;
}

export const RadioSelection: React.FC<RadioSelectionProps> = ({
  title,
  description,
  choices,
  value,
  onSelect
}) => {
  return (
    <Card className="p-4">
      <div className="space-y-3">
        <div>
          <h4 className="font-medium text-sm">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="space-y-2">
          {choices.map((choice) => (
            <button
              key={choice.value}
              onClick={() => onSelect(choice.value)}
              className={`w-full p-3 text-left rounded-md border transition-all ${
                value === choice.value
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-4 h-4 rounded-full border-2 mt-0.5 ${
                  value === choice.value
                    ? 'border-primary bg-primary'
                    : 'border-muted-foreground'
                }`}>
                  {value === choice.value && (
                    <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-sm">{choice.label}</div>
                  {choice.description && (
                    <div className="text-xs text-muted-foreground mt-1">{choice.description}</div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};