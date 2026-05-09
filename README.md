# Lead Scoring CRM

An AI-assisted mini CRM for capturing, enriching, scoring, and reviewing sales leads.

The project is designed as a portfolio-friendly automation demo: n8n receives leads from a form or webhook, OpenAI enriches and scores them, a Node.js API saves them in MongoDB, and a Next.js dashboard shows the sales team which leads are worth calling first.

## Architecture

```text
Form / Webhook
  -> n8n workflow
  -> OpenAI node for enrichment and scoring
  -> Node.js API
  -> MongoDB
  -> Email + Slack for hot leads
  -> Next.js dashboard
```

The backend intentionally stays small. It does not run the AI scoring itself because n8n already owns that workflow step.

## What Is Included

- `leads-api`: Express + Mongoose API for saving and reading leads.
- `dashboard`: Next.js App Router dashboard with lead table, lead drawer, charts, and lead capture pages.
- `demo-form`: standalone HTML lead form that posts to your n8n webhook.
- `README.md`: setup and project explanation.
- `agent-context.md`: handoff notes for future agents.

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop for local MongoDB
- n8n workflow from Phase 1
- OpenAI credentials configured in n8n

## Setup

Install dependencies from the project root:

```bash
npm install
```

Create API environment file:

```bash
cp leads-api/.env.example leads-api/.env
```

Edit `leads-api/.env`:

```env
PORT=3001
MONGO_URI=mongodb://127.0.0.1:27017/lead-scoring-crm
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
```

## MongoDB With Docker

This project includes `docker-compose.yml` for local MongoDB.

Start MongoDB:

```bash
docker compose up -d mongo
```

Check that it is running:

```bash
docker ps
```

The API should use:

```env
MONGO_URI=mongodb://127.0.0.1:27017/lead-scoring-crm
```

Stop MongoDB:

```bash
docker compose down
```

Stop MongoDB and delete the local database volume:

```bash
docker compose down -v
```

Optional dashboard environment file:

```bash
cp dashboard/.env.local.example dashboard/.env.local
```

For the Next.js lead capture forms, set:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/lead
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/lead
```

`N8N_WEBHOOK_URL` is used by the Next.js server-side proxy route. This avoids browser CORS errors when n8n does not return `Access-Control-Allow-Origin`.

## Run Locally

Start MongoDB first.

Start the API:

```bash
npm run dev:api
```

Add demo leads to MongoDB:

```bash
npm --workspace leads-api run seed:mock
```

The seed command replaces only leads with `source: "mock_seed"` and leaves real n8n leads untouched.

Start the dashboard in another terminal:

```bash
npm run dev:dashboard
```

Open:

- API health check: `http://localhost:3001/health`
- Dashboard: `http://localhost:3000`
- Stats: `http://localhost:3000/stats`
- Internal capture form: `http://localhost:3000/capture`
- Public-style lead form: `http://localhost:3000/submit`
- Standalone HTML form: open `demo-form/index.html` in a browser

## Scripts

From the project root:

```bash
npm run dev:api          # Start Express API on port 3001
npm run dev:dashboard    # Start Next.js dashboard on port 3000
npm run build            # Build the Next.js dashboard
npm run typecheck        # Runs the dashboard build check
npm --workspace leads-api run seed:mock
```

## API Endpoints

### `POST /leads`

Creates a lead. n8n should call this after the OpenAI scoring step.

Example body:

```json
{
  "name": "Priya Sharma",
  "email": "priya@example.com",
  "phone": "+91 98765 43210",
  "location": "Mumbai",
  "company": "Sharma Interiors",
  "source": "website",
  "leadCategory": "marketing_agency",
  "serviceNeeded": "Paid Ads",
  "monthlyBudget": "$1500-$5000",
  "timeline": "ASAP",
  "businessType": "Local business",
  "currentProblem": "Needs more qualified renovation leads.",
  "intent": "ready_to_buy",
  "type": "Local Business",
  "score": 86,
  "summary": "High-intent local business with urgent paid ads need.",
  "recommended_next_step": "Call today and offer a paid ads audit."
}
```

### `GET /leads`

Returns newest leads first.

Optional query params:

- `status=hot`
- `source=facebook_ad`
- `limit=50`

### `GET /leads/stats`

Returns counts by source, counts by status, and summary totals for charts.

### `GET /leads/:id`

Returns one lead by MongoDB ID.

## n8n Notes

Your Phase 1 workflow can keep using:

```text
Webhook -> Normalize Data -> OpenAI -> Parse AI Response -> HTTP Request -> IF -> Email + Slack
```

Because the demo form includes phone, location, marketing fields, and real estate fields, update the Normalize Data code node if your current version only keeps `name`, `email`, `company`, `website`, `notes`, and `source`.

Suggested Normalize Data code:

```js
const body = $input.first().json.body ?? $input.first().json;

return [{
  json: {
    name: body.name ?? '',
    email: body.email ?? '',
    phone: body.phone ?? '',
    location: body.location ?? '',
    company: body.company ?? '',
    website: body.website ?? '',
    notes: body.notes ?? '',
    source: body.source ?? 'website',
    leadCategory: body.leadCategory ?? 'unknown',
    serviceNeeded: body.serviceNeeded ?? '',
    monthlyBudget: body.monthlyBudget ?? '',
    businessType: body.businessType ?? '',
    currentProblem: body.currentProblem ?? '',
    lookingTo: body.lookingTo ?? '',
    propertyType: body.propertyType ?? '',
    budgetRange: body.budgetRange ?? '',
    timeline: body.timeline ?? '',
    locationPreference: body.locationPreference ?? ''
  }
}];
```

