-- Replace the enumerable, sequential public reference with an unguessable,
-- uniformly random code so a reference can't be guessed to view or cancel
-- someone else's reservation.
--
-- This is a multi-step backfill, not the single additive ALTER Prisma would
-- generate, because existing rows already carry RES-10001-style references
-- that must each be exchanged for a fresh random code before the column can be
-- made NOT NULL.

-- 1. Add the new column temporarily nullable.
ALTER TABLE "StudioReservation" ADD COLUMN "code" TEXT;

-- 2. Hand every existing row a fresh code. Codes are 7 symbols from a
--    32-symbol alphabet (digits + A-Z minus I/L/O/U, the shapes people mis-
--    read), so each new reference is uniformly random over 32^7 possibilities.
--    Postgres' random() is not a CSPRNG, but this only allocates codes for the
--    rows that exist today — every future reservation draws its code from
--    node:crypto in insertReservation (lib/reservations.ts), never from here.
DO $$
DECLARE
  chars CONSTANT TEXT := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  reservation_id INT;
  candidate TEXT;
  guard INT;
BEGIN
  FOR reservation_id IN SELECT id FROM "StudioReservation" LOOP
    guard := 0;
    LOOP
      candidate := (
        SELECT string_agg(substr(chars, 1 + floor(random() * 32)::int, 1), '')
        FROM generate_series(1, 7)
      );
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM "StudioReservation" WHERE "code" = candidate AND "id" <> reservation_id
      ) OR guard > 12;
      guard := guard + 1;
    END LOOP;
    UPDATE "StudioReservation" SET "code" = candidate WHERE "id" = reservation_id;
  END LOOP;
END $$;

-- 3. Every row now has a code, so it's required and unique.
ALTER TABLE "StudioReservation" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "StudioReservation_code_key" ON "StudioReservation"("code");

-- 4. The sequential numeric references are gone — no more enumerable ids a
--    stranger could try until one cancels someone else's booking. Dropping the
--    column also drops the serial sequence that owned it.
DROP INDEX IF EXISTS "StudioReservation_referenceNo_key";
ALTER TABLE "StudioReservation" DROP COLUMN "referenceNo";
DROP SEQUENCE IF EXISTS "StudioReservation_referenceNo_seq";