const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: { type: String },
  customerId: { type: String, index: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true, index: true },
  customerAddress: { type: String, required: true },
  items: { type: Array, default: [] },
  rawSubtotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  coinsUsed: { type: Number, default: 0 },
  coinsEarned: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },
  paymentMethod: { type: String, default: 'cash' },
  advancePaid: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  distanceKm: { type: Number, default: 1.2 },
  distanceZoneLabel: { type: String, default: '' },
  isFreeDeliveryApplied: { type: Boolean, default: false },
  status: { type: String, default: 'pending', index: true },
  orderDate: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
