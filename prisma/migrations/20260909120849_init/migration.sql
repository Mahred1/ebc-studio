-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('pending', 'confirmed', 'declined');

-- CreateTable
CREATE TABLE "StudioReservation" (
    "id" SERIAL NOT NULL,
    "referenceNo" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "bid" DECIMAL(12,2) NOT NULL,
    "status" "ReservationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudioReservation_referenceNo_key" ON "StudioReservation"("referenceNo");

-- CreateIndex
CREATE INDEX "StudioReservation_email_idx" ON "StudioReservation"("email");

-- CreateIndex
CREATE INDEX "StudioReservation_channel_idx" ON "StudioReservation"("channel");

-- Seed the referenceNo sequence so the first reservation gets reference
-- RES-10001, matching the 5-digit references the lookup form already accepts.
SELECT setval(pg_get_serial_sequence('"StudioReservation"', 'referenceNo'), 10000, true);
