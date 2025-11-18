import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIGenerateButtonProps extends ButtonProps {
  children?: React.ReactNode;
}

export const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({ 
  children = "Generate with AI", 
  className,
  disabled,
  ...props 
}) => {
  return (
    <Button
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600",
        "hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700",
        "text-white font-semibold shadow-lg",
        "transition-all duration-300",
        "hover:shadow-xl hover:scale-105",
        "before:absolute before:inset-0 before:bg-white/20",
        "before:animate-shimmer before:bg-gradient-to-r",
        "before:from-transparent before:via-white/30 before:to-transparent",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className
      )}
      disabled={disabled}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        <Sparkles className="w-4 h-4 animate-pulse" />
        {children}
        <Sparkles className="w-4 h-4 animate-pulse animation-delay-200" />
      </span>
    </Button>
  );
};
