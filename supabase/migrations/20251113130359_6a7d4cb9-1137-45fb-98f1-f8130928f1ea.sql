-- Enable real-time for workshop activity tables
-- Add tables to supabase_realtime publication for instant updates
ALTER PUBLICATION supabase_realtime ADD TABLE bottleneck_submissions;
ALTER PUBLICATION supabase_realtime ADD TABLE effortless_map_items;
ALTER PUBLICATION supabase_realtime ADD TABLE voting_results;

-- Set REPLICA IDENTITY FULL to capture complete row data for real-time updates
ALTER TABLE bottleneck_submissions REPLICA IDENTITY FULL;
ALTER TABLE effortless_map_items REPLICA IDENTITY FULL;
ALTER TABLE voting_results REPLICA IDENTITY FULL;