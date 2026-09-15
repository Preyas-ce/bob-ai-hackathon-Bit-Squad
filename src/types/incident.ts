export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export type IncidentStatus = 'NEW' | 'IN_PROGRESS' | 'CLOSED'

// ── Alert (used inside the drawer's correlated-alerts list) ──────────────────
export interface CorrelatedAlert {
  id: string          // e.g. "ALT-001"
  severity: Severity
  timestamp: string   // ISO 8601
  description: string
}

// ── Timeline event (drawer timeline section) ─────────────────────────────────
export interface TimelineEvent {
  timestamp: string   // HH:MM format for display
  description: string
}

// ── Correlation evidence item (Task 6 expandable accordion) ──────────────────
// Each item represents one reason the alerts were grouped.
// factor       — short label shown in the collapsed row (e.g. "Common Domain")
// evidence     — the specific, concrete observation for this incident
// whyItMatters — one sentence explaining the analytical significance
export interface CorrelationEvidence {
  factor: string
  evidence: string
  whyItMatters: string
}

// ── Structured BLUF (Task 7) ──────────────────────────────────────────────────
// Replaces the single bluf string with three labelled fields.
export interface BlufContent {
  whatHappened: string      // concise description of the observed activity
  whyItMatters: string      // significance of the activity
  currentAssessment: string // cautious analyst assessment based on evidence
}

// ── MITRE technique reference ─────────────────────────────────────────────────
export interface MitreTechnique {
  id: string           // e.g. "T1566.001"
  name: string         // e.g. "Spearphishing Attachment"
  tactic: string       // e.g. "Initial Access"
  mappingReason: string // why this technique was mapped to this incident (Task 7)
}

// ── Main Incident type ────────────────────────────────────────────────────────
export interface Incident {
  id: string
  title: string
  severity: Severity
  status: IncidentStatus
  confidence: number          // 0.0 – 1.0  (existing)
  correlatedAlerts: number    // raw alert count (existing)
  sourceCount: number         // number of distinct feeds (existing)
  primaryTactic: string       // MITRE ATT&CK tactic name (existing)
  source: string              // originating feed / sensor type (existing)
  timestamp: string           // ISO 8601 (existing)

  // ── Added for explainable scoring (Task 3) ───────────────────────────────
  sourceReliability: number   // how trustworthy the originating source is (0–1)
  mitreEvidence: number       // strength of MITRE ATT&CK technique evidence (0–1)

  // ── Added for Investigation Drawer (Task 5, structured in Task 7) ────────
  bluf: BlufContent                   // Bottom Line Up Front — three-field structure
  correlationReasons: string[]        // bullet-point list of why alerts were grouped
  correlationExplanation: string      // one natural-language sentence summarising the above
  alertList: CorrelatedAlert[]        // individual alerts that make up this incident
  timeline: TimelineEvent[]           // same alerts in chronological order for the timeline
  mitreTechniques: MitreTechnique[]   // MITRE techniques observed
  recommendedInvestigations: string[] // 1–3 suggested next steps for the analyst

  // ── Added for expandable correlation evidence (Task 6) ───────────────────
  correlationEvidence: CorrelationEvidence[]  // structured, expandable evidence items
}
