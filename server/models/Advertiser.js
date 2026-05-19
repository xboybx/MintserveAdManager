const mongoose = require('mongoose');

const advertiserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactEmail: String,
  totalSpend: { type: Number, default: 0 }
});

module.exports = mongoose.model('Advertiser', advertiserSchema);
