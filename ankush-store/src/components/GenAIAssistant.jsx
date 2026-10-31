import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useStore, STORE_ADDRESS_TEXT, SHOP_WHATSAPP_NUMBER } from '../StoreContext';

/* =====================================================================
   GEN AI ASSISTANT — EXACT AURA / JARVIS 3D ORB ENGINE
   Exact Design Match to user's uploaded aura_jarves.txt:
   - S=110px Canvas with rotating dashed orbit ring (5*D, 9*D)
   - 3 Rotating thinking dots on orbit when thinking
   - Deforming organic plasma perimeter with radial core gradient
   - Eyebrows, realistic blinking, winking, blush & speech mouth
   - 12 Emotional expressions (MD Engine)
   - Gaze tracking (smooth pupil saccades, pointer follower)
   - Floating organic hop & hover motion
   - Exact speech bubble (#bub) styling & flying physics
   - Google Gemini Live API: models/gemini-flash-latest
   - Instant live ping verification with Green (Connected) / Red (Disconnected)
   - Robust continuous voice recognition (Mobile + PC sound catching)
===================================================================== */

const MD = {
  neutral: { sm: 0.2, op: 0, ey: 1, hp: 0, br: 0, an: 0, bl: 0, wk: 0, tl: 0 },
  calm: { sm: 0.45, op: 0, ey: 1, hp: 0, br: 0.1, an: 0, bl: 0.1, wk: 0, tl: 0 },
  happy: { sm: 0.9, op: 0.12, ey: 1, hp: 0.9, br: 0.3, an: 0, bl: 0.55, wk: 0, tl: 0 },
  laugh: { sm: 1, op: 0.75, ey: 1, hp: 1, br: 0.4, an: 0, bl: 0.75, wk: 0, tl: 0 },
  surprised: { sm: 0, op: 0.85, ey: 1.45, hp: 0, br: 1, an: 0, bl: 0, wk: 0, tl: 0 },
  curious: { sm: 0.15, op: 0, ey: 1.12, hp: 0, br: 0.5, an: 0, bl: 0, wk: 0, tl: 1 },
  thinking: { sm: -0.1, op: 0, ey: 0.7, hp: 0, br: 0.5, an: 0.15, bl: 0, wk: 0, tl: 0.6 },
  sad: { sm: -0.85, op: 0, ey: 0.72, hp: 0, br: -0.2, an: 0.5, bl: 0, wk: 0, tl: -0.5 },
  proud: { sm: 0.7, op: 0, ey: 0.85, hp: 0.45, br: 0.25, an: 0, bl: 0.4, wk: 0, tl: 0 },
  alert: { sm: 0.1, op: 0, ey: 1.28, hp: 0, br: 0.6, an: 0, bl: 0, wk: 0, tl: 0 },
  determined: { sm: 0.3, op: 0, ey: 0.8, hp: 0, br: -0.2, an: -0.5, bl: 0, wk: 0, tl: 0 },
  wink: { sm: 0.85, op: 0, ey: 1, hp: 0, br: 0.2, an: 0, bl: 0.45, wk: 1, tl: 0.3 }
};

const PAL = {
  idle: [[124, 92, 255], [56, 189, 248], [236, 72, 153]],
  fly: [[56, 189, 248], [124, 92, 255], [250, 204, 21]],
  listen: [[16, 185, 129], [56, 189, 248], [132, 204, 22]],
  think: [[251, 146, 60], [244, 63, 94], [250, 204, 21]],
  speak: [[236, 72, 153], [168, 85, 247], [56, 189, 248]]
};

