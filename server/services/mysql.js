import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
} catch {}

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

let pool = null;
let isConnected = false;

const toMySQLDateTime = (d) => {
  if (!d) return null;
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return null;
  return dateObj.toISOString().slice(0, 19).replace('T', ' ');
};

export const initMySQL = async () => {
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.MYSQL_PORT) || 3306;
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'stitch_hook';

  // In Vercel serverless, skip localhost connection attempts to avoid container timeout
  if (isServerless && (host === 'localhost' || host === '127.0.0.1')) {
    return false;
  }

  try {
    // 1. Connect to MySQL server to ensure DB exists
    const rootConn = await mysql.createConnection({ host, port, user, password, connectTimeout: 3000 });
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await rootConn.end();

    // 2. Create Pool connected to stitch_hook DB
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 5,
      connectTimeout: 3000,
      queueLimit: 0
    });

    // 3. Create tables if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE,
        phone VARCHAR(50),
        password VARCHAR(255),
        role VARCHAR(50) DEFAULT 'customer',
        twoFactorEnabled BOOLEAN DEFAULT TRUE,
        preferredOtpMethod VARCHAR(50) DEFAULT 'both',
        addresses JSON,
        wishlist JSON,
        cart JSON,
        createdAt DATETIME,
        updatedAt DATETIME
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        category VARCHAR(255),
        categorySlug VARCHAR(255),
        price INT,
        originalPrice INT,
        rating DECIMAL(2,1) DEFAULT 5.0,
        reviewsCount INT DEFAULT 1,
        image VARCHAR(500),
        description TEXT,
        dimensions VARCHAR(255),
        yarnMaterial VARCHAR(255),
        inStock BOOLEAN DEFAULT TRUE,
        badge VARCHAR(255),
        colorOptions JSON,
        careInstructions TEXT,
        createdAt DATETIME,
        updatedAt DATETIME
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255),
        customerName VARCHAR(255),
        customerPhone VARCHAR(50),
        customerEmail VARCHAR(255),
        shippingAddress JSON,
        items JSON,
        subtotal INT,
        shippingFee INT DEFAULT 0,
        totalAmount INT,
        whatsappNumber VARCHAR(50),
        status VARCHAR(100) DEFAULT 'WhatsApp Checkout Initiated',
        createdAt DATETIME,
        updatedAt DATETIME
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS otps (
        targetKey VARCHAR(255) PRIMARY KEY,
        emailOtp VARCHAR(10),
        smsOtp VARCHAR(10),
        method VARCHAR(50),
        expiresAt BIGINT,
        attempts INT DEFAULT 0,
        createdAt BIGINT
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    isConnected = true;
    console.log(`🐬 [MYSQL SUCCESS] Connected to MySQL database "${database}" on ${host}:${port}!`);

    // Schema upgrades: Ensure LONGTEXT image and JSON images columns exist
    try { await pool.query('ALTER TABLE products MODIFY COLUMN image LONGTEXT'); } catch {}
    try { await pool.query('ALTER TABLE products ADD COLUMN images JSON'); } catch {}

    // Seed Admin User
    const adminEmail = 'jdeep8823@gmail.com';
    const [existingAdmin] = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [adminEmail]);
    const hashedAdminPass = bcrypt.hashSync('Luckydeepu', 10);

    if (existingAdmin.length === 0) {
      await pool.query(
        `INSERT INTO users (id, name, email, phone, password, role, twoFactorEnabled, preferredOtpMethod, addresses, wishlist, cart, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'usr-admin-1',
          'Deepu (Administrator)',
          adminEmail,
          '6305616316',
          hashedAdminPass,
          'admin',
          1,
          'both',
          JSON.stringify([{
            id: 'addr-admin-1',
            isDefault: true,
            fullName: 'Deepu (Stitch & Hook)',
            phone: '6305616316',
            street: 'Stitch & Hook Artisan Studio, Main Road',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500001'
          }]),
          JSON.stringify([]),
          JSON.stringify([])
        ]
      );
    }

    return true;
  } catch (err) {
    console.warn('⚠️ [MYSQL WARNING] Could not connect to MySQL database:', err.message);
    isConnected = false;
    return false;
  }
};

export const getMySQLPool = () => pool;
export const isMySQLConnected = () => isConnected;

/* ============================================================
   PRODUCT MYSQL CRUD OPERATIONS
   ============================================================ */

export const getMySQLProducts = async () => {
  if (!pool || !isConnected) return null;
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY createdAt DESC');
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      categorySlug: r.categorySlug,
      price: Number(r.price),
      originalPrice: r.originalPrice ? Number(r.originalPrice) : Math.round(Number(r.price) * 1.25),
      rating: r.rating ? Number(r.rating) : 5.0,
      reviewsCount: r.reviewsCount ? Number(r.reviewsCount) : 1,
      image: r.image || '/images/laptop_bag_lavender.jpg',
      images: typeof r.images === 'string' ? JSON.parse(r.images || '[]') : (r.images || (r.image ? [r.image] : [])),
      description: r.description || '',
      dimensions: r.dimensions || '',
      yarnMaterial: r.yarnMaterial || '',
      inStock: Boolean(r.inStock),
      badge: r.badge || '',
      colorOptions: typeof r.colorOptions === 'string' ? JSON.parse(r.colorOptions || '[]') : (r.colorOptions || []),
      careInstructions: r.careInstructions || '',
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined
    }));
  } catch (err) {
    console.error('getMySQLProducts error:', err.message);
    return null;
  }
};

export const upsertMySQLProduct = async (product) => {
  if (!pool || !isConnected || !product) return false;
  try {
    const primaryImg = product.image || (Array.isArray(product.images) && product.images[0]) || '/images/laptop_bag_lavender.jpg';
    const imagesList = Array.isArray(product.images) && product.images.length > 0 ? product.images : [primaryImg];
    const imagesJson = JSON.stringify(imagesList);

    const sql = `
      INSERT INTO products (
        id, name, category, categorySlug, price, originalPrice, rating, reviewsCount,
        image, images, description, dimensions, yarnMaterial, inStock, badge, colorOptions,
        careInstructions, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        category = VALUES(category),
        categorySlug = VALUES(categorySlug),
        price = VALUES(price),
        originalPrice = VALUES(originalPrice),
        rating = VALUES(rating),
        reviewsCount = VALUES(reviewsCount),
        image = VALUES(image),
        images = VALUES(images),
        description = VALUES(description),
        dimensions = VALUES(dimensions),
        yarnMaterial = VALUES(yarnMaterial),
        inStock = VALUES(inStock),
        badge = VALUES(badge),
        colorOptions = VALUES(colorOptions),
        careInstructions = VALUES(careInstructions),
        updatedAt = VALUES(updatedAt)
    `;

    const colorJson = Array.isArray(product.colorOptions)
      ? JSON.stringify(product.colorOptions)
      : (typeof product.colorOptions === 'string' ? JSON.stringify(product.colorOptions.split(',').map(s => s.trim())) : JSON.stringify(['Original']));

    await pool.query(sql, [
      product.id,
      product.name || 'Handmade Crochet',
      product.category || 'Crochet Creation',
      product.categorySlug || (product.category || 'crochet').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      Number(product.price || 0),
      product.originalPrice ? Number(product.originalPrice) : Math.round(Number(product.price || 0) * 1.25),
      Number(product.rating || 5.0),
      Number(product.reviewsCount || 1),
      primaryImg,
      imagesJson,
      product.description || '',
      product.dimensions || '',
      product.yarnMaterial || '',
      product.inStock !== false ? 1 : 0,
      product.badge || '',
      colorJson,
      product.careInstructions || '',
      toMySQLDateTime(product.createdAt || new Date()),
      toMySQLDateTime(new Date())
    ]);
    return true;
  } catch (err) {
    console.error('upsertMySQLProduct error:', err.message);
    return false;
  }
};

export const seedMySQLProducts = async (productsList) => {
  if (!pool || !isConnected || !productsList || productsList.length === 0) return false;
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count === 0) {
      console.log(`📦 [MYSQL SEED] Seeding ${productsList.length} products into MySQL database...`);
      for (const prod of productsList) {
        await upsertMySQLProduct(prod);
      }
      console.log(`✅ [MYSQL SEED] Successfully seeded products into MySQL!`);
      return true;
    }
    return false;
  } catch (err) {
    console.error('seedMySQLProducts error:', err.message);
    return false;
  }
};

export const deleteMySQLProduct = async (id) => {
  if (!pool || !isConnected || !id) return false;
  try {
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return true;
  } catch (err) {
    console.error('deleteMySQLProduct error:', err.message);
    return false;
  }
};

/* ============================================================
   USER MYSQL CRUD OPERATIONS
   ============================================================ */

export const getMySQLUsers = async () => {
  if (!pool || !isConnected) return null;
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      password: r.password,
      role: r.role,
      twoFactorEnabled: Boolean(r.twoFactorEnabled),
      preferredOtpMethod: r.preferredOtpMethod || 'both',
      addresses: typeof r.addresses === 'string' ? JSON.parse(r.addresses || '[]') : (r.addresses || []),
      wishlist: typeof r.wishlist === 'string' ? JSON.parse(r.wishlist || '[]') : (r.wishlist || []),
      cart: typeof r.cart === 'string' ? JSON.parse(r.cart || '[]') : (r.cart || []),
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined
    }));
  } catch (err) {
    console.error('getMySQLUsers error:', err.message);
    return null;
  }
};

export const upsertMySQLUser = async (user) => {
  if (!pool || !isConnected || !user) return false;
  try {
    const sql = `
      INSERT INTO users (
        id, name, email, phone, password, role, twoFactorEnabled, preferredOtpMethod,
        addresses, wishlist, cart, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        phone = VALUES(phone),
        password = VALUES(password),
        role = VALUES(role),
        twoFactorEnabled = VALUES(twoFactorEnabled),
        preferredOtpMethod = VALUES(preferredOtpMethod),
        addresses = VALUES(addresses),
        wishlist = VALUES(wishlist),
        cart = VALUES(cart),
        updatedAt = VALUES(updatedAt)
    `;

    await pool.query(sql, [
      user.id,
      user.name || '',
      (user.email || '').toLowerCase(),
      user.phone || '',
      user.password,
      user.role || 'customer',
      user.twoFactorEnabled !== false ? 1 : 0,
      user.preferredOtpMethod || 'both',
      JSON.stringify(user.addresses || []),
      JSON.stringify(user.wishlist || []),
      JSON.stringify(user.cart || []),
      toMySQLDateTime(user.createdAt || new Date()),
      toMySQLDateTime(new Date())
    ]);
    return true;
  } catch (err) {
    console.error('upsertMySQLUser error:', err.message);
    return false;
  }
};

/* ============================================================
   ORDER MYSQL CRUD OPERATIONS
   ============================================================ */

export const getMySQLOrders = async () => {
  if (!pool || !isConnected) return null;
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY createdAt DESC');
    return rows.map(r => ({
      id: r.id,
      userId: r.userId,
      customerName: r.customerName,
      customerPhone: r.customerPhone,
      customerEmail: r.customerEmail,
      shippingAddress: typeof r.shippingAddress === 'string' ? JSON.parse(r.shippingAddress || 'null') : r.shippingAddress,
      items: typeof r.items === 'string' ? JSON.parse(r.items || '[]') : (r.items || []),
      subtotal: Number(r.subtotal || 0),
      shippingFee: Number(r.shippingFee || 0),
      totalAmount: Number(r.totalAmount || 0),
      whatsappNumber: r.whatsappNumber || '6305616316',
      status: r.status || 'WhatsApp Checkout Initiated',
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: r.updatedAt ? new Date(r.updatedAt).toISOString() : undefined
    }));
  } catch (err) {
    console.error('getMySQLOrders error:', err.message);
    return null;
  }
};

export const upsertMySQLOrder = async (order) => {
  if (!pool || !isConnected || !order) return false;
  try {
    const sql = `
      INSERT INTO orders (
        id, userId, customerName, customerPhone, customerEmail, shippingAddress,
        items, subtotal, shippingFee, totalAmount, whatsappNumber, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        updatedAt = VALUES(updatedAt)
    `;

    await pool.query(sql, [
      order.id,
      order.userId || null,
      order.customerName || 'Customer',
      order.customerPhone || '',
      order.customerEmail || '',
      JSON.stringify(order.shippingAddress || null),
      JSON.stringify(order.items || []),
      Number(order.subtotal || order.totalAmount || 0),
      Number(order.shippingFee || 0),
      Number(order.totalAmount || 0),
      order.whatsappNumber || '6305616316',
      order.status || 'WhatsApp Checkout Initiated',
      toMySQLDateTime(order.createdAt || new Date()),
      toMySQLDateTime(new Date())
    ]);
    return true;
  } catch (err) {
    console.error('upsertMySQLOrder error:', err.message);
    return false;
  }
};

export const deleteMySQLOrder = async (orderId) => {
  if (!pool || !isConnected || !orderId) return false;
  try {
    await pool.query('DELETE FROM orders WHERE id = ?', [orderId]);
    return true;
  } catch (err) {
    console.error('deleteMySQLOrder error:', err.message);
    return false;
  }
};

export const clearMySQLOrders = async () => {
  if (!pool || !isConnected) return false;
  try {
    await pool.query('DELETE FROM orders');
    return true;
  } catch (err) {
    console.error('clearMySQLOrders error:', err.message);
    return false;
  }
};

/* ============================================================
   OTP MYSQL OPERATIONS
   ============================================================ */

export const saveMySQLOtp = async (targetKey, otpData) => {
  if (!pool || !isConnected || !targetKey) return false;
  try {
    const sql = `
      INSERT INTO otps (targetKey, emailOtp, smsOtp, method, expiresAt, attempts, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        emailOtp = VALUES(emailOtp),
        smsOtp = VALUES(smsOtp),
        method = VALUES(method),
        expiresAt = VALUES(expiresAt),
        attempts = VALUES(attempts),
        createdAt = VALUES(createdAt)
    `;
    await pool.query(sql, [
      targetKey,
      otpData.emailOtp || '',
      otpData.smsOtp || '',
      otpData.method || 'both',
      otpData.expiresAt || 0,
      otpData.attempts || 0,
      Date.now()
    ]);
    return true;
  } catch (err) {
    console.error('saveMySQLOtp error:', err.message);
    return false;
  }
};

export const getMySQLOtp = async (targetKey) => {
  if (!pool || !isConnected || !targetKey) return null;
  try {
    const [rows] = await pool.query('SELECT * FROM otps WHERE targetKey = ?', [targetKey]);
    return rows[0] || null;
  } catch (err) {
    console.error('getMySQLOtp error:', err.message);
    return null;
  }
};

export const deleteMySQLOtp = async (targetKey) => {
  if (!pool || !isConnected || !targetKey) return false;
  try {
    await pool.query('DELETE FROM otps WHERE targetKey = ?', [targetKey]);
    return true;
  } catch (err) {
    console.error('deleteMySQLOtp error:', err.message);
    return false;
  }
};
