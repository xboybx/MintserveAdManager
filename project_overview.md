# Project: Mini Ad Server (GAM Clone)

## 1. Project Objectives
The objective of this project is to architect and build a lightweight, high-performance digital ad-serving platform capable of mimicking the core functionalities of enterprise Publisher Operations (PubOps) systems like Google Ad Manager. 

**Key Goals:**
*   **Hierarchical Management:** Implement the industry-standard data hierarchy (Advertisers ➔ Orders ➔ Line Items ➔ Ad Units ➔ Creatives).
*   **Ad Decision Engine:** Build a high-speed API that receives bid requests, evaluates targeting parameters (geo, device, browser), checks budgets, and returns the highest-priority ad in milliseconds.
*   **Budget Pacing & Delivery:** Simulate real-world operational constraints like impression limits, click limits, and active flight dates.
*   **Analytics Tracking:** Track impressions and clicks accurately to calculate dummy revenue and yield.

## 2. Why We Are Building This
Because enterprise AdTech platforms like GAM or Amazon Publisher Services are gated behind strict domain verifications and traffic minimums, there are no public sandboxes available. 

By building this platform from scratch, we achieve deep, mechanical mastery of digital advertising. Writing the backend logic to parse targeting rules and manage frequency capping forces a complete understanding of how programmatic requests and direct deals are actually executed over the web.

## 3. Tech Stack & Libraries

We are using a decoupled **MERN + Next.js** architecture. The frontend dashboard needs rich routing and SSR, while the ad-serving engine requires low latency and high concurrency. 

### Frontend (`/client`)
*   **Framework:** Next.js (App Router)
*   **UI Rendering:** Next.js Server Components for fast initial loads of dashboard tables, with Client Components for interactive forms.
*   **Styling:** Tailwind CSS (for rapid, clean dashboard UI).
*   **State Management:** React Hooks / Zustand (if global state is needed for complex campaign creation forms).

### Backend (`/server`)
*   **Runtime/Framework:** Node.js with Express.
    *   *Why a separate Express server?* Ad-serving requires extremely fast, stateful, and cached responses. Serverless functions (like Next.js API routes) can suffer from cold starts, which is detrimental to an ad tag that must load in <100ms. An always-on Express server deployed behind an Nginx reverse proxy guarantees low latency.
*   **Database:** MongoDB (via Mongoose). Perfect for hierarchical, document-based ad targeting schemas.
*   **Utilities:** `cors` (crucial for third-party ad serving), `helmet` (security headers), `dotenv`.

---

## 4. System Design & Architecture

The system is split into three distinct operational layers.

### A. The PubOps Dashboard (Next.js Client)
This is the visual interface where the Publisher Operations Manager logs in to configure the platform. It communicates with the backend via REST to update the MongoDB database. 
*   **Features:** Create Ad Units, manage Advertisers, traffic Line Items, and view yield statistics.

### B. The Ad Decision Engine (Express API)
This is the workhorse of the platform. It operates entirely under the hood. 
*   **The Flow:** A user visits a test webpage ➔ The webpage fires an Ad Tag (`<script src="http://api.yourdomain.com/serve?unit=header">`) ➔ The Express server catches the request, parses the metadata, queries MongoDB for eligible ads, filters by priority/budget, and returns the creative markup.

### C. The Delivery/Tracking Network
When an ad is served, the API also attaches an invisible tracking pixel URL to the creative. When the ad renders on the screen, the pixel fires back to the Express server to log an `impression`. If clicked, it hits a `/track/click` endpoint before redirecting the user to the advertiser's site.

---

## 5. Database Schema Design (MongoDB)

Here is the exact Mongoose schema structure required to link the data properly.

