import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PreWorkResponsesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intakeId: string;
}

export const PreWorkResponsesModal: React.FC<PreWorkResponsesModalProps> = ({
  open,
  onOpenChange,
  intakeId,
}) => {
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      loadResponses();
    }
  }, [open, intakeId]);

  const loadResponses = async () => {
    try {
      const { data, error } = await supabase
        .from('pre_workshop_inputs')
        .select('*')
        .eq('intake_id', intakeId)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setResponses(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error loading pre-work responses:', error);
      setLoading(false);
    }
  };

  // Aggregate insights
  const getTopBottlenecks = () => {
    const bottlenecks: Record<string, number> = {};
    responses.forEach(r => {
      const bottleneckArray = r.pre_work_responses?.current_bottlenecks || [];
      bottleneckArray.forEach((text: string) => {
        if (text) {
          bottlenecks[text] = (bottlenecks[text] || 0) + 1;
        }
      });
    });
    return Object.entries(bottlenecks)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const getTopConcerns = () => {
    const concerns: Record<string, number> = {};
    responses.forEach(r => {
      const concernArray = r.pre_work_responses?.ai_myths_concerns || [];
      concernArray.forEach((concern: string) => {
        if (concern) {
          concerns[concern] = (concerns[concern] || 0) + 1;
        }
      });
    });
    return Object.entries(concerns)
      .sort(([, a], [, b]) => b - a);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Pre-Workshop Responses</DialogTitle>
          <DialogDescription>
            Individual input from {responses.length} participant{responses.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading responses...</div>
        ) : (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="individual">Individual Responses</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Top Bottlenecks</CardTitle>
                      <CardDescription>Most commonly mentioned challenges</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {getTopBottlenecks().map(([bottleneck, count], index) => (
                        <div key={index} className="flex items-start justify-between gap-4 p-3 border rounded-lg">
                          <p className="text-sm flex-1">{bottleneck}</p>
                          <Badge variant="secondary">{count} mention{count !== 1 ? 's' : ''}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">AI Concerns Distribution</CardTitle>
                      <CardDescription>What the team is worried about</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {getTopConcerns().map(([concern, count], index) => (
                        <div key={index} className="flex items-center justify-between gap-4 p-3 border rounded-lg">
                          <p className="text-sm flex-1">{concern}</p>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${(count / responses.length) * 100}%` }}
                              />
                            </div>
                            <Badge variant="secondary">{count}</Badge>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Simulation Experience</CardTitle>
                      <CardDescription>Who has dealt with these scenarios before</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-2">Simulation 1:</p>
                          <p className="text-xs text-muted-foreground">
                            {responses.filter(r => r.pre_work_responses?.simulation_1_experience?.dealt_with).length} of {responses.length} have experience
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-2">Simulation 2:</p>
                          <p className="text-xs text-muted-foreground">
                            {responses.filter(r => r.pre_work_responses?.simulation_2_experience?.dealt_with).length} of {responses.length} have experience
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="individual">
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-4">
                  {responses.map((response, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-base">{response.participant_name}</CardTitle>
                        <CardDescription>{response.participant_email}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Current Bottlenecks</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {(response.pre_work_responses?.current_bottlenecks || []).map((b: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground">{b}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-sm mb-2">AI Myths & Concerns</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {(response.pre_work_responses?.ai_myths_concerns || []).map((c: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground">{c}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm mb-2">Department</h4>
                          <Badge variant="outline">{response.pre_work_responses?.department || 'Not specified'}</Badge>
                        </div>

                        <div>
                          <h4 className="font-semibold text-sm mb-2">AI Experience Level</h4>
                          <Badge variant="outline">{response.pre_work_responses?.ai_experience_level || 'Not specified'}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};