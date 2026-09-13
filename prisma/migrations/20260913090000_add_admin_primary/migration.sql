-- Adds the primary-admin flag. Existing rows are kept as-is; the oldest one
-- (the account seeded by the old create-admin CLI script) becomes primary, so
-- there is always exactly one account that can delete admins.
ALTER TABLE "Admin" ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Admin" SET "isPrimary" = true
WHERE "id" = (SELECT MIN("id") FROM "Admin");
