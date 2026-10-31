const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Order = require('./models/Order');
const Customer = require('./models/Customer');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection (MongoDB Atlas Cloud / Local fallback)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ankushStore";

mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
})
  .then(() => console.log("✅ MongoDB Database Connected Successfully!"))
  .catch(err => console.log("⚠️ DB Connection Warning (will retry/offline mode):", err.message));

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
// 1. ORDER APIs
// =========================================================================

// Save New Order
app.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.id) {
      orderData.id = `AGS-${Date.now()}`;
    }

    // Check if order already exists
    const existing = await Order.findOne({ id: orderData.id });
    if (existing) {
      Object.assign(existing, orderData);
      await existing.save();
      return res.status(200).json({ success: true, message: "Order updated!", order: existing });
    }

    const newOrder = new Order(orderData);
    await newOrder.save();

    // If customer earned coins, credit them automatically
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

    // If customer redeemed coins, deduct them automatically
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

    res.status(201).json({ success: true, message: "Order saved successfully!", order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Orders (Sorted by date)
app.get('/api/orders', async (req, res) => {
  try {
    const { phone } = req.query;
    const query = phone ? { customerPhone: phone } : {};
    const orders = await Order.find(query).sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Order Status (e.g. delivered, processing, cancelled)
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
// 2. CUSTOMER AUTHENTICATION & VIP MEMBERSHIP APIs
// =========================================================================

// Register Customer
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

    const newCustomer = new Customer({
      id: `CUST-${Date.now()}`,
      name: name?.trim() || 'VIP Customer',
      phone: cleanPhone,
      pin: cleanPin,
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
    res.status(201).json({ success: true, user: newCustomer });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Customer Login
app.post('/api/customers/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;
    const cleanPhone = String(phone || '').trim();
    const cleanPin = String(pin || '').trim();

    const user = await Customer.findOne({ phone: cleanPhone });
    if (!user || user.pin !== cleanPin) {
      return res.status(401).json({
        success: false,
        message: "Galat Mobile Number ya 4-Digit PIN!"
      });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Customers (For Admin Dashboard)
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ joinedAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Sync Customers List
app.post('/api/customers/sync', async (req, res) => {
  try {
    const { customers: clientList } = req.body;
    if (Array.isArray(clientList) && clientList.length > 0) {
      for (const c of clientList) {
        if (c.phone && c.pin) {
          const exists = await Customer.findOne({ phone: String(c.phone).trim() });
          if (!exists) {
            await Customer.create({
              id: c.id || `CUST-${Date.now()}`,
              name: c.name || 'VIP Customer',
              phone: String(c.phone).trim(),
              pin: String(c.pin).trim(),
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
    res.json({ success: true, customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Customer Profile & Rewards
app.put('/api/customers/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    const updates = req.body;
    const updated = await Customer.findOneAndUpdate(
      { phone },
      { $set: updates },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }
    res.json({ success: true, user: updated });
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
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Ankush Store Server running on port ${PORT} (listening on all interfaces)`));
