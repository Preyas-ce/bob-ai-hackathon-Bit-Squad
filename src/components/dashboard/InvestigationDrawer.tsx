import React from 'react'
import { useState, type ReactNode } from 'react'
import type { Incident, Severity, CorrelatedAlert, CorrelationEvidence, BlufContent, MitreTechnique } from '../../types/incident'
import { calculateThreatScore } from '../../utils/threatScore'

// ── Severity helpers ──────────────────────────────────────────────────────────

function severityBadgeClasses(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-950 text-red-300 border border-red-700'
    case 'HIGH':     return 'bg-orange-950 text-orange-300 border border-orange-700'
    case 'MEDIUM':   return 'bg-yellow-950 text-yellow-300 border border-yellow-700'
    case 'LOW':      return 'bg-green-950 text-green-300 border border-green-800'
  }
}

function severityBarClasses(severity: Severity): string {
  switch (severity) {
    case 'CRITICAL': return 'bg-red-500'
    case 'HIGH':     return 'bg-orange-400'
    case 'MEDIUM':   return 'bg-yellow-400'
    case 'LOW':      return 'bg-green-500'
  }
}

function scoreColor(total: number): string {
  if (total >= 80) return 'text-red-400'
  if (total >= 55) return 'text-orange-400'
  if (total >= 35) return 'text-yellow-400'
  return 'text-slate-400'
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Reusable section divider with heading ─────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  return (
    <h3 className="text-xs text-slate-500 uppercase tracking-[0.15em] font-bold mb-3 pt-4 border-t border-slate-800">
      {children}
    </h3>
  )
}

// ── Collapsible secondary section ─────────────────────────────────────────────
// Used for Correlated Alerts, Timeline, MITRE, and Recommendations.
// Always starts collapsed so the primary sections dominate on open.

interface CollapsibleSectionProps {
  id: string
  label: string
  openSections: Set<string>
  onToggle: (id: string) => void
  children: ReactNode
}

