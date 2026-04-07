-- Create contact_messages table for storing contact form submissions
CREATE TABLE IF NOT EXISTS contact_messages (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    phone VARCHAR,
    subject VARCHAR NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_contact_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_contact_messages_updated_at();
