import { supabase } from "@/integrations/supabase/client";

/**
 * Automatically sync booking data to backend systems (Google Sheets)
 * This happens behind the scenes - users never see or interact with this
 */
export const syncBookingToBackend = async (bookingId: string) => {
  try {
    // Call the Google Sheets sync function in the background
    const { data, error } = await supabase.functions.invoke('sync-to-google-sheets', {
      body: {
        syncType: 'booking',
        recordId: bookingId
      }
    });

    if (error) {
      // Don't throw - we don't want to interrupt the user flow if backend sync fails
      return false;
    }

    return true;
  } catch (error) {
    // Silent failure - user never knows about backend issues
    return false;
  }
};

/**
 * Sync analytics data to backend systems
 * This is purely for internal tracking and lead management
 */
export const syncAnalyticsToBackend = async (analyticsId?: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-to-google-sheets', {
      body: {
        syncType: 'analytics',
        recordId: analyticsId
      }
    });

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Batch sync all recent data to backend systems
 * This could be called periodically or on-demand by admins
 */
export const syncAllToBackend = async () => {
  try {
    // Sync bookings
    const bookingSync = await supabase.functions.invoke('sync-to-google-sheets', {
      body: { syncType: 'booking' }
    });

    // Sync analytics
    const analyticsSync = await supabase.functions.invoke('sync-to-google-sheets', {
      body: { syncType: 'analytics' }
    });

    const results = {
      bookings: !bookingSync.error,
      analytics: !analyticsSync.error
    };

    return results;
  } catch (error) {
    return { bookings: false, analytics: false };
  }
};