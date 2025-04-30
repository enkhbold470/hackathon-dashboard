-- Updated applications table for DAHacks portal
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE, -- Clerk Auth user ID

    -- From personalInfo
    cwid TEXT NOT NULL,
    full_name TEXT NOT NULL,
    discord TEXT NOT NULL,
    skill_level TEXT NOT NULL,
    hackathon_experience TEXT NOT NULL,
    dietary_restrictions TEXT,
    hear_about_us TEXT NOT NULL,

    -- From aboutYou
    why_attend TEXT NOT NULL,
    project_experience TEXT NOT NULL,
    future_plans TEXT NOT NULL,
    fun_fact TEXT NOT NULL,
    self_description TEXT NOT NULL,

    -- From additionalInfo
    links TEXT,
    teammates TEXT,
    referral_email TEXT,
    dietary_restrictions_extra TEXT,
    agree_to_terms BOOLEAN NOT NULL DEFAULT false,

    -- Meta
    status VARCHAR(50) NOT NULL DEFAULT 'not_started', -- not_started, in_progress, submitted, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user lookup
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE applications IS 'Stores all DAHacks applications and their statuses';
COMMENT ON COLUMN applications.status IS 'Application status: not_started, in_progress, submitted, accepted, rejected, confirmed';
