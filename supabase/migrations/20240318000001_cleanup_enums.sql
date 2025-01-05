-- Drop the duplicate enum if no tables are using it
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE data_type = 'employment_status_type'
    ) THEN
        DROP TYPE IF EXISTS employment_status_type;
    END IF;
END $$; 