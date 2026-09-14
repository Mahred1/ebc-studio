// Channel-name rules, shared by the client (the input in the inventory dialog)
// and the server actions that write the row. Deliberately free of server
// imports so a client component can pull this module in — the prisma-backed
// reads live in lib/channels.ts instead.

export const CHANNEL_NAME_MAX = 60

/** The error for a channel name, or undefined if it's fine. Expects the raw input. */
export function validateChannelName(name: string): string | undefined {
  const trimmed = name.trim()
  if (!trimmed) return "Name is required."
  if (trimmed.length > CHANNEL_NAME_MAX)
    return `Keep the name under ${CHANNEL_NAME_MAX} characters.`
  return undefined
}

/** Postgres unique-violation, surfaced by Prisma. Checked structurally. */
export function isChannelNameTaken(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  )
}