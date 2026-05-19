const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertiser' },
  adUnitId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdUnit' },
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
    mediaUrl: String,
    clickUrl: String
  },
  status: { type: String, enum: ['Active', 'Paused', 'Completed'], default: 'Active' }
});

module.exports = mongoose.model('LineItem', lineItemSchema);