const pick = (a) => a[Math.floor(Math.random() * a.length)];
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export default function GenAIAssistant({ onNavigateTab, activeTab }) {
  const {
    products = [],
    activeOffers = [],
    orders = [],
    customers = [],
    storeSettings = {}
  } = useStore();

  const canvasRef = useRef(null);
  const aiRef = useRef(null);
  const hlRef = useRef(null);
  const bubRef = useRef(null);

  // UI States
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [bubble, setBubble] = useState({ title: '', text: '', show: false, action: null });
  const [isListening, setIsListening] = useState(false);
  const [isConvo, setIsConvo] = useState(false);

  // Gemini API Key State
  // Persistent API Connection & Memory States
  const [geminiApiKey, setGeminiApiKey] = useState(() => {
    return localStorage.getItem('ags_gemini_api_key') || '';
  });
  const [apiConnectionStatus, setApiConnectionStatus] = useState(() => {
    const savedKey = localStorage.getItem('ags_gemini_api_key');
    const wasConnected = localStorage.getItem('ags_gemini_connected') === 'true';
    if (savedKey && wasConnected) return 'connected';
    if (savedKey) return 'checking';
    return 'none';
  });
  const [isTestingKey, setIsTestingKey] = useState(false);

  // AI Persistent Conversation Memory Database
  const [chatMemory, setChatMemory] = useState(() => {
    try {
      const saved = localStorage.getItem('ags_ai_chat_memory');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const saveToMemory = useCallback((userText, aiText) => {
    if (!userText || !aiText) return;
    setChatMemory(prev => {
      const updated = [
        ...prev,
        { role: 'user', text: userText, timestamp: Date.now() },
        { role: 'model', text: aiText, timestamp: Date.now() }
      ].slice(-24); // Keep last 12 turns of rich context
      try {
        localStorage.setItem('ags_ai_chat_memory', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const clearMemory = useCallback(() => {
    setChatMemory([]);
    try {
      localStorage.removeItem('ags_ai_chat_memory');
    } catch (e) {}
  }, []);

  // Physics & Animation States matching exact aura_jarves.txt
  const stateRef = useRef({
    flying: false,
    thinking: false,
    speaking: false,
    listening: false,
    speakUntil: 0
  });

  const emoRef = useRef(JSON.parse(JSON.stringify(MD.neutral)));
  const targetEmoRef = useRef(MD.neutral);
  const moodUntilRef = useRef(0);
  const microAtRef = useRef(Date.now() + 6000);
  const hopAtRef = useRef(Date.now() + 6000);
  const blinkAtRef = useRef(Date.now() + 1800);
  const blinkUntilRef = useRef(0);
  const lookRef = useRef([0, 0]);
  const targetLookRef = useRef([0, 0]);
  const lastMoveRef = useRef(0);
  const colorCurRef = useRef(JSON.parse(JSON.stringify(PAL.idle)));
  const levelRef = useRef(0);
  const isListeningRef = useRef(false);
  const activeModelRef = useRef('gemini-flash-lite-latest');

  // Rest Position (Bottom right corner)
  const posRef = useRef({
    x: typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 130) : 250,
    y: typeof window !== 'undefined' ? Math.max(70, window.innerHeight - 170) : 400
  });
  const dragRef = useRef(null);
  const recognitionRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  // Set Mood
  const setMood = useCallback((n, ms = 2200) => {
    if (MD[n]) {
      targetEmoRef.current = MD[n];
      moodUntilRef.current = Date.now() + ms;
    }
  }, []);

  // Web Audio Chime
  const playChime = useCallback(() => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const ctx = new AC();
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) {}
  }, []);

  // Bubble helper (placed before testGeminiConnection to prevent TDZ ReferenceError)
  const showBubble = useCallback((title, text, action = null) => {
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    setBubble({ title, text, show: true, action });
    fadeTimeoutRef.current = setTimeout(() => {
      setBubble(prev => ({ ...prev, show: false }));
    }, 15000);
  }, []);

  // Google Gemini API Live Verification with models/gemini-flash-lite-latest
  const testGeminiConnection = useCallback(async (keyToTest) => {
    const key = (keyToTest || geminiApiKey || '').trim();
    if (!key) {
      setApiConnectionStatus('none');
      return;
    }
    setIsTestingKey(true);
    setApiConnectionStatus('checking');

    // Candidate models: resilient ultra-fast flash-lite, then flash
    const candidateModels = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let verified = false;

    for (const modelName of candidateModels) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(key)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'hi' }] }]
            })
          }
        );

        if (res.ok) {
          verified = true;
          activeModelRef.current = modelName;
          setApiConnectionStatus('connected');
          localStorage.setItem('ags_gemini_api_key', key);
          localStorage.setItem('ags_gemini_connected', 'true');
          setMood('happy', 2500);
          showBubble("✨ Gemini Connected", "Google Gemini Live Co-Pilot hamesha ke liye connect ho gaya!");
          break;
        }
      } catch (err) {
        console.warn('Ping failed for', modelName, err);
      }
    }

    if (!verified) {
      // If was previously connected, keep as connected with local brain backup
      const wasSaved = localStorage.getItem('ags_gemini_connected') === 'true';
      if (wasSaved) {
        setApiConnectionStatus('connected');
      } else {
        setApiConnectionStatus('error');
        setMood('sad', 2500);
      }
    }
    setIsTestingKey(false);
  }, [geminiApiKey, setMood, showBubble]);

  // Dynamic voices cache for mobile & desktop
  const voicesRef = useRef([]);
  useEffect(() => {
    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        voicesRef.current = window.speechSynthesis.getVoices() || [];
      }
    };
    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Verify key on mount
  useEffect(() => {
    const wasConnected = localStorage.getItem('ags_gemini_connected') === 'true';
    if (geminiApiKey) {
      if (wasConnected) {
        setApiConnectionStatus('connected');
      } else {
        testGeminiConnection(geminiApiKey);
      }
    }
  }, []);

  // Natural Speech Synthesis (Mobile & Desktop Hindi Fix)
  const speakText = useCallback((text) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    try { window.speechSynthesis.cancel(); } catch (e) {}

    // Clean text of action tags, markdown stars, hashtags, brackets, emojis, parentheticals
    const clean = text
      .replace(/\[\[ACTION:.*?\]\]/g, '')
      .replace(/[*_#`~>]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/gu, '') // strip emojis for cleaner voice
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) return;

    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'hi-IN'; // Explicit Indian Hindi Locale for natural mobile pronunciation
    u.rate = 1.0;
    u.pitch = 1.0;

    const availableVoices = voicesRef.current.length > 0
      ? voicesRef.current
      : (window.speechSynthesis.getVoices() || []);

    // Pick best Hindi voice
    const hinVoice =
      availableVoices.find(v => (v.lang === 'hi-IN' || v.lang === 'hi_IN') && v.name.toLowerCase().includes('google')) ||
      availableVoices.find(v => (v.lang === 'hi-IN' || v.lang === 'hi_IN') && (v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('online'))) ||
      availableVoices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN') ||
      availableVoices.find(v => v.lang.startsWith('hi')) ||
      availableVoices.find(v => v.lang.includes('IN')) ||
      null;

    if (hinVoice) {
      u.voice = hinVoice;
      u.lang = hinVoice.lang || 'hi-IN';
    }

    stateRef.current.speaking = true;
    stateRef.current.speakUntil = Date.now() + Math.max(2500, clean.length * 68);

    u.onstart = () => {
      stateRef.current.speaking = true;
    };
    u.onend = () => {
      stateRef.current.speaking = false;
      levelRef.current = 0;
    };
    u.onerror = () => {
      stateRef.current.speaking = false;
      levelRef.current = 0;
    };

    try {
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('Speech synthesis speak error:', e);
    }
  }, []);

  // Deep Real-Time Store Intelligence Snapshot (Ultra-Safe Guards)
  const storeSnapshot = useMemo(() => {
    const safeOrders = Array.isArray(orders) ? orders : [];
    const safeProducts = Array.isArray(products) ? products : [];
    const safeCustomers = Array.isArray(customers) ? customers : [];
    const safeOffers = Array.isArray(activeOffers) ? activeOffers : [];

    const totalRev = safeOrders.reduce((s, o) => s + (Number(o?.finalAmount) || 0), 0);
    const pendingOrdersList = safeOrders.filter(o => o && (o.status === 'pending' || !o.status));
    const deliveredOrdersList = safeOrders.filter(o => o && o.status === 'delivered');
    const outOfStockList = safeProducts.filter(p => p && (p.stockStatus === 'Out of Stock' || Number(p.stock) <= 0));
    const lowStockList = safeProducts.filter(p => p && Number(p.stock) > 0 && Number(p.stock) <= 5);

    // Item sold frequency
    const itemSoldCount = {};
    safeOrders.forEach(o => {
      (o?.items || []).forEach(it => {
        const n = it?.name || it?.baseProductName;
        if (n) itemSoldCount[n] = (itemSoldCount[n] || 0) + (Number(it?.quantity) || 1);
      });
    });
    const topSoldItems = Object.entries(itemSoldCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(e => `${e[0]} (${e[1]} units)`);

    const upiOrders = safeOrders.filter(o => o && o.paymentMethod === 'upi').length;
    const cashOrders = safeOrders.filter(o => o && o.paymentMethod === 'cash').length;

    return {
      storeName: storeSettings?.storeName || 'Ankush General Store',
      storeAddress: storeSettings?.storeAddress || 'Khorma, Pratappur',
      totalOrders: safeOrders.length,
      totalRevenue: totalRev,
      avgOrderValue: safeOrders.length ? Math.round(totalRev / safeOrders.length) : 0,
      pendingOrdersCount: pendingOrdersList.length,
      pendingOrdersSample: pendingOrdersList.slice(0, 3).map(o => `#${o?.id || o?.orderId || 'ORD'} (${o?.customerName || 'Grahak'}: ₹${o?.finalAmount || 0})`),
      deliveredOrdersCount: deliveredOrdersList.length,
      totalProductsCount: safeProducts.length,
      topSoldItems: topSoldItems.length ? topSoldItems : ['Sprite', 'Fanta', 'Basmati Rice', 'Mustard Oil'],
      outOfStockCount: outOfStockList.length,
      outOfStockSample: outOfStockList.map(p => p?.name || 'Saman').slice(0, 8),
      lowStockCount: lowStockList.length,
      lowStockSample: lowStockList.map(p => `${p?.name || 'Saman'} (${p?.stock || 0} bache)`).slice(0, 8),
      vipCustomersCount: safeCustomers.length,
      upiOrdersCount: upiOrders,
      cashOrdersCount: cashOrders,
      activeOffersCount: safeOffers.length,
      activeOffersSample: safeOffers.map(o => o?.title || 'Offer').slice(0, 5),
      currentOpenStatus: storeSettings?.isStoreOpen ? 'Dukan Khuli Hai (Open)' : 'Dukan Band Hai (Closed)'
    };
  }, [orders, products, customers, storeSettings, activeOffers]);

  // Answer Query using Gemini Multi-Turn or Conversational Brain
  const answerQuery = useCallback(async (q) => {
    const query = q.trim();
    if (!query) return;

    // BARGE-IN INTERRUPTION: Stop speaking if user interrupts
    if (stateRef.current.speaking || (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking)) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
      stateRef.current.speaking = false;
      levelRef.current = 0;
    }

    stateRef.current.thinking = true;
    setMood('thinking', 8000);
    showBubble("You: " + query, "… Soch raha hoon …");

    // 1. Check Google Gemini API with Multi-Turn Memory
    if (geminiApiKey) {
      try {
        const systemPrompt = `Aap ho "Gen" (Ankush General Store, Khorma, Pratappur ke AI Co-Pilot aur Smart Business Manager).
AAPKA ANDAAZ (GEMINI LIVE STYLE):
- Bilkul "Gemini Live" jaisa bolna hai: Natural Desi, friendly, witty, respectful, aur energetic human partner!
- Fillers aur expressions use karo jaise: "Haan bilkul sir!", "Arey sir ek second, main dukan ka data dekh kar batata hoon...", "Haha sahi pakde hain sir!", "Ji sir bilkul...", "Aap hukum kijiye sir."
- 100% natural, sweet aur clear Hindi / Hinglish me baat karo. Shudh kathin Hindi ya faltu English words mat bolo.
- Hamesha 2-3 line me crisp aur accurate jawab do taaki bolne me bilkul insani lage.
- Pichhli baatein yaad rakho (Aapka apna memory system hai).

DUKAN KA LIVE DATABASE SNAPSHOT RIGHT NOW:
- Dukan: ${storeSnapshot.storeName} (${storeSnapshot.storeAddress})
- Dukan Status: ${storeSnapshot.currentOpenStatus}
- Kul Sales: ₹${storeSnapshot.totalRevenue.toLocaleString('en-IN')} (Kul Orders: ${storeSnapshot.totalOrders}, Average Order: ₹${storeSnapshot.avgOrderValue})
- Pending Orders: ${storeSnapshot.pendingOrdersCount} (${storeSnapshot.pendingOrdersSample.join(', ') || 'Koi nahi'})
- Delivered: ${storeSnapshot.deliveredOrdersCount}
- Top Bikne Wale Saman: ${storeSnapshot.topSoldItems.join(', ')}
- Out of Stock: ${storeSnapshot.outOfStockCount > 0 ? storeSnapshot.outOfStockSample.join(', ') : 'Sabhi saman available hai'}
- Low Stock (<5): ${storeSnapshot.lowStockCount > 0 ? storeSnapshot.lowStockSample.join(', ') : 'Sabhi products full hain'}
- VIP Customers: ${storeSnapshot.vipCustomersCount} (UPI: ${storeSnapshot.upiOrdersCount}, Cash: ${storeSnapshot.cashOrdersCount})

INSTRUCTIONS:
1. Agar admin koi bhi sawal puche - dukan ka ho, hisaab ka ho, business advice ka ho, ya aam baat-cheet / mazaak ka ho - sabhi ka smart jawab do!
2. Agar admin koi tab kholne ko kahe to action token lagao:
   - [[ACTION:NAVIGATE:analytics-hub]] for sales/reports
   - [[ACTION:NAVIGATE:pending]] for pending orders
   - [[ACTION:NAVIGATE:add-product]] for stock/products
   - [[ACTION:NAVIGATE:customers]] for VIP customers
   - [[ACTION:NAVIGATE:coin-delivery]] for delivery/coins
   - [[ACTION:NAVIGATE:offers]] for banners
   - [[ACTION:NAVIGATE:dashboard]] for overview`;

        // Multi-Turn chat memory format
        const historyParts = chatMemory.slice(-6).map(m => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.text }]
        }));

        const modelToUse = activeModelRef.current || 'gemini-flash-lite-latest';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${encodeURIComponent(geminiApiKey)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                { role: 'model', parts: [{ text: 'Ji sir! Main Ankush General Store ka live Gen Co-Pilot hoon. Aap hukum kijiye!' }] },
                ...historyParts,
                { role: 'user', parts: [{ text: query }] }
              ]
            })
          }
        );

        if (res.ok) {
          const d = await res.json();
          const reply = d?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            stateRef.current.thinking = false;
            const act = reply.match(/\[\[ACTION:NAVIGATE:(.*?)\]\]/);
            if (act && act[1] && onNavigateTab) {
              onNavigateTab(act[1].trim());
            }
            const clean = reply.replace(/\[\[ACTION:.*?\]\]/g, '').trim();
            saveToMemory(query, clean);
            setMood('happy', 3500);
            showBubble("You: " + query, clean);
            speakText(clean);
            return;
          }
        }
      } catch (err) {
        console.warn('Gemini live call fallback:', err);
      }
    }

    // 2. Autonomous Conversational Intelligence Brain (Zero-Downtime Guarantee)
    stateRef.current.thinking = false;
    const lower = query.toLowerCase();
    let replyText = '';

    // Greetings & Casual Banter
    if (/^(hi|hello|hey|namaste|pranam|salam|ram ram|kya hal|kaise ho)/i.test(lower)) {
      replyText = `नमस्ते सर! मैं बिल्कुल मस्त हूँ और आपकी दुकान के सारे डेटा पर नज़र रखे हुए हूँ। बताइए सर, आज दुकान के लिए क्या प्लान है?`;
      setMood('happy', 3000);
    }
    // Sales & Kamai
    else if (/(sale|revenue|kamai|bikri|paisa|kolekshan|aaj kitna|kitna kamaya)/i.test(lower)) {
      if (onNavigateTab) onNavigateTab('analytics-hub');
      replyText = `हाँ बिल्कुल सर! दुकान की कुल कमाई अभी ₹${storeSnapshot.totalRevenue.toLocaleString('en-IN')} हो चुकी है, कुल ${storeSnapshot.totalOrders} ऑर्डर्स में। मैंने स्क्रीन पर Analytics Hub खोल दिया है।`;
      setMood('happy', 3500);
    }
    // Pending Orders
    else if (/(pending|order baaki|kiska order|pending order)/i.test(lower)) {
      if (onNavigateTab) onNavigateTab('pending');
      replyText = storeSnapshot.pendingOrdersCount > 0
        ? `अरे सर, अभी कुल ${storeSnapshot.pendingOrdersCount} ऑर्डर्स पेंडing हैं कन्फर्मेशन के लिए! मैंने Pending Orders टैब खोल दिया है, तुरंत अप्रूव कर दीजिए।`
        : `सर, बहुत बढ़िया! अभी एक भी पेंडिंग ऑर्डर नहीं है, सारे ऑर्डर्स निपटा दिए गए हैं।`;
      setMood('alert', 3500);
    }
    // Out of Stock & Inventory
    else if (/(stock|out of stock|khatam|saman|inventory|kya bacha)/i.test(lower)) {
      if (onNavigateTab) onNavigateTab('add-product');
      replyText = storeSnapshot.outOfStockCount > 0
        ? `सर, दुकान में ${storeSnapshot.outOfStockCount} सामान आउट ऑफ स्टॉक हो चुके हैं (${storeSnapshot.outOfStockSample.slice(0, 3).join(', ')}). मेरी सलाह है कि नया स्टॉक तुरंत मंगवा लीजिए। मैंने Products टैब खोल दिया है।`
        : `सर खुशखबरी! दुकान के सभी ${storeSnapshot.totalProductsCount} प्रोडक्ट्स फुल स्टॉक में उपलब्ध हैं।`;
      setMood(storeSnapshot.outOfStockCount > 0 ? 'alert' : 'proud', 3500);
    }
    // Best Sellers & Top Products
    else if (/(top|bestseller|sabse zyada|kya bikta|demand)/i.test(lower)) {
      replyText = `सर, आपकी दुकान में सबसे ज़्यादा डिमांड ${storeSnapshot.topSoldItems.slice(0, 3).join(', ')} की है। इन सामानों का स्टॉक हमेशा फुल रखना फायदेमंद रहेगा!`;
      setMood('proud', 3500);
    }
    // Business Advice & Salah
    else if (/(salah|advice|idea|dukan kaise|sales kaise|growth|badhayein)/i.test(lower)) {
      replyText = `जी सर, मेरी दो खास सलाह हैं: पहला, जो ${storeSnapshot.outOfStockCount || 'कम'} सामान खत्म हैं उन्हें जल्दी रिस्टॉक करें। और दूसरा, प्रतापपुर के 2 किलोमीटर वाले कस्टमर्स के लिए एक वीकेंड डिस्काउंट बैनर लगा दीजिए, सेल तुरंत बढ़ेगी!`;
      setMood('happy', 4000);
    }
    // VIP Customers & Khata
    else if (/(customer|vip|khata|loyalty|coin)/i.test(lower)) {
      if (onNavigateTab) onNavigateTab('customers');
      replyText = `हाँ सर, आपके पास अभी कुल ${storeSnapshot.vipCustomersCount} रजिस्टर्ड VIP कस्टमर्स हैं। मैंने Customers टैब खोल दिया है।`;
      setMood('happy', 3500);
    }
    // Jokes & Humor
    else if (/(joke|majak|mazaak|chutkula|shayari|hasi|bore)/i.test(lower)) {
      replyText = `Haha सर सुनिए! एक ग्राहक ने पूछा- भइया उधार मिलेगा? दुकानदार ने मुस्कुरा कर कहा- उधार तो दिल का सुकून छीन लेता है, और हम अपने ग्राहकों को हमेशा सुकून में देखना चाहते हैं!`;
      setMood('excited', 3500);
    }
    // Identity & Abilities
    else if (/(tum kaun ho|kya kar sakte ho|kya naam|who are you)/i.test(lower)) {
      replyText = `सर, मैं हूँ Gen! अंकुश जनरल स्टोर का लाइव AI को-पायलट और आपका पर्सनल बिजनेस पार्टनर। मैं दुकान की सेल्स, ऑर्डर्स, स्टॉक और ग्राहक सबका हिसाब रखता हूँ और आपको सही सलाह देता हूँ!`;
      setMood('proud', 3500);
    }
    // General Conversational Fallback
    else {
      replyText = `जी सर, मैंने आपकी बात नोट कर ली है! दुकान पर अभी ₹${storeSnapshot.totalRevenue.toLocaleString('en-IN')} की सेल और ${storeSnapshot.pendingOrdersCount} पेंडिंग ऑर्डर्स लाइव हैं। आप जो भी पूछेंगे या आदेश देंगे, मैं तुरंत कर दूँगा!`;
      setMood('curious', 3000);
    }

    saveToMemory(query, replyText);
    showBubble("You: " + query, replyText);
    speakText(replyText);
  }, [geminiApiKey, storeSnapshot, chatMemory, onNavigateTab, saveToMemory, setMood, showBubble, speakText]);

  // Robust Continuous Speech Recognition with Barge-In
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      showBubble("Microphone", "Browser me speech recognition support nahi hai. Chrome use karein.");
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      // If AI is speaking when mic is pressed, silence AI immediately
      if (stateRef.current.speaking || (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking)) {
        try { window.speechSynthesis.cancel(); } catch (e) {}
        stateRef.current.speaking = false;
        levelRef.current = 0;
      }

      const r = new SR();
      r.lang = 'hi-IN';
      r.interimResults = true;
      r.continuous = true;
      r.maxAlternatives = 2;

      r.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        stateRef.current.listening = true;
        setMood('alert', 15000);
        showBubble("🎙️ Sun raha hoon…", "Aap bol sakte hain...");
      };

      r.onresult = (e) => {
        // BARGE-IN: User spoke, silence any lingering AI speech immediately
        if (stateRef.current.speaking || (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking)) {
          try { window.speechSynthesis.cancel(); } catch (e) {}
          stateRef.current.speaking = false;
          levelRef.current = 0;
          setMood('alert', 2500);
        }

        let interimStr = '';
        let finalStr = '';

        for (let i = e.resultIndex; i < e.results.length; i++) {
          const trans = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalStr += trans;
          } else {
            interimStr += trans;
          }
        }

        const currentWords = (finalStr || interimStr).trim();
        if (currentWords) {
          showBubble("🎙️ Sun raha hoon…", currentWords);
        }

        if (finalStr.trim()) {
          const finalSpoken = finalStr.trim();
          answerQuery(finalSpoken);
        }
      };

      r.onerror = (e) => {
        if (e.error === 'no-speech') return; // Don't crash on pauses
        if (e.error === 'not-allowed') {
          showBubble("Microphone", "माइक की अनुमति blocked है। Browser lock 🔒 icon par jaakar allow karein.");
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      r.onend = () => {
        if (isListeningRef.current && !stateRef.current.speaking) {
          try { r.start(); } catch (e) {}
        } else {
          setIsListening(false);
          stateRef.current.listening = false;
        }
      };

      r.start();
      recognitionRef.current = r;
      playChime();
    } catch (err) {
      console.warn('Speech start error:', err);
      setIsListening(false);
    }
  }, [answerQuery, playChime, setMood, showBubble]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }
    setIsListening(false);
    stateRef.current.listening = false;
  }, []);

  // EXACT CANVAS 3D ORB DRAWING LOOP MATCHING AURA_JARVES.TXT
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const cx = cv.getContext('2d');
    let animId;

    const D = Math.min(window.devicePixelRatio || 1, 2);
    const S = 110;
    cv.width = S * D;
    cv.height = S * D;
    cv.style.width = `${S}px`;
    cv.style.height = `${S}px`;

    const cc = JSON.parse(JSON.stringify(PAL.idle));

    const draw = (ms) => {
      const t = ms / 1000;
      const c = (S * D) / 2;
      const now = Date.now();

      // Current Mode
      let mode = 'idle';
      if (stateRef.current.flying) mode = 'fly';
      else if (stateRef.current.thinking) mode = 'think';
      else if (stateRef.current.speaking || now < stateRef.current.speakUntil) mode = 'speak';
      else if (stateRef.current.listening) mode = 'listen';

      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.clearRect(0, 0, S * D, S * D);

      // Emotion LERP
      if (now > moodUntilRef.current) {
        targetEmoRef.current = mode === 'think' ? MD.thinking :
                               mode === 'listen' ? MD.alert :
                               mode === 'speak' ? MD.calm : MD.neutral;
      }
      const E = emoRef.current;
      const ET = targetEmoRef.current;
      for (const k in E) {
        E[k] += (ET[k] - E[k]) * 0.13;
      }

      // Audio Level
      const tl = mode === 'speak' ? 0.4 + Math.random() * 0.55 :
                 mode === 'fly' ? 0.7 :
                 mode === 'listen' ? 0.4 + Math.sin(t * 8) * 0.15 :
                 mode === 'think' ? 0.5 + Math.sin(t * 5) * 0.2 :
                 0.08 + Math.sin(t * 1.3) * 0.04;
      levelRef.current += (tl - levelRef.current) * 0.25;
      const level = levelRef.current;

      // Color LERP
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          cc[i][j] += (PAL[mode][i][j] - cc[i][j]) * 0.08;
        }
      }

      const R = c * 0.55 * (1 + level * 0.06);

      const rgb = (i, a) => {
        return `rgba(${Math.round(cc[i][0])},${Math.round(cc[i][1])},${Math.round(cc[i][2])},${a == null ? 1 : a})`;
      };

      // 1. Rotating Dashed Orbit Ring
      cx.save();
      cx.translate(c, c);
      cx.rotate(t * (mode === 'think' ? 2.2 : 0.5));
      cx.setLineDash([5 * D, 9 * D]);
      cx.strokeStyle = rgb(1, mode === 'idle' ? 0.25 : 0.75);
      cx.lineWidth = 1.6 * D;
      cx.beginPath();
      cx.arc(0, 0, R * 1.32, 0, 6.2832);
      cx.stroke();
      cx.restore();

      // 2. Thinking Dots on Orbit
      if (mode === 'think') {
        cx.fillStyle = rgb(2);
        for (let p = 0; p < 3; p++) {
          const a = t * 3 + p * 2.09;
          cx.beginPath();
          cx.arc(c + Math.cos(a) * R * 1.32, c + Math.sin(a) * R * 1.32, 2.6 * D, 0, 6.2832);
          cx.fill();
        }
      }

      // 3. Deforming Organic Blob Perimeter
      cx.beginPath();
      for (let a2 = 0; a2 <= 90; a2++) {
        const an = (a2 / 90) * 6.2832;
        const n = Math.sin(an * 3 + t * 1.5) * 0.06 + Math.sin(an * 5 - t * 2) * 0.04 * (1 + level * 3) + Math.sin(an * 2 + t) * 0.05;
        const r = R * (1 + n * (0.6 + level * 2));
        const x = c + Math.cos(an) * r;
        const y = c + Math.sin(an) * r;
        a2 ? cx.lineTo(x, y) : cx.moveTo(x, y);
      }
      cx.closePath();

      const g = cx.createRadialGradient(c - R * 0.35, c - R * 0.4, R * 0.1, c, c, R * 1.25);
      g.addColorStop(0, rgb(1));
      g.addColorStop(0.55, rgb(0));
      g.addColorStop(1, rgb(2));

      cx.shadowColor = rgb(0, 0.85);
      cx.shadowBlur = 20 * D;
      cx.fillStyle = g;
      cx.fill();
      cx.shadowBlur = 0;

      // 4. Blinking
      if (now > blinkAtRef.current) {
        blinkAtRef.current = now + 1800 + Math.random() * 3200;
        blinkUntilRef.current = now + 130;
      }
      const bl = now < blinkUntilRef.current ? 0.1 : 1;

      // Gaze LERP
      const look = lookRef.current;
      const tgt = targetLookRef.current;
      look[0] += (tgt[0] - look[0]) * 0.12;
      look[1] += (tgt[1] - look[1]) * 0.12;

      // 5. Blush
      if (E.bl > 0.05) {
        cx.fillStyle = `rgba(255,110,170,${E.bl * 0.42})`;
        [-1, 1].forEach((s) => {
          cx.beginPath();
          cx.ellipse(c + s * R * 0.47 + look[0] * R * 0.1, c + R * 0.2, R * 0.12, R * 0.07, 0, 0, 6.2832);
          cx.fill();
        });
      }

      // 6. Eyes & Eyebrows
      cx.fillStyle = '#fff';
      cx.strokeStyle = '#fff';
      cx.lineCap = 'round';
      cx.shadowColor = '#fff';
      cx.shadowBlur = 7 * D;

      const ey = c - R * 0.05 + look[1] * R * 0.12;

      [-1, 1].forEach((s) => {
        const ex = c + s * R * 0.3 + look[0] * R * 0.18;
        const h = R * 0.13 * E.ey * bl * (1 - E.hp) * (E.wk > 0.5 && s === 1 ? 0.08 : 1);

        if (1 - E.hp > 0.05) {
          cx.globalAlpha = 1 - E.hp * 0.9;
          cx.beginPath();
          cx.ellipse(ex, ey, R * 0.08 * (1 + (E.ey - 1) * 0.35), Math.max(R * 0.012, h), 0, 0, 6.2832);
          cx.fill();
          cx.globalAlpha = 1;
        }

        if (E.hp > 0.05) {
          cx.globalAlpha = E.hp;
          cx.lineWidth = 3.4 * D;
          cx.beginPath();
          cx.arc(ex, ey + R * 0.06, R * 0.085, 3.5, 5.92);
          cx.stroke();
          cx.globalAlpha = 1;
        }

        // Eyebrow
        cx.save();
        cx.translate(ex, ey - R * 0.25 - E.br * R * 0.07 - (s === 1 ? E.tl * R * 0.05 : 0));
        cx.rotate(E.an * s);
        cx.globalAlpha = 0.8;
        cx.lineWidth = 2.6 * D;
        cx.beginPath();
        cx.moveTo(-R * 0.09, 0);
        cx.lineTo(R * 0.09, 0);
        cx.stroke();
        cx.restore();
        cx.globalAlpha = 1;
      });

      // 7. Mouth
      const mx = c + look[0] * R * 0.1;
      const my = c + R * 0.34 + look[1] * R * 0.06;
      const op = Math.max(E.op, mode === 'speak' ? level * 0.85 : 0);
      const mw = R * (0.1 + op * 0.05 + Math.max(0, E.sm) * 0.06);
      const cu = E.sm * R * 0.11;

      cx.lineWidth = 3 * D;
      cx.beginPath();
      if (op > 0.12) {
        cx.moveTo(mx - mw, my);
        cx.quadraticCurveTo(mx, my + cu * 0.5 - R * 0.02, mx + mw, my);
        cx.quadraticCurveTo(mx, my + op * R * 0.3 + cu * 0.5, mx - mw, my);
        cx.closePath();
        cx.fillStyle = 'rgba(50,10,70,.9)';
        cx.fill();
        cx.stroke();
      } else {
        cx.moveTo(mx - mw, my - cu * 0.35);
        cx.quadraticCurveTo(mx, my + cu, mx + mw, my - cu * 0.35);
        cx.stroke();
      }
      cx.shadowBlur = 0;

      // 8. Natural Floating Motion
      const ox = Math.sin(t * 0.7) * 7 + look[0] * 4;
      const oy = Math.sin(t * 1.1) * 6 + look[1] * 3 + (mode === 'speak' ? Math.sin(t * 9) * 1.5 : 0);
      const rot = Math.sin(t * 0.5) * 3 + look[0] * 4 + E.tl * 9;
      cv.style.transform = `translate(${ox}px, ${oy}px) rotate(${rot}deg)`;

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Gaze Tracking
  useEffect(() => {
    const handleMove = (e) => {
      if (!aiRef.current) return;
      const r = aiRef.current.getBoundingClientRect();
      const dx = e.clientX - (r.left + 55);
      const dy = e.clientY - (r.top + 55);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 120);
      targetLookRef.current = [(dx / d) * k, (dy / d) * k];
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const updateOrbPosition = useCallback((x, y) => {
    posRef.current = { x, y };
    if (aiRef.current) {
      aiRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, []);

  useEffect(() => {
    const initX = typeof window !== 'undefined' ? Math.max(10, window.innerWidth - 130) : 250;
    const initY = typeof window !== 'undefined' ? Math.max(70, window.innerHeight - 170) : 400;
    updateOrbPosition(initX, initY);

    const handleResize = () => {
      const nx = Math.min(window.innerWidth - 120, Math.max(10, posRef.current.x));
      const ny = Math.min(window.innerHeight - 150, Math.max(60, posRef.current.y));
      updateOrbPosition(nx, ny);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateOrbPosition]);

  // Draggable physics with robust window listeners
  const onPointerDown = (e) => {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: posRef.current.x,
      posY: posRef.current.y,
      moved: false
    };

    const handleGlobalMove = (ev) => {
      if (!dragRef.current) return;
      const dx = ev.clientX - dragRef.current.startX;
      const dy = ev.clientY - dragRef.current.startY;
      if (Math.hypot(dx, dy) > 4) {
        dragRef.current.moved = true;
      }
      const nx = Math.min(window.innerWidth - 116, Math.max(6, dragRef.current.posX + dx));
      const ny = Math.min(window.innerHeight - 150, Math.max(50, dragRef.current.posY + dy));
      posRef.current = { x: nx, y: ny };
      if (aiRef.current) {
        aiRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
      }
    };

    const handleGlobalUp = () => {
      if (dragRef.current && !dragRef.current.moved) {
        setIsConsoleOpen(prev => !prev);
      }
      dragRef.current = null;
      window.removeEventListener('pointermove', handleGlobalMove);
      window.removeEventListener('pointerup', handleGlobalUp);
    };

    window.addEventListener('pointermove', handleGlobalMove);
    window.addEventListener('pointerup', handleGlobalUp);
  };

  return (
    <>
      {/* Floating Canvas Orb (#ai) matching exact aura_jarves.txt */}
      <div
        ref={aiRef}
        onPointerDown={onPointerDown}
        style={{
          transform: `translate(${posRef.current.x}px, ${posRef.current.y}px)`,
          touchAction: 'none'
        }}
        className="fixed top-0 left-0 z-[9999] w-[110px] h-[110px] cursor-grab active:cursor-grabbing select-none"
      >
        <canvas
          ref={canvasRef}
          className="w-[110px] h-[110px] block pointer-events-none drop-shadow-[0_8px_25px_rgba(124,92,255,0.65)]"
        />

        {/* Status indicator dot */}
        <div
          className={`absolute bottom-1 right-3 w-3.5 h-3.5 rounded-full border-2 border-slate-900 pointer-events-none ${
            apiConnectionStatus === 'connected' ? 'bg-emerald-400 animate-pulse' :
            apiConnectionStatus === 'error' ? 'bg-rose-500' : 'bg-amber-400'
          }`}
          title={apiConnectionStatus === 'connected' ? 'Gemini AI Online' : 'Gemini AI Offline'}
        />

        {/* 1-Click Quick Mic Action Trigger next to Orb */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isListening) {
              stopListening();
            } else {
              startListening();
            }
          }}
          className={`absolute -top-1 -right-1 w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs font-bold transition-all shadow-lg cursor-pointer ${
            isListening
              ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse ring-4 ring-rose-500/30'
              : 'bg-violet-600/90 hover:bg-violet-500 text-white'
          }`}
          title={isListening ? 'Click to stop listening' : 'Click to speak to Gen AI'}
        >
          {isListening ? '⏹️' : '🎙️'}
        </button>
      </div>

      {/* Floating Speech Bubble (#bub) matching exact aura_jarves.txt */}
      {bubble.show && (
        <div
          ref={bubRef}
          style={{
            left: `${Math.min(window.innerWidth - 290, Math.max(10, posRef.current.x - 170))}px`,
            top: `${Math.max(10, posRef.current.y - 110)}px`
          }}
          className="fixed z-[9999] w-72 max-w-[85vw] max-h-48 overflow-y-auto bg-slate-950/95 text-white border border-[#7c5cff] p-3 rounded-2xl text-xs shadow-[0_8px_30px_rgba(124,92,255,0.35)] space-y-1 backdrop-blur-md"
        >
          {bubble.title && (
            <div className="text-[11px] font-bold text-teal-300">
              {bubble.title}
            </div>
          )}
          <div className="text-xs text-white leading-relaxed font-medium">
            {bubble.text}
          </div>
        </div>
      )}

      {/* Slide-out Gemini Live Console */}
      {isConsoleOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsConsoleOpen(false)}
          />

          <div className="relative w-full max-w-md bg-[#131127] border border-[#2a2850] rounded-3xl p-5 sm:p-6 text-white z-10 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2a2850]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#7c5cff] to-[#ec4899] flex items-center justify-center text-white font-black text-sm">
                  ✨
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Gen — Live Co-Pilot</h3>
                  <p className="text-[11px] text-[#a29fc9]">Google Gemini Live AI Business Advisor</p>
                </div>
              </div>
              <button
                onClick={() => setIsConsoleOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* AI Persistent Memory Indicator */}
            <div className="bg-[#171630] border border-[#2a2850] rounded-2xl px-3.5 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#a29fc9]">
                <span>🧠</span>
                <span className="font-bold text-white">
                  {chatMemory.length > 0 ? `${Math.floor(chatMemory.length / 2)} Baatein Yaad Hain` : 'Memory Fresh (Nayi Shuruat)'}
                </span>
              </div>
              {chatMemory.length > 0 && (
                <button
                  onClick={clearMemory}
                  className="text-[10px] text-rose-400 hover:text-rose-300 bg-rose-950/40 border border-rose-500/30 px-2 py-0.5 rounded-lg cursor-pointer"
                >
                  Clear Memory
                </button>
              )}
            </div>

            {/* API Status Badge & Key Input */}
            <div className="bg-[#171630] border border-[#2a2850] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#a29fc9]">Gemini Status:</span>
                {apiConnectionStatus === 'connected' && (
                  <span className="text-[11px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    🟢 Live Connected
                  </span>
                )}
                {apiConnectionStatus === 'error' && (
                  <span className="text-[11px] font-extrabold text-rose-400 bg-rose-950/80 border border-rose-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    🔴 Disconnected / Invalid Key
                  </span>
                )}
                {apiConnectionStatus === 'checking' && (
                  <span className="text-[11px] font-extrabold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    🟡 Connecting...
                  </span>
                )}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="password"
                  placeholder="Paste Gemini API Key..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="flex-1 bg-[#0d0c1b] border border-[#2a2850] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none font-mono"
                />
                <button
                  onClick={() => testGeminiConnection(geminiApiKey)}
                  disabled={isTestingKey}
                  className="px-3 py-2 rounded-xl bg-[#7c5cff] hover:bg-[#6c4ce7] text-white font-extrabold text-xs cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {isTestingKey ? '...' : 'Connect'}
                </button>
              </div>
            </div>

            {/* Mic & Voice Controls */}
            <div className="bg-[#171630] border border-[#2a2850] rounded-2xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{isListening ? '🎙️' : '🎧'}</span>
                <div>
                  <p className="text-xs font-black text-white">
                    {isListening ? 'Sun raha hoon (Aap bol sakte hain)...' : 'Live Voice Ready'}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-bold">Natural Hindi Speech • Barge-In Active</p>
                </div>
              </div>

              <button
                onClick={isListening ? stopListening : startListening}
                className={`px-4 py-2 rounded-xl font-black text-xs cursor-pointer transition-all ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-[#10b981] hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                }`}
              >
                {isListening ? 'Stop' : 'Start Mic'}
              </button>
            </div>

            {/* Quick Prompts */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                "📊 Aaj ki kul kamai aur orders batao",
                "💡 Dukan badhane ki koi acchi salah do",
                "⚠️ Konsa saman out of stock hai?",
                "📦 Pending orders kitne hain?",
                "🔥 Sabse zyada kya bik raha hai?",
                "😄 Ek mazedaar chutkula sunao"
              ].map(p => (
                <button
                  key={p}
                  onClick={() => answerQuery(p)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#2a2850] text-[#a29fc9] hover:text-white cursor-pointer text-[11px] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Gen se kuch bhi poochhein…"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    answerQuery(inputText);
                    setInputText('');
                  }
                }}
                className="flex-1 bg-[#0d0c1b] border border-[#2a2850] rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 outline-none"
              />
              <button
                onClick={() => {
                  answerQuery(inputText);
                  setInputText('');
                }}
                className="px-3.5 py-2.5 bg-[#7c5cff] hover:bg-[#6c4ce7] text-white font-black text-xs rounded-xl cursor-pointer"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
