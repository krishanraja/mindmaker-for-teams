import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Zap, Eye, Clock, Sparkles, FileText, Target } from 'lucide-react';

interface SegmentNavigatorProps {
  currentSegment: number;
  onSegmentChange: (segment: number) => void;
}

const SEGMENTS = [
  { id: 0, name: 'The Provocation', icon: Sparkles, duration: 15, color: 'text-amber-500' },
  { id: 1, name: 'Mythbuster', icon: Zap, duration: 30, color: 'text-blue-500' },
  { id: 2, name: 'The Mirror', icon: Eye, duration: 45, color: 'text-purple-500' },
  { id: 3, name: 'The Time Machine', icon: Clock, duration: 60, color: 'text-green-500' },
  { id: 4, name: 'The Crystal Ball', icon: Sparkles, duration: 45, color: 'text-yellow-500' },
  { id: 5, name: 'The Rewrite', icon: FileText, duration: 45, color: 'text-orange-500' },
  { id: 6, name: 'The Huddle', icon: Target, duration: 30, color: 'text-red-500' },
];

export const SegmentNavigator: React.FC<SegmentNavigatorProps> = ({
  currentSegment,
  onSegmentChange,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentSegmentData = SEGMENTS.find(s => s.id === currentSegment);

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isTimerRunning, timeRemaining]);

  const startTimer = () => {
    setTimeRemaining((currentSegmentData?.duration || 0) * 60);
    setIsTimerRunning(true);
  };

  const pauseTimer = () => {
    setIsTimerRunning(false);
  };

  const resetTimer = () => {
    setTimeRemaining((currentSegmentData?.duration || 0) * 60);
    setIsTimerRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = SEGMENTS.reduce((sum, s) => sum + s.duration, 0);
  const progressPercent = ((SEGMENTS.find(s => s.id === currentSegment)?.id || 0) / SEGMENTS.length) * 100;

  return (
    <div className="w-80 border-r bg-gradient-to-b from-card to-muted/20 flex flex-col">
      <div className="p-6 border-b space-y-4">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-1">Workshop Progress</h2>
          <p className="text-xs text-muted-foreground">Total Duration: {totalDuration} minutes</p>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Segment {currentSegment + 1} of {SEGMENTS.length}
          </p>
        </div>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="text-center">
            <div className="text-5xl font-bold text-primary mb-2 tabular-nums">
              {formatTime(timeRemaining)}
            </div>
            <div className="text-sm font-medium text-foreground mb-3">
              {currentSegmentData?.name}
            </div>
            <div className="flex gap-2">
              {!isTimerRunning ? (
                <Button onClick={startTimer} className="flex-1" size="sm">Start</Button>
              ) : (
                <Button onClick={pauseTimer} variant="secondary" className="flex-1" size="sm">Pause</Button>
              )}
              <Button onClick={resetTimer} variant="outline" className="flex-1" size="sm">Reset</Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {SEGMENTS.map((segment) => {
          const Icon = segment.icon;
          const isActive = segment.id === currentSegment;
          const isCompleted = segment.id < currentSegment;

          return (
            <Button
              key={segment.id}
              onClick={() => onSegmentChange(segment.id)}
              variant={isActive ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start h-auto py-3',
                isActive && 'bg-primary text-primary-foreground',
                !isActive && 'hover:bg-muted'
              )}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={cn(
                  'p-2 rounded-lg',
                  isActive ? 'bg-primary-foreground/20' : 'bg-muted'
                )}>
                  <Icon className={cn('h-5 w-5', isActive ? 'text-primary-foreground' : segment.color)} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{segment.name}</div>
                  <div className={cn(
                    'text-xs',
                    isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                  )}>
                    {segment.duration} minutes
                  </div>
                </div>
                {isCompleted && (
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                )}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
