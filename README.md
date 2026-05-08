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
- `dashboard`: Next.js App Router dashboard with lead table, lead drawer, and charts.
- `demo-form`: standalone HTML lead form that posts to your n8n webhook.
- `README.md`: setup and project explanation.
- `agent-context.md`: handoff notes for future agents.

## Prerequisites

- Node.js 20 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string
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
CORS_ORIGIN=http://localhost:3000
```

Optional dashboard environment file:

```bash
cp dashboard/.env.local.example dashboard/.env.local
```

## Run Locally

Start MongoDB first.

Start the API:

```bash
npm run dev:api
```

Start the dashboard in another terminal:

```bash
npm run dev:dashboard
```

Open:

- API health check: `http://localhost:3001/health`
- Dashboard: `http://localhost:3000`
- Stats: `http://localhost:3000/stats`
- Demo form: open `demo-form/index.html` in a browser

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

## Demo Form

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

Score colors:

- Hot: `70+`
- Warm: `40-69`
- Cold: `<40`

## Build

```bash
npm run build
```

## Suggested Demo Flow

1. Start MongoDB.
2. Start the API with `npm run dev:api`.
3. Start n8n and activate/test the Phase 1 workflow.
4. Open `demo-form/index.html`.
5. Submit a marketing agency lead with urgent timeline and strong budget.
6. Confirm n8n scores it, saves it to MongoDB, and sends hot-lead alerts.
7. Open the dashboard at `http://localhost:3000`.
8. Show the lead table, drawer summary, and stats charts.

## What This Project Does Not Include

- Authentication
- A separate AI microservice
- A production email provider abstraction
- HubSpot or Salesforce integration
- Payment or billing logic

Those are intentionally skipped so the demo stays focused on the automation pipeline and lead scoring experience.
