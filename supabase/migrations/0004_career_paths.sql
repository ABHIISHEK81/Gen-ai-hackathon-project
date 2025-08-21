-- Create career_paths table
CREATE TABLE career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] -- Array of skills
);

-- Seed data for career_paths
INSERT INTO career_paths (title, description, required_skills) VALUES
('Frontend Developer', 'Specializes in building the user interface of websites and web applications.', '{"HTML", "CSS", "JavaScript", "React", "Vue.js"}'),
('Backend Developer', 'Focuses on the server-side logic, databases, and APIs that power web applications.', '{"Node.js", "Python", "Java", "SQL", "REST APIs"}'),
('Full-Stack Developer', 'Works on both the frontend and backend of web applications.', '{"HTML", "CSS", "JavaScript", "React", "Node.js", "SQL"}'),
('DevOps Engineer', 'Works on automating the software development lifecycle, including build, test, and deployment.', '{"Docker", "Kubernetes", "CI/CD", "AWS", "Terraform"}'),
('Data Scientist', 'Analyzes and interprets complex data to help organizations make better decisions.', '{"Python", "R", "SQL", "Machine Learning", "Statistics"}'),
('Machine Learning Engineer', 'Designs and builds machine learning models and systems.', '{"Python", "TensorFlow", "PyTorch", "Scikit-learn", "NLP"}');
