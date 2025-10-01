-- Create AI Literacy Modules table to store all 12 modules
CREATE TABLE IF NOT EXISTS public.ai_literacy_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('LEADERSHIP', 'IMPLEMENTATION')),
  tier TEXT NOT NULL CHECK (tier IN ('Basic', 'Advanced', 'Expert')),
  credits INTEGER NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  target_audience TEXT[] NOT NULL DEFAULT '{}',
  challenges TEXT[] NOT NULL DEFAULT '{}',
  team_sizes TEXT[] NOT NULL DEFAULT '{}',
  urgency TEXT[] NOT NULL DEFAULT '{}',
  learning_styles TEXT[] NOT NULL DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ai_literacy_modules ENABLE ROW LEVEL SECURITY;

-- Allow public read access to modules (they're not sensitive)
CREATE POLICY "Modules are viewable by everyone"
  ON public.ai_literacy_modules
  FOR SELECT
  USING (true);

-- Insert all 12 real Mindmaker modules
INSERT INTO public.ai_literacy_modules (id, title, category, tier, credits, description, icon, target_audience, challenges, team_sizes, urgency, learning_styles) VALUES
  ('align-leaders', 'ALIGN LEADERS', 'LEADERSHIP', 'Basic', 15, 
   'Exec Team primer on AI literacy, market shifts, and how media leaders are preparing for 2030',
   '👥', 
   ARRAY['Executives', 'Leadership Team', 'C-Suite'],
   ARRAY['Leadership buy-in', 'Strategic direction', 'Change management'],
   ARRAY['small', 'medium', 'large'],
   ARRAY['immediate', 'short-term'],
   ARRAY['Live workshops', 'Keynote', 'Executive briefing']),
   
  ('inspire-staff', 'INSPIRE STAFF', 'LEADERSHIP', 'Basic', 10,
   'All Hands keynote on the future of work & principles to thrive',
   '📢',
   ARRAY['All staff', 'General workforce'],
   ARRAY['Employee engagement', 'AI anxiety', 'Change resistance'],
   ARRAY['medium', 'large', 'enterprise'],
   ARRAY['immediate', 'short-term'],
   ARRAY['Live workshops', 'Keynote', 'All-hands']),
   
  ('product-strategy', 'PRODUCT STRATEGY', 'LEADERSHIP', 'Basic', 25,
   'Map AI capabilities to your product roadmap or new revenue lines',
   '🎯',
   ARRAY['Product teams', 'Strategy teams', 'Innovation leaders'],
   ARRAY['Product development', 'Revenue growth', 'Market positioning'],
   ARRAY['small', 'medium', 'large'],
   ARRAY['immediate', 'short-term', 'medium-term'],
   ARRAY['Strategic', 'Workshop', 'Collaborative']),
   
  ('agent-opp-spotter', 'AGENT OPP SPOTTER', 'IMPLEMENTATION', 'Basic', 5,
   'Workflow redesign jam: spot agent opportunities',
   '🔍',
   ARRAY['Operations', 'Process teams', 'Team leads'],
   ARRAY['Process optimization', 'Workflow efficiency', 'Automation opportunities'],
   ARRAY['small', 'medium'],
   ARRAY['immediate', 'short-term'],
   ARRAY['Workshop', 'Hands-on', 'Collaborative']),
   
  ('formalize-ops', 'FORMALIZE OPS', 'LEADERSHIP', 'Advanced', 20,
   'Produce & train an internal AI usage playbook',
   '⚙️',
   ARRAY['Operations', 'HR', 'Training teams'],
   ARRAY['Standardization', 'Best practices', 'Knowledge management'],
   ARRAY['medium', 'large', 'enterprise'],
   ARRAY['medium-term', 'long-term'],
   ARRAY['Self-paced', 'Documentation', 'Process design']),
   
  ('get-building', 'GET BUILDING', 'IMPLEMENTATION', 'Advanced', 20,
   'Deep dive: build a lightweight tool with one team and track KPIs',
   '🔨',
   ARRAY['Technical teams', 'Innovation teams', 'Early adopters'],
   ARRAY['Technical implementation', 'Tool development', 'Measurement'],
   ARRAY['small', 'medium'],
   ARRAY['short-term', 'medium-term'],
   ARRAY['Hands-on', 'Technical', 'Project-based']),
   
  ('coach-the-coaches', 'COACH THE COACHES', 'IMPLEMENTATION', 'Advanced', 20,
   '1-1 coaching for power users to scale literacy',
   '🎓',
   ARRAY['Team leads', 'Trainers', 'Champions'],
   ARRAY['Train the trainer', 'Scale literacy', 'Internal advocacy'],
   ARRAY['medium', 'large', 'enterprise'],
   ARRAY['medium-term', 'long-term'],
   ARRAY['Coaching', '1-on-1', 'Mentorship']),
   
  ('gamify-learning', 'GAMIFY LEARNING', 'IMPLEMENTATION', 'Advanced', 15,
   'Mini-lessons + scorecards delivered via email/newsletter',
   '🎮',
   ARRAY['All staff', 'Remote teams', 'Busy professionals'],
   ARRAY['Time constraints', 'Engagement', 'Continuous learning'],
   ARRAY['medium', 'large', 'enterprise'],
   ARRAY['long-term', 'ongoing'],
   ARRAY['Self-paced', 'Microlearning', 'Digital']),
   
  ('workflow-redesign-mastery', 'WORKFLOW REDESIGN MASTERY', 'IMPLEMENTATION', 'Expert', 25,
   'Advanced process redesign with AI-first thinking',
   '🔄',
   ARRAY['Operations leaders', 'Process experts', 'Transformation leads'],
   ARRAY['Process optimization', 'Transformation', 'Efficiency gains'],
   ARRAY['medium', 'large', 'enterprise'],
   ARRAY['medium-term', 'long-term'],
   ARRAY['Strategic', 'Analytical', 'Workshop']),
   
  ('competitive-intelligence-bootcamp', 'COMPETITIVE INTELLIGENCE BOOTCAMP', 'IMPLEMENTATION', 'Expert', 40,
   'Transform market research using AI',
   '🕵️',
   ARRAY['Strategy teams', 'Market research', 'Business intelligence'],
   ARRAY['Market intelligence', 'Competitive advantage', 'Strategic insights'],
   ARRAY['small', 'medium', 'large'],
   ARRAY['immediate', 'short-term'],
   ARRAY['Strategic', 'Analytical', 'Research-focused']),
   
  ('internal-champion-development', 'INTERNAL CHAMPION DEVELOPMENT', 'LEADERSHIP', 'Expert', 45,
   'Build a network of AI champions across the org',
   '🌟',
   ARRAY['Champions', 'Change agents', 'Department leads'],
   ARRAY['Change management', 'Adoption', 'Cultural transformation'],
   ARRAY['large', 'enterprise'],
   ARRAY['medium-term', 'long-term'],
   ARRAY['Leadership development', 'Network building', 'Mentorship']),
   
  ('ai-powered-content-strategy', 'AI-POWERED CONTENT STRATEGY', 'IMPLEMENTATION', 'Expert', 20,
   'Create systematic AI-driven content workflows',
   '📝',
   ARRAY['Content teams', 'Marketing', 'Communications'],
   ARRAY['Content creation', 'Brand consistency', 'Scalability'],
   ARRAY['small', 'medium', 'large'],
   ARRAY['immediate', 'short-term'],
   ARRAY['Creative', 'Hands-on', 'Project-based']);

-- Create updated_at trigger
CREATE TRIGGER update_ai_literacy_modules_updated_at
  BEFORE UPDATE ON public.ai_literacy_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();