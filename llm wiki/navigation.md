# Project Navigation & Codebase Guide

> Last updated: 2026-05-27 | Status: Vercel deployment fixes + comprehensive Ad Preview Hub implemented.

---

## High-Level Architecture

```
[Browser: Publisher Website]          [Browser: PubOps Dashboard]
         |                                      |
         | GET /api/serve                       | REST (CRUD - GET/POST/PUT/DELETE)
         ▼                                      ▼
 ┌─────────────────────────────────────────────────────────┐
 │              Express Server  (port 5000)                 │
 │  /api/serve  |  /api/track/*  |  /api/admin/*           │
 └────────────────────────┬────────────────────────────────┘
                          │ Mongoose
                          ▼
                   ┌─────────────┐
                   │   MongoDB   │
                   └─────────────┘
```

---

## 1. Directory Structure

```text
/GAM (root = Next.js project)
│
├── /src
│   ├── /app                        # Next.js App Router pages
│   │   ├── layout.js               # Root layout (Sidebar + Appbar)
│   │   ├── globals.css             # Tailwind v4 + GAM theme tokens
│   │   ├── page.js                 # Home Dashboard (KPI overview)
│   │   ├── /inventory
│   │   │   └── page.js             # Inventory page (Ad Units + search/filter)
│   │   ├── /campaigns
│   │   │   └── page.js             # Delivery page (Orders/Line Items + search/filter)
│   │   ├── /reporting
│   │   │   └── page.js             # KPI scorecards + per-campaign table
│   │   └── /admin
│   │       └── page.js             # Admin page (Advertisers + API reference)
│   │
│   └── /components                 # Reusable Client Components
│       ├── Sidebar.js              # Active-link navigation sidebar
│       ├── DeliveryManager.js      # Client component (tabs, filter/search, CRUD actions)
│       ├── InventoryManager.js     # Client component (search/filter, Ad Unit CRUD)
│       ├── AdminManager.js         # Client component (search/filter, Advertiser CRUD)
│       ├── CreateAdUnit.js         # Modal form (Create & Edit) → POST/PUT /api/admin/ad-units
│       ├── CreateAdvertiser.js     # Modal form (Create & Edit) → POST/PUT /api/admin/advertisers
│       ├── CreateOrder.js          # Modal form (Create & Edit) → POST/PUT /api/admin/orders
│       └── CreateLineItem.js       # Modal form (Create & Edit) → POST/PUT /api/admin/line-items
│
├── /server                         # Express backend
│   ├── index.js                    # Server entry: DB connect, middleware, routes
│   ├── seed.js                     # Seed script for 14 days of realistic analytics data
│   ├── /models
│   │   ├── AdUnit.js               # Schema: name, dimensions, floorPrice, isActive
│   │   ├── Advertiser.js           # Schema: name, contactEmail, totalSpend
│   │   ├── Order.js                # Schema: name, advertiserId, trafficker, status, notes
│   │   ├── LineItem.js             # Schema: orderId, advertiserId, adUnitId, targeting, creative
│   │   └── Analytics.js           # Schema: lineItemId, date, impressions, clicks
│   ├── /routes
│   │   ├── admin.js                # CRUD routes (GET/POST/PUT/DELETE) for dashboard
│   │   └── delivery.js             # /serve, /track/impression, /track/click
│   └── .env                        # MONGODB_URI, PORT, API_URL
│
├── .env.local                      # NEXT_PUBLIC_API_URL for Next.js
├── vercel.json                     # Vercel deployment config: forces Next.js detection + /preview rewrite (fixes 404s)
├── /public                         # Static assets served by Next.js
│   ├── index.html                  # Simple publisher sandbox: accessed at /preview
│   ├── ad-preview.html             # Comprehensive Ad Slot Preview Hub: accessed at /ad-preview.html
│   └── Mintserve.webp              # Mintserve branding asset
├── /llm wiki                       # Project documentation
│   ├── campaign_creation_and_testing_guide.md # Setup, testing, and dynamic slot insertion guide
│   ├── navigation.md               # This file
│   └── project_overview.md         # Original spec + change log
```

---

## 2. Pages & UI Walkthrough

### A. Root Layout (`src/app/layout.js`)
- Renders the **Sidebar** component (client component, tracks `pathname`).
- Renders the **top appbar** (search bar + help/notification icons + user avatar).
- Loads Google Fonts (Roboto) and Material Icons.

---

### B. Home Dashboard (`/`)
**Server Component.** Fetches aggregated report statistics from `/api/admin/reports`.
- Displays real MongoDB-backed cards for Total Revenue, Impressions, and Clicks.
- Computes estimated revenue based on live impressions and clicks dynamically.
- Renders **DashboardChart** (Client Component) containing a dual Y-axes line chart plotting the last 14 days of impressions and clicks dynamically.

