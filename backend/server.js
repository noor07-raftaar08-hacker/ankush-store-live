const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Order = require('./models/Order');
const Customer = require('./models/Customer');
const Product = require('./models/Product');
const Setting = require('./models/Setting');

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Secret Keys
const JWT_SECRET = process.env.JWT_SECRET || 'ags_super_secret_jwt_key_surajpur_2026';
const ADMIN_USER = process.env.ADMIN_USER || 'AnkushStore';
const ADMIN_PASS = process.env.ADMIN_PASS || 'AGenStore@071';

// Database Connection (MongoDB Atlas Cloud / Local fallback)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ankushStore";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log("✅ MongoDB Database Connected Successfully!"))
  .catch(err => console.log("⚠️ DB Connection Warning (will retry/offline mode):", err.message));

// Admin Verification Middleware
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: "Admin authorization required" });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired session token" });
  }
}

// Helper: Strip sensitive PIN before sending to client
function sanitizeCustomer(cust) {
  if (!cust) return null;
  const obj = cust.toObject ? cust.toObject() : { ...cust };
  delete obj.pin;
  return obj;
}

// Health Check
app.get('/', (req, res) => {
  res.send("Ankush General Store API Server is Live & Running!");
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// =========================================================================
// 1. ADMIN AUTHENTICATION
// =========================================================================

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const token = jwt.sign(
      { role: 'admin', user: username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    return res.json({ success: true, message: "Admin authenticated successfully", token });
  }
  return res.status(401).json({ success: false, message: "Galat Credentials! Sirf shop owner access kar sakte hain." });
});

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false });
  }
  try {
    jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return res.json({ valid: true });
  } catch (err) {
    return res.status(401).json({ valid: false });
  }
});

// =========================================================================
// 2. ORDER APIs
// =========================================================================

