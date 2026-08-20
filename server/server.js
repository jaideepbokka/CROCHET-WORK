import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from server/.env or root .env
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    storeName: 'Stitch & Hook',
    businessWhatsApp: process.env.WHATSAPP_BUSINESS_NUMBER || '9014567531',
    smsProvider: process.env.SMS_PROVIDER || '2factor',
    twoFactorKeyConfigured: Boolean(process.env.TWO_FACTOR_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🧵 ✨ ==============================================`);
  console.log(`✨ Stitch & Hook Backend Server running on http://localhost:${PORT}`);
  console.log(`📱 WhatsApp Direct Ordering: +91 ${process.env.WHATSAPP_BUSINESS_NUMBER || '9014567531'}`);
  console.log(`🔑 2Factor.in SMS Gateway: ${process.env.TWO_FACTOR_API_KEY ? 'Active (' + process.env.TWO_FACTOR_API_KEY.slice(0, 8) + '...)' : 'Not Configured'}`);
  console.log(`✉️ SMTP Email Gateway: ${process.env.SMTP_USER || 'Not Configured'}`);
  console.log(`🧵 ==============================================\n`);
});
