const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, index: true, trim: true },
  pin: { type: String, required: true },
  address: { type: String, default: '' },
  savedAddresses: { type: Array, default: [] },
  coins: { type: Number, default: 20 },
  unseenReward: { type: Object, default: null },
  coinHistory: { type: Array, default: [] },
  joinedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
