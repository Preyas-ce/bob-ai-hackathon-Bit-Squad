\# Problem Statement



\## Background



Defence and security teams receive large volumes of alerts from different sources, including SIEM systems, cyber sensors, and intelligence reports. These alerts can have different formats, severity levels, confidence values, and sources, making it difficult for analysts to quickly understand the overall threat situation.



\## The Problem



The main challenge is determining which alerts are related, which incidents deserve immediate attention, and which alerts may be false positives. Analysts may need to manually examine large numbers of alerts and piece together evidence before understanding what is happening.



At the same time, commanders and decision-makers do not need to read every technical alert. They need a concise understanding of what happened, why it matters, and what should be investigated first.



\## Who is Affected



The primary users are security and defence analysts who investigate large volumes of security alerts and need to prioritize investigations.



Commanders and decision-makers are also affected because they need concise, understandable summaries of important incidents to support timely decisions.



\## Why It Matters



Alert overload can make investigations slower and can cause important activity to receive less attention among many lower-priority alerts. Spending too much time manually reviewing related alerts also makes it harder for analysts to focus on the investigations that require the most attention.



\## Why Existing Workflows Fall Short



Traditional alert-monitoring workflows can present large numbers of individual alerts without giving analysts a unified investigation view. Analysts may have to manually connect related alerts, assess their importance, review supporting evidence, identify attacker techniques, and prepare summaries for decision-makers.



Our project addresses this workflow gap by bringing these investigation steps together in one analyst-focused dashboard.



\## Prototype Scope



The current submission is a prototype using structured fictional threat data. It demonstrates alert correlation, explainable priority scoring, supporting evidence, MITRE ATT\&CK context, investigation timelines, possible false-positive indication, and BLUF summaries.



It does not connect to real SIEM systems, live intelligence feeds, or military infrastructure.