---

### C. Inventory (`/inventory`)
**Server Component** wrapper rendering **InventoryManager** (Client Component).
- Features dynamic search filtering by Name, and dropdown filtering by Status (Active/Inactive).
- "+ New Ad Unit" opens modal to create an ad unit.
- Action buttons in the table trigger the **Edit Modal** or a **Delete** API call (`DELETE /api/admin/ad-units/:id`). Deleting an ad unit automatically pauses related line items.

---

### D. Public Preview Routes
These static pages are available for testing ad delivery without navigating the dashboard:
- **/preview**: Simple publisher sandbox (routes to `/public/index.html` via vercel.json rewrites)
- **/ad-preview.html**: Comprehensive Ad Slot Preview Hub with all standard IAB ad sizes in realistic positions
- Access both locally: `http://localhost:3000/preview` and `http://localhost:3000/ad-preview.html`
- The vercel.json configuration ensures these work correctly in Vercel production without 404 errors

---

### D. Delivery / Campaigns (`/campaigns`)
**Server Component** wrapper rendering **DeliveryManager** (Client Component).
- **Tab Bar**: Switch between "Line items" and "Orders" views.
- **Search & Filters**:
  - Filter line items or orders by Advertiser.
  - Filter by Status (Active/Paused/Completed for Line Items, and Draft/Approved/Paused/Completed for Orders).
  - Search by Name.
- **Line Item Actions**: Edit modal, Delete button, and inline status toggle (Play/Pause icon) which flips the state of the line item instantly.
- **Order Actions**: Edit modal, Delete button, and inline status toggle. Pausing/approving an Order automatically pauses/resumes all line items nested inside it.

---

### E. Reporting (`/reporting`)
**Server Component.** Fetches aggregated metrics and campaign statuses.
- Shows live KPI metrics: Impressions, Clicks, Click-Through-Rate (CTR %), and Est. Revenue.
- Pacing progress bar per campaign matching exact delivery progress (`delivered / totalLimit`).

---

### F. Admin (`/admin`)
**Server Component** wrapper rendering **AdminManager** (Client Component).
- Displays Advertiser list with full Edit, Delete, and Search filters.
- **API Reference card** displaying the integration tag code using the environment variable `NEXT_PUBLIC_API_URL`.

---

## 3. Backend API Contracts

### Management APIs (CRUD)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/ad-units` | List all ad units |
| `POST` | `/api/admin/ad-units` | Create a new ad unit |
| `PUT` | `/api/admin/ad-units/:id` | Update an existing ad unit |
| `DELETE` | `/api/admin/ad-units/:id` | Delete an ad unit |
| `GET` | `/api/admin/advertisers` | List all advertisers |
| `POST` | `/api/admin/advertisers` | Create a new advertiser |
| `PUT` | `/api/admin/advertisers/:id` | Update an advertiser |
| `DELETE` | `/api/admin/advertisers/:id` | Delete an advertiser |
| `GET` | `/api/admin/orders` | List all orders (populated) |
| `POST` | `/api/admin/orders` | Create a new order |
| `PUT` | `/api/admin/orders/:id` | Update an order (propagates status to line items) |
| `DELETE` | `/api/admin/orders/:id` | Delete an order & all related line items |
| `GET` | `/api/admin/line-items` | List all line items (populated) |
| `POST` | `/api/admin/line-items` | Create a new line item |
| `PUT` | `/api/admin/line-items/:id` | Update an existing line item |
| `DELETE` | `/api/admin/line-items/:id` | Delete a line item |
| `GET` | `/api/admin/reports` | Get real-time aggregated reports |

### Delivery APIs

| Method | Endpoint | Action |
|--------|----------|--------|
| `GET` | `/api/serve` | Ad Decision Engine (filters by targeting, flight dates, and priority) |
| `GET` | `/api/track/impression` | Log impression count + daily Analytics tracking, return 1×1 GIF |
| `GET` | `/api/track/click` | Log click count + daily Analytics tracking, 302 redirect to clickUrl |

---

## 4. Environment Variables

### `/server/.env`
```
MONGODB_URI=mongodb://localhost:27017/mini-ad-server
PORT=5000
API_URL=http://localhost:5000
```

### `/.env.local` (Next.js root)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 5. Seed Script

To load 14 days of realistic, queryable historical tracking records, run:
```bash
node server/seed.js
```
This guarantees your dashboards display real analytics calculations and live graphs, rather than static mock states.