```javascript
// 1. AdUnit.js - The empty slots on the publisher's website
const adUnitSchema = new Schema({
  name: { type: String, required: true }, // e.g., "Right_Sidebar_300x250"
  dimensions: { width: Number, height: Number },
  basePriceFloor: Number,
  isActive: { type: Boolean, default: true }
});

// 2. Advertiser.js - The brands spending the budget
const advertiserSchema = new Schema({
  name: { type: String, required: true },
  contactEmail: String,
  totalSpend: { type: Number, default: 0 }
});

// 3. LineItem.js - The core targeting and budget logic
const lineItemSchema = new Schema({
  advertiserId: { type: Schema.Types.ObjectId, ref: 'Advertiser' },
  adUnitId: { type: Schema.Types.ObjectId, ref: 'AdUnit' },
  name: String, // e.g., "Winter Promo Campaign"
  priority: { type: Number, default: 10 }, // 1 is highest priority
  
  // Budgeting & Flight Dates
  startDate: Date,
  endDate: Date,
  goalType: { type: String, enum: ['CPM', 'CPC'] },
  totalLimit: Number, 
  delivered: { type: Number, default: 0 },
  
  // Targeting Logic
  targeting: {
    device: [String], // ["Desktop", "Mobile"]
    geo: [String]     // ["IN", "US"]
  },
  
  // The Creative Asset
  creativeDetails: {
    mediaUrl: String,   // e.g., "[https://example.com/assets/she-feels-like-winter-banner.jpg](https://example.com/assets/she-feels-like-winter-banner.jpg)"
    clickUrl: String    // e.g., "[https://music-stream.com/x-boy](https://music-stream.com/x-boy)"
  },
  status: { type: String, enum: ['Active', 'Paused', 'Completed'] }
});

// 4. Analytics.js - Tracking the numbers
const analyticsSchema = new Schema({
  lineItemId: { type: Schema.Types.ObjectId, ref: 'LineItem' },
  date: { type: Date, default: Date.now },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 }
});

6. API Design & Contracts
The Express backend exposes two types of routes: Management APIs (for the Next.js dashboard) and Delivery APIs (for the public internet).

Management APIs (Protected)
Used by the dashboard to configure campaigns.

POST /api/admin/ad-units - Create a new inventory slot.

POST /api/admin/line-items - Traffic a new ad campaign.

GET /api/admin/reports - Fetch impression/click aggregations for charts.

Ad Delivery & Tracking APIs (Public, High-Speed)
GET /api/serve

Query Params: ?adUnitId=123&device=mobile&geo=IN

Logic: Finds active Line Items ➔ Matches targeting ➔ Checks limits (is delivered < totalLimit?) ➔ Sorts by priority ➔ Returns JSON with mediaUrl and tracking links.

GET /api/track/impression

Query Params: ?lineItemId=456

Logic: Increments the impression counter in MongoDB and returns a 1x1 transparent pixel.

GET /api/track/click

Query Params: ?lineItemId=456&redirectUrl=...

Logic: Increments the click counter and executes a 302 HTTP Redirect to the advertiser's landing page.

7. Implementation Plan
Phase 1: Environment Setup & Database
Initialize standard Git repository with /client and /server directories.

Set up the Node.js/Express server and configure CORS.

Connect to MongoDB Atlas.

Write the Mongoose models based on the schema design above.

Phase 2: The Ad Decision Engine (Backend)
Build the /api/serve endpoint. Hardcode a few dummy Line Items into MongoDB to test it.

Write the filtering logic. Ensure the API correctly rejects requests if the device parameter doesn't match the Line Item's targeting rule.

Implement the tracking endpoints (/track/impression and /track/click) to update the database counters.

Phase 3: The PubOps Dashboard (Frontend)
Initialize the Next.js App Router project. Set up Tailwind CSS.

Build the Inventory Page: A table to display Ad Units and a form to create them.

Build the Campaign Page: A multi-step form to create Line Items, select targeting rules (checkboxes for device/geo), and upload creative links.

Connect Next.js Server Components to the Express Management APIs to populate the UI.

Phase 4: Integration & Testing
Create a simple, blank index.html file on your local machine (acting as the Publisher's website).

Write a vanilla JavaScript fetch request in that HTML file that calls your /api/serve endpoint and injects the returned image and tracking links into the DOM.

Click the ad and verify the database increments the click counter and handles the redirect.

-Dont use Hardcode urls for api requeests and use env variables for sensitive links and variables

-alos create a new md files to have the track of the project to have a deep knowledge of the project.

---

## 8. Change Log (Implementation Record)

> This section tracks what was actually built, changed, or added beyond the original spec.

### Phase 1 — Environment Setup & Database ✅
| Item | Status | Notes |
|------|--------|-------|
| `/server` directory with Express | ✅ Done | `server/index.js` — entry point with helmet, cors, express.json |
| MongoDB connection via Mongoose | ✅ Done | Uses `MONGODB_URI` from `server/.env` |
| `AdUnit` model | ✅ Done | `server/models/AdUnit.js` |
| `Advertiser` model | ✅ Done | `server/models/Advertiser.js` |
| `LineItem` model | ✅ Done | `server/models/LineItem.js` — full targeting + budget schema |
| `Analytics` model | ✅ Done | `server/models/Analytics.js` — per-day impression/click tracking |
| Environment variables | ✅ Done | `server/.env` (backend) + `.env.local` (frontend) — no hardcoded URLs |
| `npm run dev` for server | ✅ Done | Uses `node --watch` (no nodemon dependency needed) |

### Phase 2 — Ad Decision Engine (Backend) ✅
| Item | Status | Notes |
|------|--------|-------|
| `GET /api/serve` | ✅ Done | Full targeting filter + budget cap + priority sort |
| `GET /api/track/impression` | ✅ Done | Increments counter + returns 1×1 transparent GIF pixel |
| `GET /api/track/click` | ✅ Done | Increments counter + 302 redirect to advertiser URL |
| Management CRUD routes | ✅ Done | `POST/GET` for ad-units, advertisers, line-items, reports |
| Revenue aggregation | ✅ Done | `/api/admin/reports` — dummy CPM/CPC revenue formula |

### Phase 3 — PubOps Dashboard (Frontend) ✅
| Item | Status | Notes |
|------|--------|-------|
| Next.js App Router setup | ✅ Done | Tailwind CSS v4 (`@import "tailwindcss"`) |
| **UI redesigned to match Google Ad Manager** | ✅ Done | See "Design Changes" below |
| Home Dashboard (`/`) | ✅ Done | KPI cards: Revenue, Impressions, Clicks + chart placeholder |
| Inventory page (`/inventory`) | ✅ Done | Ad Units table + `CreateAdUnit` modal |
| Campaigns page (`/campaigns`) | ✅ Done | Line Items table + `CreateLineItem` + `CreateAdvertiser` modals |
| Reporting page (`/reporting`) | ✅ Added | KPI scorecards (CTR, Revenue) + per-campaign breakdown table |
| Admin page (`/admin`) | ✅ Added | Advertisers table + API reference card |
| Sidebar navigation | ✅ Done | `Sidebar.js` client component with active-route highlighting |
| All forms fully functional | ✅ Done | POST to backend → `router.refresh()` updates Server Components |

### Phase 4 — Integration & Testing ✅
| Item | Status | Notes |
|------|--------|-------|
| `index.html` (mock publisher) | ✅ Done | Vanilla JS fetch → render ad → fire tracking pixel |
| Click tracking → redirect | ✅ Done | Wired to `/api/track/click` |

### Design Changes (GAM Accuracy Update)
The original dark-theme/glassmorphism UI was **completely replaced** with a Google Ad Manager–accurate design:

- **Color palette:** White surfaces (`#fff`), light grey background (`#f8f9fa`), Google blue (`#1a73e8`), Google text grey (`#5f6368`)
- **Typography:** Roboto font from Google Fonts
- **Icons:** Google Material Icons via CDN
- **Sidebar:** Rounded-pill active states matching real GAM left-nav
- **Top bar:** Search field + help/notification icons + user avatar circle
- **Tables:** Checkbox column, hover rows, pagination footer — matches GAM exactly
- **Modals:** Clean white card with border divider in footer — matches Google's dialog pattern
- **Breadcrumbs:** Each page has a `Section > Sub-page` breadcrumb trail

