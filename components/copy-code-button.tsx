"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CopyCodeButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? "Copied" : "Copy reservation code"}
      title="Copy reservation code"
      // navigator.clipboard needs a secure context. If it isn't there the
      // button does nothing visible and the code below is still selectable.
      onClick={() =>
        navigator.clipboard.writeText(value).then(
          () => setCopied(true),
          () => {}
        )
      }
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}