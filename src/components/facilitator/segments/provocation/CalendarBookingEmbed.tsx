import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

export const CalendarBookingEmbed: React.FC = () => {
  return (
    <Card className="border-2 border-primary/30 bg-primary/5 animate-fade-in">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="h-8 w-8 text-primary" />
          <h3 className="text-2xl font-bold text-foreground">Schedule Your Diagnostic Sprint</h3>
        </div>

        <div className="aspect-video bg-background rounded-lg border-2 border-border flex items-center justify-center">
          <div className="text-center space-y-4 p-8">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <p className="text-xl font-semibold text-foreground mb-2">
                Calendar Integration Placeholder
              </p>
              <p className="text-muted-foreground mb-4">
                Embed Calendly or Cal.com widget here
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Example Calendly embed code:</p>
                <code className="block p-4 bg-muted rounded text-xs text-left">
                  {`<!-- Calendly inline widget begin -->\n<div class="calendly-inline-widget"\n  data-url="https://calendly.com/your-link"\n  style="min-width:320px;height:630px;">\n</div>\n<script type="text/javascript"\n  src="https://assets.calendly.com/assets/external/widget.js"\n  async>\n</script>\n<!-- Calendly inline widget end -->`}
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Replace this placeholder with your actual Calendly or Cal.com embed URL. 
            The iframe will allow participants to book directly without leaving the page.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
