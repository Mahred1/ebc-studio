-- Adds reservation scheduling: what kind of spot is booked and which days it
-- occupies the picked channel.
--
-- `reservationType` is `recording` (studio session that needs a recording day)
-- or `live` (a live event that airs without recording). `recordingDate` is the
-- day the studio records — null for live events, which is why it stays
-- nullable — and `broadcastDate` is the day the program airs, present on every
-- reservation. Both dates are DATE (day-level, no time of day).
--
-- Required columns have no default because there is no legacy data; new rows
-- always supply them.

-- CreateEnum
CREATE TYPE "ReservationType" AS ENUM ('recording', 'live');

-- AlterTable
ALTER TABLE "StudioReservation" ADD COLUMN     "broadcastDate" DATE NOT NULL,
ADD COLUMN     "recordingDate" DATE,
ADD COLUMN     "reservationType" "ReservationType" NOT NULL;