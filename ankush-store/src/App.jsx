import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- SHOP CONFIGURATION (Yahan apna number aur UPI ID set karein) ---
const SHOP_WHATSAPP_NUMBER = "8817425506"; // Apna 10 digit number 91 ke sath dalein
const SHOP_UPI_ID = "8817425506@axl"; // Apna asli UPI ID yahan dalein

// --- LUCIDE ICONS COMPONENTS ---
const Icon = ({ path, className = "w-5 h-5", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {path}
  </svg>
);

const ShoppingBag = (props) => <Icon {...props} path={<><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></>} />;
const ShoppingCart = (props) => <Icon {...props} path={<><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></>} />;
const Store = (props) => <Icon {...props} path={<><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></>} />;
const Plus = (props) => <Icon {...props} path={<><path d="M5 12h14"/><path d="M12 5v14"/></>} />;
const Minus = (props) => <Icon {...props} path={<path d="M5 12h14"/>} />;
const Trash2 = (props) => <Icon {...props} path={<><path d="3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></>} />;
const X = (props) => <Icon {...props} path={<><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>} />;
const Sparkles = (props) => <Icon {...props} path={<><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></>} />;
const Gift = (props) => <Icon {...props} path={<><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/></>} />;
const Tag = (props) => <Icon {...props} path={<><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></>} />;
const CheckCircle = (props) => <Icon {...props} path={<><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>} />;
const Clock = (props) => <Icon {...props} path={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />;
const Search = (props) => <Icon {...props} path={<><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>} />;
const Calendar = (props) => <Icon {...props} path={<><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></>} />;
const ImageIcon = (props) => <Icon {...props} path={<><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></>} />;
const Eye = (props) => <Icon {...props} path={<><path d="2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>} />;
const EyeOff = (props) => <Icon {...props} path={<><path d="9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></>} />;
const LogOut = (props) => <Icon {...props} path={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></>} />;
const AlertCircle = (props) => <Icon {...props} path={<><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></>} />;
const Banknote = (props) => <Icon {...props} path={<><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></>} />;
const Smartphone = (props) => <Icon {...props} path={<><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></>} />;
const Printer = (props) => <Icon {...props} path={<><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect width="12" height="8" x="6" y="14"/></>} />;
const Lock = (props) => <Icon {...props} path={<><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>} />;
const User = (props) => <Icon {...props} path={<><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />;
const Users = (props) => <Icon {...props} path={<><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />;
const Menu = (props) => <Icon {...props} path={<><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></>} />;
const Mic = (props) => <Icon {...props} path={<><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></>} />;
const Coins = (props) => <Icon {...props} path={<><circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/></>} />;

// --- INITIAL DATA (Exact Reference Products + Bestseller Flags) ---
const initialProducts = [
  { id: 1, name: "Basmati Rice", category: "Groceries", price: 85, mrp: 100, unit: "kg", stock_quantity: 200, image_url: "🍚", bestseller: true },
  { id: 2, name: "Toor Dal", category: "Groceries", price: 140, mrp: 160, unit: "kg", stock_quantity: 150, image_url: "🫘", bestseller: true },
  { id: 3, name: "Wheat Flour (Atta)", category: "Groceries", price: 45, mrp: 52, unit: "kg", stock_quantity: 300, image_url: "🌾", bestseller: true },
  { id: 4, name: "Sugar", category: "Groceries", price: 42, mrp: 48, unit: "kg", stock_quantity: 250, image_url: "🍬" },
  { id: 5, name: "Mustard Oil", category: "Groceries", price: 180, mrp: 210, unit: "liter", stock_quantity: 100, image_url: "🫒", bestseller: true },
  { id: 6, name: "Salt", category: "Groceries", price: 25, mrp: 28, unit: "kg", stock_quantity: 400, image_url: "🧂" },
  { id: 7, name: "Turmeric Powder", category: "Groceries", price: 60, mrp: 70, unit: "packet", stock_quantity: 180, image_url: "🟡" },
  { id: 8, name: "Red Chilli Powder", category: "Groceries", price: 55, mrp: 65, unit: "packet", stock_quantity: 160, image_url: "🌶️" },
  { id: 9, name: "Moong Dal", category: "Groceries", price: 120, mrp: 135, unit: "kg", stock_quantity: 130, image_url: "🫘" },
  { id: 10, name: "Groundnut Oil", category: "Groceries", price: 210, mrp: 240, unit: "liter", stock_quantity: 80, image_url: "🥜" },
  { id: 11, name: "Coca Cola", category: "Cold Drinks", price: 40, mrp: 45, unit: "piece", stock_quantity: 200, image_url: "🥤", bestseller: true },
  { id: 12, name: "Pepsi", category: "Cold Drinks", price: 40, mrp: 45, unit: "piece", stock_quantity: 180, image_url: "🥤" },
  { id: 13, name: "Sprite", category: "Cold Drinks", price: 40, mrp: 45, unit: "piece", stock_quantity: 150, image_url: "🍋" },
  { id: 14, name: "Fanta", category: "Cold Drinks", price: 40, mrp: 45, unit: "piece", stock_quantity: 120, image_url: "🍊" },
  { id: 15, name: "Mineral Water (1L)", category: "Cold Drinks", price: 20, mrp: 20, unit: "piece", stock_quantity: 500, image_url: "💧" },
  { id: 16, name: "Mango Juice", category: "Cold Drinks", price: 30, mrp: 35, unit: "piece", stock_quantity: 100, image_url: "🥭" },
  { id: 17, name: "Lassi", category: "Cold Drinks", price: 35, mrp: 40, unit: "piece", stock_quantity: 80, image_url: "🥛" },
  { id: 18, name: "Buttermilk", category: "Cold Drinks", price: 15, mrp: 20, unit: "piece", stock_quantity: 60, image_url: "🥛" },
  { id: 19, name: "Surf Excel", category: "Household", price: 120, mrp: 135, unit: "kg", stock_quantity: 90, image_url: "🧴", bestseller: true },
  { id: 20, name: "Vim Bar", category: "Household", price: 30, mrp: 35, unit: "piece", stock_quantity: 200, image_url: "🧽" },
  { id: 21, name: "Dettol Soap", category: "Household", price: 45, mrp: 50, unit: "piece", stock_quantity: 150, image_url: "🧼" },
  { id: 22, name: "Toothpaste", category: "Household", price: 80, mrp: 95, unit: "piece", stock_quantity: 100, image_url: "🪥" },
  { id: 23, name: "Shampoo", category: "Household", price: 150, mrp: 175, unit: "piece", stock_quantity: 70, image_url: "🧴" },
  { id: 24, name: "Floor Cleaner", category: "Household", price: 95, mrp: 110, unit: "liter", stock_quantity: 60, image_url: "🧹" },
  { id: 25, name: "Dishwash Gel", category: "Household", price: 110, mrp: 125, unit: "piece", stock_quantity: 85, image_url: "🫧" },
  { id: 26, name: "Garbage Bags", category: "Household", price: 60, mrp: 75, unit: "packet", stock_quantity: 120, image_url: "🗑️" },
  { id: 27, name: "Tissue Paper", category: "Household", price: 40, mrp: 50, unit: "packet", stock_quantity: 200, image_url: "🧻" },
  { id: 28, name: "Incense Sticks", category: "Household", price: 35, mrp: 40, unit: "packet", stock_quantity: 180, image_url: "🪔" }
];

const initialOffers = [
  { id: 1, title: "🪔 Diwali Special Mega Discount!", description: "Flat 20% OFF on all Groceries! Stock up for the festive season!", is_active: true },
  { id: 2, title: "🎉 Buy 2 Get 1 Free on Cold Drinks!", description: "Summer bonanza - Buy any 2 cold drinks and get 1 absolutely FREE!", is_active: true },
  { id: 3, title: "🏠 Household Essentials Sale!", description: "Up to 30% OFF on all household cleaning products. Limited period offer!", is_active: true },
  { id: 4, title: "🛒 Free Home Delivery", description: "Orders above ₹500 get FREE home delivery within 5km radius!", is_active: true }
];

// --- CONTEXT PROVIDERS ---
const CartContext = createContext();
const OrderContext = createContext();
const OfferContext = createContext();
const ProductContext = createContext();
const CustomerContext = createContext();

function AppProviders({ children }) {
  // Products State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('ankush_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const addProduct = (prodData) => {
    const newProd = {
      ...prodData,
      id: Date.now(),
      price: Number(prodData.price),
      mrp: Math.round(Number(prodData.price) * 1.15),
      stock_quantity: Number(prodData.stock_quantity) || 100
    };
    const updated = [newProd, ...products];
    setProducts(updated);
    localStorage.setItem('ankush_products', JSON.stringify(updated));
  };

  // Customers & 4-Digit PIN Auth State
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem('ankush_customers');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('ankush_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isUserLoginOpen, setIsUserLoginOpen] = useState(false);

  // Sync currentUser with customers list
  const saveCustomers = (updatedList, updatedCurrent = currentUser) => {
    setCustomers(updatedList);
    localStorage.setItem('ankush_customers', JSON.stringify(updatedList));
    if (updatedCurrent) {
      setCurrentUser(updatedCurrent);
      localStorage.setItem('ankush_current_user', JSON.stringify(updatedCurrent));
    }
  };

  const registerCustomer = (name, phone, pin, address) => {
    if (customers.find(c => c.phone === phone)) {
      return { success: false, message: "Ye mobile number pehle se registered hai! Kripya Login karein." };
    }
    const newCustomer = {
      id: `CUST${Date.now()}`,
      name,
      phone,
      pin,
      address: address || '',
      coins: 20, // 20 Welcome Bonus Coins!
      joinedAt: new Date().toISOString()
    };
    const updated = [newCustomer, ...customers];
    saveCustomers(updated, newCustomer);
    return { success: true, user: newCustomer };
  };

  const loginCustomer = (phone, pin) => {
    const found = customers.find(c => c.phone === phone && c.pin === pin);
    if (!found) {
      return { success: false, message: "Galat Mobile Number ya 4-Digit PIN!" };
    }
    setCurrentUser(found);
    localStorage.setItem('ankush_current_user', JSON.stringify(found));
    return { success: true, user: found };
  };

  const logoutCustomer = () => {
    setCurrentUser(null);
    localStorage.removeItem('ankush_current_user');
  };

  const updateCustomerData = (phone, deltaCoins, newPin = null) => {
    const updated = customers.map(c => {
      if (c.phone === phone) {
        const nextCoins = Math.max(0, (c.coins || 0) + deltaCoins);
        return { ...c, coins: nextCoins, pin: newPin ? newPin : c.pin };
      }
      return c;
    });
    const updatedCurr = currentUser && currentUser.phone === phone
      ? updated.find(c => c.phone === phone)
      : currentUser;
    saveCustomers(updated, updatedCurr);
  };

  // Cart & Checkout State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [useCoins, setUseCoins] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [cartBounce, setCartBounce] = useState(false);

  // Auto-fill checkout details when user logs in
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name || '');
      setCustomerPhone(currentUser.phone || '');
      if (currentUser.address) setCustomerAddress(currentUser.address);
    }
  }, [currentUser]);

  // Orders State
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('ankush_orders');
    return saved ? JSON.parse(saved) : [];
  });

  // Offers State
  const [offers, setOffers] = useState(() => {
    const saved = localStorage.getItem('ankush_offers');
    return saved ? JSON.parse(saved) : initialOffers;
  });

  const addToCart = (product) => {
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 300);
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setUseCoins(false);
    if (!currentUser) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerAddress('');
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalMRP = cartItems.reduce((sum, item) => sum + (item.mrp || Math.round(item.price * 1.15)) * item.quantity, 0);
  const deliveryCharge = totalPrice >= 1500 ? 0 : 50;
  const availableCoins = currentUser ? currentUser.coins : 0;
  const coinsDiscount = (currentUser && useCoins) ? Math.min(availableCoins, Math.floor(totalPrice * 0.5)) : 0;
  const finalAmount = Math.max(0, totalPrice + deliveryCharge - coinsDiscount);
  const totalSavings = (totalMRP - totalPrice) + (deliveryCharge === 0 && totalPrice > 0 ? 50 : 0) + coinsDiscount;
  const coinsEarnedOnOrder = currentUser ? Math.floor(finalAmount / 100) * 2 : 0; // Har ₹100 par 2 Coins

  const addOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: `ORD${Date.now()}`,
      orderDate: new Date().toISOString(),
      status: 'pending',
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    localStorage.setItem('ankush_orders', JSON.stringify(updated));

    // Update customer coins if logged in
    if (currentUser) {
      const netCoinChange = (orderData.coinsEarned || 0) - (orderData.coinsUsed || 0);
      updateCustomerData(currentUser.phone, netCoinChange);
    }

    // Try saving to backend silently if running
    fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder)
    }).catch(() => {});

  // Direct WhatsApp Message Trigger (Universal API Link)
    const itemsList = newOrder.items.map(i => `• ${i.name} ×${i.quantity} (₹${i.price * i.quantity})`).join('\n');
    const paymentNote = newOrder.paymentMethod === 'cash'
      ? `💵 Cash on Delivery (₹200 Advance Paid, Remaining Due: ₹${Math.max(0, newOrder.finalAmount - 200)})`
      : `📱 UPI Full Payment (₹${newOrder.finalAmount} Paid via QR)`;

    const waText = `🏪 *Ankush General Store - New Order!*\n\n*Order ID:* ${newOrder.id}\n*Customer:* ${newOrder.customerName}\n*Phone:* ${newOrder.customerPhone}\n*Address:* ${newOrder.customerAddress}\n\n*Items Ordered:*\n${itemsList}\n\n*Subtotal:* ₹${newOrder.totalAmount}\n*Delivery:* ${newOrder.deliveryCharge === 0 ? 'FREE' : '₹' + newOrder.deliveryCharge}\n${newOrder.coinsUsed > 0 ? `*Coins Discount:* -₹${newOrder.coinsUsed}\n` : ''}*Final Total:* ₹${newOrder.finalAmount}\n*Payment:* ${paymentNote}`;

    const encodedText = encodeURIComponent(waText);
    
    // Sabse best universal link (Mobile aur PC dono par bina error chalega)
    const waLink = `https://api.whatsapp.com/send?phone=${SHOP_WHATSAPP_NUMBER}&text=${encodedText}`;

    window.open(waLink, '_blank');
    return newOrder;
  };

  const confirmDelivery = (orderId) => {
    const updated = orders.map(order =>
      order.id === orderId
        ? { ...order, status: 'delivered', deliveryDate: new Date().toISOString() }
        : order
    );
    setOrders(updated);
    localStorage.setItem('ankush_orders', JSON.stringify(updated));
  };

  const saveOffers = (newOffers) => {
    setOffers(newOffers);
    localStorage.setItem('ankush_offers', JSON.stringify(newOffers));
  };

  const addOffer = (offerData) => saveOffers([{ ...offerData, id: Date.now() }, ...offers]);
  const toggleOffer = (id) => saveOffers(offers.map(o => (o.id === id ? { ...o, is_active: !o.is_active } : o)));
  const removeOffer = (id) => saveOffers(offers.filter(o => o.id !== id));

  return (
    <ProductContext.Provider value={{ products, addProduct }}>
      <CustomerContext.Provider value={{
        customers, currentUser, registerCustomer, loginCustomer, logoutCustomer,
        updateCustomerData, isUserLoginOpen, setIsUserLoginOpen
      }}>
        <OfferContext.Provider value={{ offers, activeOffers: offers.filter(o => o.is_active), addOffer, toggleOffer, removeOffer }}>
          <OrderContext.Provider value={{
            orders, addOrder, confirmDelivery,
            getPendingOrders: () => orders.filter(o => o.status === 'pending'),
            getDeliveredOrders: () => orders.filter(o => o.status === 'delivered'),
            searchOrdersByName: (q) => (!q.trim() ? orders : orders.filter(o => o.customerName.toLowerCase().includes(q.toLowerCase()))),
            getOrdersByDate: (d) => orders.filter(o => new Date(o.orderDate).toISOString().split('T')[0] === d),
            getTotalSales: () => orders.reduce((s, o) => s + o.finalAmount, 0),
            getSalesByDate: (d) => orders.filter(o => new Date(o.orderDate).toISOString().split('T')[0] === d).reduce((s, o) => s + o.finalAmount, 0)
          }}>
            <CartContext.Provider value={{
              cartItems, addToCart, removeFromCart, updateQuantity, clearCart,
              totalItems, totalPrice, deliveryCharge, finalAmount, totalSavings,
              useCoins, setUseCoins, coinsDiscount, coinsEarnedOnOrder, cartBounce,
              isCartOpen, setIsCartOpen, paymentMethod, setPaymentMethod,
              customerName, setCustomerName, customerPhone, setCustomerPhone,
              customerAddress, setCustomerAddress, isCheckoutOpen, setIsCheckoutOpen,
              isReceiptOpen, setIsReceiptOpen, lastOrder, setLastOrder
            }}>
              {children}
            </CartContext.Provider>
          </OrderContext.Provider>
        </OfferContext.Provider>
      </CustomerContext.Provider>
    </ProductContext.Provider>
  );
}

