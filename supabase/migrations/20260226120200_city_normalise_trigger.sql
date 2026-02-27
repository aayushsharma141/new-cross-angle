-- Normalise city casing to prevent duplicates like "mumbai" vs "Mumbai"
CREATE OR REPLACE FUNCTION normalise_city() RETURNS TRIGGER AS $$ BEGIN IF NEW.city IS NOT NULL THEN NEW.city = INITCAP(TRIM(NEW.city));
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_normalise_city ON leads;
CREATE TRIGGER trg_normalise_city BEFORE
INSERT
    OR
UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION normalise_city();