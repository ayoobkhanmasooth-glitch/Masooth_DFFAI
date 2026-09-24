# Economy & Tourism AI Services: Concept Prototype

A standalone demo of three AI use cases for a UAE economy & tourism government entity,
built as an interview portfolio piece. It is an independent prototype, not an official service.

| # | Use case | What it shows | AI technique |
|---|----------|---------------|--------------|
| 1 | **Bilingual Business Services Assistant** | Guides investors/SMEs through licensing, trademarks, tourism licences (Arabic + English) | LLM chat with a scoped system prompt and guardrails |
| 2 | **Consumer Complaint Triage** | Classifies a complaint, scores urgency, routes to a team, drafts EN/AR summaries and a reply for officer review | LLM + structured outputs (JSON schema), human in the loop |
| 3 | **Tourism Demand Forecast & What-If** | Forecasts next-12-month hotel guests per emirate with a campaign-uplift slider | Seasonal time-series forecast (runs in the browser, synthetic data) |

## Structure

```
moet-ai-demo/
├── api/assist.js   ← serverless function; holds prompts + API key, calls Claude
├── index.html      ← the 3-tab frontend
└── package.json
```

The prompts live on the server, and the endpoint only accepts `mode: "business" | "complaint"`,
so it can't be abused as a general-purpose proxy.

## Deploy (Vercel)

1. In Vercel, **Add New Project** → import this repo → set **Root Directory** to `moet-ai-demo`.
2. **Settings → Environment Variables**: add `ANTHROPIC_API_KEY`.
3. Deploy. Tab 3 works even without a key; tabs 1–2 need it.

## Run locally

```bash
cd moet-ai-demo
npm install
npx vercel dev      # serves index.html and /api/assist
```

## Talking points for the interview

- **Why these three:** one citizen-facing service (assistant), one regulator workflow (triage), one policy/analytics tool (forecast). Together they cover the Ministry's service, regulation and strategy roles.
- **Responsible AI:** the assistant avoids inventing fees or legal articles and points users to official portals. Triage only *recommends*, and an officer decides. No personal data is stored.
- **Path to production:** hosting inside the UAE, integration with UAE Pass and case management, an Arabic evaluation set, bias testing, and KPIs (resolution time, first-contact resolution, forecast error).
