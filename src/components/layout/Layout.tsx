import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
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