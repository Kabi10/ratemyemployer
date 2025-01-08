-- Create timestamp update function
CREATE OR REPLACE FUNCTION update_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        NEW.created_at = timezone('utc'::text, now());
        NEW.updated_at = timezone('utc'::text, now());
    ELSIF TG_OP = 'UPDATE' THEN
        NEW.updated_at = timezone('utc'::text, now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql; 