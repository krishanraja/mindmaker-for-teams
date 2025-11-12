import { toast } from '@/hooks/use-toast';
import { Participant } from '@/types/workshop';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateRequired = (value: string | undefined, fieldName: string): boolean => {
  if (!value || !value.trim()) {
    toast({ title: `${fieldName} is required`, variant: 'destructive' });
    return false;
  }
  return true;
};

export const validateParticipants = (participants: Participant[]): boolean => {
  if (participants.length === 0) return true; // Optional

  const invalid = participants.filter(p => !p.name || !p.email || !p.role);
  if (invalid.length > 0) {
    toast({ title: 'Please complete all participant information', variant: 'destructive' });
    return false;
  }

  const invalidEmails = participants.filter(p => !validateEmail(p.email));
  if (invalidEmails.length > 0) {
    toast({ title: 'Please enter valid email addresses', variant: 'destructive' });
    return false;
  }

  return true;
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateEmailFormat = (email: string, fieldName: string = 'Email'): boolean => {
  if (!validateEmail(email)) {
    toast({ title: `Please enter a valid ${fieldName.toLowerCase()}`, variant: 'destructive' });
    return false;
  }
  return true;
};
