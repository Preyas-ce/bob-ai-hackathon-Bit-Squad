# Architecture



## Overview



Defence Threat Intelligence is a frontend-focused prototype that demonstrates how security alerts can be transformed into prioritized and explainable investigations.



The current implementation uses structured fictional threat data inside the React application. It does not require a backend, external database, live security feeds, or external AI services.



## Architecture Components



### 1. React Dashboard



The React application provides the main analyst interface.



It contains:



- Incident summary cards

- Severity filters

- Prioritized incident cards

- Investigation drawer

- Threat score explanation

- Correlation evidence

- Event timeline

- MITRE ATT&CK context

- BLUF summary

- Possible false-positive indication



### 2. Structured Threat Data



The prototype uses structured TypeScript data to represent fictional security incidents and their supporting alerts.



Each incident can contain:



- Incident ID

- Severity

- Confidence

- Threat score inputs

- Supporting alerts

- Timestamps

- Source information

- MITRE ATT&CK mappings

- BLUF investigation information



This allows the prototype to demonstrate the intended investigation workflow without connecting to real security systems.



### 3. Threat Scoring Engine



The prototype calculates a deterministic threat priority score using predefined scoring factors.



The score considers information such as:



- Incident severity

- Confidence

- Number and relevance of supporting evidence



The score is calculated locally and the contributing factors are displayed to the analyst.



This makes the prioritization explainable rather than presenting an unexplained prediction.



### 4. Investigation View



When an analyst selects an incident, the investigation drawer presents the available investigation context in one place.



The analyst can review:



1\. Priority score

2\. Score factors

3\. Correlation evidence

4\. Event timeline

5\. MITRE ATT&CK techniques

6\. BLUF summary

7\. Possible false-positive indication



## Data Flow



The current prototype follows this flow:



```text

Structured fictional threat data

&#x20;           |

&#x20;           v

&#x20;    Incident grouping

&#x20;           |

&#x20;           v

&#x20;  Deterministic scoring

&#x20;           |

&#x20;           v

&#x20;  Prioritized incidents

&#x20;           |

&#x20;           v

&#x20;  Analyst investigation

&#x20;     /      |       \\

&#x20;    v       v        v

&#x20;Evidence  Timeline  MITRE context

&#x20;           |

&#x20;           v

&#x20;       BLUF summary


