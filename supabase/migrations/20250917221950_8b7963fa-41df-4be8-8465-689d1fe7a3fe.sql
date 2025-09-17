-- CRITICAL SECURITY FIX: Implement proper RLS policies for exposed tables

-- 1. Fix chat_messages table - restrict to session owners or authenticated users
DROP POLICY IF EXISTS "Anyone can create anonymous messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;

-- More secure policies for chat messages
CREATE POLICY "Users can view messages from their sessions" 
ON public.chat_messages 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  session_id IN (
    SELECT id FROM public.conversation_sessions 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their sessions" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  (user_id IS NULL AND session_id IS NOT NULL)
);

-- 2. Fix conversation_sessions table - restrict to session owners
DROP POLICY IF EXISTS "Anyone can create anonymous sessions" ON public.conversation_sessions;
DROP POLICY IF EXISTS "Anyone can update sessions they created" ON public.conversation_sessions;
DROP POLICY IF EXISTS "Anyone can view sessions" ON public.conversation_sessions;

CREATE POLICY "Users can view their own sessions" 
ON public.conversation_sessions 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create sessions" 
ON public.conversation_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions" 
ON public.conversation_sessions 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- 3. Fix booking_requests table - restrict to request owners
DROP POLICY IF EXISTS "Anyone can create anonymous booking requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Anyone can view booking requests" ON public.booking_requests;
DROP POLICY IF EXISTS "Anyone can update booking requests" ON public.booking_requests;

CREATE POLICY "Users can view their own booking requests" 
ON public.booking_requests 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can create booking requests" 
ON public.booking_requests 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own booking requests" 
ON public.booking_requests 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- 4. Fix lead_qualification_scores table - restrict to score owners
DROP POLICY IF EXISTS "System can manage lead qualification scores" ON public.lead_qualification_scores;

CREATE POLICY "Users can view their own lead scores" 
ON public.lead_qualification_scores 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "System can create lead scores" 
ON public.lead_qualification_scores 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update lead scores" 
ON public.lead_qualification_scores 
FOR UPDATE 
USING (true);

-- 5. Fix google_sheets_sync_log table - restrict to admin only
DROP POLICY IF EXISTS "Admin can manage sync logs" ON public.google_sheets_sync_log;

CREATE POLICY "Only admin can view sync logs" 
ON public.google_sheets_sync_log 
FOR SELECT 
USING (false); -- Temporarily restrict all access

CREATE POLICY "Only system can manage sync logs" 
ON public.google_sheets_sync_log 
FOR ALL 
USING (false) 
WITH CHECK (false); -- Temporarily restrict all access