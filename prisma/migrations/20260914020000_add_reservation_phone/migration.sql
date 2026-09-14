-- Adds the phone field to reservations. Nullable: rows booked before this
-- column existed keep phone NULL, and the display shows a placeholder for them;
-- new reservations must provide the 9 digits after +251 (validated in
-- lib/reservation.ts and stored in canonical "+2519XXXXXXXX" form).

ALTER TABLE "StudioReservation" ADD COLUMN "phone" TEXT;