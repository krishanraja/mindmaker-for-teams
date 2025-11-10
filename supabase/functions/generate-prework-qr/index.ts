import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateQRRequest {
  intakeId: string;
  bootcampPlanId: string;
  participants: Array<{ name: string; email: string; role: string }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { intakeId, participants } = await req.json() as GenerateQRRequest;

    const appOrigin = Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '') || 'https://bkyuxvschuwngtcdhsyg.supabase.co';
    const appUrl = appOrigin.replace('https://bkyuxvschuwngtcdhsyg.supabase.co', 'https://lovable.app'); // Replace with actual app URL

    const results = [];

    for (const participant of participants) {
      // Generate unique hash
      const timestamp = Date.now();
      const hashString = `${participant.email}-${intakeId}-${timestamp}`;
      const participantHash = btoa(hashString);

      // Create URL
      const directUrl = `${appUrl}/pre-workshop/${intakeId}/${participantHash}`;

      // Generate QR code
      const qrCodeDataUrl = await QRCode.toDataURL(directUrl, {
        width: 512,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // Convert data URL to blob
      const base64Data = qrCodeDataUrl.split(',')[1];
      const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

      // Upload to storage
      const sanitizedEmail = participant.email.replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `${intakeId}/${sanitizedEmail}.png`;

      const { error: uploadError } = await supabaseClient.storage
        .from('pre-workshop-qr')
        .upload(filePath, binaryData, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading QR code:', uploadError);
        throw uploadError;
      }

      // Get signed URL (valid for 7 days)
      const { data: signedUrlData } = await supabaseClient.storage
        .from('pre-workshop-qr')
        .createSignedUrl(filePath, 604800); // 7 days

      results.push({
        participantEmail: participant.email,
        participantName: participant.name,
        qrUrl: signedUrlData?.signedUrl || '',
        directUrl,
        participantHash,
      });
    }

    console.log(`Generated ${results.length} QR codes for intake ${intakeId}`);

    return new Response(
      JSON.stringify({ results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in generate-prework-qr:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});