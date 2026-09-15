# Solution Overview



## Overview



Defence Threat Intelligence is an analyst-focused dashboard designed to reduce alert overload by turning related security alerts into prioritized, explainable investigations.



The prototype brings together alert correlation, deterministic threat scoring, supporting evidence, investigation timelines, MITRE ATT&CK context, possible false-positive indication, and BLUF summaries in one workflow.



## How the Solution Works



### 1. Alert and Threat Data



The prototype uses structured fictional threat data representing alerts from different security sources.



Each incident contains information such as severity, confidence, timestamps, source context, and supporting alerts.



### 2. Alert Correlation



Related alerts are grouped into a single incident so analysts can investigate the activity as one case instead of reviewing every alert separately.



The current prototype demonstrates this correlation through structured incident data and linked supporting alerts.



### 3. Explainable Threat Prioritization



Each incident receives a deterministic priority score based on factors such as severity, confidence, and supporting evidence.



The dashboard shows the score factors so analysts can understand why an incident has been prioritized.



### 4. Investigation Context



Analysts can expand correlation evidence, review the event timeline, and see relevant MITRE ATT&CK techniques.



MITRE mappings include reasons and references to the supporting alerts in the prototype.



### 5. BLUF Summary



Each investigation includes a Bottom Line Up Front (BLUF) summary that gives a concise view of what happened, why it matters, and what should be investigated next.



This is intended to help decision-makers understand important findings without reading every technical alert.



### 6. Human Analyst Review



The dashboard supports investigation rather than replacing the analyst.



The possible false-positive indication is an investigation aid and is not presented as a definitive classification.



## Key Benefits



\- Reduces the number of individual alerts an analyst needs to review at once.

\- Makes incident prioritization explainable rather than showing an unexplained score.

\- Keeps supporting evidence and timelines close to the investigation.

\- Provides standardized MITRE ATT&CK context.

\- Produces concise BLUF summaries for faster understanding and communication.



## Prototype Scope



The current prototype demonstrates the intended analyst workflow using structured fictional threat data.



It does not currently connect to real SIEM systems, live threat feeds, military infrastructure, or external intelligence sources. The correlation evidence, confidence values, and MITRE mappings are simulated for the prototype.



In a future production implementation, the same workflow could be connected to live security feeds and scalable correlation services. AI assistance could also be added for tasks such as processing unstructured intelligence and generating or refining BLUF summaries, while keeping human analysts responsible for investigation decisions.


