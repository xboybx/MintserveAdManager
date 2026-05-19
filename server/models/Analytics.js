const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  lineItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'LineItem' },
  date: { type: Date, default: Date.now },
  impressions: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
