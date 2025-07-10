import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-app-bg text-app-fg font-inter">
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-app-bg/95 backdrop-blur-sm border-b border-border h-16 flex items-center px-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
              <Sidebar onNavigate={() => setIsOpen(false)} />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-display font-semibold">Fractionl AI</h1>
        </header>

        {/* Mobile Content */}
        <main className="pt-16 p-4">
          {children}
        </main>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-app-bg text-app-fg font-inter">
      <div className="flex">
        <Sidebar />
        
        <div className="flex-1 pl-80">
          {/* Main Content Area */}
          <div className="flex min-h-screen">
            {/* Step Content */}
            <div className="flex-1 flex flex-col">
              <main className="flex-1 p-8">
                {children}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};