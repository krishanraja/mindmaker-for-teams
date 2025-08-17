-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for extended profile information
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company_name TEXT,
  company_size TEXT,
  industry TEXT,
  role_title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(auth_user_id)
);

-- Conversation sessions for managing chat contexts
CREATE TABLE public.conversation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_title TEXT,
  ai_personality TEXT DEFAULT 'ai_literacy_consultant',
  session_context JSONB DEFAULT '{}',
  qualification_score INTEGER DEFAULT 0,
  engagement_level TEXT DEFAULT 'initial',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual chat messages
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI conversations for structured Q&A tracking
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  question_category TEXT,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  confidence_score DECIMAL(3,2),
  insights_generated JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User business context for domain-specific intelligence
CREATE TABLE public.user_business_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  context_type TEXT NOT NULL,
  context_data JSONB NOT NULL,
  confidence_level DECIMAL(3,2) DEFAULT 0.5,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead qualification tracking
CREATE TABLE public.lead_qualifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
  qualification_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  indicators JSONB DEFAULT '{}',
  qualified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Engagement analytics
CREATE TABLE public.engagement_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.conversation_sessions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Security audit log
CREATE TABLE public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource TEXT,
  ip_address INET,
  user_agent TEXT,
  status TEXT DEFAULT 'success',
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_business_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = auth_user_id);

-- RLS Policies for conversation_sessions
CREATE POLICY "Users can view their own sessions" ON public.conversation_sessions
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create their own sessions" ON public.conversation_sessions
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own sessions" ON public.conversation_sessions
  FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view their own messages" ON public.chat_messages
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create their own messages" ON public.chat_messages
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for ai_conversations
CREATE POLICY "Users can view their own conversations" ON public.ai_conversations
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create their own conversations" ON public.ai_conversations
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for user_business_context
CREATE POLICY "Users can view their own context" ON public.user_business_context
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create their own context" ON public.user_business_context
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update their own context" ON public.user_business_context
  FOR UPDATE USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for lead_qualifications
CREATE POLICY "Users can view their own qualifications" ON public.lead_qualifications
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create their own qualifications" ON public.lead_qualifications
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for engagement_analytics
CREATE POLICY "Users can view their own analytics" ON public.engagement_analytics
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create their own analytics" ON public.engagement_analytics
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- RLS Policies for security_audit_log (admin-only, but structure for future)
CREATE POLICY "Users can view their own audit logs" ON public.security_audit_log
  FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conversation_sessions_updated_at
  BEFORE UPDATE ON public.conversation_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_conversation_sessions_user_id ON public.conversation_sessions(user_id);
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX idx_ai_conversations_session_id ON public.ai_conversations(session_id);
CREATE INDEX idx_user_business_context_user_id ON public.user_business_context(user_id);
CREATE INDEX idx_lead_qualifications_user_id ON public.lead_qualifications(user_id);
CREATE INDEX idx_engagement_analytics_session_id ON public.engagement_analytics(session_id);
CREATE INDEX idx_security_audit_log_user_id ON public.security_audit_log(user_id);