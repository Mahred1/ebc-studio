"use client"

import { useTransition } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { toggleChannelHidden } from "./actions"

/**
 * Hides/shows a channel on the reserve form. The action is the plain server
 * post; the page re-reads the flag, so the badge and button label refresh with
 * it, and the result decides which toast the toggle answers with.
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
  const [pending, startTransition] = useTransition()

  function toggle() {
    const formData = new FormData()
    formData.set("id", String(id))
    formData.set("hidden", String(hidden))
    startTransition(async () => {
      try {
        const { ok } = await toggleChannelHidden(formData)
        toast[ok ? "success" : "info"](
          ok
            ? hidden
              ? `${name} is shown on the reserve form again.`
              : `${name} is hidden from the reserve form.`
            : `${name} was already changed elsewhere.`
        )
      } catch {
        toast.error("That didn't go through. Please try again.")
      }
    })
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-label={hidden ? `Show ${name} on the reserve form` : `Hide ${name} from the reserve form`}
      onClick={toggle}
    >
      {hidden ? <EyeOffIcon /> : <EyeIcon />}
      {hidden ? "Show" : "Hide"}
    </Button>
  )
}