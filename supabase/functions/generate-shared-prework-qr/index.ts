import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { intakeId } = await req.json();

    if (!intakeId) {
      throw new Error('intakeId is required');
    }

    console.log('Generating shared QR code for intake:', intakeId);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Use actual deployed app URL
    const appUrl = 'https://bkyuxvschuwngtcdhsyg.lovable.app';
    const registrationUrl = `${appUrl}/mobile-registration/${intakeId}`;

    console.log('Registration URL:', registrationUrl);

    // Generate QR code as PNG buffer (works in Deno environment)
    const qrCodeBuffer = await QRCode.toBuffer(registrationUrl, {
      errorCorrectionLevel: 'H',
      width: 512,
      margin: 2,
      color: {
        dark: '#000000FF',
        light: '#FFFFFFFF',
      },
      type: 'png'
    });

    // Convert to Uint8Array for upload
    const binaryData = new Uint8Array(qrCodeBuffer);

    // Upload to storage
    const fileName = `shared/${intakeId}.png`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pre-workshop-qr')
      .upload(fileName, binaryData, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('QR code uploaded:', uploadData);

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pre-workshop-qr')
      .getPublicUrl(fileName);

    const qrCodeUrl = urlData.publicUrl;

    console.log('QR code URL:', qrCodeUrl);

    return new Response(
      JSON.stringify({
        success: true,
        qrCodeUrl,
        directUrl: registrationUrl,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating QR code:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
