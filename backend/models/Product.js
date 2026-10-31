const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, default: 'Groceries', trim: true },
  price: { type: Number, required: true, default: 0 },
  mrp: { type: Number, default: 0 },
  unit: { type: String, default: 'kg', trim: true },
  stock_quantity: { type: Number, default: 100 },
  stockStatus: { type: String, default: 'Full Stock' },
  image_url: { type: String, default: '🛒' },
  bestseller: { type: Boolean, default: false },
  soldCount: { type: Number, default: 50 },
  packages: { type: Array, default: [] },
  discountConfig: { type: Object, default: {} },
  rating: { type: Number, default: 4.8 },
  reviews: { type: Array, default: [] }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
