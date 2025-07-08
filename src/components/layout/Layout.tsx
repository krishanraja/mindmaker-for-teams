import React from 'react';
import { Sidebar } from './Sidebar';
import { useCanvas } from '../../contexts/CanvasContext';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state } = useCanvas();
  
  return (
    <div className="min-h-screen bg-app-bg text-app-fg font-inter">
      <Sidebar />
      
      <div className="ml-70">
        {/* Main Content Area */}
        <div className="flex min-h-screen">
          {/* Step Content */}
          <div className="flex-1 flex flex-col">
            <main className="flex-1 p-8">
              {children}
            </main>
          </div>
          
          {/* PDF Preview Panel (hidden on smaller screens) */}
          <div className="hidden xl:block w-80 bg-card border-l border-border p-6">
            <div className="sticky top-8">
              <h3 className="font-outfit font-semibold text-lg mb-4">Canvas Preview</h3>
              <div className="bg-muted rounded-lg p-4 h-96 flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Complete the steps to see your AI transformation canvas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};