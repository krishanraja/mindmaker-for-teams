import React, { useState } from 'react';
import { Brain, Menu } from 'lucide-react';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ui/theme-toggle';
import { useIsMobile } from '../../hooks/use-mobile';
import { StepNavigation } from './StepNavigation';
import { ProgressIndicator } from './ProgressIndicator';
import { MobileMenu } from './MobileMenu';
import { useMindmaker } from '../../contexts/MindmakerContext';

export const NavigationBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { state } = useMindmaker();
  
  // Don't render navigation on Step 1 (Welcome page) as it has its own header
  if (state.currentStep === 1) {
    return null;
  }

  return (
    <>
      <header className="glass-nav fixed top-0 left-0 right-0 z-50 border-b border-white/10">
        <div className="container-width">
          <div className="flex items-center justify-between h-16 px-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-foreground text-lg">Fractionl</span>
            </div>

            {/* Desktop Navigation */}
            {!isMobile ? (
              <div className="flex items-center space-x-6">
                <ProgressIndicator />
                <StepNavigation />
                <ThemeToggle />
              </div>
            ) : (
              /* Mobile Navigation */
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="relative"
                  aria-label="Toggle mobile menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />

      {/* Spacer to account for fixed header */}
      <div className="h-16" />
    </>
  );
};