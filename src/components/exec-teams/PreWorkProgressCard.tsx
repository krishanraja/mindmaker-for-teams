import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Clock } from 'lucide-react';

interface PreWorkProgressCardProps {
  intakeId: string;
  onViewResponses: () => void;
}

export const PreWorkProgressCard: React.FC<PreWorkProgressCardProps> = ({
  intakeId,
  onViewResponses,
}) => {
  const [participants, setParticipants] = useState<any[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [intakeId]);

  const loadProgress = async () => {
    try {
      // Get intake participants
      const { data: intake } = await supabase
        .from('exec_intakes')
        .select('participants')
        .eq('id', intakeId)
        .single();

      if (!intake?.participants) return;

      const participantsList = intake.participants as any[];

      // Get submitted pre-work
      const { data: submissions } = await supabase
        .from('pre_workshop_inputs')
        .select('participant_email')
        .eq('intake_id', intakeId);

      const submittedEmails = new Set(submissions?.map(s => s.participant_email) || []);
      
      const participantsWithStatus = participantsList.map((p: any) => ({
        ...p,
        completed: submittedEmails.has(p.email),
      }));

      setParticipants(participantsWithStatus);
      setCompletedCount(participantsWithStatus.filter((p: any) => p.completed).length);
      setLoading(false);
    } catch (error) {
      console.error('Error loading pre-work progress:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pre-Workshop Participation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const totalParticipants = participants.length;
  const percentComplete = totalParticipants > 0 ? (completedCount / totalParticipants) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pre-Workshop Participation</CardTitle>
        <CardDescription>
          Individual team member input to enrich the bootcamp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {completedCount} of {totalParticipants} completed
            </span>
            <span className="font-medium">{Math.round(percentComplete)}%</span>
          </div>
          <Progress value={percentComplete} className="h-2" />
        </div>

        <div className="flex gap-2 flex-wrap">
          <TooltipProvider>
            {participants.map((p, index) => (
              <Tooltip key={index}>
                <TooltipTrigger>
                  <div className="relative">
                    <Avatar className={p.completed ? 'border-2 border-green-500' : 'opacity-50 border-2 border-muted'}>
                      <AvatarFallback className={p.completed ? 'bg-green-50 text-green-700' : ''}>
                        {p.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {p.completed && (
                      <CheckCircle2 className="w-4 h-4 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
                    )}
                    {!p.completed && (
                      <Clock className="w-4 h-4 text-muted-foreground absolute -bottom-1 -right-1 bg-white rounded-full" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.role}</div>
                    <div className="text-xs mt-1">
                      {p.completed ? (
                        <span className="text-green-600">✅ Completed</span>
                      ) : (
                        <span className="text-amber-600">⏳ Pending</span>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>

        {completedCount > 0 && (
          <Button variant="outline" onClick={onViewResponses} className="w-full">
            View Individual Responses ({completedCount})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};