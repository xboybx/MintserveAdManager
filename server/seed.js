/**
 * seed.js — Populate the database with realistic ad-tech data.
 *
 * Run once:  node seed.js
 *
 * This creates:
 *   - 4 Advertisers (real-ish brands)
 *   - 4 Orders (campaign folders matching Advertiser contracts)
 *   - 5 Ad Units (common slot sizes)
 *   - 8 Line Items (campaigns with targeting, budgets, partial delivery)
 *   - Analytics records (impressions & clicks spread over 14 days)
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const AdUnit = require('./models/AdUnit');
const Advertiser = require('./models/Advertiser');
const Order = require('./models/Order');
const LineItem = require('./models/LineItem');
const Analytics = require('./models/Analytics');

// ── Helper: random integer between min and max (inclusive) ──
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB — seeding...');

  // Wipe existing data so the script is idempotent
  await Promise.all([
    AdUnit.deleteMany({}),
    Advertiser.deleteMany({}),
    Order.deleteMany({}),
    LineItem.deleteMany({}),
    Analytics.deleteMany({}),
  ]);
  console.log('Cleared old data.');

  // ── 1. Advertisers ────────────────────────────────────────
  const advertisers = await Advertiser.insertMany([
    { name: 'Nike',          contactEmail: 'media@nike.com',          totalSpend: 4520.00 },
    { name: 'Spotify',       contactEmail: 'ads@spotify.com',         totalSpend: 3180.50 },
    { name: 'Samsung',       contactEmail: 'digital@samsung.com',     totalSpend: 6740.25 },
    { name: 'Coursera',      contactEmail: 'partnerships@coursera.org', totalSpend: 1290.00 },
  ]);
  console.log(`Created ${advertisers.length} advertisers.`);

  // ── 2. Orders (GAM style) ──────────────────────────────────
  const orders = await Order.insertMany([
    { name: 'Nike — Annual Campaign 2026', advertiserId: advertisers[0]._id, trafficker: 'Alice Johnson', status: 'Approved', notes: 'Sponsorship order' },
    { name: 'Spotify — Premium Trials Q2', advertiserId: advertisers[1]._id, trafficker: 'Bob Smith', status: 'Approved', notes: 'Global digital spend' },
    { name: 'Samsung — Galaxy Launch', advertiserId: advertisers[2]._id, trafficker: 'Alice Johnson', status: 'Approved', notes: 'Urgent mobile launch' },
    { name: 'Coursera — Education Promo', advertiserId: advertisers[3]._id, trafficker: 'Charlie Davis', status: 'Approved', notes: 'Priced with discounts' }
  ]);
  console.log(`Created ${orders.length} orders.`);

  // ── 3. Ad Units ───────────────────────────────────────────
  const adUnits = await AdUnit.insertMany([
    { name: 'Header_Leaderboard_728x90',   dimensions: { width: 728, height: 90 },   basePriceFloor: 2.50, isActive: true },
    { name: 'Sidebar_MedRect_300x250',     dimensions: { width: 300, height: 250 },  basePriceFloor: 1.80, isActive: true },
    { name: 'Footer_Banner_970x90',        dimensions: { width: 970, height: 90 },   basePriceFloor: 1.20, isActive: true },
    { name: 'InContent_HalfPage_300x600',  dimensions: { width: 300, height: 600 },  basePriceFloor: 3.00, isActive: true },
    { name: 'Mobile_Interstitial_320x480', dimensions: { width: 320, height: 480 },  basePriceFloor: 4.50, isActive: true },
  ]);
  console.log(`Created ${adUnits.length} ad units.`);

  // ── 4. Line Items (Campaigns) ─────────────────────────────
  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n * 86400000);
  const daysFromNow = (n) => new Date(now.getTime() + n * 86400000);

  const lineItemsData = [
    {
      orderId: orders[0]._id,
      advertiserId: advertisers[0]._id, // Nike
      adUnitId: adUnits[0]._id,         // Header leaderboard
      name: 'Nike — Summer Running Shoes',
      priority: 1,
      startDate: daysAgo(14),
      endDate: daysFromNow(16),
      goalType: 'CPM',
      totalLimit: 50000,
      delivered: 32450,
      targeting: { device: ['Desktop', 'Mobile'], geo: ['US', 'IN'] },
      creativeDetails: {
        mediaUrl: 'https://picsum.photos/728/90?random=1',
        clickUrl: 'https://www.nike.com/running',
      },
      status: 'Active',
    },
    {
      orderId: orders[0]._id,
      advertiserId: advertisers[0]._id, // Nike
      adUnitId: adUnits[4]._id,         // Mobile interstitial
      name: 'Nike — App Install (Mobile)',
      priority: 2,
      startDate: daysAgo(7),
      endDate: daysFromNow(23),
      goalType: 'CPC',
      totalLimit: 10000,
      delivered: 2870,
      targeting: { device: ['Mobile'], geo: ['US'] },
      creativeDetails: {
        mediaUrl: 'https://picsum.photos/320/480?random=2',
        clickUrl: 'https://www.nike.com/app',
      },
      status: 'Active',
    },
    {
      orderId: orders[1]._id,
      advertiserId: advertisers[1]._id, // Spotify
      adUnitId: adUnits[1]._id,         // Sidebar
      name: 'Spotify — Premium Free Trial',
      priority: 3,
      startDate: daysAgo(10),
      endDate: daysFromNow(20),
      goalType: 'CPM',
      totalLimit: 80000,
      delivered: 54200,
      targeting: { device: ['Desktop'], geo: ['US', 'UK'] },
      creativeDetails: {
        mediaUrl: 'https://picsum.photos/300/250?random=3',
        clickUrl: 'https://www.spotify.com/premium',
      },
      status: 'Active',
    },
    {
      orderId: orders[1]._id,
      advertiserId: advertisers[1]._id, // Spotify
      adUnitId: adUnits[2]._id,         // Footer
      name: 'Spotify — Wrapped 2026 Promo',
      priority: 5,
      startDate: daysAgo(5),
      endDate: daysFromNow(25),
      goalType: 'CPM',
      totalLimit: 40000,
      delivered: 8100,
      targeting: { device: ['Desktop', 'Mobile'], geo: ['US', 'IN', 'UK'] },
      creativeDetails: {
        mediaUrl: 'https://picsum.photos/970/90?random=4',
        clickUrl: 'https://www.spotify.com/wrapped',
      },
      status: 'Active',
    },
    {
      orderId: orders[2]._id,
      advertiserId: advertisers[2]._id, // Samsung
      adUnitId: adUnits[3]._id,         // Half page
      name: 'Samsung — Galaxy S26 Launch',
      priority: 1,
      startDate: daysAgo(3),
      endDate: daysFromNow(27),
      goalType: 'CPM',
      totalLimit: 100000,
      delivered: 12350,
      targeting: { device: ['Desktop', 'Mobile'], geo: ['US', 'IN'] },
      creativeDetails: {
        mediaUrl: 'https://picsum.photos/300/600?random=5',
        clickUrl: 'https://www.samsung.com/galaxy-s26',
      },
      status: 'Active',
    },
    {
      orderId: orders[2]._id,
      advertiserId: advertisers[2]._id, // Samsung
      adUnitId: adUnits[0]._id,         // Header
      name: 'Samsung — Trade-In Offer',
      priority: 4,
      startDate: daysAgo(20),
      endDate: daysAgo(2),
      goalType: 'CPC',
      totalLimit: 25000,
      delivered: 25000,
      targeting: { device: ['Desktop'], geo: ['US'] },
      creativeDetails: {
        mediaUrl: 'https://picsum.photos/728/90?random=6',
        clickUrl: 'https://www.samsung.com/trade-in',
      },
      status: 'Completed',
    },
    {
      orderId: orders[3]._id,
      advertiserId: advertisers[3]._id, // Coursera
      adUnitId: adUnits[1]._id,         // Sidebar
      name: 'Coursera — Google Cert Scholarship',
      priority: 6,
      startDate: daysAgo(12),
      endDate: daysFromNow(18),
      goalType: 'CPC',
      totalLimit: 15000,
      delivered: 7820,
      targeting: { device: ['Desktop', 'Mobile'], geo: ['IN'] },
      creativeDetails: {
        mediaUrl: 'https://picsum.photos/300/250?random=7',
        clickUrl: 'https://www.coursera.org/google-career-certificates',
      },
      status: 'Active',
    },
    {
      orderId: orders[3]._id,
      advertiserId: advertisers[3]._id, // Coursera
      adUnitId: adUnits[2]._id,         // Footer
      name: 'Coursera — Back to School Sale',
      priority: 8,
      startDate: daysAgo(1),
      endDate: daysFromNow(29),
      goalType: 'CPM',
      totalLimit: 60000,
      delivered: 1450,
      targeting: { device: ['Desktop'], geo: ['US', 'IN'] },
      creativeDetails: {
        mediaUrl: 'https://picsum.photos/970/90?random=8',
        clickUrl: 'https://www.coursera.org/sale',
      },
      status: 'Active',
    },
  ];

  const lineItems = await LineItem.insertMany(lineItemsData);
  console.log(`Created ${lineItems.length} line items.`);

  // ── 5. Analytics (14 days of impression/click data) ───────
  const analyticsRecords = [];

  for (const li of lineItems) {
    for (let d = 0; d < 14; d++) {
      const date = new Date(daysAgo(13 - d)); // oldest first
      date.setHours(0, 0, 0, 0);

      // Scale impressions/clicks to match the line item's delivered count
      const dailyImpressions = rand(
        Math.floor(li.delivered / 30),
        Math.floor(li.delivered / 10)
      );
      const dailyClicks = rand(
        Math.floor(dailyImpressions * 0.005),
        Math.floor(dailyImpressions * 0.035)
      );

      analyticsRecords.push({
        lineItemId: li._id,
        date,
        impressions: dailyImpressions,
        clicks: dailyClicks,
      });
    }
  }

  await Analytics.insertMany(analyticsRecords);
  console.log(`Created ${analyticsRecords.length} analytics records (14 days × ${lineItems.length} campaigns).`);

  console.log('\n✅ Database seeded successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
