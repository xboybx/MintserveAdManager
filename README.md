# Mini Ad Server — GAM Clone

A lightweight, full-stack digital ad-serving platform that mirrors the core Publisher Operations (PubOps) workflow of Google Ad Manager. Built with **Next.js (App Router)** for the dashboard and **Express + MongoDB** for the high-speed Ad Decision Engine.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), Tailwind CSS v4 |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| UI Style | Google Material Design (GAM-accurate) |
| Icons | Google Material Icons |

---

## Project Structure

```
/GAM
├── /src/app          → Next.js pages (Home, Inventory, Campaigns, Reporting, Admin)
├── /src/components   → Reusable React components (Sidebar, modals)
├── /server           → Express API (Ad Engine + Management routes)
├── index.html        → Mock publisher website for testing
├── navigation.md     → Full codebase guide (read this!)
└── project_overview.md → Original spec + change log
```

---

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB running locally (or MongoDB Atlas URI)

### 1. Configure Environment Variables

**Backend** — create `/server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/mini-ad-server
PORT=5000
API_URL=http://localhost:5000
```

**Frontend** — create `/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 2. Install Dependencies

```bash
# Root (Next.js dashboard)
npm install

# Backend
cd server && npm install
```

### 3. Run Both Servers

```bash
# Terminal 1 — Backend (auto-restarts on change)
cd server
npm run dev

# Terminal 2 — Frontend dashboard
npm run dev
```

- **Dashboard:** http://localhost:3000  
- **API:** http://localhost:5000

---

## Testing the Ad Flow (End-to-End)

1. **Create an Ad Unit** → `/inventory` → "+ New Ad Unit"  
2. **Create an Advertiser** → `/campaigns` → "+ New Advertiser"  
3. **Create a Line Item** → `/campaigns` → "+ New Line Item" (link to both above)  
4. Copy the Ad Unit `_id` from MongoDB Compass (or from the network tab)  
5. Open `index.html` in your browser, paste the ID into `adRequestConfig.adUnitId`  
6. The ad renders! Click it → click counter increments → you get redirected  
7. Check `/reporting` — impressions and clicks update in real time  

---

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/serve?adUnitId=&device=&geo=` | GET | Ad Decision Engine |
| `/api/track/impression?lineItemId=` | GET | Log impression, return 1×1 pixel |
| `/api/track/click?lineItemId=&redirectUrl=` | GET | Log click + 302 redirect |
| `/api/admin/ad-units` | GET / POST | Manage ad units |
| `/api/admin/advertisers` | GET / POST | Manage advertisers |
| `/api/admin/line-items` | GET / POST | Manage line items |
| `/api/admin/reports` | GET | Aggregated metrics |

---

## Read More

See [`navigation.md`](./navigation.md) for a baby-step walkthrough of every file, component, and API.
