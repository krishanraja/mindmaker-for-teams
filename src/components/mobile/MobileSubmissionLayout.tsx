import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, LucideIcon } from 'lucide-react';

interface MobileSubmissionLayoutProps {
  title: string;
  icon: LucideIcon;
  description: string;
  children: React.ReactNode;
  onSubmit: () => Promise<void>;
  submitted: boolean;
  onReset?: () => void;
  submitButtonText?: string;
  successTitle?: string;
  successMessage?: string;
  resetButtonText?: string;
}

export const MobileSubmissionLayout: React.FC<MobileSubmissionLayoutProps> = ({
  title,
  icon: Icon,
  description,
  children,
  onSubmit,
  submitted,
  onReset,
  submitButtonText = 'Submit',
  successTitle = 'Thank you!',
  successMessage = 'Your submission has been recorded and is now visible on the facilitator board.',
  resetButtonText = 'Submit Another',
}) => {
  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Send className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">{successTitle}</h2>
            <p className="text-muted-foreground mb-4">{successMessage}</p>
            {onReset && (
              <Button onClick={onReset} variant="outline">
                {resetButtonText}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-6 w-6 text-primary" />
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{description}</p>
            {children}
            <Button onClick={onSubmit} className="w-full" size="lg">
              <Send className="mr-2 h-4 w-4" />
              {submitButtonText}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
