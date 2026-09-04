import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  dotenv.config({ path: path.join(__dirname, '.env') });
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
} catch {}

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Dual routing prefix support for local and serverless rewrites
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/products', productRoutes);
app.use('/products', productRoutes);

app.use('/api/orders', orderRoutes);
app.use('/orders', orderRoutes);

// Health check endpoint
const handleHealth = (req, res) => {
  res.status(200).json({
    status: 'online',
    storeName: 'Stitch & Hook',
    businessWhatsApp: process.env.WHATSAPP_BUSINESS_NUMBER || '6305616316',
    smsProvider: process.env.SMS_PROVIDER || '2factor',
    twoFactorKeyConfigured: Boolean(process.env.TWO_FACTOR_API_KEY),
    timestamp: new Date().toISOString()
  });
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);
app.get('/api', (req, res) => res.json({ message: 'Stitch & Hook Serverless Gateway Active 🧵✨' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Start Server when running locally (not in serverless export)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🧵 ✨ ==============================================`);
    console.log(`✨ Stitch & Hook Backend Server running on http://localhost:${PORT}`);
    console.log(`📱 WhatsApp Direct Ordering: +91 ${process.env.WHATSAPP_BUSINESS_NUMBER || '6305616316'}`);
    console.log(`🔑 2Factor.in SMS Gateway: ${process.env.TWO_FACTOR_API_KEY ? 'Active (' + process.env.TWO_FACTOR_API_KEY.slice(0, 8) + '...)' : 'Not Configured'}`);
    console.log(`✉️ SMTP Email Gateway: ${process.env.SMTP_USER || 'Not Configured'}`);
    console.log(`🧵 ==============================================\n`);
  });
}

export default app;
