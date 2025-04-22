-- db/schema.sql
-- Schema for the hackathon application system
-- This schema focuses on the 'applications' table which stores all user application data.

-- Create applications table
-- This table stores all hackathon applications with their current status and details
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE, -- Clerk Auth user ID (unique per user)
    legal_name VARCHAR(255),      -- Applicant's legal name
    email VARCHAR(255),           -- Applicant's email address
    university VARCHAR(255),      -- Applicant's university or school
    major VARCHAR(255),           -- Applicant's field of study
    graduation_year VARCHAR(10),  -- Expected graduation year
    experience VARCHAR(50),       -- Level of coding/hackathon experience
    why_attend TEXT,              -- Reason for wanting to attend
    project_experience TEXT,      -- Past project experience
    future_plans TEXT,            -- Career goals and aspirations
    fun_fact TEXT,                -- Fun fact about the applicant
    self_description VARCHAR(50), -- How applicant describes themselves
    links TEXT,                   -- Portfolio, GitHub, LinkedIn URLs
    teammates TEXT,               -- Potential teammates (optional)
    referral_email VARCHAR(255),  -- Referral source (optional)
    dietary_restrictions TEXT,    -- Dietary needs (optional)
    agree_to_terms BOOLEAN NOT NULL DEFAULT false, -- Agreement to terms & conditions
    status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- Application status: not_started, in_progress, submitted, accepted, rejected, confirmed
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- When the application was first created
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- When the application was last updated
);

-- Add index on user_id for faster lookups since all queries are by user_id
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Create trigger function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to the applications table
CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Add comment to the applications table for better documentation
COMMENT ON TABLE applications IS 'Stores all hackathon applications and their statuses';
COMMENT ON COLUMN applications.user_id IS 'Clerk Auth user ID';
COMMENT ON COLUMN applications.status IS 'Application status: not_started, in_progress, submitted, accepted, rejected, confirmed'; 