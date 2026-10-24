const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Order = require('./models/Order');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection (Local MongoDB for testing)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ankushStore";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Database Connected Successfully!"))
  .catch(err => console.log("❌ DB Connection Error: ", err));

app.get('/', (req, res) => {
  res.send("Ankush General Store Backend is Running!");
});

// Save Order API
app.post('/api/orders', async (req, res) => {
  try {
    const newOrder = new Order(req.body);
    await newOrder.save();
    res.status(201).json({ success: true, message: "Order saved!", order: newOrder });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get All Orders API
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Order Status API
app.put('/api/orders/:id', async (req, res) => {
  try {
    const updated = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status: 'delivered' },
      { new: true }
    );
    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));