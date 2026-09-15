import type { Incident, Severity } from '../types/incident'

// ─────────────────────────────────────────────────────────────────────────────
// Explainable Threat Priority Scoring
//
// This is a transparent, rule-based prototype — NOT a machine-learning model.
// Every point awarded can be traced directly to an incident field and a rule.
//
// Maximum points per factor:
//   Severity          25 pts
//   Confidence        25 pts
//   Correlation       20 pts
//   Source Reliability 15 pts
//   MITRE Evidence    15 pts
//   ─────────────────────────
//   Total            100 pts
// ─────────────────────────────────────────────────────────────────────────────

/** The five individual factor scores that make up the total. */
export interface ScoreBreakdown {
  severity: number          // 0–25
  confidence: number        // 0–25
  correlation: number       // 0–20
  sourceReliability: number // 0–15
  mitreEvidence: number     // 0–15
}

/** The full result returned by calculateThreatScore(). */
export interface ThreatScoreResult {
  total: number             // 0–100, always equals sum of breakdown values
  breakdown: ScoreBreakdown
}

// ── Factor 1: Severity (max 25 pts) ─────────────────────────────────────────
// Fixed points per severity level. No interpolation — each level earns
// a defined amount so the rule is completely obvious to any reviewer.

const SEVERITY_POINTS: Record<Severity, number> = {
  CRITICAL: 25,
  HIGH:     18,
  MEDIUM:   10,
  LOW:       4,
}

function scoreSeverity(severity: Severity): number {
  return SEVERITY_POINTS[severity]
}

// ── Factor 2: Confidence (max 25 pts) ────────────────────────────────────────
// The existing confidence field is 0.0–1.0.
// Multiply by 25 and round to the nearest whole number.
// Example: 0.94 → round(0.94 × 25) = round(23.5) = 24

function scoreConfidence(confidence: number): number {
  return Math.round(confidence * 25)
}

// ── Factor 3: Correlation (max 20 pts) ───────────────────────────────────────
// More correlated alerts means stronger evidence that a real incident exists.
// We cap the count at 10 so a flood of alerts doesn't exceed the maximum.
// Formula: min(correlatedAlerts, 10) / 10 × 20
// Example: 12 alerts → min(12,10)/10 × 20 = 1.0 × 20 = 20 pts (capped)
//           7 alerts → 7/10 × 20 = 14 pts
//           3 alerts → 3/10 × 20 =  6 pts

const CORRELATION_CAP = 10  // alerts above this number give no extra credit

function scoreCorrelation(correlatedAlerts: number): number {
  const capped = Math.min(correlatedAlerts, CORRELATION_CAP)
  return Math.round((capped / CORRELATION_CAP) * 20)
}

// ── Factor 4: Source Reliability (max 15 pts) ────────────────────────────────
// sourceReliability is 0.0–1.0 — how trustworthy the originating feed is.
// Multiply by 15 and round.
// Example: 0.90 → round(0.90 × 15) = round(13.5) = 14 pts

function scoreSourceReliability(sourceReliability: number): number {
  return Math.round(sourceReliability * 15)
}

// ── Factor 5: MITRE Evidence (max 15 pts) ────────────────────────────────────
// mitreEvidence is 0.0–1.0 — how strongly the observed behaviour maps to a
// documented MITRE ATT&CK technique.
// Multiply by 15 and round.
// Example: 0.88 → round(0.88 × 15) = round(13.2) = 13 pts

function scoreMitreEvidence(mitreEvidence: number): number {
  return Math.round(mitreEvidence * 15)
}

// ── Main exported function ────────────────────────────────────────────────────

/**
 * Calculates an explainable threat priority score for a single incident.
 *
 * The returned `total` is always the exact sum of the five `breakdown` values,
 * so analysts (and hackathon judges) can verify every point awarded.
 */
export function calculateThreatScore(incident: Incident): ThreatScoreResult {
  const breakdown: ScoreBreakdown = {
    severity:          scoreSeverity(incident.severity),
    confidence:        scoreConfidence(incident.confidence),
    correlation:       scoreCorrelation(incident.correlatedAlerts),
    sourceReliability: scoreSourceReliability(incident.sourceReliability),
    mitreEvidence:     scoreMitreEvidence(incident.mitreEvidence),
  }

  const total =
    breakdown.severity +
    breakdown.confidence +
    breakdown.correlation +
    breakdown.sourceReliability +
    breakdown.mitreEvidence

  return { total, breakdown }
}
