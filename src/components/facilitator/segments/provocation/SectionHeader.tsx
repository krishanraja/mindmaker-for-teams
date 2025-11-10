import React from 'react';

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ icon, title, subtitle }) => (
  <div className="flex items-start gap-4 mb-8">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
      {React.cloneElement(icon as React.ReactElement, { 
        className: 'w-7 h-7 text-primary' 
      })}
    </div>
    <div>
      <h2 className="text-4xl font-semibold text-foreground leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-muted-foreground mt-2">
          {subtitle}
        </p>
      )}
    </div>
  </div>
);
