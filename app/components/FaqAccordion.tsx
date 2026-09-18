'use client'

import { useState } from 'react'

const items = [
  { q: 'How far in advance do I need to book?', a: 'Same-day is possible when channels are open. For prime slots (mornings, weekends), book 2–3 days ahead.' },
  { q: 'Can I cancel or reschedule?', a: 'Yes — use your reservation ID at /check-reservation to view or modify. Changes must be made at least 4 hours before your slot.' },
  { q: 'Is parking available?', a: 'Yes — visitor parking is available at the main EBC compound. Arrive 15 minutes early to settle in.' },
  { q: 'What equipment is included?', a: 'Broadcast cameras, professional audio, lighting rigs, and a crew operator. Special gear can be requested at booking.' },
]

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="mt-12 space-y-4">
      {items.map((faq, i) => (
        <div key={faq.q} className="rounded-2xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-muted/30 transition-colors"
            aria-expanded={open === i}
            aria-controls={`faq-${i}`}
          >
            <h3 className="font-semibold text-lg tracking-tight">{faq.q}</h3>
            <span className={`ml-4 text-2xl leading-none text-muted-foreground transition-transform duration-200 ${open === i ? 'rotate-45' : ''}`} aria-hidden="true">+</span>
          </button>
          <div id={`faq-${i}`} className={`px-6 pb-5 text-muted-foreground leading-relaxed ${open === i ? 'block' : 'hidden'}`}>
            {faq.a}
          </div>
        </div>
      ))}
    </div>
  )
}
