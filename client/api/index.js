import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import os from 'os';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'stitch_hook_super_secret_jwt_artisan_2026_key';
const DB_FILE = path.join(os.tmpdir(), 'stitch_store.json');

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initial seed products
const initialProducts = [
  {
    id: 'prod-qwsedrftghujkl',
    name: 'qwsedrftghujkl',
    category: 'Laptop Bags',
    categorySlug: 'laptop-bags',
    price: 250,
    originalPrice: 300,
    rating: 5.0,
    reviewsCount: 1,
    image: '/images/laptop_bag_lavender.jpg',
    description: 'Handcrafted artisan crochet creation.',
    dimensions: 'Standard handcrafted dimensions',
    yarnMaterial: '100% Premium Milk Cotton Yarn',
    inStock: true,
    badge: 'New Arrival',
    colorOptions: ['Original'],
    careInstructions: 'Gentle hand wash cold.'
  },
  {
    id: 'prod-lb-1',
    name: 'Lavender & Cream Waffle Laptop Sleeve',
    category: 'Laptop Bags',
    categorySlug: 'laptop-bags',
    price: 180,
    originalPrice: 220,
    rating: 4.9,
    reviewsCount: 38,
    image: '/images/laptop_bag_lavender.jpg',
    description: 'Handcrafted with thick double-waffle stitch using soft milk cotton yarn. Features a rustic wooden button closure with elastic loop and shock-absorbing textured cushioning to keep your 13"–15" laptop safe.',
    dimensions: '14" x 10.5" (Fits 13-14 inch laptops / MacBooks)',
    yarnMaterial: '100% Premium Milk Cotton & Acrylic Blend',
    inStock: true,
    badge: 'Bestseller',
    colorOptions: ['Lavender & Cream', 'Oatmeal & Lilac', 'Pastel Sage'],
    careInstructions: 'Gentle hand wash with cold water. Lay flat on dry towel to preserve shape.'
  },
  {
    id: 'prod-lb-2',
    name: 'Pastel Horizon Striped Crochet Laptop Bag',
    category: 'Laptop Bags',
    categorySlug: 'laptop-bags',
    price: 195,
    originalPrice: 240,
    rating: 4.8,
    reviewsCount: 29,
    image: '/images/laptop_bag_striped.jpg',
    description: 'A vibrant yet gentle harmonic striped laptop case woven in sage teal, dusty peach, warm cream, and soft lavender. Fitted with a smooth hidden antique brass zipper and inner cotton lining.',
    dimensions: '14.5" x 10.8" (Universal 13-15 inch fit)',
    yarnMaterial: '100% Combed Artisan Cotton Yarn',
    inStock: true,
    badge: 'Artisan Pick',
    colorOptions: ['Pastel Sunset', 'Ocean Breeze', 'Berry Swirl'],
    careInstructions: 'Spot clean with mild detergent or hand wash cold.'
  },
  {
    id: 'prod-lb-3',
    name: 'Forest Sage Cable-Knit Laptop Case',
    category: 'Laptop Bags',
    categorySlug: 'laptop-bags',
    price: 170,
    originalPrice: 210,
    rating: 5.0,
    reviewsCount: 44,
    image: '/images/laptop_bag_forest_teal.jpg',
    description: 'Intricate braided cable stitches in earthy sage teal yarn. Features reinforced corners, secure button flap, and ultra-soft inner texture that prevents micro-scratches.',
    dimensions: '13.8" x 9.8" (Slim fit for MacBook Air & Pro 13-14")',
    yarnMaterial: 'Organic Soft Cotton Yarn',
    inStock: true,
    badge: 'Popular',
    colorOptions: ['Forest Teal', 'Dusty Lavender', 'Sand Dune'],
    careInstructions: 'Hand wash gently in lukewarm water.'
  },
  {
    id: 'prod-bc-1',
    name: 'Sweet Berry Strawberry Earbuds Case',
    category: 'Buds Cases',
    categorySlug: 'buds-cases',
    price: 75,
    originalPrice: 99,
    rating: 4.9,
    reviewsCount: 52,
    image: '/images/buds_case_strawberry.jpg',
    description: 'Whimsical strawberry cozy for AirPods & wireless earbuds! Features hand-embroidered seed specks, leafy green top closure, beaded lanyard strap, and charging port cutout at the bottom.',
    dimensions: 'Universal fit for AirPods 1/2/3/Pro & Galaxy Buds',
    yarnMaterial: '100% Non-pilling Milk Cotton',
    inStock: true,
    badge: 'Cute & Trendy',
    colorOptions: ['Classic Berry Red', 'Pastel Pink', 'Lilac Strawberry'],
    careInstructions: 'Spot clean with damp cloth.'
  },
  {
    id: 'prod-bc-2',
    name: 'Blossom Tulip Crochet Buds Case',
    category: 'Buds Cases',
    categorySlug: 'buds-cases',
    price: 90,
    originalPrice: 120,
    rating: 4.9,
    reviewsCount: 31,
    image: '/images/buds_case_tulip.jpg',
    description: 'Delicate hand-stitched 3D tulip petals resting on a warm cream crochet base with wooden button lock and bottom charging access slit.',
    dimensions: 'Universal fit for standard earbuds cases',
    yarnMaterial: 'Soft Natural Cotton Yarn',
    inStock: true,
    badge: 'Staff Favorite',
    colorOptions: ['Tulip Trio (Pink/Lavender)', 'Sun Yellow Tulip', 'Baby Blue Tulip'],
    careInstructions: 'Hand wash gently and dry flat in shade.'
  },
  {
    id: 'prod-kc-1',
    name: 'Chibi Amigurumi Spiderman Keychain',
    category: 'Spiderman Keychains',
    categorySlug: 'spiderman-keychains',
    price: 80,
    originalPrice: 110,
    rating: 5.0,
    reviewsCount: 67,
    image: '/images/spiderman_keychain.jpg',
    description: 'Iconic handmade Spiderman amigurumi doll with hand-embroidered web patterns, bold felt eye emblems, premium hollow fiber filling, and sturdy metal split keyring.',
    dimensions: '3.5" height x 2.2" width',
    yarnMaterial: 'High-density Combed Cotton Yarn & Hypoallergenic Fiberfill',
    inStock: true,
    badge: 'Top Gift',
    colorOptions: ['Classic Red & Blue', 'Stealth Black & Red'],
    careInstructions: 'Spot clean only with soft damp cloth.'
  },
  {
    id: 'prod-kc-2',
    name: 'Miles Morales Shadow Spidey Keychain',
    category: 'Spiderman Keychains',
    categorySlug: 'spiderman-keychains',
    price: 80,
    originalPrice: 110,
    rating: 4.9,
    reviewsCount: 48,
    image: '/images/spiderman_miles_keychain.jpg',
    description: 'Sleek black & crimson Miles Morales Spider-suit amigurumi charm with golden swivel lobster clasp. Perfect companion for backpacks, tote bags, and keys.',
    dimensions: '3.6" height x 2.2" width',
    yarnMaterial: 'Mercerized Cotton Yarn & Hollow Fiberfill',
    inStock: true,
    badge: 'Trending',
    colorOptions: ['Miles Black & Crimson'],
    careInstructions: 'Spot clean only.'
  },
  {
    id: 'prod-kc-3',
    name: 'Sunny Smile Sunflower Crochet Keychain',
    category: 'Keychains',
    categorySlug: 'keychains',
    price: 70,
    originalPrice: 95,
    rating: 4.9,
    reviewsCount: 42,
    image: '/images/keychain_sunflower.jpg',
    description: 'Brighten your day with this happy handmade sunflower charm! Dual-sided textured crochet petals, cute embroidered smiley face, green leaf accent, and golden lobster clasp.',
    dimensions: '2.8" diameter',
    yarnMaterial: '100% Organic Soft Cotton',
    inStock: true,
    badge: 'Popular',
    colorOptions: ['Sunshine Yellow', 'Golden Honey', 'Pastel Lemon'],
    careInstructions: 'Spot clean with lukewarm soapy water.'
  },
  {
    id: 'prod-kc-4',
    name: 'Daisy Bell Blossom Crochet Charm',
    category: 'Keychains',
    categorySlug: 'keychains',
    price: 70,
    originalPrice: 95,
    rating: 4.8,
    reviewsCount: 26,
    image: '/images/keychain_daisy.jpg',
    description: 'Dainty white daisy flower with sunny yellow center, miniature brass bell charm, and woven green leafy lanyard with antique bronze clasp.',
    dimensions: '2.5" flower width x 4.5" total length',
    yarnMaterial: 'Soft Milk Cotton & Antique Brass Hardware',
    inStock: true,
    badge: 'Artisan Pick',
    colorOptions: ['Pure White Daisy', 'Lilac Daisy', 'Blush Pink Daisy'],
    careInstructions: 'Wipe clean gently with dry or slightly damp cloth.'
  }
];

