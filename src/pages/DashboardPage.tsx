import React from 'react'
import { useState } from 'react'
import type { Incident, Severity } from '../types/incident'
import IncidentCard from '../components/dashboard/IncidentCard'
import InvestigationDrawer from '../components/dashboard/InvestigationDrawer'

// ── Severity filter type ──────────────────────────────────────────────────────
// 'ALL' is a special value meaning "no filter applied — show everything".
// The other values come directly from the existing Severity type.
type SeverityFilter = Severity | 'ALL'

// ── Mock data ────────────────────────────────────────────────────────────────
// Three fictional incidents, ordered CRITICAL → HIGH → MEDIUM.
// None of these reference real organizations, real IPs, or sensitive information.

const MOCK_INCIDENTS: Incident[] = [
  {
    id: 'INC-001',
    title: 'Coordinated spear-phishing campaign targeting operational network accounts',
    severity: 'CRITICAL',
    status: 'NEW',
    confidence: 0.94,
    correlatedAlerts: 7,
    sourceCount: 4,
    primaryTactic: 'Initial Access',
    source: 'SIEM / Email Gateway',
    timestamp: '2026-09-14T09:30:00Z',
    sourceReliability: 0.90,
    mitreEvidence: 0.88,

    bluf: {
      whatHappened: 'Seven alerts across a 40-minute window indicate that multiple operational network accounts received targeted phishing emails containing malicious attachments. Three distinct accounts were affected: ops.user04, ops.user11, and ops.user17. A suspicious link click and an unusual outbound connection were also recorded following attachment delivery.',
      whyItMatters: 'The volume of affected accounts, the common attachment hash across three alerts, and independent corroboration from both the SIEM and the email gateway indicate this may be a coordinated delivery campaign targeting a specific organisational unit, rather than an isolated or opportunistic event.',
      currentAssessment: 'Current evidence supports the assessment that this activity is consistent with a coordinated spear-phishing campaign. Confidence is high (94%) based on cross-source corroboration and attachment hash consistency. The unusual outbound connection at 15:22 suggests possible post-delivery activity and warrants priority investigation. Assessment remains pending full forensic review of affected accounts.',
    },

    correlationReasons: [
      'Same targeted domain — all emails directed at accounts in the same organisational unit',
      'Common malicious attachment hash observed across ALT-001, ALT-002, and ALT-005',
      'Activity clustered within a 40-minute window (02:42–03:22 PM)',
      'Spoofed sender domain blocked by email gateway (ALT-004)',
      'SIEM and email gateway independently flagged the same account identifiers',
    ],
    correlationExplanation: 'These alerts were grouped because they share a common malicious attachment, target the same organisational unit, and were detected within a closely related time window by two independent sources, forming a consistent and suspicious activity pattern.',

    alertList: [
      { id: 'ALT-001', severity: 'CRITICAL', timestamp: '2026-09-14T14:42:00Z', description: 'Malicious attachment detected — account ops.user04' },
      { id: 'ALT-002', severity: 'CRITICAL', timestamp: '2026-09-14T14:48:00Z', description: 'Malicious attachment detected — account ops.user11' },
      { id: 'ALT-003', severity: 'HIGH',     timestamp: '2026-09-14T14:54:00Z', description: 'Suspicious link click recorded — account ops.user04' },
      { id: 'ALT-004', severity: 'HIGH',     timestamp: '2026-09-14T15:01:00Z', description: 'Email gateway blocked delivery — spoofed sender domain' },
      { id: 'ALT-005', severity: 'CRITICAL', timestamp: '2026-09-14T15:08:00Z', description: 'Malicious attachment detected — account ops.user17' },
      { id: 'ALT-006', severity: 'HIGH',     timestamp: '2026-09-14T15:14:00Z', description: 'SIEM correlation rule triggered — repeated attachment hash' },
      { id: 'ALT-007', severity: 'MEDIUM',   timestamp: '2026-09-14T15:22:00Z', description: 'Unusual outbound connection after attachment open — ops.user04' },
    ],

    timeline: [
      { timestamp: '14:42', description: 'First malicious attachment detected (ops.user04)' },
      { timestamp: '14:48', description: 'Second malicious attachment detected (ops.user11)' },
      { timestamp: '14:54', description: 'Suspicious link click — possible payload retrieval' },
      { timestamp: '15:01', description: 'Email gateway blocks further delivery — spoofed sender' },
      { timestamp: '15:08', description: 'Third malicious attachment detected (ops.user17)' },
      { timestamp: '15:14', description: 'SIEM correlation rule fires — repeated attachment hash confirmed' },
      { timestamp: '15:22', description: 'Unusual outbound connection observed — possible C2 contact' },
    ],

    mitreTechniques: [
      {
        id: 'T1566.001',
        name: 'Spearphishing Attachment',
        tactic: 'Initial Access',
        mappingReason: 'Mapped because ALT-001, ALT-002, and ALT-005 each describe malicious attachments delivered to distinct operational accounts. The repeated delivery pattern across multiple targets is consistent with this technique.',
      },
      {
        id: 'T1566.002',
        name: 'Spearphishing Link',
        tactic: 'Initial Access',
        mappingReason: 'Supported by ALT-003, which records a suspicious link click by ops.user04 following attachment delivery. The link click is consistent with a secondary phishing vector or payload retrieval attempt.',
      },
      {
        id: 'T1204.002',
        name: 'Malicious File',
        tactic: 'Execution',
        mappingReason: 'Consistent with the sequence of malicious attachment delivery (ALT-001, ALT-002, ALT-005) followed by an unusual outbound connection (ALT-007). The outbound connection suggests possible file execution resulting in post-delivery activity, though this cannot be confirmed without further forensic analysis.',
      },
    ],

    recommendedInvestigations: [
      'Isolate the accounts that opened the attachment (ops.user04, ops.user11, ops.user17) and review their recent activity logs.',
      'Extract and hash the attachment from quarantine; compare against known threat intelligence indicators.',
      'Review outbound network connections from affected hosts in the 03:22–03:40 PM window for potential command-and-control traffic.',
    ],

    correlationEvidence: [
      {
        factor: 'Shared Malicious Attachment',
        evidence: 'A common attachment hash was observed across ALT-001, ALT-002, and ALT-005. All three alerts were triggered by the same file delivered to different accounts (ops.user04, ops.user11, ops.user17).',
        whyItMatters: 'Identical malicious files appearing across multiple accounts supports the possibility that the alerts belong to the same coordinated delivery campaign rather than independent events.',
      },
      {
        factor: 'Spoofed Sender Domain',
        evidence: 'ALT-004 recorded the email gateway blocking a delivery attempt from a spoofed sender domain. The accounts targeted in ALT-001 and ALT-002 are in the same organisational unit as the blocked delivery target.',
        whyItMatters: 'A spoofed sender domain, combined with attachment delivery to accounts in the same organisational unit, suggests the campaign may have used consistent sender infrastructure, providing supporting evidence of a common origin.',
      },
      {
        factor: 'Temporal Clustering',
        evidence: 'ALT-001 occurred at 14:42, ALT-002 at 14:48, and ALT-005 at 15:08 — all within a 40-minute window. The SIEM correlation rule in ALT-006 fired at 15:14 in direct response to this clustering.',
        whyItMatters: 'The tight time window makes it less likely these are coincidental separate events, and more likely they form part of the same coordinated activity sequence.',
      },
      {
        factor: 'Cross-Source Corroboration',
        evidence: 'Both the SIEM and the email gateway independently flagged the same account identifiers. ALT-001 through ALT-003 originate from the email gateway; ALT-006 originates from the SIEM correlation engine.',
        whyItMatters: 'Agreement between two independent detection sources strengthens confidence that the observed activity is genuine rather than a false positive from a single feed.',
      },
      {
        factor: 'Post-Delivery Unusual Outbound Connection',
        evidence: 'ALT-007 recorded an unusual outbound connection from ops.user04 at 15:22, approximately 40 minutes after ALT-001 detected the initial attachment delivery to that account at 14:42.',
        whyItMatters: 'The sequence — delivery followed by unusual outbound traffic — is consistent with a known post-exploitation pattern and suggests the events may be causally related.',
      },
    ],
  },

  {
    id: 'INC-002',
    title: 'Anomalous lateral movement observed across internal network segment',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    confidence: 0.78,
    correlatedAlerts: 7,
    sourceCount: 3,
    primaryTactic: 'Lateral Movement',
    source: 'Cyber Sensor / NDR',
    timestamp: '2026-09-14T08:15:00Z',
    sourceReliability: 0.85,
    mitreEvidence: 0.75,

    bluf: {
      whatHappened: 'Seven correlated alerts over a 25-minute window indicate HOST-WS-042 made successive authenticated connections to internal servers across three separate network segments. Five key alerts are detailed below; a pass-the-hash credential indicator was detected at 08:19. All activity was detected by both the NDR sensor and the SIEM.',
      whyItMatters: 'The combination of a single source host, cross-segment targeting, a credential technique indicator, and connections made outside normal hours suggests activity inconsistent with legitimate use. The pattern is consistent with internal lateral movement behaviour.',
      currentAssessment: 'Current evidence supports the assessment that HOST-WS-042 may be compromised and in use for lateral movement. Confidence is moderate (78%). The successful authentication to HOST-SRV-031 at 08:27 requires priority review. Assessment is in progress and pending isolation and forensic analysis.',
    },

    correlationReasons: [
      'All connections originate from the same internal source host (HOST-WS-042)',
      'Destination hosts span three separate internal segments not typically accessed by this host',
      'Activity window is tightly clustered between 08:02 and 08:27',
      'Authentication method used (pass-the-hash indicator) is flagged as suspicious by the NDR sensor',
    ],
    correlationExplanation: 'These alerts were grouped because all suspicious connections originate from a single host, target an unusual spread of internal destinations, and occurred within a short, defined window — consistent with systematic lateral movement behaviour.',

    alertList: [
      { id: 'ALT-008', severity: 'HIGH',   timestamp: '2026-09-14T08:02:00Z', description: 'Unusual SMB connection from HOST-WS-042 to HOST-SRV-011' },
      { id: 'ALT-009', severity: 'HIGH',   timestamp: '2026-09-14T08:09:00Z', description: 'Unusual RDP session from HOST-WS-042 to HOST-SRV-019' },
      { id: 'ALT-010', severity: 'MEDIUM', timestamp: '2026-09-14T08:14:00Z', description: 'Repeated failed login attempts from HOST-WS-042 to HOST-SRV-023' },
      { id: 'ALT-011', severity: 'HIGH',   timestamp: '2026-09-14T08:19:00Z', description: 'Pass-the-hash indicator detected — HOST-WS-042' },
      { id: 'ALT-012', severity: 'HIGH',   timestamp: '2026-09-14T08:27:00Z', description: 'Successful authentication to HOST-SRV-031 — non-standard hours' },
    ],

    timeline: [
      { timestamp: '08:02', description: 'Unusual SMB connection to internal server (HOST-SRV-011)' },
      { timestamp: '08:09', description: 'Unusual RDP session to second internal server (HOST-SRV-019)' },
      { timestamp: '08:14', description: 'Repeated failed logins to third server (HOST-SRV-023)' },
      { timestamp: '08:19', description: 'Pass-the-hash credential technique indicator detected' },
      { timestamp: '08:27', description: 'Successful login to fourth server outside normal hours (HOST-SRV-031)' },
    ],

    mitreTechniques: [
      {
        id: 'T1021.001',
        name: 'Remote Desktop Protocol',
        tactic: 'Lateral Movement',
        mappingReason: 'Mapped because ALT-009 records an unusual RDP session from HOST-WS-042 to HOST-SRV-019. RDP use from a workstation to a server outside normal operational patterns is consistent with this technique.',
      },
      {
        id: 'T1021.002',
        name: 'SMB/Windows Admin Shares',
        tactic: 'Lateral Movement',
        mappingReason: 'Supported by ALT-008, which records an unusual SMB connection from HOST-WS-042 to HOST-SRV-011. SMB connections to servers outside the host\'s normal access scope are consistent with this technique.',
      },
      {
        id: 'T1550.002',
        name: 'Pass the Hash',
        tactic: 'Defence Evasion',
        mappingReason: 'Mapped because ALT-011 records a pass-the-hash indicator detected on HOST-WS-042 at 08:19. This indicator is directly associated with this technique and was flagged by the NDR sensor.',
      },
    ],

    recommendedInvestigations: [
      'Isolate HOST-WS-042 from the network and preserve a memory image for forensic analysis.',
      'Audit the accounts used in each authenticated connection to determine whether credentials have been compromised.',
      'Review HOST-SRV-031 activity logs for any file access, data staging, or persistence mechanisms established after the 08:27 login.',
    ],

    correlationEvidence: [
      {
        factor: 'Common Source Host',
        evidence: 'The key alerts (ALT-008 through ALT-012) all originate from the same internal workstation, HOST-WS-042. No other source host appears across the correlated alerts.',
        whyItMatters: 'A single host generating connections to multiple unrelated servers is a behavioural pattern that supports the possibility of systematic lateral movement rather than normal operations.',
      },
      {
        factor: 'Credential Technique Indicator',
        evidence: 'ALT-011 recorded a pass-the-hash indicator on HOST-WS-042 at 08:19. This indicator type is associated with credential reuse across network hosts and was detected by the NDR sensor.',
        whyItMatters: 'A credential technique indicator in the middle of a series of unusual connection alerts provides supporting evidence that the connections may be driven by the same compromised credential.',
      },
      {
        factor: 'Sequential Destination Pattern',
        evidence: 'The destination hosts — HOST-SRV-011, HOST-SRV-019, HOST-SRV-023, and HOST-SRV-031 — span three separate internal network segments not typically accessed by HOST-WS-042 according to baseline behaviour.',
        whyItMatters: 'The breadth and sequencing of targets across different segments suggests a possible exploratory pattern, where each connection may be probing a different part of the internal network.',
      },
      {
        factor: 'Temporal Clustering',
        evidence: 'ALT-008 occurred at 08:02 and ALT-012 at 08:27 — a 25-minute window. All correlated alerts fall within this range with no significant gaps.',
        whyItMatters: 'The compressed time window suggests the connections were made in deliberate succession rather than coincidentally, supporting the grouping of these alerts into a single incident.',
      },
    ],
  },

  {
    id: 'INC-003',
    title: 'Repeated failed authentication attempts on external-facing service',
    severity: 'MEDIUM',
    status: 'NEW',
    confidence: 0.61,
    correlatedAlerts: 3,
    sourceCount: 2,
    primaryTactic: 'Credential Access',
    source: 'SIEM / Auth Logs',
    timestamp: '2026-09-14T07:45:00Z',
    sourceReliability: 0.60,
    mitreEvidence: 0.50,

    bluf: {
      whatHappened: 'Three alerts over a 15-minute window record multiple failed login attempts against 14 distinct usernames on the external-facing authentication service, followed by a successful login from account svc.monitor at 07:45. The failed-attempt rate exceeded the SIEM baseline threshold at 07:38.',
      whyItMatters: 'The multi-username targeting pattern is consistent with a password-spraying technique. The successful login immediately following a failed sequence indicates that at least one credential attempt may have been accepted, which warrants priority review of the svc.monitor account.',
      currentAssessment: 'Current evidence suggests possible password-spraying activity against the external authentication service. Confidence is lower (61%), reflecting the possibility that this may be automated scanner or probe activity rather than a targeted attack. The svc.monitor successful login requires immediate verification. Assessment is pending account activity review.',
    },

    correlationReasons: [
      'All failed attempts target the same external-facing authentication endpoint',
      'Multiple distinct usernames attempted — consistent with password-spraying pattern',
      'Source IP ranges cluster in a narrow subnet across all three alerts',
    ],
    correlationExplanation: 'These alerts were grouped because they all target the same authentication endpoint, use a password-spraying pattern across multiple valid usernames, and originate from a narrow source address range within a 15-minute window.',

    alertList: [
      { id: 'ALT-013', severity: 'MEDIUM', timestamp: '2026-09-14T07:31:00Z', description: 'Multiple failed logins — 14 distinct usernames — external auth endpoint' },
      { id: 'ALT-014', severity: 'MEDIUM', timestamp: '2026-09-14T07:38:00Z', description: 'SIEM threshold rule triggered — failed auth rate exceeded baseline' },
      { id: 'ALT-015', severity: 'LOW',    timestamp: '2026-09-14T07:45:00Z', description: 'One successful login following failed sequence — account svc.monitor' },
    ],

    timeline: [
      { timestamp: '07:31', description: 'Failed logins detected across 14 usernames — external auth endpoint' },
      { timestamp: '07:38', description: 'SIEM threshold rule fires — failed authentication rate above baseline' },
      { timestamp: '07:45', description: 'Successful login observed following failed sequence — account svc.monitor' },
    ],

    mitreTechniques: [
      {
        id: 'T1110.003',
        name: 'Password Spraying',
        tactic: 'Credential Access',
        mappingReason: 'Mapped because ALT-013 records failed login attempts against 14 distinct usernames in a single session. The breadth of targeted accounts within a short window is the defining characteristic of this technique.',
      },
      {
        id: 'T1078',
        name: 'Valid Accounts',
        tactic: 'Defence Evasion',
        mappingReason: 'Supported by ALT-015, which records a successful authentication by account svc.monitor immediately following the failed-login sequence. Use of a valid account credential following a spraying attempt is consistent with this technique.',
      },
    ],

    recommendedInvestigations: [
      'Verify whether the successful login by svc.monitor at 07:45 was authorised; if not, suspend the account and rotate credentials.',
      'Review the source IP subnet for any prior malicious activity indicators and consider temporary rate-limiting or blocking.',
    ],

    correlationEvidence: [
      {
        factor: 'Common Target Endpoint',
        evidence: 'All three alerts (ALT-013, ALT-014, ALT-015) reference the same external-facing authentication endpoint. No other endpoint appears across the correlated alerts.',
        whyItMatters: 'Multiple alerts targeting a single endpoint suggests a focused attempt on that specific service rather than broad opportunistic scanning, supporting grouping of these alerts.',
      },
      {
        factor: 'Password-Spraying Pattern',
        evidence: 'ALT-013 recorded failed login attempts against 14 distinct usernames within a single session. This breadth of targeted accounts is characteristic of a password-spraying technique (T1110.003) rather than targeted single-account brute force.',
        whyItMatters: 'The multi-account pattern provides supporting evidence that the alerts share a common methodological origin, rather than representing unrelated failed logins.',
      },
      {
        factor: 'Temporal Sequence — Failure Followed by Success',
        evidence: 'ALT-013 recorded failed attempts at 07:31, ALT-014 triggered the SIEM threshold at 07:38, and ALT-015 recorded a successful login at 07:45 — 14 minutes after the first failed attempts.',
        whyItMatters: 'A successful authentication closely following a failed-authentication sequence may suggest that one of the attempted credentials was eventually accepted, which is a recognised indicator for this technique.',
      },
    ],
  },
]

