-- Tracks who canceled a reservation and what reinstating should restore.
--
-- `canceledByUser` marks a cancellation made by the booker on the
-- check-reservation page. The check-reservation page shows a "Reinstate"
-- control only for canceled rows where this is true — admin-canceled rows keep
-- the default false and so have no user-facing reinstate path.
--
-- `reopenStatus` records the status the reservation had right before the booker
-- canceled it (pending or confirmed), so reinstating can restore it exactly.
-- It's null for rows that were never user-canceled, and is cleared again when a
-- reservation is reinstated.

ALTER TABLE "StudioReservation"
  ADD COLUMN "canceledByUser" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "reopenStatus" "ReservationStatus";