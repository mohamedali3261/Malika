ALTER TABLE admins ADD COLUMN role TEXT NOT NULL DEFAULT 'owner' CHECK(role IN ('owner','orders'));
