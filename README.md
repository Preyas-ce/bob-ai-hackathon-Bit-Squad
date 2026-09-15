# Defence Threat Intelligence

## Team

| Field | Value |
|---|---|
| Team Name | Bit Squad |
| Track | AI |
| Team Lead | Dhruvit Ramani - 26ce086@charusat.edu.in |
| Members | Preyas Patel, Zenil Sorathiya, Meet Panasuriya |

---

## Problem Statement

Defence and security teams receive thousands of alerts every day from different sources such as SIEM systems, cyber sensors, and intelligence reports. Analysts must identify related threats, prioritize genuine incidents, and investigate possible false positives while commanders need a clear summary of the most important threats.

---

## Solution

Defence Threat Intelligence is an analyst-focused dashboard that groups related alerts, calculates an explainable threat priority score, maps relevant activity to MITRE ATT&CK techniques, and presents investigation findings through evidence, timelines, and BLUF summaries.

The prototype demonstrates how a large number of security alerts can be turned into a smaller set of prioritized investigations while keeping the reasoning visible to the analyst.

---

## Key Features

- Explainable threat priority scoring
- Alert correlation and supporting evidence
- MITRE ATT&CK technique mapping
- BLUF investigation summaries
- Investigation timeline and suggested investigation starting points
- Possible false-positive indication

---

## Tech Stack

| Category | Technologies |
|---|---|
| Languages | TypeScript |
| Frameworks | React, Vite, Tailwind CSS |
| IBM Technologies | IBM Bob |
| Databases | None |
| Other | Git, GitHub |

---

## How to Run

Follow the setup guide in docs/setup-guide.md.

```bash
git clone https://github.com/Preyas-ce/bob-ai-hackathon-Bit-Squad.git
cd bob-ai-hackathon-Bit-Squad
npm install
npm run dev

