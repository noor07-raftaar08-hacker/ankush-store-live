const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: String,
  customerName: String,
  customerPhone: String,
  customerAddress: String,
  items: Array,
  totalAmount: Number,
  deliveryCharge: Number,
  coinsUsed: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  finalAmount: Number,
  paymentMethod: String,
  advancePaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  status: { type: String, default: 'pending' },
  orderDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);