// ── Summary statistics ───────────────────────────────────────────────────────
// Derived directly from the mock data so the numbers always stay in sync.

const SUMMARY = {
  critical: MOCK_INCIDENTS.filter(i => i.severity === 'CRITICAL').length,
  high:     MOCK_INCIDENTS.filter(i => i.severity === 'HIGH').length,
  medium:   MOCK_INCIDENTS.filter(i => i.severity === 'MEDIUM').length,
  total:    MOCK_INCIDENTS.length,
}

 // ── Summary card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string
  count: number
  countClass: string   // Tailwind text color for the number
  accentClass: string  // Tailwind border-top color
}

function SummaryCard({ label, count, countClass, accentClass }: SummaryCardProps) {
  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 border-t-2 ${accentClass}`}>
      <p className={`text-3xl font-bold tabular-nums ${countClass}`}>{count}</p>
      <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mt-1">{label}</p>
    </div>
  )
}

// ── Filter bar ────────────────────────────────────────────────────────────────

interface FilterBarProps {
  selectedSeverity: SeverityFilter
  onSeverityChange: (value: SeverityFilter) => void
}

function FilterBar({ selectedSeverity, onSeverityChange }: FilterBarProps) {
  const isFiltered = selectedSeverity !== 'ALL'

  const severitySelectClass =
    'bg-slate-800 text-slate-100 text-xs rounded px-3 py-1.5 focus:outline-none border transition-colors ' +
    (isFiltered ? 'border-cyan-500 text-cyan-300' : 'border-slate-600')

  return (
    <div className="flex flex-wrap items-center gap-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5">
      {/* Live severity filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Severity</span>
        {isFiltered && (
          <span className="text-xs bg-cyan-900/50 text-cyan-400 border border-cyan-700 rounded px-1.5 py-0.5 uppercase tracking-wider font-bold">
            LIVE
          </span>
        )}
        <select
          className={severitySelectClass}
          value={selectedSeverity}
          onChange={e => onSeverityChange(e.target.value as SeverityFilter)}
          aria-label="Filter by severity"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
        </select>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [selectedSeverity, setSelectedSeverity] = useState<SeverityFilter>('ALL')
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null)

  const filteredIncidents: Incident[] =
    selectedSeverity === 'ALL'
      ? MOCK_INCIDENTS
      : MOCK_INCIDENTS.filter(incident => incident.severity === selectedSeverity)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* ── Header ── */}
      <header className="border-b border-slate-800 bg-slate-950">
        {/* Cyan accent line at very top */}
        <div className="h-0.5 bg-gradient-to-r from-cyan-600 via-cyan-500 to-transparent" />
        <div className="px-6 py-4">
          <p className="text-xs text-cyan-500 uppercase tracking-[0.2em] font-bold mb-0.5">
            Defence Threat Intelligence
          </p>
          <h1 className="text-xl font-bold text-white tracking-wide">
            Threat Operations Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Prioritized security incidents requiring analyst attention
          </p>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="px-6 py-5 max-w-5xl mx-auto space-y-5">

        {/* ── Summary cards ── */}
        <section aria-label="Incident summary">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard label="Critical"        count={SUMMARY.critical} countClass="text-red-400"    accentClass="border-t-red-600" />
            <SummaryCard label="High"            count={SUMMARY.high}     countClass="text-orange-400" accentClass="border-t-orange-600" />
            <SummaryCard label="Medium"          count={SUMMARY.medium}   countClass="text-yellow-400" accentClass="border-t-yellow-600" />
            <SummaryCard label="Total Incidents" count={SUMMARY.total}    countClass="text-slate-200"  accentClass="border-t-slate-600" />
          </div>
        </section>

        {/* ── Filter bar ── */}
        <section aria-label="Filters">
          <FilterBar
            selectedSeverity={selectedSeverity}
            onSeverityChange={setSelectedSeverity}
          />
        </section>

        {/* ── Prioritized incident list ── */}
        <section aria-label="Prioritized incidents">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
              Prioritized Incidents
            </h2>
            <span className="text-xs text-slate-600">
              {filteredIncidents.length} of {MOCK_INCIDENTS.length} shown
            </span>
          </div>

          {filteredIncidents.length === 0 ? (
            <div className="py-10 text-center text-slate-600 text-sm border border-slate-800 rounded-lg">
              No incidents match the selected filter.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredIncidents.map(incident => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  onClick={setSelectedIncident}
                />
              ))}
            </div>
          )}
        </section>

      </main>

      {selectedIncident !== null && (
        <InvestigationDrawer
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
        />
      )}
    </div>
  )
}
