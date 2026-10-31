import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStore, STORE_ADDRESS_TEXT, SHOP_WHATSAPP_NUMBER } from '../StoreContext';

/* =====================================================================
   GEN AI ASSISTANT — JARVIS-CLASS INTELLIGENT STORE ORB
   Features:
   - Full Canvas 3D Orb with realistic fluid shader gradients
   - 12 Emotional facial expressions (happy, laugh, surprised, wink, thinking, etc.)
   - Cursor & touch eye tracking with pupil blinking
   - Draggable physics orb across the screen
   - Voice listening (SpeechRecognition) & natural SpeechSynthesis
   - Audio waveform reactive mouth animation
   - Physical page flying & smooth section highlighting
   - Deep live connection to Ankush General Store database & Admin analytics
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

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const wait = (ms) => new Promise((res) => setTimeout(res, ms));

export default function GenAIAssistant({ onNavigateTab }) {
  const {
    products,
    activeOffers,
    orders,
    storeSettings,
    setIsCartOpen,
    totalItems,
    finalAmount,
    currentView
  } = useStore();

  const canvasRef = useRef(null);
  const aiRef = useRef(null);
  const bubbleRef = useRef(null);
  const hlRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [bubbleContent, setBubbleContent] = useState({ user: '', bot: '', action: null, show: false });
  const [isListening, setIsListening] = useState(false);
  const [convoMode, setConvoMode] = useState(false);
  const [statusText, setStatusText] = useState('Gen AI Online');

  // Animation & Physics Refs
  const stateRef = useRef({
    flying: false,
    thinking: false,
    speaking: false,
    listening: false,
    speakUntil: 0
  });

  const emotionRef = useRef(JSON.parse(JSON.stringify(MD.neutral)));
  const targetEmotionRef = useRef(MD.neutral);
  const moodUntilRef = useRef(0);
  const microAtRef = useRef(Date.now() + 6000);
  const hopAtRef = useRef(Date.now() + 6000);
  const blinkAtRef = useRef(Date.now() + 2500);
  const blinkUntilRef = useRef(0);
  const lookRef = useRef([0, 0]);
  const targetLookRef = useRef([0, 0]);
  const lastMoveRef = useRef(0);
  const colorPaletteRef = useRef(JSON.parse(JSON.stringify(PAL.idle)));
  const audioLevelRef = useRef(0);
  const posRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth - 130 : 250, y: typeof window !== 'undefined' ? window.innerHeight - 280 : 400 });
  const dragRef = useRef(null);

  // Audio & Speech
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const audioBufRef = useRef(null);
  const recognitionRef = useRef(null);
  const fadeTimeoutRef = useRef(null);

  const setMood = useCallback((name, durationMs = 2200) => {
    if (MD[name]) {
      targetEmotionRef.current = MD[name];
      moodUntilRef.current = Date.now() + durationMs;
    }
  }, []);

  const curMode = useCallback(() => {
    const st = stateRef.current;
    if (st.flying) return 'fly';
    if (st.thinking) return 'think';
    if (st.speaking || Date.now() < st.speakUntil) return 'speak';
    if (st.listening) return 'listen';
    return 'idle';
  }, []);

  // Natural Speech Synthesis
  const speakText = useCallback((text, onFinish) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/\[\[.*?\]\]/g, '')
      .replace(/[*_#`]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const voices = window.speechSynthesis.getVoices();
    const isHindi = /[\u0900-\u097F]/.test(cleanText);

    let chosenVoice = null;
    if (isHindi) {
      chosenVoice = voices.find(v => /^hi/i.test(v.lang) && /male|hemant|madhur/i.test(v.name)) ||
                    voices.find(v => /^hi/i.test(v.lang));
      utterance.lang = 'hi-IN';
    } else {
      chosenVoice = voices.find(v => /google uk english male|daniel|george|arthur|ryan|oliver/i.test(v.name)) ||
                    voices.find(v => /en-GB/i.test(v.lang)) ||
                    voices.find(v => /^en/i.test(v.lang));
      utterance.lang = 'en-IN';
    }

    if (chosenVoice) utterance.voice = chosenVoice;
    utterance.pitch = 0.88;
    utterance.rate = 1.0;

    stateRef.current.speaking = true;
    stateRef.current.speakUntil = Date.now() + cleanText.length * 70;

    utterance.onstart = () => {
      stateRef.current.speaking = true;
      setMood('calm', cleanText.length * 65);
    };

    utterance.onend = () => {
      stateRef.current.speaking = false;
      stateRef.current.speakUntil = 0;
      if (onFinish) onFinish();
    };

    utterance.onerror = () => {
      stateRef.current.speaking = false;
      stateRef.current.speakUntil = 0;
      if (onFinish) onFinish();
    };

    window.speechSynthesis.speak(utterance);
  }, [setMood]);

  // Highlight Section on Screen
  const highlightSection = useCallback((elementId) => {
    const el = document.getElementById(elementId);
    if (!el || !hlRef.current) return;
    const r = el.getBoundingClientRect();
    const hl = hlRef.current;
    hl.style.left = `${r.left - 8}px`;
    hl.style.top = `${r.top - 8}px`;
    hl.style.width = `${r.width + 16}px`;
    hl.style.height = `${r.height + 16}px`;
    hl.classList.add('opacity-100');
    setTimeout(() => {
      if (hlRef.current) hlRef.current.classList.remove('opacity-100');
    }, 4500);
  }, []);

  // Physical Flying to Section
  const flyToSection = useCallback(async (elementId) => {
    const el = document.getElementById(elementId);
    if (!el || !aiRef.current) return;

    stateRef.current.flying = true;
    setMood('determined', 3000);

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await wait(600);

    const r = el.getBoundingClientRect();
    const destX = Math.min(window.innerWidth - 120, Math.max(10, r.left - 20));
    let destY = r.top - 120;
    if (destY < 70) destY = Math.min(window.innerHeight - 260, r.bottom + 20);

    const cur = posRef.current;
    const dx = destX - cur.x;
    const dy = destY - cur.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 10 && aiRef.current.animate) {
      const dur = Math.min(1400, 450 + dist * 0.9);
      const anim = aiRef.current.animate([
        { transform: `translate(${cur.x}px, ${cur.y}px) scale(1)` },
        { transform: `translate(${cur.x + dx / 2}px, ${cur.y + dy / 2 - 30}px) scale(1.2)` },
        { transform: `translate(${destX}px, ${destY}px) scale(1)` }
      ], { duration: dur, easing: 'cubic-bezier(0.25, 1, 0.5, 1)', fill: 'forwards' });

      await new Promise(r => { anim.onfinish = r; });
      anim.cancel();
    }

    posRef.current = { x: destX, y: destY };
    if (aiRef.current) aiRef.current.style.transform = `translate(${destX}px, ${destY}px)`;

    stateRef.current.flying = false;
    highlightSection(elementId);
    setMood('proud', 2500);
  }, [highlightSection, setMood]);

  // Intelligent Store Answers Generator
  const answerQuery = useCallback((query) => {
    const q = query.toLowerCase().trim();

    // 1. Navigation / Show Intent
    if (/(deal|daily deal|offer|chhut|discount)/i.test(q)) {
      flyToSection('daily-deals-section');
      return {
        text: `जी सर, ये रहे आज के ताज़ा Daily Deals और Offers! आप यहाँ से डायरेक्ट भारी छूट पर ऑर्डर कर सकते हैं।`,
        mood: 'happy',
        action: { label: 'Deals Dekhein →', target: 'daily-deals-section' }
      };
    }

    if (/(product|saman|catalog|vegetable|sabji|fruit|rashan)/i.test(q)) {
      flyToSection('main-products-catalog');
      return {
        text: `जी सर, हमारी दुकान का पूरा राशन और ग्रॉसरी कैटलॉग ये रहा। कुल ${products.length} प्रोडक्ट्स फुल स्टॉक में उपलब्ध हैं।`,
        mood: 'proud',
        action: { label: 'Products Dekhein →', target: 'main-products-catalog' }
      };
    }

    if (/(cart|bag|order list|kitna saman)/i.test(q)) {
      setIsCartOpen(true);
      return {
        text: `सर, आपके कार्ट में अभी कुल ${totalItems} सामान हैं, जिनका कुल मूल्य ₹${Number(finalAmount).toFixed(0)} है।`,
        mood: 'happy'
      };
    }

    if (/(delivery|pata|address|kahan hai|timing|shop timing)/i.test(q)) {
      flyToSection('contact-footer');
      return {
        text: `अंकश जनरल स्टोर खोरमा, प्रतापपुर, जिला सूरजपुर में स्थित है। दुकान सुबह 7:00 बजे से रात 9:30 बजे तक खुली रहती है, और 2 किमी के अंदर फास्ट होम डिलीवरी मिलती है।`,
        mood: 'calm'
      };
    }

    if (/(coin|loyalty|gold coin|reward)/i.test(q)) {
      return {
        text: `अंकश स्टोर में 1 कॉइन = ₹1 का डिस्काउंट होता है! हर ₹100 की खरीदारी पर आपको 2 VIP गोल्ड कॉइन्स मिलते हैं जिन्हें आप अगले ऑर्डर पर तुरंत भुना सकते हैं।`,
        mood: 'proud'
      };
    }

    // 2. Admin Portal Telemetry Answers (Safe - No PIN leaks)
    if (currentView === 'admin' || /(sale|bikri|revenue|total order|pending|aaj kitna)/i.test(q)) {
      const totalSales = orders.reduce((sum, o) => sum + (Number(o.finalAmount) || 0), 0);
      const pendingCount = orders.filter(o => o.status === 'pending').length;
      const deliveredCount = orders.filter(o => o.status === 'delivered').length;

      // Category breakdown
      const categorySales = {};
      orders.forEach(o => {
        (o.items || []).forEach(it => {
          const cat = it.category || 'Groceries';
          categorySales[cat] = (categorySales[cat] || 0) + (it.finalItemTotal || (it.price * it.quantity));
        });
      });
      const topCat = Object.entries(categorySales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Groceries';

      if (/(pending)/i.test(q) && onNavigateTab) {
        onNavigateTab('pending');
      }

      return {
        text: `सर, स्टोर डेटा के अनुसार अब तक कुल बिक्री ₹${totalSales.toLocaleString('en-IN')} हुई है, जिसमें ${orders.length} ऑर्डर्स आए हैं (${pendingCount} पेंडिंग, ${deliveredCount} डिलीवर)। सबसे ज़्यादा बिकने वाली कैटेगरी '${topCat}' रही है!`,
        mood: 'proud'
      };
    }

    // 3. Specific Product Price Lookups
    const matchProd = products.find(p => q.includes(p.name?.toLowerCase()) || (p.category && q.includes(p.category?.toLowerCase())));
    if (matchProd) {
      return {
        text: `${matchProd.name} का दाम ₹${matchProd.price} प्रति ${matchProd.unit || 'pack'} है, और यह ${matchProd.stockStatus || 'Full Stock'} में उपलब्ध है।`,
        mood: 'happy'
      };
    }

    // 4. Greetings & General Conversational Wit
    if (/(namaste|hello|hi|hey|kaise ho)/i.test(q)) {
      return {
        text: pick([
          "नमस्ते सर! मैं जेन (Gen) हूँ, अंकुश जनरल स्टोर का AI साथी। आज आपकी क्या सेवा करूँ?",
          "Hello sir! All systems are online. बताइए, दुकान का क्या हालचाल या सामान देखना है?",
          "नमस्ते! मैं बिल्कुल तैयार हूँ। आज राशन ऑर्डर करना है या कोई ऑफर देखना है?"
        ]),
        mood: 'happy'
      };
    }

    if (/(joke|chutkula|hansa)/i.test(q)) {
      return {
        text: pick([
          "एक बार कंप्यूटर ने डॉक्टर से कहा: मुझे ठंड लग रही है! डॉक्टर बोले: अरे, तुमने बहुत सारी विंडोज़ खोल रखी हैं, बंद करो!",
          "सर, मैंने आज अपनी सारी गलतियों को सुधारा, तो पता चला कि वही तो मेरे बेस्ट फीचर्स थे!"
        ]),
        mood: 'laugh'
      };
    }

    return {
      text: `जी सर, मैं अंकुश जनरल स्टोर की पूरी जानकारी रखता हूँ। आप मुझसे किसी भी सामान का दाम, आज के ऑफर्स, डिलीवरी चार्ज, या कुल बिक्री के बारे में पूछ सकते हैं!`,
      mood: 'curious'
    };
  }, [products, orders, totalItems, finalAmount, currentView, flyToSection, setIsCartOpen, onNavigateTab]);

  // Ask Question Handler
  const handleAsk = useCallback((text) => {
    const q = text.trim();
    if (!q) return;

    setInputText('');
    stateRef.current.thinking = true;
    setMood('thinking', 2000);
    setBubbleContent({ user: q, bot: '...', action: null, show: true });

    setTimeout(() => {
      stateRef.current.thinking = false;
      const res = answerQuery(q);
      setMood(res.mood || 'calm', 3000);
      setBubbleContent({ user: q, bot: res.text, action: res.action || null, show: true });
      speakText(res.text);

      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = setTimeout(() => {
        setBubbleContent(prev => ({ ...prev, show: false }));
      }, 14000);
    }, 450);
  }, [answerQuery, setMood, speakText]);

  // Voice Recognition Setup
  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Aapke browser me speech recognition support nahi hai. Kripya Chrome use karein.");
      return;
    }

    try {
      if (recognitionRef.current) recognitionRef.current.abort();

      const rec = new SpeechRecognition();
      rec.lang = 'hi-IN';
      rec.continuous = convoMode;
      rec.interimResults = true;

      rec.onstart = () => {
        setIsListening(true);
        stateRef.current.listening = true;
        setMood('alert', 8000);
        setStatusText('🎙️ Sun raha hoon...');
      };

      rec.onresult = (e) => {
        let transcript = '';
        let isFinal = false;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          transcript += e.results[i][0].transcript;
          if (e.results[i].isFinal) isFinal = true;
        }
        if (isFinal && transcript.trim()) {
          handleAsk(transcript);
        }
      };

      rec.onerror = () => {
        setIsListening(false);
        stateRef.current.listening = false;
        setStatusText('Gen AI Online');
      };

      rec.onend = () => {
        setIsListening(false);
        stateRef.current.listening = false;
        setStatusText('Gen AI Online');
        if (convoMode && !stateRef.current.speaking) {
          setTimeout(startListening, 600);
        }
      };

      rec.start();
      recognitionRef.current = rec;
    } catch (e) {
      setIsListening(false);
    }
  }, [convoMode, handleAsk, setMood]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch (e) {}
    }
    setIsListening(false);
    stateRef.current.listening = false;
    setStatusText('Gen AI Online');
  }, []);

  // Main Canvas Rendering Loop (Exact Aura/Jarvis Visual Engine)
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;

    const cx = cv.getContext('2d');
    const D = Math.min(window.devicePixelRatio || 1, 2);
    const S = 110;
    cv.width = cv.height = S * D;

    let animId;
    const render = (ms) => {
      const t = ms / 1000;
      const c = (S * D) / 2;
      const mode = curMode();
      const now = Date.now();

      cx.setTransform(1, 0, 0, 1, 0, 0);
      cx.clearRect(0, 0, S * D, S * D);

      // Micro emotional gestures
      if (now > moodUntilRef.current) {
        targetEmotionRef.current = mode === 'think' ? MD.thinking : mode === 'listen' ? MD.alert : mode === 'fly' ? MD.determined : mode === 'speak' ? MD.calm : MD.neutral;
      }

      if (mode === 'idle' && now > microAtRef.current) {
        microAtRef.current = now + 6000 + Math.random() * 8000;
        setMood(pick(['happy', 'curious', 'wink', 'calm']), 1700);
      }

      // Smooth Emotion Interpolation
      const E = emotionRef.current;
      const ET = targetEmotionRef.current;
      for (const k in E) {
        E[k] += (ET[k] - E[k]) * 0.13;
      }

      // Audio reactive levels
      let tl = mode === 'speak' ? 0.4 + Math.sin(t * 12) * 0.35 : mode === 'fly' ? 0.7 : mode === 'listen' ? 0.4 + Math.sin(t * 8) * 0.15 : mode === 'think' ? 0.5 + Math.sin(t * 5) * 0.2 : 0.08 + Math.sin(t * 1.3) * 0.04;
      audioLevelRef.current += (tl - audioLevelRef.current) * 0.25;
      const level = audioLevelRef.current;

      // Color Palette Interpolation
      const cc = colorPaletteRef.current;
      const targetColors = PAL[mode] || PAL.idle;
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          cc[i][j] += (targetColors[i][j] - cc[i][j]) * 0.08;
        }
      }

      const R = c * 0.55 * (1 + level * 0.06);
      const rgb = (i, a = 1) => `rgba(${Math.round(cc[i][0])},${Math.round(cc[i][1])},${Math.round(cc[i][2])},${a})`;

      // Outer Pulsing Dashed Orbit Ring
      cx.save();
      cx.translate(c, c);
      cx.rotate(t * (mode === 'think' ? 2.2 : 0.5));
      cx.setLineDash([5 * D, 9 * D]);
      cx.strokeStyle = rgb(1, mode === 'idle' ? 0.3 : 0.8);
      cx.lineWidth = 1.6 * D;
      cx.beginPath();
      cx.arc(0, 0, R * 1.32, 0, Math.PI * 2);
      cx.stroke();
      cx.restore();

      // Thinking Satellites
      if (mode === 'think') {
        cx.fillStyle = rgb(2);
        for (let p = 0; p < 3; p++) {
          const a = t * 3 + p * 2.09;
          cx.beginPath();
          cx.arc(c + Math.cos(a) * R * 1.32, c + Math.sin(a) * R * 1.32, 2.6 * D, 0, Math.PI * 2);
          cx.fill();
        }
      }

      // Fluid Plasma Orb Body
      cx.beginPath();
      for (let a2 = 0; a2 <= 90; a2++) {
        const an = (a2 / 90) * Math.PI * 2;
        const n = Math.sin(an * 3 + t * 1.5) * 0.06 + Math.sin(an * 5 - t * 2) * 0.04 * (1 + level * 3) + Math.sin(an * 2 + t) * 0.05;
        const r = R * (1 + n * (0.6 + level * 2));
        const x = c + Math.cos(an) * r;
        const y = c + Math.sin(an) * r;
        if (a2 === 0) cx.moveTo(x, y);
        else cx.lineTo(x, y);
      }
      cx.closePath();

      // 3-Stop Radial Glow Fill
      const g = cx.createRadialGradient(c - R * 0.35, c - R * 0.4, R * 0.1, c, c, R * 1.25);
      g.addColorStop(0, rgb(1));
      g.addColorStop(0.55, rgb(0));
      g.addColorStop(1, rgb(2));

      cx.shadowColor = rgb(0, 0.85);
      cx.shadowBlur = 20 * D;
      cx.fillStyle = g;
      cx.fill();
      cx.shadowBlur = 0;

      // Eye Blinking
      if (now > blinkAtRef.current) {
        blinkAtRef.current = now + 2000 + Math.random() * 3000;
        blinkUntilRef.current = now + 140;
      }
      const bl = now < blinkUntilRef.current ? 0.1 : 1;

      // Look Direction Interpolation
      const look = lookRef.current;
      const tgt = targetLookRef.current;
      look[0] += (tgt[0] - look[0]) * 0.12;
      look[1] += (tgt[1] - look[1]) * 0.12;

      // Blush
      if (E.bl > 0.05) {
        cx.fillStyle = `rgba(255, 110, 170, ${E.bl * 0.42})`;
        [-1, 1].forEach(s => {
          cx.beginPath();
          cx.ellipse(c + s * R * 0.47 + look[0] * R * 0.1, c + R * 0.2, R * 0.12, R * 0.07, 0, 0, Math.PI * 2);
          cx.fill();
        });
      }

      // Facial Features (White luminous eyes & eyebrows)
      cx.fillStyle = '#fff';
      cx.strokeStyle = '#fff';
      cx.lineCap = 'round';
      cx.shadowColor = '#fff';
      cx.shadowBlur = 7 * D;

      const ey = c - R * 0.05 + look[1] * R * 0.12;

      [-1, 1].forEach(s => {
        const ex = c + s * R * 0.3 + look[0] * R * 0.18;
        const h = R * 0.13 * E.ey * bl * (1 - E.hp) * (E.wk > 0.5 && s === 1 ? 0.08 : 1);

        if (1 - E.hp > 0.05) {
          cx.globalAlpha = 1 - E.hp * 0.9;
          cx.beginPath();
          cx.ellipse(ex, ey, R * 0.08 * (1 + (E.ey - 1) * 0.35), Math.max(R * 0.012, h), 0, 0, Math.PI * 2);
          cx.fill();
          cx.globalAlpha = 1;
        }

        // Happy closed eye curves
        if (E.hp > 0.05) {
          cx.globalAlpha = E.hp;
          cx.lineWidth = 3.4 * D;
          cx.beginPath();
          cx.arc(ex, ey + R * 0.06, R * 0.085, 3.5, 5.92);
          cx.stroke();
          cx.globalAlpha = 1;
        }

        // Eyebrows
        cx.save();
        cx.translate(ex, ey - R * 0.25 - E.br * R * 0.07 - (s === 1 ? E.tl * R * 0.05 : 0));
        cx.rotate(E.an * s);
        cx.globalAlpha = 0.85;
        cx.lineWidth = 2.6 * D;
        cx.beginPath();
        cx.moveTo(-R * 0.09, 0);
        cx.lineTo(R * 0.09, 0);
        cx.stroke();
        cx.restore();
        cx.globalAlpha = 1;
      });

      // Reactive Speaking Mouth
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
        cx.fillStyle = 'rgba(50, 10, 70, 0.9)';
        cx.fill();
        cx.stroke();
      } else {
        cx.moveTo(mx - mw, my - cu * 0.35);
        cx.quadraticCurveTo(mx, my + cu, mx + mw, my - cu * 0.35);
        cx.stroke();
      }

      cx.shadowBlur = 0;

      // Breathing Hop Physics
      const ox = Math.sin(t * 0.7) * 7 + look[0] * 4;
      const oy = Math.sin(t * 1.1) * 6 + look[1] * 3 + (mode === 'speak' ? Math.sin(t * 9) * 1.5 : 0);
      const rot = Math.sin(t * 0.5) * 3 + look[0] * 4 + E.tl * 9;

      if (mode === 'idle' && now > hopAtRef.current && cv.animate) {
        hopAtRef.current = now + 8000 + Math.random() * 9000;
        cv.animate([
          { transform: 'translate(0, 0)' },
          { transform: 'translate(0, -16px) scale(1.08)' },
          { transform: 'translate(0, 0)' }
        ], { duration: 520, easing: 'ease-out' });
      }

      cv.style.transform = `translate(${ox}px, ${oy}px) rotate(${rot}deg)`;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [curMode, setMood]);

  // Cursor & Touch Gaze Tracking
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!aiRef.current || stateRef.current.flying) return;
      const rect = aiRef.current.getBoundingClientRect();
      const dx = e.clientX - (rect.left + 55);
      const dy = e.clientY - (rect.top + 55);
      const dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, dist / 140);
      targetLookRef.current = [(dx / dist) * k, (dy / dist) * k];
      lastMoveRef.current = Date.now();
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Drag Physics
  const handlePointerDown = (e) => {
    if (!aiRef.current) return;
    dragRef.current = {
      dx: e.clientX - posRef.current.x,
      dy: e.clientY - posRef.current.y,
      moved: 0
    };
    aiRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerDrag = (e) => {
    if (!dragRef.current || !aiRef.current) return;
    const nx = e.clientX - dragRef.current.dx;
    const ny = e.clientY - dragRef.current.dy;

    if (Math.abs(nx - posRef.current.x) + Math.abs(ny - posRef.current.y) > 3) {
      dragRef.current.moved = 1;
    }

    posRef.current.x = Math.max(10, Math.min(window.innerWidth - 120, nx));
    posRef.current.y = Math.max(10, Math.min(window.innerHeight - 250, ny));
    aiRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
  };

  const handlePointerUp = () => {
    if (dragRef.current && !dragRef.current.moved) {
      // Tap on Gen
      setMood('happy', 2000);
      setIsOpen(prev => !prev);
      if (!bubbleContent.show) {
        setBubbleContent({
          user: '',
          bot: pick([
            "जी सर! मैं जेन हूँ। कहिए क्या सेवा करूँ?",
            "नमस्ते! अंकुश जनरल स्टोर लाइव असिस्टेंट हाज़िर है।",
            "सुन रहा हूँ सर, बोलिए क्या ढूँढना है?"
          ]),
          action: null,
          show: true
        });
        speakText("जी सर! मैं हाज़िर हूँ, कहिए क्या ढूँढना है?");
      }
    }
    dragRef.current = null;
  };

  return (
    <>
      {/* Target Section Highlight Ring */}
      <div
        ref={hlRef}
        className="fixed z-40 pointer-events-none rounded-3xl border-2 border-fuchsia-400 shadow-[0_0_0_9999px_rgba(8,6,25,0.65),0_0_35px_#ec4899] opacity-0 transition-all duration-500"
      />

      {/* Floating Canvas Orb Element */}
      <div
        ref={aiRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerDrag}
        onPointerUp={handlePointerUp}
        style={{
          transform: `translate(${posRef.current.x}px, ${posRef.current.y}px)`,
          touchAction: 'none'
        }}
        className="fixed top-0 left-0 w-[110px] h-[110px] z-50 cursor-grab active:cursor-grabbing select-none"
      >
        <canvas ref={canvasRef} className="w-[110px] h-[110px] block pointer-events-none drop-shadow-2xl" />

        {/* Small "Gen" Name Pill Under Orb */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-950/85 backdrop-blur-md text-cyan-300 border border-cyan-500/40 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider shadow pointer-events-none flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>GEN</span>
        </div>
      </div>

      {/* Speech Bubble */}
      {bubbleContent.show && (
        <div
          ref={bubbleRef}
          style={{
            left: Math.min(window.innerWidth - 300, Math.max(12, posRef.current.x - 90)),
            top: Math.max(16, posRef.current.y - 150)
          }}
          className="fixed z-50 w-[280px] max-w-[85vw] bg-slate-900/95 backdrop-blur-xl text-white border-2 border-fuchsia-500/60 p-3.5 rounded-2xl shadow-[0_10px_35px_rgba(236,72,153,0.35)] text-xs leading-relaxed"
        >
          {bubbleContent.user && (
            <p className="text-[10px] text-cyan-300 font-bold mb-1 truncate">
              🗣️ You: "{bubbleContent.user}"
            </p>
          )}
          <p className="font-semibold text-slate-100 text-xs">
            {bubbleContent.bot}
          </p>

          {bubbleContent.action && (
            <button
              onClick={() => {
                flyToSection(bubbleContent.action.target);
                setBubbleContent(prev => ({ ...prev, show: false }));
              }}
              className="mt-2.5 w-full py-1.5 px-3 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white font-black rounded-xl text-[11px] shadow-sm flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>{bubbleContent.action.label}</span>
            </button>
          )}

          <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10 text-[9px] text-slate-400">
            <span>Ankush Store Gen AI</span>
            <button
              onClick={() => setBubbleContent(prev => ({ ...prev, show: false }))}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}

      {/* Gen Assistant Dock / Controls (Expands when tapped or open) */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 select-none">
        {isOpen ? (
          <div className="bg-slate-950/95 backdrop-blur-2xl border-2 border-fuchsia-500/40 rounded-3xl p-3.5 shadow-2xl text-white space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h4 className="font-black text-xs text-white">Gen — Store AI Assistant</h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {[
                "🔥 Daily Deals dikhao",
                "🚚 Delivery kitne me hai?",
                "🪙 Coins kaise milte hain?",
                "🛒 Cart kholo",
                "📦 Order track karna hai"
              ].map(chip => (
                <button
                  key={chip}
                  onClick={() => handleAsk(chip)}
                  className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 shrink-0 font-medium cursor-pointer transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input & Voice Controls */}
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/15 rounded-2xl p-1.5">
              <input
                type="text"
                placeholder="Gen se pucho ya bolo..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAsk(inputText)}
                className="flex-1 bg-transparent px-2.5 text-xs text-white outline-none placeholder:text-slate-400"
              />

              {/* Continuous Listen Button */}
              <button
                onClick={() => {
                  setConvoMode(prev => !prev);
                  if (!convoMode) startListening();
                  else stopListening();
                }}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  convoMode ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/50 shadow-md' : 'bg-white/10 text-slate-300'
                }`}
                title="Continuous Gemini Live Mode"
              >
                🎧
              </button>

              {/* Mic Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/10 text-slate-300 hover:text-white'
                }`}
                title="Speak once"
              >
                🎙️
              </button>

              {/* Send Button */}
              <button
                onClick={() => handleAsk(inputText)}
                className="px-3 py-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white rounded-xl text-xs font-black shadow cursor-pointer"
              >
                ➤
              </button>
            </div>

            <p className="text-[10px] text-slate-400 text-center font-medium">
              {statusText}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-slate-950/90 hover:bg-slate-900 border border-fuchsia-500/40 text-white px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-xl text-xs font-bold cursor-pointer transition-transform hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Ask Gen AI Assistant</span>
            <span className="bg-fuchsia-500/30 text-fuchsia-300 text-[10px] px-2 py-0.5 rounded-full font-black">
              LIVE
            </span>
          </button>
        )}
      </div>
    </>
  );
}
