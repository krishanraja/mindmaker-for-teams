import React from 'react';
import { Loader2, Sparkles, Zap } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-purple via-brand-blue to-brand-teal">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        {/* Animated Logo/Icon */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-white/20"></div>
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-white border-r-transparent border-b-transparent border-l-transparent" style={{ animationDuration: '1s' }}></div>
          <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-white animate-pulse" />
          </div>
        </div>

        {/* Main Loading Text */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-bold text-white animate-fade-in">
            We're pulling together your 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200 mt-2">
              Agentic Mindmaker Workshop Proposal...
            </span>
          </h1>
          
          {/* Progress indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2 text-white/80">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing your organization</span>
            </div>
            
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-200 to-pink-200 rounded-full animate-[scale-in_5s_ease-out_forwards] origin-left"
                style={{ 
                  animation: 'width-grow 5s ease-out forwards',
                  width: '0%'
                }}
              />
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Sparkles className="absolute top-1/4 left-1/4 w-6 h-6 text-yellow-200 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute top-1/3 right-1/4 w-4 h-4 text-pink-200 animate-pulse" style={{ animationDelay: '1.5s' }} />
          <Sparkles className="absolute bottom-1/3 left-1/3 w-5 h-5 text-blue-200 animate-pulse" style={{ animationDelay: '2.5s' }} />
          <Sparkles className="absolute bottom-1/4 right-1/3 w-4 h-4 text-purple-200 animate-pulse" style={{ animationDelay: '3.5s' }} />
        </div>
      </div>

      {/* Inline styles for the progress bar animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes width-grow {
            from { width: 0%; }
            to { width: 100%; }
          }
        `
      }} />
    </div>
  );
};