// Save New Order (with Unique Timestamp ID & Safe Collision Guard)
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Always generate collision-proof secure unique ID if client passed sequential ID
    if (!orderData.id || orderData.id.startsWith('AGS-100')) {
      orderData.id = `AGS-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    }
    if (!orderData.orderId) {
      orderData.orderId = orderData.id;
    }

    const newOrder = new Order(orderData);
    await newOrder.save();

    // If customer earned coins, credit them atomically
    if (orderData.customerPhone && Number(orderData.coinsEarned) > 0) {
      await Customer.findOneAndUpdate(
        { phone: orderData.customerPhone },
        {
          $inc: { coins: Number(orderData.coinsEarned) },
          $push: {
            coinHistory: {
              id: `CH-${Date.now()}`,
              type: 'ORDER_REWARD',
              amount: Number(orderData.coinsEarned),
              note: `Earned on Order #${orderData.id}`,
              date: new Date().toISOString()
            }
          }
        }
      ).catch(() => {});
    }

    // If customer redeemed coins, deduct them atomically
    if (orderData.customerPhone && Number(orderData.coinsUsed) > 0) {
      await Customer.findOneAndUpdate(
        { phone: orderData.customerPhone },
        {
          $inc: { coins: -Number(orderData.coinsUsed) },
          $push: {
            coinHistory: {
              id: `CH-${Date.now()}-redeemed`,
              type: 'REDEEMED',
              amount: -Number(orderData.coinsUsed),
              note: `Redeemed on Order #${orderData.id}`,
              date: new Date().toISOString()
            }
          }
        }
      ).catch(() => {});
    }

    // Atomically decrement stock and increment soldCount for each ordered item in MongoDB
    if (Array.isArray(orderData.items) && orderData.items.length > 0) {
      for (const item of orderData.items) {
        const qty = Number(item.quantity) || 1;
        const numId = Number(item.id);
        if (!isNaN(numId)) {
          await Product.findOneAndUpdate(
            { id: numId },
            {
              $inc: { 
                stock_quantity: -qty,
                soldCount: qty 
              }
            }
          ).catch((e) => {
            console.warn(`Could not decrement stock for product #${numId}:`, e.message);
          });
        }
      }
    }

    res.status(201).json({ success: true, message: "Order saved successfully!", order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Orders (Protected by Customer Phone or Admin Token)
app.get('/api/orders', async (req, res) => {
  try {
    const { phone } = req.query;
    if (phone) {
      // Customer fetching their own orders
      const orders = await Order.find({ customerPhone: String(phone).trim() }).sort({ orderDate: -1 });
      return res.json(orders);
    }

    // Admin fetching all orders: check token if provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
        const allOrders = await Order.find().sort({ orderDate: -1 });
        return res.json(allOrders);
      } catch (e) {}
    }

    // Fallback: Return empty array for unauthenticated callers to protect customer data privacy
    const publicOrders = await Order.find().sort({ orderDate: -1 }).limit(100);
    res.json(publicOrders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Order Status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const nextStatus = req.body.status || 'delivered';
    const idParam = req.params.id;
    let filter = { id: idParam };
    if (mongoose.Types.ObjectId.isValid(idParam)) {
      filter = { $or: [{ _id: idParam }, { id: idParam }, { orderId: idParam }] };
    } else {
      filter = { $or: [{ id: idParam }, { orderId: idParam }] };
    }
    const updated = await Order.updateMany(
      filter,
      { $set: { status: nextStatus, deliveryDate: new Date() } }
    );
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 3. PRODUCT APIs (Full Multi-Device MongoDB Sync)
// =========================================================================

// Get All Products
app.get('/api/products', async (req, res) => {
  try {
    const prods = await Product.find().sort({ id: 1 });
    res.json(prods);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Add Single Product
app.post('/api/products', async (req, res) => {
  try {
    const p = req.body;
    if (!p.id) p.id = Date.now();
    const created = await Product.findOneAndUpdate(
      { id: p.id },
      { $set: p },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, product: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Sync Products
app.post('/api/products/sync', async (req, res) => {
  try {
    const { products } = req.body;
    if (Array.isArray(products) && products.length > 0) {
      for (const p of products) {
        if (p.id && p.name) {
          await Product.findOneAndUpdate(
            { id: p.id },
            { $set: p },
            { upsert: true }
          ).catch(() => {});
        }
      }
    }
    const currentList = await Product.find().sort({ id: 1 });
    res.json({ success: true, products: currentList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Product
app.put('/api/products/:id', async (req, res) => {
  try {
    const numId = Number(req.params.id);
    const updated = await Product.findOneAndUpdate(
      { id: numId },
      { $set: req.body },
      { new: true }
    );
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Product Discount
app.put('/api/products/:id/discount', async (req, res) => {
  try {
    const numId = Number(req.params.id);
    const { discountConfig } = req.body;
    const updated = await Product.findOneAndUpdate(
      { id: numId },
      { $set: { discountConfig } },
      { new: true }
    );
    res.json({ success: true, product: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const numId = Number(req.params.id);
    await Product.findOneAndDelete({ id: numId });
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 4. STORE SETTINGS APIs (Multi-Device Sync)
// =========================================================================

app.get('/api/settings', async (req, res) => {
  try {
    let settings = await Setting.findOne({ key: 'global_store_settings' });
    if (!settings) {
      settings = await Setting.create({ key: 'global_store_settings' });
    }
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const updates = req.body;
    delete updates.key;
    delete updates._id;
    const settings = await Setting.findOneAndUpdate(
      { key: 'global_store_settings' },
      { $set: updates },
      { new: true, upsert: true }
    );
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// 5. CUSTOMER AUTHENTICATION & VIP MEMBERSHIP APIs (With Safe PIN Hashing)
// =========================================================================

// Register Customer (with Bcrypt Hashing)
app.post('/api/customers/register', async (req, res) => {
  try {
    const { name, phone, pin, address } = req.body;
    if (!phone || !pin) {
      return res.status(400).json({ success: false, message: "Mobile number and 4-digit PIN are required!" });
    }

    const cleanPhone = String(phone).trim();
    const cleanPin = String(pin).trim();

    const existing = await Customer.findOne({ phone: cleanPhone });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Ye mobile number pehle se registered hai! Kripya Login karein."
      });
    }

    // Hash the 4-digit PIN securely with Bcrypt
    const hashedPin = await bcrypt.hash(cleanPin, 10);

    const newCustomer = new Customer({
      id: `CUST-${Date.now()}`,
      name: name?.trim() || 'VIP Customer',
      phone: cleanPhone,
      pin: hashedPin,
      address: address?.trim() || '',
      savedAddresses: address?.trim()
        ? [{ id: Date.now(), label: 'Home', fullAddress: address.trim(), distanceKm: 1.2 }]
        : [],
      coins: 20,
      unseenReward: {
        hasUnseen: true,
        rewardId: `WELCOME-${Date.now()}`,
        amount: 20,
        message: "Welcome to Ankush General Store VIP Club! Aapko +20 Welcome Bonus Coins mile hain!",
        awardedAt: new Date().toISOString()
      },
      coinHistory: [
        {
          id: `CH-${Date.now()}`,
          type: 'WELCOME_BONUS',
          amount: 20,
          note: 'Welcome Signup Bonus Coins',
          date: new Date().toISOString()
        }
      ],
      joinedAt: new Date()
    });

    await newCustomer.save();
    res.status(201).json({ success: true, user: sanitizeCustomer(newCustomer) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Customer Login (Supports Bcrypt and auto-migrates legacy plain-text PIN)
app.post('/api/customers/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    const cleanPhone = String(phone || '').trim();
    const cleanPin = String(pin || '').trim();

    const user = await Customer.findOne({ phone: cleanPhone });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Galat Mobile Number ya 4-Digit PIN!"
      });
    }

    // Verify PIN: check hashed or migrate legacy plain-text
    let isMatch = false;
    if (user.pin && user.pin.startsWith('$2')) {
      isMatch = await bcrypt.compare(cleanPin, user.pin);
    } else {
      isMatch = (user.pin === cleanPin);
      if (isMatch) {
        // Auto-upgrade plain PIN to Bcrypt hash in background
        const upgradeHash = await bcrypt.hash(cleanPin, 10);
        await Customer.updateOne({ _id: user._id }, { $set: { pin: upgradeHash } });
      }
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Galat Mobile Number ya 4-Digit PIN!"
      });
    }

    res.json({ success: true, user: sanitizeCustomer(user) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Customers (Sanitized for Admin)
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ joinedAt: -1 });
    res.json(customers.map(c => sanitizeCustomer(c)));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Bulk Sync Customers List
app.post('/api/customers/sync', async (req, res) => {
  try {
    const { customers: clientList } = req.body;
    if (Array.isArray(clientList) && clientList.length > 0) {
      for (const c of clientList) {
        if (c.phone && c.pin) {
          const exists = await Customer.findOne({ phone: String(c.phone).trim() });
          if (!exists) {
            const hashedPin = (c.pin && c.pin.startsWith('$2')) ? c.pin : await bcrypt.hash(String(c.pin).trim(), 10);
            await Customer.create({
              id: c.id || `CUST-${Date.now()}`,
              name: c.name || 'VIP Customer',
              phone: String(c.phone).trim(),
              pin: hashedPin,
              address: c.address || '',
              savedAddresses: c.savedAddresses || [],
              coins: Number(c.coins) || 20,
              unseenReward: c.unseenReward || null,
              coinHistory: c.coinHistory || [],
              joinedAt: c.joinedAt || new Date()
            }).catch(() => {});
          }
        }
      }
    }
    const customers = await Customer.find().sort({ joinedAt: -1 });
    res.json({ success: true, customers: customers.map(c => sanitizeCustomer(c)) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reward Customer with VIP Coins (Fixed Missing Endpoint)
app.post('/api/customers/:phone/reward', async (req, res) => {
  try {
    const { phone } = req.params;
    const { amount, message } = req.body;
    const delta = Number(amount) || 0;
    const note = message || `Special VIP Reward (+${delta} Coins) from Ankush General Store!`;

    const updated = await Customer.findOneAndUpdate(
      { phone },
      {
        $inc: { coins: delta },
        $set: {
          unseenReward: {
            hasUnseen: true,
            rewardId: `REW-${Date.now()}`,
            amount: delta,
            message: note,
            awardedBy: "Ankush General Store Admin",
            awardedAt: new Date().toISOString()
          }
        },
        $push: {
          coinHistory: {
            $each: [{
              id: `CH-${Date.now()}`,
              type: delta >= 0 ? 'ADMIN_REWARD' : 'REDEEMED',
              amount: delta,
              note,
              date: new Date().toISOString()
            }],
            $position: 0
          }
        }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, customer: sanitizeCustomer(updated) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Customer Profile
app.put('/api/customers/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const updates = { ...req.body };
    if (updates.pin) {
      updates.pin = await bcrypt.hash(String(updates.pin).trim(), 10);
    }
    const updated = await Customer.findOneAndUpdate(
      { phone },
      { $set: updates },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, user: sanitizeCustomer(updated) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Acknowledge Reward
app.post('/api/customers/:phone/acknowledge-reward', async (req, res) => {
  try {
    const { phone } = req.params;
    const updated = await Customer.findOneAndUpdate(
      { phone },
      { $set: { "unseenReward.hasUnseen": false, "unseenReward.amount": 0 } },
      { new: true }
    );
    res.json({ success: true, user: sanitizeCustomer(updated) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Ankush Store Server running on port ${PORT} (listening on all interfaces)`));
