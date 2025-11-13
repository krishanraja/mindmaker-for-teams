import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SharedQRDisplayProps {
  qrCodeUrl: string;
  directUrl: string;
  companyName: string;
  organizerName: string;
}

export const SharedQRDisplay: React.FC<SharedQRDisplayProps> = ({
  qrCodeUrl,
  directUrl,
  companyName,
  organizerName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directUrl);
      setCopied(true);
      toast({ title: 'Link copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  };

  const handleDownloadQR = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${companyName}-workshop-qr.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: 'QR code downloaded!' });
    } catch (error) {
      toast({ title: 'Failed to download QR code', variant: 'destructive' });
    }
  };

  const firstName = organizerName.split(' ')[0];
  
  const emailTemplate = `Subject: Register for AI Leadership Bootcamp - ${companyName}

Hi Team,

We're preparing for our upcoming AI Leadership Bootcamp and need your input to make it as valuable as possible.

Please take 3 minutes to register and share your perspective:

📱 Scan this QR code: [Attach the downloaded QR code image to this email]

💻 Or use this link: ${directUrl}

Your responses will help us tailor the workshop to address your specific concerns and goals about AI implementation.

Thank you!
${firstName}`;

  const handleCopyEmailTemplate = async () => {
    try {
      await navigator.clipboard.writeText(emailTemplate);
      toast({ title: 'Email template copied!' });
    } catch (error) {
      toast({ title: 'Failed to copy email template', variant: 'destructive' });
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle>📱 Share This QR Code With Your Team</CardTitle>
        <CardDescription>
          Copy the QR code and email template below, then send it to all workshop participants from your own email client. Participants will register and provide pre-workshop input via the link.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Display */}
        <div className="flex justify-center p-6 bg-white dark:bg-gray-900 rounded-lg border-2">
          <img 
            src={qrCodeUrl} 
            alt="Workshop Registration QR Code" 
            className="w-64 h-64"
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="w-full"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={handleDownloadQR}
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Download QR Code
          </Button>
        </div>


        {/* Email Template */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold">Email Template</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyEmailTemplate}
            >
              <Mail className="w-4 h-4 mr-2" />
              Copy Template
            </Button>
          </div>
          
          <div className="p-4 bg-muted rounded-lg border">
            <pre className="text-xs whitespace-pre-wrap font-sans">{emailTemplate}</pre>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Manual Steps (Required):
          </h4>
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li><strong>Download the QR code</strong> using the button above</li>
            <li><strong>Copy the email template</strong> and customize if needed</li>
            <li><strong>Open your email client</strong> (Gmail, Outlook, etc.)</li>
            <li><strong>Attach the QR code image</strong> to the email where indicated</li>
            <li><strong>Send to all workshop participants</strong> from your own email</li>
            <li>Participants will scan the QR code or click the link to register (takes 3 minutes)</li>
            <li>All responses will be automatically linked to this workshop</li>
          </ol>
          <p className="text-xs text-muted-foreground mt-3 italic">
            Note: Emails cannot be sent automatically from this tool. You must send them manually.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
