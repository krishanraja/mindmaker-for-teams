import React, { useState } from 'react';
import { MobileMenu } from './MobileMenu';
import { ProgressIndicator } from './ProgressIndicator';
import { StepNavigation } from './StepNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMindmaker } from '@/contexts/MindmakerContext';
import { cn } from '@/lib/utils';

export const NavigationBar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { state } = useMindmaker();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Fixed Navigation Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex flex-col items-start">
                <img 
                  src="/lovable-uploads/eee5a570-3b3e-4c59-847b-b04ef6b24a57.png" 
                  alt="Fractionl AI Logo" 
                  className="h-8 md:h-10 w-auto object-contain mb-1"
                />
                <span className="text-xs text-muted-foreground">
                  Corporate Workshop Builder
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <div className="flex items-center space-x-8">
                <ProgressIndicator />
                <StepNavigation />
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="default" 
                    size="sm"
                    className="shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Button>
                  <ThemeToggle />
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <div className="flex items-center space-x-2">
                <ProgressIndicator />
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMobileMenu}
                  className="relative"
                  aria-label="Toggle menu"
                >
                  <div className="relative w-6 h-6">
                    <span 
                      className={cn(
                        "absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out",
                        isMobileMenuOpen ? "rotate-45 translate-y-0" : "-translate-y-1.5"
                      )}
                    />
                    <span 
                      className={cn(
                        "absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out",
                        isMobileMenuOpen ? "-rotate-45 translate-y-0" : "translate-y-1.5"
                      )}
                    />
                  </div>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobile && (
          <MobileMenu 
            isOpen={isMobileMenuOpen} 
            onClose={() => setIsMobileMenuOpen(false)} 
          />
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-20" />
    </>
  );
};