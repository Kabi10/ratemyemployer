-- Add the content column
ALTER TABLE reviews
ADD COLUMN content TEXT;

-- Update existing rows with an empty string
UPDATE reviews
SET content = '';

-- Set the NOT NULL constraint
ALTER TABLE reviews
ALTER COLUMN content SET NOT NULL; 