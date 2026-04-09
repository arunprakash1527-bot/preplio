-- Enable extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Certifications (multi-cert from day 1)
-- ============================================
CREATE TABLE certifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  provider TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Certification parts (e.g., ORM Part 1 & Part 2)
CREATE TABLE certification_parts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  certification_id UUID REFERENCES certifications(id) ON DELETE CASCADE,
  part_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  pass_percentage NUMERIC(5,2) NOT NULL,
  UNIQUE(certification_id, part_number)
);

-- Certification topics with exam weights
CREATE TABLE certification_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  certification_id UUID REFERENCES certifications(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  exam_weight_percentage NUMERIC(5,2) DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(certification_id, name)
);

-- Seed ORM certification
INSERT INTO certifications (id, name, code, provider, description) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Operational Risk Management Designation',
  'ORM',
  'PRMIA',
  'The ORM Designation by PRMIA covers operational risk governance, IT risk, cybersecurity, compliance, and risk frameworks.'
);

INSERT INTO certification_parts (certification_id, part_number, name, total_questions, duration_minutes, pass_percentage) VALUES
  ('a0000000-0000-0000-0000-000000000001', 1, 'ORM Part 1', 60, 120, 60.00),
  ('a0000000-0000-0000-0000-000000000001', 2, 'ORM Part 2', 50, 120, 60.00);

INSERT INTO certification_topics (certification_id, name, exam_weight_percentage, sort_order) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Operational Risk Governance & Frameworks', 20, 1),
  ('a0000000-0000-0000-0000-000000000001', 'IT Risk & Cybersecurity', 15, 2),
  ('a0000000-0000-0000-0000-000000000001', 'Risk Assessment & Measurement', 15, 3),
  ('a0000000-0000-0000-0000-000000000001', 'Compliance & Regulatory Requirements', 15, 4),
  ('a0000000-0000-0000-0000-000000000001', 'Business Continuity & Resilience', 10, 5),
  ('a0000000-0000-0000-0000-000000000001', 'Supply Chain & Third-Party Risk', 10, 6),
  ('a0000000-0000-0000-0000-000000000001', 'Financial Crime & Fraud', 10, 7),
  ('a0000000-0000-0000-0000-000000000001', 'Capital Modeling & Reporting', 5, 8);

-- ============================================
-- Profiles (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  certification_id UUID REFERENCES certifications(id),
  exam_date DATE,
  hours_per_day NUMERIC(3,1) DEFAULT 2.0,
  experience_level TEXT DEFAULT 'none' CHECK (experience_level IN ('none', 'some', 'experienced')),
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Documents (uploaded study materials)
-- ============================================
CREATE TABLE documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'docx', 'text', 'transcript', 'youtube', 'image')),
  certification_id UUID REFERENCES certifications(id),
  file_url TEXT,
  file_size INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  total_chunks INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Document chunks (for RAG)
-- ============================================
CREATE TABLE chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding VECTOR(1024),
  topic TEXT,
  section TEXT,
  page_ref TEXT,
  chunk_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Questions (AI-generated)
-- ============================================
CREATE TABLE questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  certification_id UUID REFERENCES certifications(id),
  stem TEXT NOT NULL,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  source_chunks UUID[] DEFAULT '{}',
  difficulty INTEGER DEFAULT 3 CHECK (difficulty BETWEEN 1 AND 5),
  topic TEXT NOT NULL,
  exam_part INTEGER,
  is_approved BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Quiz sessions
-- ============================================
CREATE TABLE quiz_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  certification_id UUID REFERENCES certifications(id),
  mode TEXT NOT NULL CHECK (mode IN ('practice', 'mock_exam_1', 'mock_exam_2', 'quick_review')),
  topic TEXT,
  total_questions INTEGER NOT NULL,
  correct_answers INTEGER DEFAULT 0,
  score_percentage NUMERIC(5,2),
  time_spent_seconds INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Question attempts (with spaced repetition)
