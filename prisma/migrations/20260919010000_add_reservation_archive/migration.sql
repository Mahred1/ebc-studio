-- Adds an admin archive state to reservations.
--
-- `archived` marks a reservation an admin set aside from the bookings page.
-- Archived rows drop out of email lookups (getReservationsByEmail), but stay
-- reachable by their reference code, which then shows an "archived by
-- administrator" notice. `archivedAt` records when the admin archived it and is
-- null while the reservation is active.

ALTER TABLE "StudioReservation"
  ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "StudioReservation_archived_idx" ON "StudioReservation"("archived");