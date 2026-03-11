-- Create receipt_sequences table
CREATE TABLE IF NOT EXISTS receipt_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financial_year TEXT UNIQUE NOT NULL,
    last_number INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Function to generate unique, sequential receipt numbers
CREATE OR REPLACE FUNCTION generate_receipt_number() RETURNS TEXT AS $$
DECLARE
    current_dt TIMESTAMP WITH TIME ZONE := now() AT TIME ZONE 'utc'; -- Using UTC for consistency
    fy_start_year INT;
    fy_end_year INT;
    fy_str TEXT;
    seq_val INT;
BEGIN
    -- Financial year in India starts on April 1st
    -- If month is Jan(1), Feb(2), Mar(3), then FY started in the previous year
    IF EXTRACT(MONTH FROM current_dt) >= 4 THEN
        fy_start_year := EXTRACT(YEAR FROM current_dt);
    ELSE
        fy_start_year := EXTRACT(YEAR FROM current_dt) - 1;
    END IF;
    
    fy_end_year := fy_start_year + 1;
    
    -- Format: YYYY-YY (e.g., 2025-26)
    fy_str := fy_start_year::TEXT || '-' || LPAD((fy_end_year % 100)::TEXT, 2, '0');

    -- Atomic increment using ON CONFLICT logic
    INSERT INTO receipt_sequences (financial_year, last_number)
    VALUES (fy_str, 1)
    ON CONFLICT (financial_year) 
    DO UPDATE SET last_number = receipt_sequences.last_number + 1
    RETURNING last_number INTO seq_val;

    -- Return formatted receipt number: SO/YYYY-YY/XXXX
    RETURN 'SO/' || fy_str || '/' || LPAD(seq_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for unique constraint (already handled by UNIQUE in table definition, but good for performance)
CREATE INDEX IF NOT EXISTS idx_receipt_sequences_fy ON receipt_sequences(financial_year);