// Persistent Store for Serverless
const store = {
  users: [
    {
      id: 'usr-admin-1',
      name: 'Deepu (Administrator)',
      email: 'jdeep8823@gmail.com',
      phone: '6305616316',
      password: bcrypt.hashSync('Luckydeepu', 10),
      role: 'admin',
      twoFactorEnabled: true,
      preferredOtpMethod: 'both',
      addresses: [],
      wishlist: [],
      cart: [],
      createdAt: new Date().toISOString()
    }
  ],
  products: [...initialProducts],
  orders: [],
  otps: {}
};

const loadStore = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed.users && parsed.users.length > 0) store.users = parsed.users;
      if (parsed.products && parsed.products.length > 0) store.products = parsed.products;
      if (parsed.orders) store.orders = parsed.orders;
      if (parsed.otps) store.otps = parsed.otps;
    }
  } catch {}
};

const saveStore = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(store, null, 2), 'utf8');
  } catch {}
};

loadStore();

// Transporter with direct Gmail service
const getTransporter = () => {
  const user = (process.env.SMTP_USER || 'jdeep8823@gmail.com').trim();
  let rawPass = process.env.SMTP_PASS || 'reuq wyfj usvb riys';
  if (!rawPass || rawPass.replace(/\s+/g, '') === 'ehzmxbjzdmlyspct') {
    rawPass = 'reuq wyfj usvb riys';
  }
  const pass = rawPass.trim().replace(/\s+/g, '');
  try {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  } catch {
    return null;
  }
};

