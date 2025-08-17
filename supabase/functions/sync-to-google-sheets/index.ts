import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// This function is designed to be called ONLY by database triggers or internal systems
// Users should never interact with Google Sheets directly - it's purely for backend lead collection

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { syncType = 'booking', recordId, leadData, priority } = await req.json();
    
    console.log(`Starting automatic Google Sheets sync for type: ${syncType}`);

    // Get specific record or recent records to sync
    let dataToSync;
    let sheetName;
    
    switch (syncType) {
      case 'booking':
        const bookingQuery = supabase
          .from('booking_requests')
          .select(`
            *,
            users (
              full_name,
              email,
              company_name,
              role_title
            )
          `);
        
        if (recordId) {
          // Sync specific record
          const { data: singleBooking } = await bookingQuery.eq('id', recordId);
          dataToSync = singleBooking;
        } else {
          // Sync recent records
          const { data: bookings } = await bookingQuery
            .order('created_at', { ascending: false })
            .limit(100);
          dataToSync = bookings;
        }
        
        sheetName = 'Lead Bookings';
        break;
        
      case 'analytics':
        const analyticsQuery = supabase
          .from('conversion_analytics')
          .select('*');
          
        if (recordId) {
          const { data: singleAnalytics } = await analyticsQuery.eq('id', recordId);
          dataToSync = singleAnalytics;
        } else {
          const { data: analytics } = await analyticsQuery
            .order('created_at', { ascending: false })
            .limit(100);
          dataToSync = analytics;
        }
        
        sheetName = 'Conversion Analytics';
        break;
        
      case 'lead_capture':
        // Direct lead capture from Mindmaker tool - use provided data
        dataToSync = leadData ? [leadData] : [];
        sheetName = 'Mindmaker Leads';
        break;
        
      default:
        throw new Error(`Unsupported sync type: ${syncType}`);
    }

    if (!dataToSync || dataToSync.length === 0) {
      console.log('No data to sync');
      return new Response(
        JSON.stringify({ message: 'No data to sync', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Google OAuth credentials
    const googleCredentials = Deno.env.get('GOOGLE_OAUTH_CREDENTIALS');
    if (!googleCredentials) {
      console.error('Google OAuth credentials not configured - skipping sync');
      return new Response(
        JSON.stringify({ message: 'Google Sheets sync disabled - credentials not configured', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const credentials = JSON.parse(googleCredentials);
    const spreadsheetId = Deno.env.get('GOOGLE_SHEETS_SPREADSHEET_ID');
    
    if (!spreadsheetId) {
      console.error('Google Sheets spreadsheet ID not configured - skipping sync');
      return new Response(
        JSON.stringify({ message: 'Google Sheets sync disabled - spreadsheet ID not configured', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Syncing ${dataToSync.length} records to backend Google Sheets`);

    // Get OAuth token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: credentials.client_id,
        client_secret: credentials.client_secret,
        refresh_token: credentials.refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get OAuth token: ${tokenResponse.statusText}`);
    }

    const { access_token } = await tokenResponse.json();

    // Prepare data for Google Sheets
    let values;
    let headers;

    if (syncType === 'booking') {
      headers = [
        'ID', 'Contact Name', 'Email', 'Company', 'Role', 'Phone',
        'Service Type', 'Service Title', 'Preferred Time', 'Specific Needs',
        'Lead Score', 'Priority', 'Status', 'Created At', 'Notes'
      ];
      
      values = dataToSync.map(booking => [
        booking.id,
        booking.contact_name || booking.users?.full_name || '',
        booking.contact_email || booking.users?.email || '',
        booking.company_name || booking.users?.company_name || '',
        booking.role || booking.users?.role_title || '',
        booking.phone || '',
        booking.service_type || '',
        booking.service_title || '',
        booking.preferred_time || '',
        booking.specific_needs || '',
        booking.lead_score || 0,
        booking.priority || '',
        booking.status || '',
        new Date(booking.created_at).toLocaleString(),
        booking.notes || ''
      ]);
    } else if (syncType === 'lead_capture') {
      headers = [
        'Timestamp', 'Business Name', 'Contact Name', 'Email', 'Country', 'Website',
        'Employee Count', 'Company Type', 'Business Description', 'Business Functions', 'AI Adoption',
        'Avg Anxiety Level', 'AI Skills', 'Automation Risks', 'Success Targets', 'Change Narrative', 'Learning Modality',
        'Total Score', 'Quality Tier', 'Business Readiness', 'Engagement Score', 'Contact Quality', 
        'Pain Point Severity', 'Urgency Score', 'Steps Completed', 'PDF Generated', 'Summary Viewed', 
        'Time Spent (mins)', 'Source', 'Lead Type'
      ];
      
      values = dataToSync.map(lead => [
        lead.timestamp || new Date().toISOString(),
        lead.businessName || 'Unknown',
        lead.contactName || 'Unknown',
        lead.email || 'Unknown',
        lead.country || 'Unknown',
        lead.website || '',
        lead.employeeCount || 0,
        lead.company || '',
        lead.businessDescription || '',
        lead.businessFunctions || '',
        lead.aiAdoption || '',
        lead.avgAnxietyLevel || 0,
        lead.aiSkills || '',
        lead.automationRisks || '',
        lead.successTargets || '',
        lead.changeNarrative || '',
        lead.learningModality || '',
        lead.totalScore || 0,
        lead.qualityTier || 'disqualified',
        lead.businessReadiness || 0,
        lead.engagementScore || 0,
        lead.contactQuality || 0,
        lead.painPointSeverity || 0,
        lead.urgencyScore || 0,
        lead.stepsCompleted || 0,
        lead.pdfGenerated ? 'Yes' : 'No',
        lead.summaryViewed ? 'Yes' : 'No',
        lead.timeSpent || 0,
        lead.source || 'AI Transformation Mindmaker',
        lead.leadType || 'mindmaker_completion'
      ]);
    } else {
      headers = [
        'ID', 'Session ID', 'User ID', 'Lead Score', 'Session Duration',
        'Messages Exchanged', 'Topics Explored', 'Insights Generated',
        'Conversion Value', 'Conversion Type', 'Service Type', 'Source Channel', 'Created At'
      ];
      
      values = dataToSync.map(record => [
        record.id,
        record.session_id || '',
        record.user_id || '',
        record.lead_score || 0,
        record.session_duration || 0,
        record.messages_exchanged || 0,
        record.topics_explored || 0,
        record.insights_generated || 0,
        record.conversion_value || 0,
        record.conversion_type || '',
        record.service_type || '',
        record.source_channel || '',
        new Date(record.created_at).toLocaleString()
      ]);
    }

    // Always append new leads to existing data (never replace the entire sheet)
    if (syncType === 'lead_capture' || recordId) {
      // Append single row
      const appendResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z:append?valueInputOption=RAW`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: values,
          }),
        }
      );

      if (!appendResponse.ok) {
        const errorText = await appendResponse.text();
        throw new Error(`Failed to append to Google Sheet: ${errorText}`);
      }
    } else {
      // Replace all data
      const allValues = [headers, ...values];
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A:Z?valueInputOption=RAW`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            values: allValues,
          }),
        }
      );

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        throw new Error(`Failed to update Google Sheet: ${errorText}`);
      }
    }

    // Log successful sync
    await supabase
      .from('google_sheets_sync_log')
      .insert({
        sync_type: syncType,
        status: 'completed',
        data_count: dataToSync.length,
        synced_at: new Date().toISOString(),
        sync_metadata: {
          sheet_name: sheetName,
          records_synced: dataToSync.length,
          sync_timestamp: new Date().toISOString(),
          record_id: recordId || null
        }
      });

    console.log(`Successfully synced ${dataToSync.length} records to backend Google Sheets`);

    return new Response(
      JSON.stringify({ 
        message: 'Data synced to backend successfully', 
        synced: dataToSync.length,
        sheetName 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in automatic Google Sheets sync:', error);
    
    // Log failed sync
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      await supabase
        .from('google_sheets_sync_log')
        .insert({
          sync_type: 'unknown',
          status: 'failed',
          error_message: error.message,
          sync_metadata: {
            error_timestamp: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.error('Failed to log sync error:', logError);
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});