In the HTTP Request node that saves to the API:

- Method: `POST`
- URL from Docker n8n: `http://host.docker.internal:3001/leads`
- URL from local n8n outside Docker: `http://localhost:3001/leads`
- Body: JSON
- Send the full current JSON payload

## Lead Capture Forms

There are now two Next.js lead-entry options, plus the original standalone HTML form.

### Option A: Dashboard Capture Form

Open:

```text
http://localhost:3000/capture
```

This is the internal/admin version. It lives inside the dashboard and is best for portfolio demos, internal tools, and manually entering a lead from a sales call.

Flow:

```text
User -> Next.js dashboard form -> Next.js API proxy -> n8n webhook -> AI scoring -> Node API -> MongoDB
```

### Option B: Public Client Form

Open:

```text
http://localhost:3000/submit
```

This is the public-style intake page. It simulates a real client website form that sends submissions into the same n8n automation.

If `NEXT_PUBLIC_N8N_WEBHOOK_URL` is configured, the public form uses it automatically. If it is not configured, the page shows a webhook URL field so local demos still work.

The public page also has its own light/dark mode toggle. It shares the same persisted theme setting as the dashboard.

Flow:

```text
Website visitor -> Public lead form -> Next.js API proxy -> n8n webhook -> AI scoring -> Node API -> MongoDB
```

The proxy route is:

```text
POST http://localhost:3000/api/lead-webhook
```

The browser calls this same-origin Next.js route. The Next.js server then forwards the lead to n8n, so the browser never makes a cross-origin request to `localhost:5678`.

### Standalone HTML Form

Open `demo-form/index.html` in your browser.

Paste the n8n webhook URL, for example:

```text
http://localhost:5678/webhook-test/lead
```

The form has two lead modes:

- Marketing Agency
- Real Estate Agent

It always sends:

- name
- email
- phone
- location
- company
- source
- leadCategory
- notes

Marketing agency mode also sends service, budget, timeline, business type, and current problem.

Real estate mode also sends buy/sell intent, property type, budget range, timeline, and location preference.

## Dashboard

The dashboard uses Next.js instead of plain React because it gives a cleaner project structure, routing, and room to grow without adding much complexity.

Main screens:

- `/`: lead table with score badges and a details drawer
- `/stats`: source bar chart and hot/warm/cold pie chart
- `/capture`: internal dashboard lead form
- `/submit`: public-style client intake form
- Light/dark mode toggle in the top bar
- Lead rows are clickable and keyboard-openable for details
- Metrics, rows, and charts include hover hints/tooltips

Score colors:

- Hot: `70+`
- Warm: `40-69`
- Cold: `<40`

## Build

Stop `npm run dev:dashboard` before running a production build. Next.js dev and build both write to `dashboard/.next`.

```bash
npm run build
```

## Troubleshooting

### Browser CORS Error When Submitting to n8n

If the browser says the n8n webhook was blocked by CORS, do not call the n8n webhook directly from the browser. Use the built-in Next.js proxy route:

```text
POST /api/lead-webhook
```

The `/capture` and `/submit` pages already use this route.

Set the server-side webhook URL in `dashboard/.env.local`:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/lead
```

If n8n is running in Docker but exposes port `5678` to your host machine, `http://localhost:5678/...` is correct from the Next.js dev server running on your host.

If you use an n8n test webhook such as `/webhook-test/lead`, click **Execute workflow** in n8n before submitting the form. Test webhooks are temporary and n8n may return `404 The requested webhook "lead" is not registered` until the workflow is listening. For an active workflow, use the production webhook path, usually `/webhook/lead`.

### `__webpack_modules__[moduleId] is not a function`

This can happen if `next build` runs while `next dev` is still running, because both commands write to `dashboard/.next`.

Fix:

1. Stop the dashboard dev server.
2. Delete `dashboard/.next`.
3. Start the dashboard again with `npm run dev:dashboard`.

Avoid running `npm run build` while the dev server is open.

## Suggested Demo Flow

1. Start MongoDB with `docker compose up -d mongo`.
2. Start the API with `npm run dev:api`.
3. Start the dashboard with `npm run dev:dashboard`.
4. Optional: seed demo data with `npm --workspace leads-api run seed:mock`.
5. Start n8n and activate/test the Phase 1 workflow.
6. Open `http://localhost:3000/capture` and submit an internal test lead.
7. Open `http://localhost:3000/submit` and submit a public-style lead.
8. Confirm n8n scores each lead, saves it to MongoDB, and sends hot-lead alerts.
9. Open `http://localhost:3000` and show the lead table, drawer summary, stats charts, and dark mode.

## What This Project Does Not Include

- Authentication
- A separate AI microservice
- A production email provider abstraction
- HubSpot or Salesforce integration
- Payment or billing logic

Those are intentionally skipped so the demo stays focused on the automation pipeline and lead scoring experience.
