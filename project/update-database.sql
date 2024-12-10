-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    time TIME,
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'SHOWN', 'DISMISSED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_family ON reminders(family_id);
CREATE INDEX IF NOT EXISTS idx_reminders_date ON reminders(date);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

-- Add RLS policies
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Allow users to view reminders for their families
CREATE POLICY "Users can view family reminders"
ON reminders FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.family_id = reminders.family_id
        AND family_members.user_id = auth.uid()
    )
);

-- Allow users to create reminders for their families
CREATE POLICY "Users can create reminders for their families"
ON reminders FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.family_id = family_id
        AND family_members.user_id = auth.uid()
    )
);

-- Allow users to update their own reminders
CREATE POLICY "Users can update their own reminders"
ON reminders FOR UPDATE
USING (user_id = auth.uid());

-- Allow users to delete their own reminders
CREATE POLICY "Users can delete their own reminders"
ON reminders FOR DELETE
USING (user_id = auth.uid());