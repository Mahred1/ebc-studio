import type { Metadata } from "next"
import { cn } from "cn"

import { Badge } from "@/components/ui/badge"
import { requireAdmin } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AddChannelDialog, EditChannelDialog } from "./channel-dialog"
import { ChannelVisibilityButton } from "./channel-toggle"
import { DeleteChannelButton } from "./delete-channel-button"

export const metadata: Metadata = {
  title: "Inventory | EBC Studio Admin",
  robots: { index: false, follow: false },
}

// The reserve form dropdown reads this table on every request, and the actions
// below rewrite it — force-dynamic so the list can't go stale behind a build.
export const dynamic = "force-dynamic"

export default async function AdminInventoryPage() {
  await requireAdmin()
  const channels = await prisma.channelInventory.findMany({
    orderBy: { name: "asc" },
  })

  const visibleCount = channels.filter((channel) => !channel.hidden).length

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-primary">Inventory</h1>
          <p className="text-muted-foreground">
            The channels the reserve form offers. Hide a channel to drop it
            from the form without losing its past reservations.
          </p>
        </div>
        <AddChannelDialog />
      </header>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-4">
          <h2 className="text-sm font-semibold">Channels</h2>
          <p className="text-sm text-muted-foreground">
            {channels.length}{" "}
            {channels.length === 1 ? "channel" : "channels"} —{" "}
            {visibleCount} on the reserve form
          </p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-[0.625rem] uppercase tracking-[0.18em] text-muted-foreground">
              <th scope="col" className="px-5 py-3 font-semibold">
                Channel
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Added by
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Added
              </th>
              <th scope="col" className="px-5 py-3 font-semibold">
                Status
              </th>
              <th scope="col" className="px-5 py-3 text-right font-semibold">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {channels.map((channel) => (
              <tr
                key={channel.id}
                className={cn(
                  "border-b last:border-0",
                  channel.hidden && "text-muted-foreground/70"
                )}
              >
                <td className="px-5 py-4">
                  <span className="font-medium">{channel.name}</span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {channel.addedBy}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {channel.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-5 py-4">
                  {channel.hidden ? (
                    <Badge variant="outline">Hidden</Badge>
                  ) : (
                    <Badge variant="secondary">Visible</Badge>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <ChannelVisibilityButton
                      id={channel.id}
                      hidden={channel.hidden}
                      name={channel.name}
                    />
                    <EditChannelDialog id={channel.id} name={channel.name} />
                    <DeleteChannelButton id={channel.id} name={channel.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {channels.length === 0 ? (
          <p className="px-5 py-4 text-sm text-muted-foreground">
            No channels yet — add the first one to open the reserve form.
          </p>
        ) : null}
      </section>
    </div>
  )
}