-- ============================================
CREATE TABLE question_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_id UUID REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  question_id UUID REFERENCES questions(id),
  selected_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_spent_seconds INTEGER,
  next_review_date DATE,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Topic mastery tracking
-- ============================================
CREATE TABLE topic_mastery (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  certification_id UUID REFERENCES certifications(id),
  topic TEXT NOT NULL,
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  mastery_percentage NUMERIC(5,2) DEFAULT 0,
  last_practiced TIMESTAMPTZ,
  UNIQUE(user_id, certification_id, topic)
);

-- ============================================
-- Study plans
-- ============================================
CREATE TABLE study_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  certification_id UUID REFERENCES certifications(id),
  exam_date DATE NOT NULL,
  schedule JSONB NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Chat conversations
-- ============================================
CREATE TABLE chat_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  certification_id UUID REFERENCES certifications(id),
  title TEXT DEFAULT 'New Chat',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Chat messages
-- ============================================
CREATE TABLE chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  citations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_chunks_document ON chunks(document_id);
CREATE INDEX idx_chunks_embedding ON chunks USING hnsw (embedding vector_cosine_ops);
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_certification ON questions(certification_id);
CREATE INDEX idx_question_attempts_user ON question_attempts(user_id);
CREATE INDEX idx_question_attempts_review ON question_attempts(next_review_date) WHERE next_review_date IS NOT NULL;
CREATE INDEX idx_topic_mastery_user ON topic_mastery(user_id);
CREATE INDEX idx_documents_certification ON documents(certification_id);

-- ============================================
-- Row Level Security
-- ============================================
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Certifications: everyone can read
CREATE POLICY "Anyone can view certifications" ON certifications FOR SELECT USING (true);
CREATE POLICY "Anyone can view certification parts" ON certification_parts FOR SELECT USING (true);
CREATE POLICY "Anyone can view certification topics" ON certification_topics FOR SELECT USING (true);

-- Profiles: users can read/update own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Documents: authenticated users can read, admins can insert/update/delete
CREATE POLICY "Authenticated users can view documents" ON documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert documents" ON documents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update documents" ON documents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete documents" ON documents FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Chunks: authenticated users can read
CREATE POLICY "Authenticated users can view chunks" ON chunks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service role can manage chunks" ON chunks FOR ALL USING (true);

-- Questions: users can view approved, admins can view all
CREATE POLICY "Users can view approved questions" ON questions FOR SELECT TO authenticated USING (
  is_approved = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can manage questions" ON questions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Quiz sessions: users manage own
CREATE POLICY "Users manage own quiz sessions" ON quiz_sessions FOR ALL USING (auth.uid() = user_id);

-- Question attempts: users manage own
CREATE POLICY "Users manage own attempts" ON question_attempts FOR ALL USING (auth.uid() = user_id);

-- Topic mastery: users manage own
CREATE POLICY "Users manage own mastery" ON topic_mastery FOR ALL USING (auth.uid() = user_id);

-- Study plans: users manage own
CREATE POLICY "Users manage own plans" ON study_plans FOR ALL USING (auth.uid() = user_id);

-- Chat: users manage own
CREATE POLICY "Users manage own conversations" ON chat_conversations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own messages" ON chat_messages FOR ALL USING (
  EXISTS (SELECT 1 FROM chat_conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-- ============================================
-- Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, certification_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'a0000000-0000-0000-0000-000000000001'  -- Default to ORM cert
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- Vector similarity search function
-- ============================================
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1024),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 8,
  filter_certification_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  topic TEXT,
  section TEXT,
  page_ref TEXT,
  document_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    chunks.id,
    chunks.content,
    chunks.topic,
    chunks.section,
    chunks.page_ref,
    chunks.document_id,
    1 - (chunks.embedding <=> query_embedding) AS similarity
  FROM chunks
  JOIN documents ON documents.id = chunks.document_id
  WHERE 1 - (chunks.embedding <=> query_embedding) > match_threshold
    AND (filter_certification_id IS NULL OR documents.certification_id = filter_certification_id)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
