"use client"

import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toggleChannelHidden } from "./actions"

/**
 * Hides/shows a channel on the reserve form. The action is a plain form post;
 * the page re-reads the flag, so the badge and button label refresh with it.
 */
export function ChannelVisibilityButton({
  id,
  hidden,
  name,
}: {
  id: number
  hidden: boolean
  name: string
}) {
  return (
    <form action={toggleChannelHidden}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="hidden" value={hidden ? "true" : "false"} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        aria-label={hidden ? `Show ${name} on the reserve form` : `Hide ${name} from the reserve form`}
      >
        {hidden ? <EyeOffIcon /> : <EyeIcon />}
        {hidden ? "Show" : "Hide"}
      </Button>
    </form>
  )
}