// --- 1. HEADER (With Customer Wallet, Login & Admin) ---
function Header({ currentView, setCurrentView }) {
  const { totalItems, setIsCartOpen, cartBounce } = useContext(CartContext);
  const { currentUser, setIsUserLoginOpen } = useContext(CustomerContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
      className="sticky top-0 z-40 bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 shadow-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div onClick={() => setCurrentView('home')} className="flex items-center gap-3 cursor-pointer group">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 0.5 }}
              className="bg-white/20 backdrop-blur-sm p-2 rounded-xl"
            >
              <Store className="w-7 h-7 text-yellow-300" />
            </motion.div>
            <div>
              <h1 className="text-white font-bold text-lg sm:text-xl tracking-wide">
                Ankush General Store
              </h1>
              <p className="text-green-200 text-xs hidden sm:block">Your Trusted Local Grocery Shop</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-5">
            <button
              onClick={() => setCurrentView('home')}
              className={`text-sm font-medium transition-colors ${currentView === 'home' ? 'text-yellow-300' : 'text-white/80 hover:text-white'}`}
            >
              🏠 Home
            </button>

            {currentUser ? (
              <button
                onClick={() => setCurrentView('account')}
                className={`text-sm font-semibold px-3 py-1.5 rounded-full flex items-center gap-2 transition-all ${
                  currentView === 'account' ? 'bg-yellow-400 text-green-950 shadow-md' : 'bg-white/15 text-white hover:bg-white/25'
                }`}
              >
                <span>👋 {currentUser.name.split(' ')[0]}</span>
                <span className="bg-yellow-300 text-green-900 text-xs px-2 py-0.5 rounded-full font-extrabold">
                  🪙 {currentUser.coins}
                </span>
              </button>
            ) : (
              <button
                onClick={() => setIsUserLoginOpen(true)}
                className="text-sm font-semibold bg-white/15 hover:bg-white/25 text-white px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
              >
                <User className="w-4 h-4 text-yellow-300" /> Login / Coins
              </button>
            )}

            <button
              onClick={() => setCurrentView('admin')}
              className={`text-sm font-medium transition-colors ${currentView === 'admin' ? 'text-yellow-300' : 'text-white/80 hover:text-white'}`}
            >
              ⚙️ Admin Dashboard
            </button>

            <motion.button
              animate={cartBounce ? { scale: [1, 1.25, 0.95, 1] } : {}}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative bg-yellow-400 hover:bg-yellow-300 text-green-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2 shadow-lg transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Cart</span>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
          </nav>

          <div className="md:hidden flex items-center gap-2.5">
            {currentUser ? (
              <button
                onClick={() => setCurrentView('account')}
                className="bg-white/15 text-white text-xs px-2.5 py-1.5 rounded-full font-bold flex items-center gap-1"
              >
                🪙 {currentUser.coins}
              </button>
            ) : (
              <button
                onClick={() => setIsUserLoginOpen(true)}
                className="bg-white/15 text-white text-xs px-2.5 py-1.5 rounded-full font-semibold"
              >
                👤 Login
              </button>
            )}
            <motion.button
              animate={cartBounce ? { scale: [1, 1.25, 1] } : {}}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              className="relative bg-yellow-400 text-green-900 p-2 rounded-full"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </motion.button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white p-2">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 border-t border-white/20 mt-2 pt-4"
          >
            <div className="flex flex-col gap-2">
              <button
                onClick={() => { setCurrentView('home'); setMobileMenuOpen(false); }}
                className="text-left text-white/90 hover:text-yellow-300 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                🏠 Home
              </button>
              {currentUser ? (
                <button
                  onClick={() => { setCurrentView('account'); setMobileMenuOpen(false); }}
                  className="text-left text-yellow-300 font-semibold px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  👋 My Account ({currentUser.coins} Coins)
                </button>
              ) : (
                <button
                  onClick={() => { setIsUserLoginOpen(true); setMobileMenuOpen(false); }}
                  className="text-left text-yellow-300 font-semibold px-3 py-2 rounded-lg hover:bg-white/10"
                >
                  👤 Customer Login / Sign Up
                </button>
              )}
              <button
                onClick={() => { setCurrentView('admin'); setMobileMenuOpen(false); }}
                className="text-left text-white/90 hover:text-yellow-300 px-3 py-2 rounded-lg hover:bg-white/10"
              >
                ⚙️ Admin Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}

// --- 2. OFFER BANNER + TIME-BASED SMART GREETING ---
function OfferBanner() {
  const { activeOffers } = useContext(OfferContext);
  const [currentIndex, setCurrentIndex] = useState(0);

  const timeGreeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "🌅 Good Morning! Nashte aur taaza rasoi ke liye best deals!";
    if (hr < 17) return "☀️ Good Afternoon! Dopahar ke khane ke liye Daal aur Chawal par bachat!";
    if (hr < 21) return "🌆 Good Evening! Shaam ki chai ke sath snacks aur cold drinks mangwayein!";
    return "🌙 Late Night Cravings? Thandi Cold Drinks aur essentials turant order karein!";
  }, []);

  const particles = useMemo(() =>
    Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
    })), []);

  useEffect(() => {
    if (activeOffers.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeOffers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [activeOffers.length]);

  if (activeOffers.length === 0) return null;
  const currentOffer = activeOffers[currentIndex];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500">
      <div className="bg-black/20 text-white/95 text-xs sm:text-sm py-1.5 px-4 text-center font-medium backdrop-blur-sm border-b border-white/10">
        {timeGreeting}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{ left: `${particle.left}%`, top: `${particle.top}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
            transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay }}
          />
        ))}
      </div>

      <motion.div
        className="absolute left-4 top-10 text-3xl hidden sm:block"
        animate={{ rotate: [0, 15, -15, 0], y: [0, -5, 5, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        🎆
      </motion.div>
      <motion.div
        className="absolute right-4 top-10 text-3xl hidden sm:block"
        animate={{ rotate: [0, -15, 15, 0], y: [0, 5, -5, 0] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        ✨
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 py-5 sm:py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </motion.div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white drop-shadow-lg">
                {currentOffer.title}
              </h2>
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                <Sparkles className="w-5 h-5 text-yellow-300" />
              </motion.div>
            </div>
            <p className="text-white/90 text-sm sm:text-base font-medium max-w-2xl mx-auto">
              {currentOffer.description}
            </p>
            <motion.div
              className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Gift className="w-4 h-4 text-yellow-300" />
              <span className="text-white text-sm font-semibold">Limited Period Offer</span>
              <Tag className="w-4 h-4 text-yellow-300" />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {activeOffers.length > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            {activeOffers.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 32" className="w-full h-6 fill-gray-50">
          <path d="M0,16 C360,32 720,0 1080,16 C1260,24 1380,20 1440,16 L1440,32 L0,32 Z" />
        </svg>
      </div>
    </div>
  );
}

// --- 3. PRODUCT CARD (With Fly Animation & Glowing Bestseller Badge) ---
function ProductCard({ product, index }) {
  const { addToCart, cartItems, updateQuantity } = useContext(CartContext);
  const [flying, setFlying] = useState(false);
  const cartItem = cartItems.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    setFlying(true);
    setTimeout(() => setFlying(false), 600);
    addToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      whileHover={{ y: -5 }}
      className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border flex flex-col justify-between relative ${
        product.bestseller ? 'border-amber-300 ring-1 ring-amber-200/50' : 'border-gray-100'
      }`}
    >
      {/* Fly to Cart Emoji Animation */}
      <AnimatePresence>
        {flying && (
          <motion.div
            initial={{ opacity: 1, scale: 1, y: 40, x: 0 }}
            animate={{ opacity: 0, scale: 0.2, y: -220, x: 120 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeIn" }}
            className="absolute z-30 left-1/2 -translate-x-1/2 text-5xl pointer-events-none"
          >
            {product.image_url}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 p-6 flex items-center justify-center h-36">
        <motion.span
          className="text-6xl select-none"
          whileHover={{ scale: 1.2, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {product.image_url}
        </motion.span>

        {product.bestseller && (
          <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-sm animate-pulse">
            🔥 Bestseller
          </span>
        )}

        {product.stock_quantity < 50 && !product.bestseller && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            Low Stock
          </span>
        )}

        <span className="absolute top-2 left-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
          {product.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-base mb-1 truncate">{product.name}</h3>
        <div className="flex items-baseline gap-1.5 mb-2">
          <span className="text-2xl font-bold text-green-700">₹{product.price}</span>
          {product.mrp && (
            <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
          )}
          <span className="text-sm text-gray-500">/ {product.unit}</span>
        </div>
        <p className="text-xs text-gray-400 mb-3">
          {product.stock_quantity} {product.unit}s available
        </p>

        {quantity === 0 ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAdd}
            className="w-full bg-white border-2 border-green-600 text-green-600 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-50 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD</span>
          </motion.button>
        ) : (
          <div className="flex items-center justify-between bg-green-600 rounded-xl overflow-hidden shadow-inner">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="flex-1 py-2.5 flex items-center justify-center text-white hover:bg-green-700 transition-colors"
            >
              <Minus className="w-5 h-5" />
            </motion.button>
            <span className="text-white font-bold text-lg px-4">{quantity}</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="flex-1 py-2.5 flex items-center justify-center text-white hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </motion.button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// --- 4. CART DRAWER (With Magic Progress Bar, Smart Combos & Savings) ---
function CartDrawer() {
  const {
    cartItems, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart,
    clearCart, totalPrice, totalItems, deliveryCharge, finalAmount,
    totalSavings, setIsCheckoutOpen, addToCart
  } = useContext(CartContext);
  const { products } = useContext(ProductContext);
  const { currentUser, setIsUserLoginOpen } = useContext(CustomerContext);

  const canCheckout = totalPrice >= 700;
  const progressPercent = Math.min(100, Math.round((totalPrice / 700) * 100));

  // Smart Combo Recommendations (Items not in cart yet)
  const smartCombos = useMemo(() => {
    const inCartIds = new Set(cartItems.map(i => i.id));
    return products.filter(p => !inCartIds.has(p.id) && p.bestseller).slice(0, 2);
  }, [cartItems, products]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-6 h-6 text-yellow-300" />
                <h2 className="text-white font-bold text-lg">Your Cart</h2>
                {totalItems > 0 && (
                  <span className="bg-yellow-400 text-green-900 text-xs px-2 py-0.5 rounded-full font-bold">
                    {totalItems} items
                  </span>
                )}
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Magic Progress Bar */}
            {cartItems.length > 0 && (
              <div className="bg-emerald-50 px-4 py-2.5 border-b border-emerald-100">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  {canCheckout ? (
                    <span className="text-green-700">🎉 Order Unlocked! {totalPrice < 1500 ? `Add ₹${1500 - totalPrice} for FREE Delivery!` : 'You got FREE Delivery!'}</span>
                  ) : (
                    <span className="text-orange-700">⚡ Add ₹{(700 - totalPrice).toFixed(0)} more to unlock Home Delivery!</span>
                  )}
                  <span className="text-gray-600">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    className={`h-full rounded-full ${canCheckout ? 'bg-green-600' : 'bg-orange-500'}`}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ShoppingBag className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium">Your cart is empty</p>
                  <p className="text-sm mt-1">Add some items to get started!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {cartItems.map(item => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 border border-gray-100"
                      >
                        <span className="text-3xl">{item.image_url}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-800 text-sm truncate">{item.name}</h4>
                          <p className="text-green-700 font-bold text-sm">₹{item.price} / {item.unit}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-green-600 rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center text-white hover:bg-green-700">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center font-semibold text-sm text-white">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center text-white hover:bg-green-700">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Smart Combos Section */}
                  {smartCombos.length > 0 && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 mt-4">
                      <p className="text-xs font-bold text-amber-900 mb-2">🤝 Sath me ye bhi le lo (Smart Combos):</p>
                      <div className="space-y-2">
                        {smartCombos.map(combo => (
                          <div key={combo.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-100 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{combo.image_url}</span>
                              <div>
                                <p className="font-semibold text-gray-800">{combo.name}</p>
                                <p className="text-green-700 font-bold">₹{combo.price}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => addToCart(combo)}
                              className="bg-green-600 text-white px-2.5 py-1 rounded-lg font-semibold hover:bg-green-700"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-3">
                {/* Loyalty Prompt for Guest Users */}
                {!currentUser && (
                  <div
                    onClick={() => { setIsCartOpen(false); setIsUserLoginOpen(true); }}
                    className="bg-purple-50 border border-purple-200 rounded-xl p-2.5 flex items-center justify-between cursor-pointer hover:bg-purple-100 transition-colors"
                  >
                    <span className="text-xs font-semibold text-purple-800">🎁 Login to earn Loyalty Coins on this order!</span>
                    <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full font-bold">Login</span>
                  </div>
                )}

                {/* Savings Highlighter */}
                {totalSavings > 0 && (
                  <div className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1.5 rounded-lg text-center">
                    🥳 Aapki Bachat: You are saving ₹{totalSavings.toFixed(0)} on this order!
                  </div>
                )}

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">₹{totalPrice.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span className={`font-medium ${deliveryCharge === 0 ? 'text-green-600' : ''}`}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
                  <div className="border-t pt-1 flex justify-between"><span className="font-bold text-gray-800">Total</span><span className="font-bold text-xl text-green-700">₹{finalAmount.toFixed(2)}</span></div>
                </div>

                <motion.button
                  whileHover={{ scale: canCheckout ? 1.02 : 1 }}
                  whileTap={{ scale: canCheckout ? 0.98 : 1 }}
                  onClick={() => { if (canCheckout) { setIsCartOpen(false); setIsCheckoutOpen(true); } }}
                  disabled={!canCheckout}
                  className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg transition-all ${
                    canCheckout
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 cursor-pointer'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Checkout
                </motion.button>
                <button onClick={clearCart} className="w-full py-1.5 text-red-600 text-xs font-medium hover:bg-red-50 rounded-lg transition-colors">
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- 5. CHECKOUT MODAL (With ₹200 Cash Advance, Auto-Fill UPI QR & Coins) ---
function CheckoutModal() {
  const {
    cartItems, isCheckoutOpen, setIsCheckoutOpen, totalPrice, deliveryCharge, finalAmount,
    paymentMethod, setPaymentMethod, customerName, setCustomerName,
    customerPhone, setCustomerPhone, customerAddress, setCustomerAddress,
    useCoins, setUseCoins, coinsDiscount, coinsEarnedOnOrder,
    setIsReceiptOpen, setLastOrder
  } = useContext(CartContext);
  const { addOrder } = useContext(OrderContext);
  const { currentUser } = useContext(CustomerContext);
  const [error, setError] = useState('');
  const canOrder = totalPrice >= 700;

  // Dynamic UPI QR Code URL (Amount auto-filled!)
  const upiUri = `upi://pay?pa=${SHOP_UPI_ID}&pn=Ankush%20General%20Store&am=${finalAmount}&cu=INR`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  const handlePlaceOrder = () => {
    if (!canOrder) {
      setError('Minimum order ₹700 required for delivery');
      return;
    }
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      setError('Please fill all customer details');
      return;
    }

    const order = addOrder({
      items: cartItems,
      totalAmount: totalPrice,
      deliveryCharge,
      coinsUsed: coinsDiscount,
      coinsEarned: coinsEarnedOnOrder,
      finalAmount,
      paymentMethod,
      advancePaid: paymentMethod === 'cash' ? 200 : finalAmount,
      balanceDue: paymentMethod === 'cash' ? Math.max(0, finalAmount - 200) : 0,
      customerName,
      customerPhone,
      customerAddress,
    });

    setLastOrder(order);
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);
  };

  return (
    <AnimatePresence>
      {isCheckoutOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCheckoutOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-0 left-0 right-0 max-h-[92vh] bg-white z-50 rounded-t-3xl overflow-y-auto shadow-2xl"
          >
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-800">Checkout & Payment</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 max-w-2xl mx-auto">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Customer Details</h3>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                />
                <textarea
                  placeholder="Full Delivery Address *"
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none resize-none"
                />
              </div>

              {/* Loyalty Coins Redemption Box (For Logged-in Users) */}
              {currentUser && currentUser.coins > 0 && (
                <div
                  onClick={() => setUseCoins(!useCoins)}
                  className={`p-3.5 rounded-xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    useCoins ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🪙</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Use {currentUser.coins} Ankush Loyalty Coins</p>
                      <p className="text-xs text-gray-500">Save ₹{Math.min(currentUser.coins, Math.floor(totalPrice * 0.5))} instant discount on this bill!</p>
                    </div>
                  </div>
                  <input type="checkbox" checked={useCoins} readOnly className="w-5 h-5 accent-green-600" />
                </div>
              )}

              {/* Payment Method (Cash Advance vs UPI QR) */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Select Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`p-3.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'cash' ? 'border-green-600 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className={`w-6 h-6 ${paymentMethod === 'cash' ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className={`text-sm font-bold ${paymentMethod === 'cash' ? 'text-green-800' : 'text-gray-600'}`}>Cash on Delivery</span>
                    <span className="text-[11px] text-orange-600 font-semibold">(₹200 Advance)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3.5 rounded-xl border-2 flex flex-col items-center gap-1 transition-all ${
                      paymentMethod === 'upi' ? 'border-green-600 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className={`w-6 h-6 ${paymentMethod === 'upi' ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className={`text-sm font-bold ${paymentMethod === 'upi' ? 'text-green-800' : 'text-gray-600'}`}>UPI QR Code</span>
                    <span className="text-[11px] text-blue-600 font-semibold">(Auto Amount Scan)</span>
                  </button>
                </div>

                {/* Cash ₹200 Advance Breakdown */}
                {paymentMethod === 'cash' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 text-sm space-y-1">
                    <p className="font-bold text-orange-800">💵 Cash Order Confirmation Policy:</p>
                    <p className="text-orange-700 text-xs">Order confirm karne ke liye <b>₹200 advance</b> dena anivarya hai.</p>
                    <div className="pt-2 mt-2 border-t border-orange-200 flex justify-between text-xs font-bold text-orange-900">
                      <span>Advance Now: ₹200</span>
                      <span>Pay on Delivery: ₹{Math.max(0, finalAmount - 200).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* UPI Auto-Amount QR Code */}
                {paymentMethod === 'upi' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center space-y-2">
                    <p className="text-sm font-bold text-blue-900">📱 Scan QR with PhonePe / GPay / Paytm</p>
                    <p className="text-xs text-blue-700">Scan karte hi <b>₹{finalAmount.toFixed(2)}</b> automatic fill ho jayega!</p>
                    <div className="bg-white p-3 rounded-2xl inline-block shadow-md border border-blue-100">
                      <img src={qrImageUrl} alt="UPI QR Code" className="w-40 h-40 mx-auto" />
                    </div>
                    <p className="text-[11px] text-gray-500">UPI ID: {SHOP_UPI_ID}</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
                <h3 className="font-semibold text-gray-700">Order Bill Summary</h3>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Subtotal</span><span className="font-medium">₹{totalPrice.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Delivery Charge</span><span className={`font-medium ${deliveryCharge === 0 ? 'text-green-600' : ''}`}>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span></div>
                {coinsDiscount > 0 && (
                  <div className="flex justify-between text-sm text-yellow-700 font-semibold">
                    <span>🪙 Loyalty Coins Discount</span>
                    <span>- ₹{coinsDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-gray-800">Total Bill</span>
                  <span className="font-bold text-xl text-green-700">₹{finalAmount.toFixed(2)}</span>
                </div>
                {paymentMethod === 'cash' && (
                  <>
                    <div className="flex justify-between text-xs text-orange-700 font-semibold">
                      <span>Less: Cash Advance</span>
                      <span>- ₹200.00</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-red-600 border-t border-dashed pt-1">
                      <span>Remaining Balance on Delivery</span>
                      <span>₹{Math.max(0, finalAmount - 200).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              <motion.button
                whileHover={{ scale: canOrder ? 1.01 : 1 }}
                whileTap={{ scale: canOrder ? 0.99 : 1 }}
                onClick={handlePlaceOrder}
                disabled={!canOrder}
                className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                  canOrder
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-5 h-5" />
                {paymentMethod === 'upi' ? `Payment Done & Confirm Order (₹${finalAmount})` : `Confirm Order & Send to WhatsApp`}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- 6. RECEIPT MODAL (With Confetti Celebration, Print/PDF & Auto-Reload) ---
function ReceiptModal() {
  const { isReceiptOpen, setIsReceiptOpen, lastOrder, clearCart } = useContext(CartContext);
  if (!lastOrder) return null;

  const handleDone = () => {
    clearCart();
    setIsReceiptOpen(false);
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isReceiptOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl relative">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center relative overflow-hidden">
                <div className="text-2xl mb-1 animate-bounce">🎊 🎉 🥳 🎉 🎊</div>
                <h2 className="text-white text-xl font-bold">Order Confirmed!</h2>
                <p className="text-green-100 text-xs mt-1">Order details sent to Ankush Store WhatsApp</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="text-center border-b pb-3">
                  <h3 className="font-bold text-gray-800 text-lg">🏪 Ankush General Store</h3>
                  <p className="text-xs text-gray-500">Official Order Bill Receipt</p>
                  <p className="text-xs text-gray-400 mt-1">Order ID: {lastOrder.id}</p>
                  <p className="text-xs text-gray-400">{new Date(lastOrder.orderDate).toLocaleString('en-IN')}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <p className="text-xs text-gray-500 mb-0.5">Customer Details:</p>
                  <p className="font-bold text-gray-800">{lastOrder.customerName}</p>
                  <p className="text-gray-600 text-xs">{lastOrder.customerPhone}</p>
                  <p className="text-gray-600 text-xs">{lastOrder.customerAddress}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-gray-700 text-sm">Items Ordered:</p>
                  {lastOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-800">{item.image_url} {item.name} ×{item.quantity}</span>
                      <span className="font-medium text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>₹{lastOrder.totalAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Delivery</span><span>{lastOrder.deliveryCharge === 0 ? 'FREE' : `₹${lastOrder.deliveryCharge}`}</span></div>
                  {lastOrder.coinsUsed > 0 && (
                    <div className="flex justify-between text-yellow-700 font-semibold">
                      <span>🪙 Coins Discount</span><span>- ₹{lastOrder.coinsUsed.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-1.5 flex justify-between font-bold text-base text-green-700">
                    <span>Total Bill Amount</span><span>₹{lastOrder.finalAmount.toFixed(2)}</span>
                  </div>

                  {lastOrder.paymentMethod === 'cash' ? (
                    <div className="bg-orange-50 p-2.5 rounded-lg border border-orange-200 text-xs space-y-1 mt-2">
                      <div className="flex justify-between text-orange-800 font-semibold"><span>Advance Paid:</span><span>- ₹200.00</span></div>
                      <div className="flex justify-between text-red-600 font-bold text-sm border-t border-orange-200 pt-1">
                        <span>Balance Due on Delivery:</span><span>₹{lastOrder.balanceDue.toFixed(2)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 p-2.5 rounded-lg border border-green-200 text-center text-xs font-bold text-green-800 mt-2">
                      ✅ Full Amount Paid via UPI QR (₹{lastOrder.finalAmount.toFixed(2)})
                    </div>
                  )}
                </div>

                {lastOrder.coinsEarned > 0 && (
                  <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-2.5 text-center text-xs font-bold text-yellow-800">
                    🪙 Yay! You earned +{lastOrder.coinsEarned} Loyalty Coins on this order!
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => window.print()}
                    className="flex-1 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" /> Print / Save PDF
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDone}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-lg cursor-pointer"
                >
                  ✓ Done (Refresh Page)
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// --- 7. CUSTOMER 4-DIGIT PIN LOGIN / SIGNUP MODAL & PERSONAL DASHBOARD ---
function CustomerLoginModal() {
  const { isUserLoginOpen, setIsUserLoginOpen, loginCustomer, registerCustomer } = useContext(CustomerContext);
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [address, setAddress] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [msg, setMsg] = useState('');

  if (!isUserLoginOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setMsg("PIN bilkul 4 digit (numbers) ka hona chahiye!");
      return;
    }
    if (mode === 'login') {
      const res = loginCustomer(phone, pin);
      if (!res.success) setMsg(res.message);
      else { setMsg(''); setIsUserLoginOpen(false); }
    } else {
      const res = registerCustomer(name, phone, pin, address);
      if (!res.success) setMsg(res.message);
      else { setMsg(''); setIsUserLoginOpen(false); }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
      >
        <button onClick={() => setIsUserLoginOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex p-3 bg-green-100 text-green-700 rounded-full mb-2">
            <Coins className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'login' ? 'Customer VIP Login' : 'Create Loyalty Account'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Har order par Loyalty Coins jeetein aur agle bill me discount payein!
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
          <button
            onClick={() => { setMode('login'); setMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-white text-green-700 shadow' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('signup'); setMsg(''); }}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'signup' ? 'bg-white text-green-700 shadow' : 'text-gray-500'}`}
          >
            New Sign Up (+20 🪙)
          </button>
        </div>

        {msg && <div className="bg-red-50 text-red-600 text-xs p-2.5 rounded-lg mb-3 text-center font-medium">{msg}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Your Full Name *"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl focus:border-green-500 outline-none"
            />
          )}
          <input
            type="tel"
            placeholder="10-Digit Mobile Number *"
            required
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl focus:border-green-500 outline-none"
          />
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              maxLength={4}
              placeholder="4-Digit Secret PIN (e.g. 1234) *"
              required
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl focus:border-green-500 outline-none tracking-widest"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Delivery Address (Optional)"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 border rounded-xl focus:border-green-500 outline-none"
            />
          )}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold shadow-md hover:from-green-700 hover:to-emerald-700 cursor-pointer"
          >
            {mode === 'login' ? '🔐 Verify PIN & Login' : '🎁 Create Account & Get 20 Coins'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function CustomerAccountView({ setCurrentView }) {
  const { currentUser, logoutCustomer } = useContext(CustomerContext);
  const { orders } = useContext(OrderContext);

  if (!currentUser) {
    setCurrentView('home');
    return null;
  }

  const myOrders = orders.filter(o => o.customerPhone === currentUser.phone);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="bg-yellow-400 text-green-950 text-xs font-extrabold px-2.5 py-0.5 rounded-full">VIP MEMBER</span>
          <h2 className="text-2xl font-bold mt-2">Hello, {currentUser.name}! 👋</h2>
          <p className="text-green-100 text-sm">Phone: {currentUser.phone}</p>
        </div>
        <div className="bg-white/15 backdrop-blur-md p-4 rounded-2xl text-center border border-white/20">
          <p className="text-xs text-yellow-200 font-semibold">My Loyalty Wallet</p>
          <p className="text-3xl font-extrabold text-yellow-300 mt-1">🪙 {currentUser.coins} Coins</p>
          <p className="text-[11px] text-white/80 mt-0.5">1 Coin = ₹1 Discount on Checkout</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">📦 My Past Orders ({myOrders.length})</h3>
        <button
          onClick={() => { logoutCustomer(); setCurrentView('home'); }}
          className="text-sm text-red-600 font-semibold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-xl hover:bg-red-100"
        >
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>

      {myOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border text-gray-500">
          Aapne abhi tak koi order nahi kiya hai. Shopping shuru karein aur coins jeetein!
        </div>
      ) : (
        <div className="space-y-3">
          {myOrders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{order.id}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(order.orderDate).toLocaleString('en-IN')}</p>
                <div className="text-sm text-gray-600 mt-2">
                  {order.items.map((item, idx) => (
                    <span key={idx} className="mr-2">{item.image_url} {item.name} ×{item.quantity}</span>
                  ))}
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-lg font-bold text-green-700">₹{order.finalAmount.toFixed(2)}</p>
                <p className="text-xs text-gray-500 uppercase">{order.paymentMethod}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- 8. ADMIN DASHBOARD (Exact Dark Theme, All Reference Panels + Customers Tab) ---
function AdminDashboard({ onLogout }) {
  const { getPendingOrders, confirmDelivery, searchOrdersByName, getOrdersByDate, getTotalSales, getSalesByDate } = useContext(OrderContext);
  const { offers, addOffer, toggleOffer, removeOffer } = useContext(OfferContext);
  const { addProduct } = useContext(ProductContext);
  const { customers, updateCustomerData } = useContext(CustomerContext);

  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOffer, setNewOffer] = useState({ title: '', description: '', is_active: true });

  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Groceries', price: '', unit: 'kg', stock_quantity: '', image_url: '📦',
  });

  const pendingOrders = getPendingOrders();
  const totalSales = getTotalSales();
  const todaySales = getSalesByDate(selectedDate);

  const filteredDeliveredOrders = searchQuery
    ? searchOrdersByName(searchQuery).filter(o => o.status === 'delivered')
    : getOrdersByDate(selectedDate).filter(o => o.status === 'delivered');

  const deliveredDateTotal = filteredDeliveredOrders.reduce((s, o) => s + o.finalAmount, 0);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewProduct(prev => ({ ...prev, image_url: '🛍️' }));
    reader.readAsDataURL(file);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    addProduct(newProduct);
    alert('✅ Product successfully added to Home Store!');
    setNewProduct({ name: '', category: 'Groceries', price: '', unit: 'kg', stock_quantity: '', image_url: '📦' });
  };

  const handleAddOffer = (e) => {
    e.preventDefault();
    addOffer(newOffer);
    setNewOffer({ title: '', description: '', is_active: true });
    setShowAddOffer(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4 text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Manage orders, products & offers</p>
          </div>
          <button onClick={onLogout} className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </motion.div>

        {/* Top 3 KPI Boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500/10 p-2 rounded-lg"><Clock className="w-6 h-6 text-orange-400" /></div>
              <div><p className="text-gray-400 text-sm">Pending Orders</p><p className="text-2xl font-bold text-white">{pendingOrders.length}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-500/10 p-2 rounded-lg"><CheckCircle className="w-6 h-6 text-green-400" /></div>
              <div><p className="text-gray-400 text-sm">Total Sales</p><p className="text-2xl font-bold text-white">₹{totalSales.toFixed(0)}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/10 p-2 rounded-lg"><Calendar className="w-6 h-6 text-blue-400" /></div>
              <div><p className="text-gray-400 text-sm">Today's Sales</p><p className="text-2xl font-bold text-white">₹{todaySales.toFixed(0)}</p></div>
            </div>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'pending', label: 'Pending Orders', icon: Clock, color: 'bg-orange-500' },
            { id: 'delivered', label: 'Delivered Orders', icon: CheckCircle, color: 'bg-green-500' },
            { id: 'add-product', label: 'Add Product', icon: Plus, color: 'bg-blue-500' },
            { id: 'offers', label: 'Manage Offers', icon: Tag, color: 'bg-purple-500' },
            { id: 'customers', label: 'VIP Customers', icon: Users, color: 'bg-amber-500' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === t.id ? `${t.color} text-white shadow-lg` : 'bg-gray-800/50 text-gray-400 hover:text-white'
              }`}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          {/* TAB 1: PENDING ORDERS */}
          {activeTab === 'pending' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Pending Orders ({pendingOrders.length})</h2>
              {pendingOrders.length === 0 ? <p className="text-gray-400 text-center py-8">No pending orders</p> : (
                <div className="space-y-3">
                  {pendingOrders.map(order => (
                    <div key={order.id} className="bg-gray-900/50 rounded-xl p-4 border border-gray-700/60">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-medium">{order.customerName}</p>
                          <p className="text-gray-400 text-sm">{order.customerPhone}</p>
                          <p className="text-gray-500 text-xs">{order.customerAddress}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold">₹{order.finalAmount.toFixed(2)}</p>
                          <p className="text-gray-500 text-xs">{new Date(order.orderDate).toLocaleString('en-IN')}</p>
                          <span className="text-[11px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full uppercase">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-400 mb-3">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="mr-3">{item.image_url} {item.name} ×{item.quantity}</span>
                        ))}
                      </div>
                      <button onClick={() => confirmDelivery(order.id)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors cursor-pointer">
                        ✓ Confirm Delivery
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DELIVERED ORDERS (Exact Image Match) */}
          {activeTab === 'delivered' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Delivered Orders</h2>
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by customer name..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                  />
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:outline-none"
                />
              </div>

              <p className="text-gray-400 text-sm mb-4">
                Orders for {selectedDate} - Total: ₹{deliveredDateTotal.toFixed(2)}
              </p>

              <div className="space-y-3">
                {filteredDeliveredOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-6">No delivered orders found for this selection.</p>
                ) : (
                  filteredDeliveredOrders.map(order => (
                    <div key={order.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-white font-bold text-base">{order.customerName}</p>
                          <p className="text-gray-400 text-sm">{order.customerPhone}</p>
                          <p className="text-gray-500 text-xs">{order.customerAddress}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-lg">₹{order.finalAmount.toFixed(2)}</p>
                          <p className="text-gray-500 text-xs mb-1">{new Date(order.orderDate).toLocaleString('en-IN')}</p>
                          <span className="bg-green-500/20 text-green-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
                            delivered
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-300 mt-2">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="mr-3">{item.image_url} {item.name} ×{item.quantity}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ADD PRODUCT (Exact Image Match with Unit, Stock & Upload Box) */}
          {activeTab === 'add-product' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Add New Product</h2>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                    <select
                      value={newProduct.category}
                      onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="Groceries">Groceries</option>
                      <option value="Cold Drinks">Cold Drinks</option>
                      <option value="Household">Household</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Unit</label>
                    <select
                      value={newProduct.unit}
                      onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:outline-none"
                    >
                      <option value="kg">kg</option>
                      <option value="liter">liter</option>
                      <option value="piece">piece</option>
                      <option value="packet">packet</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Price (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.price}
                      onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Stock Quantity *</label>
                    <input
                      type="number"
                      required
                      value={newProduct.stock_quantity}
                      onChange={e => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                      className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Product Image / Emoji</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-900/30">
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <span className="text-xs text-gray-400 block">Click to upload image (or type emoji on right)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <input
                      type="text"
                      value={newProduct.image_url}
                      onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })}
                      className="w-20 h-20 text-center text-4xl bg-gray-900/50 border border-gray-600 rounded-xl"
                      title="Type Product Emoji"
                    />
                  </div>
                </div>

                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold cursor-pointer">
                  <Plus className="w-5 h-5 inline mr-2" /> Add Product
                </motion.button>
              </form>
            </div>
          )}

          {/* TAB 4: MANAGE OFFERS (Exact Image Match with Active Pill) */}
          {activeTab === 'offers' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Manage Offers</h2>
                <button onClick={() => setShowAddOffer(!showAddOffer)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors cursor-pointer">
                  <Plus className="w-4 h-4 inline mr-1" /> Add Offer
                </button>
              </div>
              {showAddOffer && (
                <form onSubmit={handleAddOffer} className="bg-gray-900/50 rounded-xl p-4 mb-4 space-y-3 border border-gray-700">
                  <input
                    type="text"
                    placeholder="Offer title (e.g. 🪔 Diwali Special Mega Discount!)"
                    value={newOffer.title}
                    onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                    required
                  />
                  <textarea
                    placeholder="Offer description"
                    value={newOffer.description}
                    onChange={e => setNewOffer({ ...newOffer, description: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-xl text-white focus:border-purple-500 focus:outline-none resize-none"
                    required
                  />
                  <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-medium cursor-pointer">Create Offer</button>
                </form>
              )}
              <div className="space-y-3">
                {offers.map(offer => (
                  <div key={offer.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex items-start justify-between">
                    <div>
                      <p className="text-white font-bold">{offer.title}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{offer.description}</p>
                      <span className={`inline-block mt-2 text-xs px-2.5 py-0.5 rounded-full font-medium ${offer.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                        {offer.is_active ? 'Active' : 'Hidden'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleOffer(offer.id)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 cursor-pointer" title="Toggle Active/Hidden">
                        {offer.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => removeOffer(offer.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 cursor-pointer" title="Delete Offer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VIP CUSTOMERS & COINS MANAGER */}
          {activeTab === 'customers' && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Registered VIP Customers ({customers.length})</h2>
              {customers.length === 0 ? (
                <p className="text-gray-400 text-center py-8">Abhi tak kisi customer ne loyalty account nahi banaya hai.</p>
              ) : (
                <div className="space-y-3">
                  {customers.map(c => (
                    <div key={c.id} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="text-white font-bold">{c.name}</p>
                        <p className="text-gray-400 text-sm">📱 {c.phone} | 🔐 PIN: <span className="text-yellow-300 font-mono">{c.pin}</span></p>
                        {c.address && <p className="text-gray-500 text-xs">{c.address}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-bold">
                          🪙 {c.coins} Coins
                        </span>
                        <button
                          onClick={() => updateCustomerData(c.phone, 20)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-2 rounded-lg font-semibold cursor-pointer"
                        >
                          +20 Bonus Coins
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

// --- 9. ADMIN LOGIN PAGE (Hidden Credentials: AnkushStore / AGenStore@071) ---
function AdminLogin({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'AnkushStore' && password === 'AGenStore@071') {
      localStorage.setItem('ankush_admin_auth', 'true');
      onLoginSuccess();
    } else {
      setError('Invalid credentials! Only shop owner can access.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }} className="inline-block mb-4">
            <div className="bg-green-500/10 p-4 rounded-full"><Lock className="w-10 h-10 text-green-400" /></div>
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-2">Only for shop owner access</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
            <p className="text-red-400 text-sm text-center">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-10 py-2.5 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold shadow-lg cursor-pointer">
            Login to Dashboard
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}

// --- 10. FLOATING BOTTOM QUICK-CART STRIP ---
function FloatingCartStrip() {
  const { totalItems, totalPrice, setIsCartOpen, isCartOpen, isCheckoutOpen } = useContext(CartContext);
  if (totalItems === 0 || isCartOpen || isCheckoutOpen) return null;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-40"
    >
      <div
        onClick={() => setIsCartOpen(true)}
        className="bg-gradient-to-r from-green-700 to-emerald-600 text-white p-3.5 px-5 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer border border-green-400/30"
      >
        <div className="flex items-center gap-3">
          <div className="bg-yellow-400 text-green-950 font-extrabold px-2.5 py-1 rounded-xl text-sm">
            🛒 {totalItems} {totalItems === 1 ? 'Item' : 'Items'}
          </div>
          <div>
            <p className="font-bold text-base">₹{totalPrice.toFixed(0)}</p>
            <p className="text-[11px] text-green-200">
              {totalPrice >= 700 ? 'Ready for Checkout!' : `Add ₹${(700 - totalPrice).toFixed(0)} more for delivery`}
            </p>
          </div>
        </div>
        <div className="font-bold text-sm bg-white text-green-800 px-4 py-2 rounded-xl shadow">
          View Cart →
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN STORE CONTENT ---
function StoreContent({ currentView, setCurrentView }) {
  const { products } = useContext(ProductContext);
  const [isAdminAuth, setIsAdminAuth] = useState(() => localStorage.getItem('ankush_admin_auth') === 'true');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Voice Search Feature
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search ke liye Google Chrome browser ka use karein!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    setIsListening(true);
    recognition.start();
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = product.name.toLowerCase().includes(q) || (product.image_url && product.image_url.includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <CartDrawer />
      <CheckoutModal />
      <ReceiptModal />
      <CustomerLoginModal />
      <FloatingCartStrip />

      {currentView === 'home' && (
        <main>
          <OfferBanner />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
              <div className="relative max-w-md mx-auto mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products or type emoji (🍚, 🥤)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors bg-white shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors cursor-pointer ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 justify-center flex-wrap">
                {['All', 'Groceries', 'Cold Drinks', 'Household'].map(category => (
                  <motion.button
                    key={category}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600'
                    }`}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </div>

          <footer className="bg-gray-800 text-white py-8 mt-12 text-center">
            <h3 className="text-xl font-bold mb-2">🏪 Ankush General Store</h3>
            <p className="text-gray-400 text-sm">Your one-stop shop for daily groceries, cold drinks & household essentials</p>
          </footer>
        </main>
      )}

      {currentView === 'account' && (
        <CustomerAccountView setCurrentView={setCurrentView} />
      )}

      {currentView === 'admin' && (
        isAdminAuth ? (
          <AdminDashboard onLogout={() => { localStorage.removeItem('ankush_admin_auth'); setIsAdminAuth(false); }} />
        ) : (
          <AdminLogin onLoginSuccess={() => setIsAdminAuth(true)} />
        )
      )}
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  return (
    <AppProviders>
      <StoreContent currentView={currentView} setCurrentView={setCurrentView} />
    </AppProviders>
  );
}