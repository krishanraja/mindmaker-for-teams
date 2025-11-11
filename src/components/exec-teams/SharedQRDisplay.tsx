import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Download, Mail, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
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
      toast.success('QR code downloaded!');
    } catch (error) {
      toast.error('Failed to download QR code');
    }
  };

  const emailTemplate = `Subject: Please register for our AI Leadership Bootcamp - ${companyName}

Hi Team,

We're preparing for our upcoming AI Leadership Bootcamp and need your input to make it as valuable as possible for our team.

Please take 3 minutes to register and complete a brief questionnaire:

📱 Scan this QR code on your mobile device:
[Attach the QR code image]

💻 Or click this link:
${directUrl}

Your responses will help us tailor the workshop to address your specific concerns and goals about AI implementation.

Thanks!
${organizerName}`;

  const handleCopyEmailTemplate = async () => {
    try {
      await navigator.clipboard.writeText(emailTemplate);
      toast.success('Email template copied!');
    } catch (error) {
      toast.error('Failed to copy email template');
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle>Participant Registration QR Code</CardTitle>
        <CardDescription>
          Share this QR code with all workshop participants. They'll register and provide pre-workshop input.
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

        {/* Direct Link Display */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground mb-2">Direct Link:</p>
          <p className="text-sm font-mono break-all">{directUrl}</p>
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
          <h4 className="text-sm font-semibold mb-2">How to use:</h4>
          <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
            <li>Download the QR code or copy the link above</li>
            <li>Copy the email template and customize if needed</li>
            <li>Send to all workshop participants</li>
            <li>Participants scan the QR code or click the link</li>
            <li>They'll register and provide their input (3 minutes)</li>
            <li>You can proceed to configure simulations while they register</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