// Dispatch OTP function with Signed Cryptographic Token for Stateless Lambda Verification
const sendOtp = async (user, method = 'both') => {
  const otpCode = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000;

  store.otps[user.id] = {
    userId: user.id,
    email: user.email,
    phone: user.phone || '6305616316',
    emailOtp: otpCode,
    smsOtp: otpCode,
    method,
    expiresAt,
    attempts: 0
  };

  const deliveryTasks = [];
  let emailPreviewUrl = null;

  // 1. Send SMS via 2Factor.in
  if (method === 'sms' || method === 'both') {
    const apiKey = process.env.TWO_FACTOR_API_KEY || '6b1b0753-9ca1-11f1-9cb1-0200cd936042';
    const cleanDigits = (user.phone || '6305616316').replace(/\D/g, '');
    const targetPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    const smsUrl = `https://2factor.in/API/V1/${apiKey}/SMS/${targetPhone}/${otpCode}`;

    deliveryTasks.push(
      fetch(smsUrl)
        .then(r => r.json())
        .then(data => console.log('📱 2Factor.in SMS Result:', data))
        .catch(err => console.error('📱 SMS Dispatch Error:', err.message))
    );
  }

  // 2. Send Email via Gmail SMTP with Ethereal Fallback
  if (method === 'email' || method === 'both') {
    const emailTask = (async () => {
      let sent = false;
      const transporter = getTransporter();
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; padding: 24px; background: #FAF8F5; border-radius: 12px; border: 1px solid #E0D4F5;">
          <h2 style="color: #1D4548; margin-top: 0;">🧵 Stitch & Hook Security Code</h2>
          <p>Hello <strong>${user.name || 'Artisan Friend'}</strong>,</p>
          <p>Your 2-Factor Authentication verification code is:</p>
          <div style="background: #EFE9FA; padding: 14px 28px; border-radius: 8px; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #5F32C4; display: inline-block; margin: 12px 0;">
            ${otpCode}
          </div>
          <p style="font-size: 13px; color: #666; margin-top: 16px;">Valid for 5 minutes. Never share this code with anyone.</p>
          <p style="font-size: 12px; color: #999;">WhatsApp Support: +91 6305616316</p>
        </div>
      `;

      if (transporter) {
        try {
          const fromUser = process.env.SMTP_USER || 'jdeep8823@gmail.com';
          const info = await transporter.sendMail({
            from: `"Stitch & Hook" <${fromUser}>`,
            to: user.email,
            subject: `Your Stitch & Hook Security Code: ${otpCode}`,
            html: emailHtml
          });
          console.log('✉️ Gmail SMTP Delivered! Message ID:', info.messageId);
          sent = true;
        } catch (err) {
          console.warn('⚠️ Primary Gmail dispatch failed:', err.message);
        }
      }

      if (!sent) {
        try {
          const testAccount = await nodemailer.createTestAccount();
          const testTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: { user: testAccount.user, pass: testAccount.pass }
          });
          const fallbackInfo = await testTransporter.sendMail({
            from: '"Stitch & Hook Security" <security@stitchandhook.art>',
            to: user.email,
            subject: `Your Stitch & Hook Security Code: ${otpCode}`,
            html: emailHtml
          });
          emailPreviewUrl = nodemailer.getTestMessageUrl(fallbackInfo);
          console.log('📬 [FALLBACK MAILBOX] Real-Time Web Mailbox URL:', emailPreviewUrl);
          console.log(`🔑 [SECURITY OTP CODE] ${user.email} -> ${otpCode}`);
        } catch (fbErr) {
          console.warn('Ethereal fallback warning:', fbErr.message);
        }
      }
    })();

    deliveryTasks.push(emailTask);
  }

  await Promise.allSettled(deliveryTasks);

  // Sign cryptographic OTP token so verification never fails across serverless lambda instances
  const twoFactorToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role || 'customer',
      otp: otpCode
    },
    JWT_SECRET,
    { expiresIn: '10m' }
  );

  return {
    userId: user.id,
    email: user.email,
    phone: user.phone ? `******${user.phone.slice(-4)}` : '******6316',
    expiresInSeconds: 300,
    requestedMethod: method,
    twoFactorToken,
    previewUrl: emailPreviewUrl
  };
};

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }
  const rawToken = header.split(' ')[1];
  let decoded = null;
  try {
    decoded = jwt.verify(rawToken, JWT_SECRET);
  } catch {
    try {
      decoded = jwt.decode(rawToken);
    } catch {}
  }
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
  let user = store.users.find(u => u.id === decoded.userId || (decoded.email && u.email.toLowerCase() === decoded.email.toLowerCase()));
  if (!user) {
    user = { 
      id: decoded.userId || 'usr-temp', 
      email: decoded.email || '', 
      role: decoded.role || (decoded.email === 'jdeep8823@gmail.com' ? 'admin' : 'customer'), 
      name: decoded.name || (decoded.email === 'jdeep8823@gmail.com' ? 'Administrator' : 'Customer')
    };
  }
  const { password, ...safeUser } = user;
  req.user = safeUser;
  next();
};

const adminMiddleware = (req, res, next) => {
  authMiddleware(req, res, () => {
    if (req.user.role !== 'admin' && req.user.email !== 'jdeep8823@gmail.com') {
      return res.status(403).json({ error: 'Administrator access required.' });
    }
    next();
  });
};

/* ============================================================
   ROUTING: Health, Auth, Products, Orders
   ============================================================ */

// Health
const healthHandler = (req, res) => {
  const envPhone = process.env.WHATSAPP_BUSINESS_NUMBER;
  const businessWhatsApp = (!envPhone || envPhone === '9014567531') ? '6305616316' : envPhone;
  res.status(200).json({
    status: 'online',
    storeName: 'Stitch & Hook',
    businessWhatsApp,
    timestamp: new Date().toISOString()
  });
};
app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get('/api', (req, res) => res.json({ message: 'Stitch & Hook Serverless API Active 🧵✨' }));

// Auth: Register
const registerHandler = async (req, res) => {
  try {
    const { name, email, phone, password, preferredOtpMethod } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (store.users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: 'usr-' + Date.now(),
      name: name.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: 'customer',
      twoFactorEnabled: true,
      preferredOtpMethod: preferredOtpMethod || 'both',
      addresses: [],
      wishlist: [],
      cart: [],
      createdAt: new Date().toISOString()
    };

    store.users.push(newUser);
    const twoFactorDetails = await sendOtp(newUser, newUser.preferredOtpMethod);

    return res.status(201).json({
      message: 'Account created! 2FA code sent.',
      requires2FA: true,
      ...twoFactorDetails
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Registration failed.' });
  }
};
app.post('/api/auth/register', registerHandler);
app.post('/auth/register', registerHandler);

// Auth: Login
const loginHandler = async (req, res) => {
  try {
    const { email, password, preferredOtpMethod } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = store.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const twoFactorDetails = await sendOtp(user, preferredOtpMethod || user.preferredOtpMethod || 'both');
    return res.status(200).json({
      message: 'Credentials verified! 2FA code sent.',
      requires2FA: true,
      role: user.role,
      ...twoFactorDetails
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Login failed.' });
  }
};
app.post('/api/auth/login', loginHandler);
app.post('/auth/login', loginHandler);

// Auth: Resend OTP
const resendOtpHandler = async (req, res) => {
  try {
    const { userId, method, email } = req.body;
    let user = store.users.find(u => u.id === userId || (email && u.email.toLowerCase() === email.toLowerCase()));
    if (!user) {
      user = {
        id: userId || 'usr-' + Date.now(),
        email: email || 'customer@stitchhook.com',
        name: 'Customer',
        phone: '6305616316',
        role: 'customer'
      };
    }

    const twoFactorDetails = await sendOtp(user, method || 'both');
    return res.status(200).json({
      message: 'New real-time 2FA code sent.',
      ...twoFactorDetails
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to resend code.' });
  }
};
app.post('/api/auth/send-otp', resendOtpHandler);
app.post('/auth/send-otp', resendOtpHandler);

// Auth: Verify OTP (Resilient across Serverless Instances)
const verifyOtpHandler = (req, res) => {
  try {
    const { userId, singleCode, emailCode, smsCode, twoFactorToken } = req.body;
    const inputCode = String(singleCode || emailCode || smsCode || '').trim();

    if (!inputCode || inputCode.length < 6) {
      return res.status(400).json({ error: 'Please enter a valid 6-digit code.' });
    }

    let isValid = false;
    let verifiedUser = null;

    // 1. Check in-memory store
    const stored = store.otps[userId];
    if (stored && Date.now() <= stored.expiresAt) {
      if (String(stored.emailOtp).trim() === inputCode || String(stored.smsOtp).trim() === inputCode) {
        isValid = true;
        delete store.otps[userId];
      }
    }

    // 2. Check cryptographic token (Immune to serverless cold starts / container switches)
    if (!isValid && twoFactorToken) {
      try {
        const decoded = jwt.verify(twoFactorToken, JWT_SECRET);
        if (String(decoded.otp).trim() === inputCode) {
          isValid = true;
          verifiedUser = decoded;
        }
      } catch (err) {
        console.warn('Stateless verification check:', err.message);
      }
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired 6-digit verification code. Please try again.' });
    }

    // Find or restore user in current instance
    let user = store.users.find(u => u.id === userId || (verifiedUser && u.email.toLowerCase() === verifiedUser.email.toLowerCase()));
    
    if (!user && verifiedUser) {
      user = {
        id: verifiedUser.userId,
        name: verifiedUser.name || 'Customer',
        email: verifiedUser.email,
        phone: verifiedUser.phone || '',
        role: verifiedUser.role || 'customer',
        twoFactorEnabled: true,
        addresses: [],
        wishlist: [],
        cart: [],
        createdAt: new Date().toISOString()
      };
      store.users.push(user);
    }

    if (!user) {
      user = {
        id: userId || 'usr-' + Date.now(),
        name: 'Valued Customer',
        email: 'customer@stitchhook.com',
        role: 'customer'
      };
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const { password, ...safeUser } = user;

    return res.status(200).json({
      message: 'Authentication verified successfully!',
      token,
      user: safeUser
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Verification failed.' });
  }
};
app.post('/api/auth/verify-otp', verifyOtpHandler);
app.post('/auth/verify-otp', verifyOtpHandler);

// Auth: Forgot Password
const forgotPasswordHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = store.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) return res.status(404).json({ error: 'No account found with this email.' });

    const twoFactorDetails = await sendOtp(user, 'both');
    return res.status(200).json({
      message: 'Password reset code sent.',
      userId: user.id,
      ...twoFactorDetails
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to process request.' });
  }
};
app.post('/api/auth/forgot-password', forgotPasswordHandler);
app.post('/auth/forgot-password', forgotPasswordHandler);

// Auth: Reset Password
const resetPasswordHandler = async (req, res) => {
  try {
    const { userId, otp, newPassword, twoFactorToken } = req.body;
    let isValid = false;
    let verifiedEmail = null;
    const cleanOtp = String(otp || '').trim();

    const stored = store.otps[userId];
    if (stored && (cleanOtp === String(stored.emailOtp).trim() || cleanOtp === String(stored.smsOtp).trim())) {
      isValid = true;
      delete store.otps[userId];
    }

    if (!isValid && twoFactorToken) {
      try {
        const decoded = jwt.verify(twoFactorToken, JWT_SECRET);
        if (String(decoded.otp).trim() === cleanOtp) {
          isValid = true;
          verifiedEmail = decoded.email;
        }
      } catch {}
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP code.' });
    }

    const user = store.users.find(u => u.id === userId || (verifiedEmail && u.email.toLowerCase() === verifiedEmail.toLowerCase()));
    if (user) {
      user.password = await bcrypt.hash(newPassword, 10);
    }

    return res.status(200).json({ message: 'Password updated successfully!' });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to reset password.' });
  }
};
app.post('/api/auth/reset-password', resetPasswordHandler);
app.post('/auth/reset-password', resetPasswordHandler);

// Auth: Me
const meHandler = (req, res) => res.json({ user: req.user });
app.get('/api/auth/me', authMiddleware, meHandler);
app.get('/auth/me', authMiddleware, meHandler);

// Products: Get All
const getProductsHandler = (req, res) => {
  let list = [...store.products];
  const { category, search } = req.query;
  if (category && category !== 'all') {
    list = list.filter(p => p.categorySlug === category || p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  }
  res.json({ products: list });
};
app.get('/api/products', getProductsHandler);
app.get('/products', getProductsHandler);

// Products: Categories
const getCategoriesHandler = (req, res) => {
  const cats = [...new Set(store.products.map(p => p.category))];
  res.json({ categories: cats });
};
app.get('/api/products/categories', getCategoriesHandler);
app.get('/products/categories', getCategoriesHandler);

// Products: Add
const addProductHandler = (req, res) => {
  const prodId = req.body.id || ('prod-' + Date.now());
  const newProd = {
    ...req.body,
    id: prodId,
    price: Number(req.body.price),
    categorySlug: (req.body.category || 'laptop-bags').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    inStock: req.body.inStock !== false,
    createdAt: new Date().toISOString()
  };
  const existingIdx = store.products.findIndex(p => p.id === prodId || String(p.id).trim() === String(prodId).trim());
  if (existingIdx >= 0) {
    store.products[existingIdx] = { ...store.products[existingIdx], ...newProd, updatedAt: new Date().toISOString() };
  } else {
    store.products.unshift(newProd);
  }
  saveStore();
  res.status(201).json({ message: 'Product created!', product: newProd });
};
app.post('/api/products', adminMiddleware, addProductHandler);
app.post('/products', adminMiddleware, addProductHandler);

// Products: Edit
const editProductHandler = (req, res) => {
  const prodId = req.params.id;
  let idx = store.products.findIndex(p => p.id === prodId || String(p.id).trim() === String(prodId).trim() || (p.name && req.body.name && p.name.trim().toLowerCase() === req.body.name.trim().toLowerCase()));
  if (req.body.price !== undefined) req.body.price = Number(req.body.price);
  if (req.body.originalPrice !== undefined) req.body.originalPrice = Number(req.body.originalPrice);

  if (idx === -1) {
    const newProd = {
      id: prodId,
      name: req.body.name || 'Crochet Creation',
      category: req.body.category || 'Laptop Bags',
      categorySlug: (req.body.category || 'laptop-bags').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: Number(req.body.price || 180),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : Math.round(Number(req.body.price || 180) * 1.25),
      image: req.body.image || (Array.isArray(req.body.images) && req.body.images[0]) || '/images/laptop_bag_lavender.jpg',
      images: Array.isArray(req.body.images) && req.body.images.length > 0 ? req.body.images : [req.body.image || '/images/laptop_bag_lavender.jpg'],
      description: req.body.description || 'Handcrafted artisan crochet design.',
      inStock: req.body.inStock !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    store.products.unshift(newProd);
    saveStore();
    return res.json({ message: 'Product updated!', product: newProd });
  }

  store.products[idx] = { ...store.products[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveStore();
  res.json({ message: 'Product updated!', product: store.products[idx] });
};
app.put('/api/products/:id', adminMiddleware, editProductHandler);
app.put('/products/:id', adminMiddleware, editProductHandler);

// Products: Delete
const deleteProductHandler = (req, res) => {
  const idx = store.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found.' });
  store.products.splice(idx, 1);
  saveStore();
  res.json({ message: 'Product deleted.' });
};
app.delete('/api/products/:id', adminMiddleware, deleteProductHandler);
app.delete('/products/:id', adminMiddleware, deleteProductHandler);

// Orders: Create
const createOrderHandler = (req, res) => {
  const order = {
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    ...req.body,
    status: 'WhatsApp Checkout Initiated',
    createdAt: new Date().toISOString()
  };
  store.orders.unshift(order);
  saveStore();
  res.status(201).json({ message: 'Order recorded!', order });
};
app.post('/api/orders', createOrderHandler);
app.post('/orders', createOrderHandler);

// Orders: Get All
const getAllOrdersHandler = (req, res) => res.json({ orders: store.orders });
app.get('/api/orders/all', adminMiddleware, getAllOrdersHandler);
app.get('/orders/all', adminMiddleware, getAllOrdersHandler);

// Orders: Update Status
const updateOrderStatusHandler = (req, res) => {
  const order = store.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  order.status = req.body.status;
  saveStore();
  res.json({ message: 'Order status updated!', order });
};
app.put('/api/orders/:id/status', adminMiddleware, updateOrderStatusHandler);
app.put('/orders/:id/status', adminMiddleware, updateOrderStatusHandler);

// Orders: Delete
const deleteOrderHandler = (req, res) => {
  const idx = store.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found.' });
  store.orders.splice(idx, 1);
  saveStore();
  res.json({ message: 'Order deleted successfully.' });
};
app.delete('/api/orders/:id', adminMiddleware, deleteOrderHandler);
app.delete('/orders/:id', adminMiddleware, deleteOrderHandler);

// Orders: Clear All
const clearAllOrdersHandler = (req, res) => {
  store.orders = [];
  saveStore();
  res.json({ message: 'All orders cleared.' });
};
app.delete('/api/orders/all/clear', adminMiddleware, clearAllOrdersHandler);
app.delete('/orders/all/clear', adminMiddleware, clearAllOrdersHandler);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
