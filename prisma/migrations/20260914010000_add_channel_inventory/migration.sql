-- The channel inventory. Seeded with the five channels the reserve form used
-- to hardcode, so the dropdown keeps working the day this ships and existing
-- reservation rows keep mapping to a real channel. The same migration rewrites
-- those legacy rows: the form used to store slugs (tv1, news, ...) and now
-- stores the channel's display name, so past values are upgraded in place.

CREATE TABLE "ChannelInventory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "addedBy" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChannelInventory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ChannelInventory_name_key" ON "ChannelInventory"("name");
CREATE INDEX "ChannelInventory_hidden_idx" ON "ChannelInventory"("hidden");

INSERT INTO "ChannelInventory" ("name", "addedBy", "updatedAt") VALUES
    ('TV1',             'system', now()),
    ('TV2',             'system', now()),
    ('TV3',             'system', now()),
    ('EBC News',        'system', now()),
    ('EBC Entertainment','system', now());

-- Upgrade legacy reservation channel slugs to the display names seeded above,
-- so the stored value matches what the reserve dropdown now records.
UPDATE "StudioReservation"
SET "channel" = CASE "channel"
    WHEN 'tv1'          THEN 'TV1'
    WHEN 'tv2'          THEN 'TV2'
    WHEN 'tv3'          THEN 'TV3'
    WHEN 'news'         THEN 'EBC News'
    WHEN 'entertainment' THEN 'EBC Entertainment'
    ELSE "channel"
END;