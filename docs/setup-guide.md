# Setup Guide

## Prerequisites

Before running the project, make sure the following are installed:

* Node.js 18 or newer
* npm
* Git

No backend, database, or external API credentials are required for the current prototype.

## Clone the Repository

```bash
git clone https://github.com/Preyas-ce/bob-ai-hackathon-Bit-Squad.git
cd bob-ai-hackathon-Bit-Squad
```

## Install Dependencies

```bash
npm install
```

## Run the Application

Start the development server:

```bash
npm run dev
```

Vite will display the local development URL. Normally, the application is available at:

`http://localhost:5173/`

Open the URL in a web browser.

## Production Build

To verify that the application can be built successfully:

```bash
npm run build
```

The production files are generated in the `dist/` directory.

## Environment Variables

The current prototype does not require environment variables.

There are no API keys, database credentials, or external service credentials required to run the application.

## Prototype Data

The application currently uses structured fictional threat data included in the frontend.

The prototype demonstrates the intended analyst workflow without connecting to real SIEM systems, live threat feeds, military infrastructure, or external AI services.

## Quick Demo

After starting the application:

1. Open the dashboard.
2. Review the incident summary cards.
3. Select `INC-001`.
4. Review its threat priority score.
5. Expand the score factors to understand why the incident was prioritized.
6. Expand the correlation evidence.
7. Review the investigation timeline.
8. Review the MITRE ATT&CK mappings.
9. Read the BLUF summary.
10. Return to the dashboard and use the severity filters.

## Troubleshooting

### `npm` is not recognized

Install Node.js and restart the terminal or command prompt.

### Dependencies are missing

Run:

```bash
npm install
```

from the project root.

### Port 5173 is already in use

Stop the other Vite development server using the port, or use the alternate local URL displayed by Vite.

### Production build fails

Make sure the dependencies are installed:

```bash
npm install
```

Then run:

```bash
npm run build
```

## Current Scope

This is a prototype using structured fictional threat data.

It does not currently connect to:

* Real SIEM systems
* Live threat intelligence feeds
* Military infrastructure
* External databases
* External AI services

The correlation evidence, confidence values, and MITRE ATT&CK mappings are simulated to demonstrate the intended production workflow.

