-- Users table
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  age INTEGER CHECK (age >= 10 AND age <= 100),
  class_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
  profile_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
  subject_preference VARCHAR(100),
  study_field VARCHAR(100),
  target_exam VARCHAR(50),
  interests TEXT[],
  avatar_url VARCHAR(255)
);

-- Exams table
CREATE TABLE exams (
  exam_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  exam_type VARCHAR(50) NOT NULL,
  exam_name VARCHAR(200) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(200),
  total_questions INTEGER NOT NULL,
  duration_minutes INTEGER,
  marking_scheme JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- Questions table
CREATE TABLE questions (
  question_id SERIAL PRIMARY KEY,
  exam_id INTEGER REFERENCES exams(exam_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) CHECK (correct_answer IN ('A','B','C','D')),
  explanation TEXT,
  difficulty VARCHAR(20),
  tags TEXT[]
);

-- Quiz sessions table
CREATE TABLE quiz_sessions (
  session_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  exam_id INTEGER REFERENCES exams(exam_id) ON DELETE CASCADE,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  total_score INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'IN_PROGRESS'
);

-- User answers table
CREATE TABLE user_answers (
  answer_id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(question_id) ON DELETE CASCADE,
  selected_answer CHAR(1),
  is_correct BOOLEAN,
  time_taken_seconds INTEGER,
  answered_at TIMESTAMP DEFAULT NOW()
);

-- User progress table
CREATE TABLE user_progress (
  progress_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(200),
  total_attempted INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL(5,2),
  weak_areas TEXT[],
  last_practiced TIMESTAMP
);

-- Badges table
CREATE TABLE badges (
  badge_id SERIAL PRIMARY KEY,
  badge_name VARCHAR(100) NOT NULL UNIQUE,
  badge_type VARCHAR(20) NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL,
  icon_url VARCHAR(255),
  points INTEGER DEFAULT 0
);

-- User badges table
CREATE TABLE user_badges (
  user_badge_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  badge_id INTEGER REFERENCES badges(badge_id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  is_claimed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, badge_id)
);

-- Leaderboard table
CREATE TABLE leaderboard (
  leaderboard_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  total_exams INTEGER DEFAULT 0,
  average_score DECIMAL(5,2),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_exams_user ON exams(user_id);
CREATE INDEX idx_questions_exam ON questions(exam_id);
CREATE INDEX idx_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_answers_session ON user_answers(session_id);
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_leaderboard_points ON leaderboard(total_points DESC);

-- Default badges
INSERT INTO badges (badge_name, badge_type, description, criteria, points) VALUES
  ('First Steps', 'CIRCLE', 'Complete your first 5 exams', '{"min_exams": 5}', 50),
  ('Rising Star', 'SQUARE', 'Score 70%+ in 10 exams', '{"min_exams": 10, "min_accuracy": 70}', 150),
  ('Streak Master', 'STAR', 'Maintain a 7-day practice streak', '{"min_streak": 7}', 300),
  ('Champion', 'TROPHY', 'Reach Top 10 on the leaderboard', '{"max_rank": 10}', 500);

-- Question Bank for pre-loaded questions
CREATE TABLE question_bank (
  bank_question_id SERIAL PRIMARY KEY,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(200),
  subtopic VARCHAR(200),
  difficulty VARCHAR(20) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer CHAR(1) CHECK (correct_answer IN ('A','B','C','D')),
  explanation TEXT,
  tags TEXT[],
  source VARCHAR(100), -- e.g., "NEET 2023", "JEE 2022"
  year INTEGER,
  exam_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- PYQ Papers storage
CREATE TABLE pyq_papers (
  paper_id SERIAL PRIMARY KEY,
  exam_type VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  paper_name VARCHAR(200) NOT NULL,
  total_questions INTEGER,
  duration_minutes INTEGER,
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Link PYQ papers to questions
CREATE TABLE pyq_questions (
  pyq_question_id SERIAL PRIMARY KEY,
  paper_id INTEGER REFERENCES pyq_papers(paper_id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  bank_question_id INTEGER REFERENCES question_bank(bank_question_id)
);

-- Question sets/modules
CREATE TABLE question_sets (
  set_id SERIAL PRIMARY KEY,
  set_name VARCHAR(200) NOT NULL,
  set_description TEXT,
  subject VARCHAR(100) NOT NULL,
  topic VARCHAR(200),
  difficulty VARCHAR(20),
  total_questions INTEGER,
  created_by INTEGER REFERENCES users(user_id),
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Link sets to questions
CREATE TABLE set_questions (
  set_question_id SERIAL PRIMARY KEY,
  set_id INTEGER REFERENCES question_sets(set_id) ON DELETE CASCADE,
  bank_question_id INTEGER REFERENCES question_bank(bank_question_id),
  question_order INTEGER
);

-- User favorite questions
CREATE TABLE favorite_questions (
  favorite_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  bank_question_id INTEGER REFERENCES question_bank(bank_question_id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, bank_question_id)
);

-- Study notes per question
CREATE TABLE question_notes (
  note_id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
  bank_question_id INTEGER REFERENCES question_bank(bank_question_id),
  note_content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_question_bank_subject ON question_bank(subject);
CREATE INDEX idx_question_bank_topic ON question_bank(topic);
CREATE INDEX idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX idx_question_bank_exam_type ON question_bank(exam_type);
CREATE INDEX idx_pyq_papers_exam_year ON pyq_papers(exam_type, year);
CREATE INDEX idx_question_sets_subject ON question_sets(subject);

-- Sample data for question bank
INSERT INTO question_bank (subject, topic, subtopic, difficulty, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, tags, exam_type, year, source) VALUES
-- Biology Questions
('Biology', 'Cell Biology', 'Cell Organelles', 'EASY', 'Which organelle is known as the powerhouse of the cell?', 'Nucleus', 'Mitochondria', 'Ribosome', 'Golgi apparatus', 'B', 'Mitochondria produce ATP through cellular respiration, providing energy for cellular processes.', ARRAY['cell-biology', 'organelles', 'mitochondria'], 'NEET', 2023, 'NEET 2023'),
('Biology', 'Cell Biology', 'Cell Structure', 'MEDIUM', 'What is the function of ribosomes in a cell?', 'Energy production', 'Protein synthesis', 'DNA replication', 'Lipid storage', 'B', 'Ribosomes are responsible for protein synthesis by translating mRNA into polypeptide chains.', ARRAY['cell-biology', 'ribosomes', 'protein-synthesis'], 'NEET', 2023, 'NEET 2023'),
('Biology', 'Genetics', 'DNA Structure', 'HARD', 'Which of the following is NOT a component of DNA?', 'Adenine', 'Guanine', 'Uracil', 'Thymine', 'C', 'Uracil is found in RNA, not DNA. DNA contains Adenine, Guanine, Cytosine, and Thymine.', ARRAY['genetics', 'dna', 'nucleotides'], 'NEET', 2022, 'NEET 2022'),
('Biology', 'Human Physiology', 'Circulatory System', 'MEDIUM', 'What is the normal human body temperature in Celsius?', '35°C', '37°C', '39°C', '40°C', 'B', 'The normal human body temperature is approximately 37°C (98.6°F).', ARRAY['physiology', 'temperature'], 'NEET', 2023, 'NEET 2023'),

-- Physics Questions
('Physics', 'Mechanics', 'Newton''s Laws', 'EASY', 'What is Newton''s second law of motion?', 'F = ma', 'E = mc²', 'V = IR', 'PV = nRT', 'A', 'Newton''s second law states that Force equals mass times acceleration (F = ma).', ARRAY['mechanics', 'newton-laws', 'force'], 'JEE', 2023, 'JEE Main 2023'),
('Physics', 'Electricity', 'Ohm''s Law', 'MEDIUM', 'According to Ohm''s law, if voltage increases and resistance remains constant, what happens to current?', 'Decreases', 'Increases', 'Remains same', 'Becomes zero', 'B', 'According to V = IR, if V increases and R is constant, I must increase proportionally.', ARRAY['electricity', 'ohms-law', 'current'], 'JEE', 2023, 'JEE Main 2023'),
('Physics', 'Thermodynamics', 'Laws of Thermodynamics', 'HARD', 'Which law of thermodynamics states that entropy of an isolated system always increases?', 'Zeroth Law', 'First Law', 'Second Law', 'Third Law', 'C', 'The Second Law of Thermodynamics states that entropy of an isolated system tends to increase over time.', ARRAY['thermodynamics', 'entropy', 'laws'], 'JEE', 2022, 'JEE Advanced 2022'),

-- Chemistry Questions
('Chemistry', 'Organic Chemistry', 'Hydrocarbons', 'EASY', 'What is the molecular formula of methane?', 'CH₄', 'C₂H₆', 'C₃H₈', 'C₄H₁₀', 'A', 'Methane is the simplest hydrocarbon with one carbon atom and four hydrogen atoms (CH₄).', ARRAY['organic-chemistry', 'hydrocarbons', 'methane'], 'NEET', 2023, 'NEET 2023'),
('Chemistry', 'Inorganic Chemistry', 'Periodic Table', 'MEDIUM', 'What is the atomic number of Carbon?', '4', '6', '8', '12', 'B', 'Carbon has 6 protons in its nucleus, giving it an atomic number of 6.', ARRAY['periodic-table', 'elements', 'carbon'], 'NEET', 2023, 'NEET 2023'),
('Chemistry', 'Physical Chemistry', 'Chemical Bonding', 'HARD', 'Which type of bond is formed when electrons are shared between atoms?', 'Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond', 'B', 'A covalent bond is formed when two atoms share one or more pairs of electrons.', ARRAY['bonding', 'covalent', 'molecular'], 'JEE', 2022, 'JEE Main 2022'),

-- Mathematics Questions
('Mathematics', 'Algebra', 'Quadratic Equations', 'EASY', 'What is the value of x in the equation x² = 16?', '2', '4', '±4', '8', 'C', 'Taking square root of both sides: x = ±√16 = ±4. Both +4 and -4 are valid solutions.', ARRAY['algebra', 'quadratic', 'equations'], 'JEE', 2023, 'JEE Main 2023'),
('Mathematics', 'Calculus', 'Differentiation', 'MEDIUM', 'What is the derivative of x³?', 'x²', '2x²', '3x²', '3x³', 'C', 'Using the power rule: d/dx(xⁿ) = n·xⁿ⁻¹, so d/dx(x³) = 3x².', ARRAY['calculus', 'derivatives', 'differentiation'], 'JEE', 2023, 'JEE Main 2023'),
('Mathematics', 'Trigonometry', 'Trigonometric Ratios', 'MEDIUM', 'What is the value of sin(90°)?', '0', '0.5', '1', '√2', 'C', 'At 90°, the sine function reaches its maximum value of 1.', ARRAY['trigonometry', 'ratios', 'sine'], 'JEE', 2023, 'JEE Main 2023'),
('Mathematics', 'Geometry', 'Circles', 'HARD', 'What is the formula for the area of a circle?', 'πr', 'πr²', '2πr', 'πd', 'B', 'The area of a circle is π times the radius squared (A = πr²).', ARRAY['geometry', 'circles', 'area'], 'JEE', 2022, 'JEE Advanced 2022'),

-- General Knowledge
('General Knowledge', 'Indian History', 'Freedom Struggle', 'EASY', 'Who is known as the Father of the Nation in India?', 'Jawaharlal Nehru', 'Mahatma Gandhi', 'Sardar Patel', 'Subhash Chandra Bose', 'B', 'Mahatma Gandhi is honored as the Father of the Nation for his leadership in India''s independence movement.', ARRAY['history', 'freedom-struggle', 'gandhi'], 'UPSC', 2023, 'UPSC Prelims 2023'),
('General Knowledge', 'Geography', 'Indian Geography', 'MEDIUM', 'Which is the longest river in India?', 'Yamuna', 'Brahmaputra', 'Ganga', 'Godavari', 'C', 'The Ganga (Ganges) is the longest river in India, flowing for approximately 2,525 km.', ARRAY['geography', 'rivers', 'india'], 'UPSC', 2023, 'UPSC Prelims 2023'),
('General Knowledge', 'Current Affairs', 'International', 'MEDIUM', 'Which country hosted the G20 Summit in 2023?', 'Indonesia', 'India', 'Brazil', 'South Africa', 'B', 'India held the presidency of the G20 and hosted the summit in New Delhi in September 2023.', ARRAY['current-affairs', 'g20', 'international'], 'UPSC', 2023, 'Current Affairs 2023');

-- Sample PYQ Papers
INSERT INTO pyq_papers (exam_type, subject, year, paper_name, total_questions, duration_minutes) VALUES
('NEET', 'Biology', 2023, 'NEET 2023 Biology', 90, 180),
('NEET', 'Chemistry', 2023, 'NEET 2023 Chemistry', 45, 180),
('NEET', 'Physics', 2023, 'NEET 2023 Physics', 45, 180),
('JEE', 'Mathematics', 2023, 'JEE Main 2023 Mathematics', 30, 180),
('JEE', 'Physics', 2023, 'JEE Main 2023 Physics', 30, 180),
('UPSC', 'General Studies', 2023, 'UPSC Prelims 2023 GS Paper 1', 100, 120);

-- Sample Question Sets
INSERT INTO question_sets (set_name, set_description, subject, topic, difficulty, total_questions, is_public) VALUES
('NEET Biology Basics', 'Essential biology questions for NEET preparation', 'Biology', 'Cell Biology', 'MEDIUM', 10, TRUE),
('JEE Physics Foundation', 'Foundation level physics questions', 'Physics', 'Mechanics', 'EASY', 15, TRUE),
('Advanced Calculus Practice', 'Challenging calculus problems for JEE Advanced', 'Mathematics', 'Calculus', 'HARD', 20, TRUE);