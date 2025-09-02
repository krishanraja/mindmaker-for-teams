import React from 'react';
import { NavigationBar } from '../navigation/NavigationBar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <NavigationBar />
      
      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};