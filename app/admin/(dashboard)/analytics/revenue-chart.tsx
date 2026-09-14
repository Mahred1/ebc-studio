"use client"

import * as React from "react"

import { CURRENCY } from "@/lib/reservation"
import type { RevenuePoint } from "@/lib/reservations"

// Fixed viewBox that scales to its container (w-full, h-auto), so the tooltip
// positions below are expressed as percentages of W/H and track the render.
const W = 640
const H = 280
const PAD_LEFT = 52
const PAD_RIGHT = 12
const PAD_TOP = 28
const PAD_BOTTOM = 28

function fmtAmount(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`
}

function fmtTooltip(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${CURRENCY.code}`
}

/** Rounds a max value up to a clean axis ceiling: 3 → 5, 12 → 20, 250 → 500... */
function niceCeil(max: number): number {
  const pow = 10 ** Math.floor(Math.log10(max))
  const head = max / pow
  const nice = head <= 1 ? 1 : head <= 2 ? 2 : head <= 5 ? 5 : 10
  return nice * pow
}

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [hover, setHover] = React.useState<number | null>(null)

  const plotW = W - PAD_LEFT - PAD_RIGHT
  const plotH = H - PAD_TOP - PAD_BOTTOM
  const base = PAD_TOP + plotH
  const top = niceCeil(Math.max(...data.map((point) => point.revenue)))
  const step = niceCeil(top / 4)
  const ticks: number[] = []
  for (let v = 0; v <= top; v += step) ticks.push(v)

  const n = data.length
  const slot = plotW / n
  // Per the mark spec: cap bar thickness at 24px and let the slot's leftover be air.
  const barW = Math.max(2, Math.min(24, slot * 0.6))

  const peakIndex = data.reduce(
    (best, point, i) => (point.revenue > data[best].revenue ? i : best),
    0
  )

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Confirmed revenue by month"
      >
        {ticks.map((tick) => {
          const y = base - Math.round((tick / top) * plotH)
          return (
            <g key={tick}>
              <line
                x1={PAD_LEFT}
                y1={y}
                x2={PAD_LEFT + plotW}
                y2={y}
                strokeWidth={1}
                style={{ stroke: "var(--border)" }}
              />
              <text
                x={PAD_LEFT - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                style={{ fill: "var(--muted-foreground)" }}
              >
                {tick.toLocaleString()}
              </text>
            </g>
          )
        })}

        {data.map((point, i) => {
          const height = Math.round((point.revenue / top) * plotH)
          // Quiet month — no bar, just its x label.
          if (height <= 0) return null
          const x = PAD_LEFT + i * slot + (slot - barW) / 2
          const y = base - height
          const r = Math.min(4, height)
          // Top corners rounded, square at the baseline.
          const d = `M${x},${base} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + barW - r},${y} Q${x + barW},${y} ${x + barW},${y + r} L${x + barW},${base} Z`
          return (
            <g
              key={point.period}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <path d={d} style={{ fill: "var(--chart-1)" }} />
              {/* Full-slot hit target — easier to hover than a 24px bar. */}
              <rect
                x={PAD_LEFT + i * slot}
                y={PAD_TOP}
                width={slot}
                height={plotH}
                fill="transparent"
              />
              <title>{`${point.period}: ${fmtTooltip(point.revenue)}`}</title>
            </g>
          )
        })}

        {/* Direct label on the peak bar only — the axis and tooltip carry the rest. */}
        {data[peakIndex].revenue > 0 ? (
          <text
            x={PAD_LEFT + peakIndex * slot + slot / 2}
            y={base - Math.round((data[peakIndex].revenue / top) * plotH) - 8}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            style={{ fill: "var(--muted-foreground)" }}
          >
            {fmtAmount(data[peakIndex].revenue)}
          </text>
        ) : null}

        {data.map((point, i) => (
          <text
            key={point.period}
            x={PAD_LEFT + i * slot + slot / 2}
            y={base + 18}
            textAnchor="middle"
            fontSize={11}
            style={{ fill: "var(--muted-foreground)" }}
          >
            {point.period}
          </text>
        ))}

        {/* Zero-height months have nothing on hover, so the tooltip only shows
            when slides over a real bar. */}
      </svg>

      {hover !== null && data[hover].revenue > 0 ? (
        <div
          className="pointer-events-none absolute select-none rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background"
          style={{
            left: `${((PAD_LEFT + hover * slot + slot / 2) / W) * 100}%`,
            top: `${(base - Math.round((data[hover].revenue / top) * plotH)) / H * 100}%`,
            transform: "translate(-50%, -110%)",
          }}
        >
          {data[hover].period} · {fmtTooltip(data[hover].revenue)}
        </div>
      ) : null}
    </div>
  )
}