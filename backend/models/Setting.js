const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, default: 'global_store_settings', unique: true },
  storeName: { type: String, default: 'Ankush General Store' },
  storeAddress: { type: String, default: 'Khorma, Pratappur, District Surajpur' },
  mapLocationUrl: { type: String, default: 'https://www.google.com/maps/search/?api=1&query=23.4865,83.2085' },
  logoUrl: { type: String, default: '' },
  firstOfferColorTheme: { type: String, default: 'royal-purple' },
  isStoreOpen: { type: Boolean, default: true },
  closureReason: { type: String, default: '' },
  closureMessage: { type: String, default: 'Aaj Hamari Dukaan Band Hai. Kripya thodi der baad ya kal subah dobara padharein. Dhanyawad!' },
  aboutContent: { type: Object, default: {} },
  socialLinks: { type: Object, default: {} },
  carouselEnabled: { type: Boolean, default: true },
  carouselImages: { type: Array, default: [] },
  coinRules: { type: Object, default: {} },
  monthlyRankingBars: { type: Array, default: [] },
  deliveryDistanceConfig: { type: Object, default: {} },
  storeCategories: { type: Array, default: [] },
  storeBanners: { type: Object, default: {} },
  dailyDealsConfig: { type: Object, default: {} }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
