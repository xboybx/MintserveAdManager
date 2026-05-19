const express = require('express');
const router = express.Router();
const AdUnit = require('../models/AdUnit');
const LineItem = require('../models/LineItem');
const Advertiser = require('../models/Advertiser');
const Order = require('../models/Order');
const Analytics = require('../models/Analytics');

// ==========================================
// AD UNIT CRUD
// ==========================================

// POST /api/admin/ad-units - Create a new inventory slot.
router.post('/ad-units', async (req, res) => {
  try {
    const adUnit = new AdUnit(req.body);
    await adUnit.save();
    res.status(201).json(adUnit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/admin/ad-units - Get all inventory slots.
router.get('/ad-units', async (req, res) => {
  try {
    const adUnits = await AdUnit.find().sort({ name: 1 });
    res.json(adUnits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/ad-units/:id - Update an inventory slot.
router.put('/ad-units/:id', async (req, res) => {
  try {
    const adUnit = await AdUnit.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!adUnit) return res.status(404).json({ error: 'Ad Unit not found' });
    res.json(adUnit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/ad-units/:id - Delete an ad unit.
router.delete('/ad-units/:id', async (req, res) => {
  try {
    const adUnit = await AdUnit.findByIdAndDelete(req.params.id);
    if (!adUnit) return res.status(404).json({ error: 'Ad Unit not found' });
    // Also deactivate or clean up line items referencing this ad unit if needed
    await LineItem.updateMany({ adUnitId: req.params.id }, { status: 'Paused' });
    res.json({ message: 'Ad Unit deleted and related line items paused.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// ADVERTISER CRUD
// ==========================================

// POST /api/admin/advertisers - Create a new advertiser.
router.post('/advertisers', async (req, res) => {
  try {
    const advertiser = new Advertiser(req.body);
    await advertiser.save();
    res.status(201).json(advertiser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/admin/advertisers - Get all advertisers.
router.get('/advertisers', async (req, res) => {
  try {
    const advertisers = await Advertiser.find().sort({ name: 1 });
    res.json(advertisers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/advertisers/:id - Update an advertiser.
router.put('/advertisers/:id', async (req, res) => {
  try {
    const advertiser = await Advertiser.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!advertiser) return res.status(404).json({ error: 'Advertiser not found' });
    res.json(advertiser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/advertisers/:id - Delete an advertiser.
router.delete('/advertisers/:id', async (req, res) => {
  try {
    const advertiser = await Advertiser.findByIdAndDelete(req.params.id);
    if (!advertiser) return res.status(404).json({ error: 'Advertiser not found' });
    // Pause all related line items and orders
    await Order.updateMany({ advertiserId: req.params.id }, { status: 'Paused' });
    await LineItem.updateMany({ advertiserId: req.params.id }, { status: 'Paused' });
    res.json({ message: 'Advertiser deleted and associated campaigns paused.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// ORDER CRUD (Google Ad Manager style)
// ==========================================

// POST /api/admin/orders - Create a new order.
router.post('/orders', async (req, res) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/admin/orders - Get all orders.
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().populate('advertiserId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/orders/:id - Update an order.
router.put('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // If order is paused/completed, propagate status to related line items
    if (req.body.status === 'Paused') {
      await LineItem.updateMany({ orderId: req.params.id }, { status: 'Paused' });
    } else if (req.body.status === 'Approved') {
      await LineItem.updateMany({ orderId: req.params.id }, { status: 'Active' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/orders/:id - Delete an order and its line items.
router.delete('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    
    // Delete all line items linked to this order
    const lineItems = await LineItem.find({ orderId: req.params.id });
    const liIds = lineItems.map(item => item._id);
    await LineItem.deleteMany({ orderId: req.params.id });
    await Analytics.deleteMany({ lineItemId: { $in: liIds } });

    res.json({ message: 'Order and all its line items and analytics deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// LINE ITEM CRUD
// ==========================================

// POST /api/admin/line-items - Traffic a new ad campaign.
router.post('/line-items', async (req, res) => {
  try {
    // If advertiserId is not provided in body, get it from the linked Order
    let advertiserId = req.body.advertiserId;
    if (!advertiserId && req.body.orderId) {
      const order = await Order.findById(req.body.orderId);
      if (order) {
        advertiserId = order.advertiserId;
      }
    }
    
    const lineItem = new LineItem({
      ...req.body,
      advertiserId
    });
    
    await lineItem.save();
    res.status(201).json(lineItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET /api/admin/line-items - Get all campaigns.
router.get('/line-items', async (req, res) => {
  try {
    const lineItems = await LineItem.find()
      .populate('advertiserId adUnitId orderId')
      .sort({ createdAt: -1 });
    res.json(lineItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/line-items/:id - Update a line item.
router.put('/line-items/:id', async (req, res) => {
  try {
    const lineItem = await LineItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lineItem) return res.status(404).json({ error: 'Line Item not found' });
    res.json(lineItem);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/admin/line-items/:id - Delete a line item.
router.delete('/line-items/:id', async (req, res) => {
  try {
    const lineItem = await LineItem.findByIdAndDelete(req.params.id);
    if (!lineItem) return res.status(404).json({ error: 'Line Item not found' });
    // Clean up analytics for this line item
    await Analytics.deleteMany({ lineItemId: req.params.id });
    res.json({ message: 'Line Item and its analytics deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ==========================================
// REPORTS & ANALYTICS
// ==========================================

// GET /api/admin/reports - Fetch impression/click aggregations for charts.
router.get('/reports', async (req, res) => {
  try {
    const reports = await Analytics.aggregate([
      {
        $group: {
          _id: null,
          totalImpressions: { $sum: '$impressions' },
          totalClicks: { $sum: '$clicks' }
        }
      }
    ]);
    
    const impressions = reports[0] ? reports[0].totalImpressions : 0;
    const clicks = reports[0] ? reports[0].totalClicks : 0;
    const realRevenue = (impressions / 1000) * 1.5 + (clicks * 0.5); // $1.5 CPM, $0.5 CPC

    // Fetch daily metrics for the last 14 days
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const dailyReports = await Analytics.aggregate([
      { $match: { date: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          impressions: { $sum: '$impressions' },
          clicks: { $sum: '$clicks' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      impressions,
      clicks,
      revenue: realRevenue,
      daily: dailyReports.map(day => ({
        date: day._id,
        impressions: day.impressions,
        clicks: day.clicks
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
