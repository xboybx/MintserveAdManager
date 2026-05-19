const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  advertiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Advertiser', required: true },
  trafficker: { type: String, default: 'Ad Server Admin' },
  status: { type: String, enum: ['Draft', 'Approved', 'Paused', 'Completed'], default: 'Approved' },
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
