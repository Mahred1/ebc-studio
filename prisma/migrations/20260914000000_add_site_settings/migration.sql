-- Runtime site flags. A single row (id 1) that the settings toggle updates and
-- the reserve flow reads; the row exists from day one so reads can assume it.
CREATE TABLE "SiteSettings" (
  "id" INTEGER NOT NULL,
  "reservationsPaused" BOOLEAN NOT NULL DEFAULT false,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SiteSettings" ("id", "updatedAt") VALUES (1, now());