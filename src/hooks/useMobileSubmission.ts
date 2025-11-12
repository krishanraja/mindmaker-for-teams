import { useState } from 'react';
import { toast } from '@/hooks/use-toast';

export const useMobileSubmission = (workshopId: string | undefined) => {
  const [participantName, setParticipantName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const validateParticipant = (fieldName: string = 'name'): boolean => {
    if (!participantName.trim()) {
      toast({ title: `Please enter your ${fieldName}`, variant: 'destructive' });
      return false;
    }
    return true;
  };
  
  const reset = () => {
    setParticipantName('');
    setSubmitted(false);
    setLoading(false);
  };
  
  return { 
    participantName, 
    setParticipantName, 
    submitted, 
    setSubmitted, 
    loading, 
    setLoading, 
    validateParticipant,
    reset,
    workshopId
  };
};
