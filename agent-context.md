# Agent Context

## Current Project Goal

Build Phase 2 onward for an AI lead scoring CRM:

- Phase 2: Node.js backend that saves and retrieves leads from MongoDB.
- Phase 3: Dashboard for viewing scored leads and stats.
- Phase 4: Demo lead source form that posts into the user's existing n8n webhook.
- Documentation: clear human README and this handoff file.

The user said Phase 1 n8n workflow is already done.

## Architecture

```text
Form/Webhook -> n8n -> OpenAI node -> Node.js API -> MongoDB -> Email + Slack -> Next.js Dashboard
```

The Node.js backend should remain simple. AI scoring happens in n8n, not in the API.

## Work Completed

Created root project files:

- `package.json` with npm workspaces for `leads-api` and `dashboard`.
- `.gitignore`.
- `README.md`.
- `agent-context.md`.

Created Express/Mongo API in `leads-api`:

- `leads-api/package.json`
- `leads-api/.env.example`
- `leads-api/src/index.js`
- `leads-api/src/models/Lead.js`
- `leads-api/src/routes/leads.js`

API routes:

- `GET /health`
- `POST /leads`
- `GET /leads`
- `GET /leads/stats`
- `GET /leads/:id`

Created Next.js dashboard in `dashboard`:

- App Router setup.
- `/` lead table with score badges and details drawer.
- `/stats` Recharts bar chart and pie chart.
- Uses `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:3001`.

Created standalone demo form:

- `demo-form/index.html`
- Posts JSON to a user-supplied n8n webhook URL.
- Includes toggle between `marketing_agency` and `real_estate_agent`.
- Includes universal fields: name, email, phone, location, company, source.
- Marketing fields: service needed, monthly budget, timeline, business type, current problem.
- Real estate fields: looking to buy/sell/both, property type, budget range, timeline, location preference.

## Important Field Context

The original Phase 1 normalize code only kept:

- name
- email
- company
- website
- notes
- source

The new form sends more fields. The README includes an updated n8n Normalize Data snippet so n8n does not drop phone, location, marketing fields, or real estate fields.

The Mongoose schema accepts these added fields:

- phone
- location
- leadCategory
- serviceNeeded
- monthlyBudget
- businessType
- currentProblem
- lookingTo
- propertyType
- budgetRange
- locationPreference
- timeline

## Verification Completed

- Ran `npm install` successfully from the project root.
- Ran `node --check` on the API entrypoint, routes, and model files successfully.
- Ran `npm run build` successfully for the Next.js dashboard.
- Ran `npm run typecheck` successfully. The script currently runs `next build` because the app is JavaScript-only and `next lint` is deprecated/interactively configured in this Next.js version.
- Started the dashboard dev server at `http://127.0.0.1:3000` and opened it in the in-app browser. The page loaded with title `Lead Scoring CRM`.

## Next Suggested Steps

1. Copy `leads-api/.env.example` to `leads-api/.env`.
2. Set `MONGO_URI`.
3. Start MongoDB.
4. Run `npm run dev:api`.
5. Run `npm run dev:dashboard` if the dev server is not already running.
6. Test `POST /leads` manually or through n8n.
7. Open `demo-form/index.html` and submit to the n8n webhook.
8. Confirm the dashboard lists the saved lead.

## Known Risks / Follow-Up

- API cannot connect without a valid `MONGO_URI`.
- n8n must send the full enriched payload to `POST /leads`.
- If n8n runs in Docker, use `http://host.docker.internal:3001/leads` for the API URL.
- `npm install` reported 2 moderate npm audit findings. No automatic force fix was applied because it may introduce breaking dependency changes.
