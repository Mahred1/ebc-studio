-- Adds the `canceled` status. A confirmed reservation can be canceled from the
-- admin Bookings page; canceled rows sit grayed out in the list. Adding an enum
-- value in Postgres needs no table rewrite.

ALTER TYPE "ReservationStatus" ADD VALUE 'canceled';