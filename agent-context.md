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
- `docker-compose.yml` for local MongoDB in Docker.
- `README.md`.
- `agent-context.md`.

Created Express/Mongo API in `leads-api`:

- `leads-api/package.json`
- `leads-api/.env.example`
- `leads-api/src/index.js`
- `leads-api/src/models/Lead.js`
- `leads-api/src/routes/leads.js`
- `leads-api/src/seedMockLeads.js`

API routes:

- `GET /health`
- `POST /leads`
- `GET /leads`
- `GET /leads/stats`
- `GET /leads/:id`

Seed script:

- `npm --workspace leads-api run seed:mock`
- Replaces only existing leads where `source` is `mock_seed`.
- Inserts 6 demo leads covering marketing agency and real estate use cases.

Created Next.js dashboard in `dashboard`:

- App Router setup.
- `/` lead table with score badges and details drawer.
- `/stats` Recharts bar chart and pie chart.
- Uses `NEXT_PUBLIC_API_URL`, defaulting to `http://localhost:3001`.
- Includes a persisted light/dark mode toggle in the top bar using `localStorage` key `leadCrmTheme`.

Created standalone demo form:

- `demo-form/index.html`
- Posts JSON to a user-supplied n8n webhook URL.
- Includes toggle between `marketing_agency` and `real_estate_agent`.
- Includes universal fields: name, email, phone, location, company, source.
- Marketing fields: service needed, monthly budget, timeline, business type, current problem.
- Real estate fields: looking to buy/sell/both, property type, budget range, timeline, location preference.
- Includes a persisted light/dark mode toggle using `localStorage` key `leadFormTheme`.

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
- After adding dark mode, ran `npm run build` successfully again and verified the dashboard theme toggle in the browser on `http://127.0.0.1:3002`.
- Fixed a reported Next dev runtime error `__webpack_modules__[moduleId] is not a function` by stopping stale dev servers on ports `3000` and `3002`, deleting generated `dashboard/.next`, and restarting a clean dev server on `http://127.0.0.1:3000`.
- Ran `npm --workspace leads-api run seed:mock` successfully. MongoDB now has 6 mock leads with `source: mock_seed`.
- Added dashboard polish: clickable lead row hints, keyboard-openable lead rows, tooltip/title hints on metrics and charts, custom chart tooltip styling, and capitalized status/source labels in tables and charts.

## Next Suggested Steps

1. Start MongoDB with `docker compose up -d mongo`.
2. Run `npm run dev:api`.
3. Run `npm run dev:dashboard` if the dev server is not already running.
4. Test `POST /leads` manually or through n8n.
5. Open `demo-form/index.html` and submit to the n8n webhook.
6. Confirm the dashboard lists the saved lead.

## Known Risks / Follow-Up

- API cannot connect without a valid `MONGO_URI`.
- n8n must send the full enriched payload to `POST /leads`.
- If n8n runs in Docker, use `http://host.docker.internal:3001/leads` for the API URL.
- `npm install` reported 2 moderate npm audit findings. No automatic force fix was applied because it may introduce breaking dependency changes.
- Do not run `npm run build` while `npm run dev:dashboard` is running; both write to `dashboard/.next` and can corrupt the dev server module graph.
