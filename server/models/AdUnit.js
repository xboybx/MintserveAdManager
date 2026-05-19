const mongoose = require('mongoose');

const adUnitSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Right_Sidebar_300x250"
  dimensions: { 
    width: Number, 
    height: Number 
  },
  basePriceFloor: Number,
  isActive: { type: Boolean, default: true }
});

module.exports = mongoose.model('AdUnit', adUnitSchema);
