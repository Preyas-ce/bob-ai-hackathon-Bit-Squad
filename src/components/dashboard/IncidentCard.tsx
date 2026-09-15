import React from 'react'
import type { Incident, Severity } from '../../types/incident'
import { calculateThreatScore } from '../../utils/threatScore'

// ── Severity helpers ─────────────────────────────────────────────────────────

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

function confidenceColor(confidence: number): string {
  if (confidence >= 0.85) return 'text-emerald-400'
  if (confidence >= 0.65) return 'text-yellow-400'
  return 'text-red-400'
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

// ── Component ────────────────────────────────────────────────────────────────

interface IncidentCardProps {
  incident: Incident
  onClick: (incident: Incident) => void
}

export default function IncidentCard({ incident, onClick }: IncidentCardProps) {
  const { total, breakdown } = calculateThreatScore(incident)
  const isPossibleFalsePositive = total < 55 && incident.confidence < 0.70

  return (
    <div
      className="flex bg-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-cyan-600 cursor-pointer transition-colors"
      onClick={() => onClick(incident)}
      role="button"
      tabIndex={0}
      aria-label={`Open investigation for ${incident.id}`}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onClick(incident) }}
    >
      {/* Severity bar */}
      <div className={`w-1 flex-shrink-0 ${severityBarClasses(incident.severity)}`} />

      {/* Main content */}
      <div className="flex-1 px-4 py-3 min-w-0">

        {/* Row 1: severity badge + ID + false-positive indicator + timestamp */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${severityBadgeClasses(incident.severity)}`}>
              {incident.severity}
            </span>
            <span className="text-xs text-slate-500 font-mono">{incident.id}</span>
            {isPossibleFalsePositive && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-sm uppercase tracking-wider bg-amber-950 text-amber-400 border border-amber-800"
                title="Lower-confidence signal — may warrant deprioritisation pending analyst review"
              >
                Possible False Positive
              </span>
            )}
          </div>
          <span className="text-xs text-slate-600 flex-shrink-0">{formatTimestamp(incident.timestamp)}</span>
        </div>

        {/* Row 2: title */}
        <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-2">
          {incident.title}
        </h3>

        {/* Row 3: compact pill metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className={`font-semibold ${confidenceColor(incident.confidence)}`}>
            {Math.round(incident.confidence * 100)}% Confidence
          </span>
          <span className="text-slate-400">
            <span className="text-slate-200 font-semibold">{incident.correlatedAlerts}</span> Alerts
          </span>
          <span className="text-slate-400">
            <span className="text-slate-200 font-semibold">{incident.sourceCount}</span> Sources
          </span>
          <span className="text-cyan-500 font-medium">{incident.primaryTactic}</span>
        </div>

      </div>

      {/* Score column — right side */}
      <div className="flex flex-col items-center justify-center px-4 py-3 bg-slate-800/60 border-l border-slate-700 min-w-[80px] flex-shrink-0">
        <span className={`text-2xl font-bold tabular-nums leading-none ${scoreColor(total)}`}>
          {total}
        </span>
        <span className="text-xs text-slate-500 mt-0.5">/100</span>
        {/* Compact factor bars */}
        <div className="mt-2 w-10 space-y-0.5">
          {[
            [breakdown.severity,          25],
            [breakdown.confidence,        25],
            [breakdown.correlation,       20],
            [breakdown.sourceReliability, 15],
            [breakdown.mitreEvidence,     15],
          ].map(([pts, max], i) => (
            <div key={i} className="bg-slate-700 rounded-full h-0.5 w-full">
              <div
                className="bg-cyan-600 h-0.5 rounded-full"
                style={{ width: `${(pts / max) * 100}%` }}
              />
            </div>
          ))}
        </div>
        <span className="text-xs text-slate-600 mt-1.5 uppercase tracking-wider" style={{ fontSize: '0.6rem' }}>
          Score
        </span>
      </div>

    </div>
  )
}
