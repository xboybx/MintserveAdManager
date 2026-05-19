const express = require('express');
const router = express.Router();
const LineItem = require('../models/LineItem');
const Analytics = require('../models/Analytics');

// GET /api/serve
// Query Params: ?adUnitId=123&device=mobile&geo=IN
router.get('/serve', async (req, res) => {
  try {
    const { adUnitId, device, geo } = req.query;

    if (!adUnitId) {
      return res.status(400).json({ error: 'adUnitId is required' });
    }

    // 1. Find active Line Items targeting this Ad Unit
    // 2. Filter by geo and device
    // 3. Ensure limits are not exceeded
    // 4. Sort by priority
    const currentDate = new Date();
    
    const query = {
      adUnitId,
      status: 'Active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate },
      $expr: { $lt: ['$delivered', '$totalLimit'] }
    };

    if (device) {
      query['targeting.device'] = device;
    }
    
    if (geo) {
      query['targeting.geo'] = geo;
    }

    const eligibleLineItems = await LineItem.find(query).sort({ priority: 1 }).lean();

    if (eligibleLineItems.length === 0) {
      return res.status(404).json({ error: 'No eligible ads found' });
    }

    // Pick the highest priority (first one after sorting)
    const winningAd = eligibleLineItems[0];
    
    const backendUrl = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}`;

    // Return the creative and tracking links
    res.json({
      mediaUrl: winningAd.creativeDetails.mediaUrl,
      trackingPixels: {
        impressionUrl: `${backendUrl}/api/track/impression?lineItemId=${winningAd._id}`,
        clickUrl: `${backendUrl}/api/track/click?lineItemId=${winningAd._id}&redirectUrl=${encodeURIComponent(winningAd.creativeDetails.clickUrl)}`
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/track/impression
router.get('/track/impression', async (req, res) => {
  try {
    const { lineItemId } = req.query;

    if (!lineItemId) return res.status(400).send('lineItemId required');

    // Increment LineItem delivered count
    await LineItem.findByIdAndUpdate(lineItemId, { $inc: { delivered: 1 } });

    // Update Analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.findOneAndUpdate(
      { lineItemId, date: today },
      { $inc: { impressions: 1 } },
      { upsert: true, new: true }
    );

    // Return a 1x1 transparent pixel
    const pixel = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
    res.writeHead(200, {
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
    });
    res.end(pixel);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

// GET /api/track/click
router.get('/track/click', async (req, res) => {
  try {
    const { lineItemId, redirectUrl } = req.query;

    if (!lineItemId || !redirectUrl) {
      return res.status(400).send('lineItemId and redirectUrl required');
    }

    // Update Analytics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Analytics.findOneAndUpdate(
      { lineItemId, date: today },
      { $inc: { clicks: 1 } },
      { upsert: true, new: true }
    );

    // Redirect to advertiser's URL
    res.redirect(302, redirectUrl);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error');
  }
});

module.exports = router;