function CollapsibleSection({ id, label, openSections, onToggle, children }: CollapsibleSectionProps) {
  const isOpen = openSections.has(id)
  return (
    <div className="border-t border-slate-800">
      <button
        type="button"
        onClick={() => onToggle(id)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between px-0 py-3 text-left"
      >
        <span className="text-xs text-slate-500 uppercase tracking-[0.15em] font-bold">{label}</span>
        <span className="text-slate-600 text-xs">{isOpen ? '▲ collapse' : '▼ expand'}</span>
      </button>
      {isOpen && <div className="pb-3">{children}</div>}
    </div>
  )
}

// ── Alert severity badge ──────────────────────────────────────────────────────

function AlertBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide flex-shrink-0 ${severityBadgeClasses(severity)}`}>
      {severity}
    </span>
  )
}

// ── Correlated alerts list ────────────────────────────────────────────────────

function AlertTable({ alerts }: { alerts: CorrelatedAlert[] }) {
  return (
    <div className="space-y-1.5">
      {alerts.map(alert => (
        <div key={alert.id} className="flex gap-2 bg-slate-800/60 rounded px-3 py-2 text-xs items-start">
          <span className="text-slate-500 font-mono w-16 flex-shrink-0 pt-0.5">{alert.id}</span>
          <AlertBadge severity={alert.severity} />
          <span className="text-slate-400 flex-shrink-0 pt-0.5">{formatTimestamp(alert.timestamp)}</span>
          <span className="text-slate-300 flex-1 pt-0.5">{alert.description}</span>
        </div>
      ))}
    </div>
  )
}

// ── Correlation accordion ─────────────────────────────────────────────────────

function CorrelationAccordion({ items }: { items: CorrelationEvidence[] }) {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set())

  function toggle(idx: number) {
    setOpenIndices(prev => {
      const next = new Set(prev)
      if (next.has(idx)) { next.delete(idx) } else { next.add(idx) }
      return next
    })
  }

  return (
    <div className="space-y-1">
      {items.map((item, idx) => {
        const isOpen = openIndices.has(idx)
        return (
          <div key={idx} className="rounded border border-slate-700 overflow-hidden">
            <button
              type="button"
              onClick={() => toggle(idx)}
              aria-expanded={isOpen}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <span className="text-cyan-600 text-xs flex-shrink-0">{isOpen ? '▼' : '▶'}</span>
              <span className="flex-1 text-xs text-slate-200 font-semibold">{item.factor}</span>
              <span className="text-xs text-slate-600">{isOpen ? 'collapse' : 'expand'}</span>
            </button>
            {isOpen && (
              <div className="px-4 py-3 bg-slate-900 space-y-2.5">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Evidence</p>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.evidence}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Why it matters</p>
                  <p className="text-xs text-slate-400 leading-relaxed italic">{item.whyItMatters}</p>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── BLUF panel ────────────────────────────────────────────────────────────────

function BlufPanel({ bluf }: { bluf: BlufContent }) {
  const fields: { label: string; text: string }[] = [
    { label: 'What Happened',      text: bluf.whatHappened },
    { label: 'Why It Matters',     text: bluf.whyItMatters },
    { label: 'Current Assessment', text: bluf.currentAssessment },
  ]
  return (
    <div className="rounded-lg border-l-2 border-cyan-600 bg-slate-900 divide-y divide-slate-800">
      {fields.map(({ label, text }) => (
        <div key={label} className="px-4 py-2.5">
          <p className="text-xs text-cyan-500 uppercase tracking-widest font-bold mb-1">{label}</p>
          <p className="text-xs text-slate-300 leading-relaxed">{text}</p>
        </div>
      ))}
    </div>
  )
}

// ── Threat score panel ────────────────────────────────────────────────────────

function DrawerScorePanel({ incident }: { incident: Incident }) {
  const { total, breakdown } = calculateThreatScore(incident)

  const rows: [string, number, number][] = [
    ['Severity',    breakdown.severity,          25],
    ['Confidence',  breakdown.confidence,        25],
    ['Correlation', breakdown.correlation,       20],
    ['Reliability', breakdown.sourceReliability, 15],
    ['MITRE',       breakdown.mitreEvidence,     15],
  ]

  return (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      {/* Score number — dominant visual anchor */}
      <div className="flex items-end gap-2 mb-1">
        <span className={`text-5xl font-bold tabular-nums leading-none ${scoreColor(total)}`}>
          {total}
        </span>
        <span className="text-slate-500 text-lg font-normal mb-1">/100</span>
      </div>
      <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-3">
        Explainable Priority Score
      </p>

      {/* Breakdown */}
      <div className="space-y-1.5">
        {rows.map(([label, pts, max]) => (
          <div key={label} className="flex items-center gap-2 text-xs">
            <span className="w-20 text-slate-500 flex-shrink-0">{label}</span>
            <div className="flex-1 bg-slate-800 rounded-full h-1">
              <div
                className="bg-cyan-600 h-1 rounded-full"
                style={{ width: `${(pts / max) * 100}%` }}
              />
            </div>
            <span className="w-10 text-right text-slate-300 font-mono tabular-nums">
              +{pts}<span className="text-slate-600">/{max}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-700 italic mt-3">rule-based priority model — not an AI prediction</p>
    </div>
  )
}

// ── MITRE panel ───────────────────────────────────────────────────────────────

function MitrePanel({ techniques }: { techniques: MitreTechnique[] }) {
  return (
    <div className="space-y-2">
      {techniques.map(technique => (
        <div key={technique.id} className="bg-slate-900 rounded border border-slate-700 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800">
            <span className="font-mono text-cyan-400 text-xs font-bold w-20 flex-shrink-0">{technique.id}</span>
            <span className="text-slate-100 text-xs font-semibold flex-1">{technique.name}</span>
            <span className="text-xs text-slate-500 bg-slate-700 rounded px-2 py-0.5 flex-shrink-0">{technique.tactic}</span>
          </div>
          <div className="px-3 py-2">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Why it was mapped</p>
            <p className="text-xs text-slate-400 leading-relaxed">{technique.mappingReason}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main drawer ───────────────────────────────────────────────────────────────

interface InvestigationDrawerProps {
  incident: Incident
  onClose: () => void
}

export default function InvestigationDrawer({ incident, onClose }: InvestigationDrawerProps) {
  // Secondary sections start collapsed — analyst expands what they need.
  const [openSections, setOpenSections] = useState<Set<string>>(new Set())

  function toggleSection(id: string) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose} aria-hidden="true" />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[540px] bg-slate-950 border-l border-slate-700 z-50 flex flex-col"
        role="dialog"
        aria-label={`Investigation — ${incident.id}`}
      >
        <div className="flex-1 overflow-y-auto px-5 py-4">

          {/* ── 1. HEADER ── */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-1 h-4 rounded-full flex-shrink-0 ${severityBarClasses(incident.severity)}`} />
                <span className={`text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${severityBadgeClasses(incident.severity)}`}>
                  {incident.severity}
                </span>
                <span className="text-xs text-slate-500 font-mono">{incident.id}</span>
              </div>
              <h2 className="text-base font-bold text-white leading-snug">
                {incident.title}
              </h2>
              <p className="mt-1 text-xs text-slate-600">{formatTimestamp(incident.timestamp)}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-slate-500 hover:text-white bg-slate-800 hover:bg-slate-700 rounded px-3 py-1.5 text-xs font-semibold transition-colors"
              aria-label="Close investigation drawer"
            >
              ✕ Close
            </button>
          </div>

          {/* ── 2. BLUF — always visible ── */}
          <SectionHeading>Bottom Line Up Front</SectionHeading>
          <BlufPanel bluf={incident.bluf} />

          {/* ── 3. WHY GROUPED — always visible ── */}
          <SectionHeading>Why These Alerts Were Grouped</SectionHeading>
          <p className="text-xs text-slate-600 italic mb-2">{incident.correlationExplanation}</p>
          <CorrelationAccordion items={incident.correlationEvidence} />

          {/* ── 4. THREAT SCORE — always visible ── */}
          <SectionHeading>Explainable Threat Priority</SectionHeading>
          <DrawerScorePanel incident={incident} />

          {/* ── 5–8. SECONDARY SECTIONS — collapsible ── */}

          <CollapsibleSection id="alerts" label={`Correlated Alerts (${incident.alertList.length})`} openSections={openSections} onToggle={toggleSection}>
            <AlertTable alerts={incident.alertList} />
          </CollapsibleSection>

          <CollapsibleSection id="timeline" label="Activity Timeline" openSections={openSections} onToggle={toggleSection}>
            <div className="relative pl-4 space-y-2.5">
              <div className="absolute left-1.5 top-2 bottom-2 w-px bg-slate-700" />
              {incident.timeline.map((event, idx) => (
                <div key={idx} className="flex gap-2.5 items-start relative">
                  <div className="w-2 h-2 rounded-full bg-cyan-600 flex-shrink-0 mt-1 -ml-0.5 relative z-10" />
                  <div>
                    <span className="text-xs font-mono text-cyan-400">{event.timestamp}</span>
                    <span className="ml-2 text-xs text-slate-300">{event.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          <CollapsibleSection id="mitre" label="MITRE ATT&CK Techniques" openSections={openSections} onToggle={toggleSection}>
            <MitrePanel techniques={incident.mitreTechniques} />
          </CollapsibleSection>

          <CollapsibleSection id="recommendations" label="Suggested Investigation Starting Points" openSections={openSections} onToggle={toggleSection}>
            <p className="text-xs text-slate-600 italic mb-2">Suggested starting points only. The analyst remains the decision-maker.</p>
            <ol className="space-y-2">
              {incident.recommendedInvestigations.map((step, idx) => (
                <li key={idx} className="flex gap-2.5 bg-slate-900 rounded px-3 py-2 text-xs">
                  <span className="text-cyan-600 font-bold flex-shrink-0 w-4">{idx + 1}.</span>
                  <span className="text-slate-300">{step}</span>
                </li>
              ))}
            </ol>
          </CollapsibleSection>

          <div className="h-6" />
        </div>
      </div>
    </>
  )
}