### Documentation Created
| File | Purpose |
|------|---------|
| `navigation.md` | Baby-step codebase guide: directory map, UI walkthrough, API contracts, engine logic, env vars, testing steps |
| `README.md` | Quick start guide with tech stack, setup instructions, and API reference table |
| `campaign_creation_and_testing_guide.md` | Step-by-step campaign set up, static developer layout testing, and dynamic paragraph ad insertion script walkthrough |
| This section (`project_overview.md §8`) | Change log tracking all implementation decisions |

### CRUD & Hierarchy Expansion (GAM Detail Update)
To match Google Ad Manager's exact data hierarchy and operational capabilities, the following features were added:
- **Order Model & CRUD**: Integrated `server/models/Order.js` representing advertiser contracts. Full Create, Read, Update, and Delete endpoints created in `server/routes/admin.js`.
- **Complete CRUD Actions**: Extended PUT (Update) and DELETE (Remove) actions for all 4 primary entities (Ad Units, Advertisers, Orders, Line Items).
- **Search & Advanced Filters**: Added interactive searching and status/advertiser dropdown filters to Campaigns (Delivery), Inventory, and Admin tables.
- **Hierarchical Line Items**: Line Items now belong directly to **Orders** (which reference Advertisers), aligning precisely with real PubOps traffic flow.
- **Seeded Historical Data**: Seed script (`server/seed.js`) updated to create hierarchical orders and load 14 days of realistic database analytics records for reporting graphs.
- **Chart.js Timeline Integration**: Built a premium, client-side dynamic line chart (`src/components/DashboardChart.js`) using Chart.js. The chart shows daily Impressions (on left Y-axis in blue) and Clicks (on right Y-axis in mint green) with custom area gradients and interactive tooltips.
- **Mintserve Branding & Visual Alignment**: Replaced all Google/generic placeholders with Mintserve branding, resized the top-left logo, and aligned the search box layout across all dashboard lists to prevent overlapping text.