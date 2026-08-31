import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import mysql from 'mysql2/promise';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import app from './server.js';
import { db } from './services/db.js';

function request(pathName, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: pathName,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: raw ? JSON.parse(raw) : null });
        } catch {
          resolve({ status: res.statusCode, raw });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runPersistenceVerification() {
  console.log('\n===============================================================');
  console.log('🧪 VERIFYING PERMANENT PRODUCT EDIT PERSISTENCE');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;
  function assert(cond, msg) {
    if (cond) {
      console.log(`✅ [PASS] ${msg}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${msg}`);
      failed++;
    }
  }

  // Wait 500ms for server to be fully ready
  await new Promise(r => setTimeout(r, 500));
  await db.initDatabaseSync();

  try {
    // 1. Admin login & OTP verification
    console.log('1️⃣ Admin Authentication...');
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'jdeep8823@gmail.com',
      password: 'Luckydeepu'
    });
    assert(loginRes.status === 200 && loginRes.data?.requires2FA, 'Admin login credentials accepted');

    const otpData = db.getOtp(loginRes.data.userId);
    assert(otpData && otpData.emailOtp, '2FA OTP retrieved for verification');

    const verifyRes = await request('/api/auth/verify-otp', 'POST', {
      userId: loginRes.data.userId,
      singleCode: otpData.emailOtp
    });
    assert(verifyRes.status === 200 && verifyRes.data?.token, 'Admin authenticated and JWT token received');
    const adminToken = verifyRes.data.token;

    // 2. Fetch original product details
    console.log('\n2️⃣ Testing Product Editing with Full Details...');
    const targetProdId = 'prod-lb-1';
    const originalProd = db.getProductById(targetProdId);
    assert(originalProd && originalProd.id === targetProdId, `Target product "${targetProdId}" exists in database`);

    // 3. Edit product via PUT /api/products/:id
    const updatedPayload = {
      name: 'Lavender & Cream Waffle Sleeve (Artisan Edition)',
      category: 'Laptop Bags',
      price: 185,
      originalPrice: 240,
      description: 'Updated artisan waffle stitch with custom wooden accents.',
      dimensions: '14.2" x 10.6" (Universal fit)',
      yarnMaterial: '100% Organic Milk Cotton',
      badge: 'Artisan Masterpiece',
      colorOptions: ['Lavender & Cream', 'Pastel Sage', 'Lilac Frost'],
      inStock: true
    };

    const updateRes = await request(`/api/products/${targetProdId}`, 'PUT', updatedPayload, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(updateRes.status === 200, `PUT /api/products/${targetProdId} returned 200 OK`);
    assert(updateRes.data?.product?.name === updatedPayload.name, 'API returned updated product name');
    assert(updateRes.data?.product?.price === 185, 'API returned updated product price (₹185)');

    // 4. Verify via GET /api/products/:id and GET /api/products
    console.log('\n3️⃣ Verifying API GET Reflection...');
    const getRes = await request(`/api/products/${targetProdId}`, 'GET');
    assert(getRes.status === 200 && getRes.data?.product?.price === 185, 'GET /api/products/:id returned updated price (₹185)');
    assert(getRes.data?.product?.name === updatedPayload.name, 'GET /api/products/:id returned updated title');

    // 5. Verify direct persistence in server/data/store.json
    console.log('\n4️⃣ Verifying JSON File Persistence on Disk...');
    const storeJsonPath = path.join(__dirname, 'data', 'store.json');
    assert(fs.existsSync(storeJsonPath), 'store.json file exists on disk');
    const storeJsonContent = JSON.parse(fs.readFileSync(storeJsonPath, 'utf8'));
    const savedInFile = storeJsonContent.products.find(p => p.id === targetProdId);
    assert(savedInFile && savedInFile.price === 185, 'store.json contains updated product price (₹185)');
    assert(savedInFile && savedInFile.name === updatedPayload.name, 'store.json contains updated product name');

    // 6. Verify direct persistence in MySQL database
    console.log('\n5️⃣ Verifying MySQL Table Persistence...');
    const host = process.env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.MYSQL_PORT) || 3306;
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'stitch_hook';

    const conn = await mysql.createConnection({ host, port, user, password, database });
    const [dbRows] = await conn.query('SELECT * FROM products WHERE id = ?', [targetProdId]);
    assert(dbRows.length === 1, 'MySQL query returned exactly 1 product matching ID');
    assert(Number(dbRows[0].price) === 185, `MySQL product price is ₹${dbRows[0].price} (Matches ₹185)`);
    assert(dbRows[0].name === updatedPayload.name, `MySQL product name is "${dbRows[0].name}"`);
    assert(dbRows[0].badge === 'Artisan Masterpiece', `MySQL badge is "${dbRows[0].badge}"`);
    await conn.end();

    // 7. Test Quick Price Update
    console.log('\n6️⃣ Testing Quick Price Update (₹180)...');
    const quickPriceRes = await request(`/api/products/${targetProdId}`, 'PUT', { price: 180 }, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(quickPriceRes.status === 200 && quickPriceRes.data?.product?.price === 180, 'Quick price update returned price: ₹180');

    const conn2 = await mysql.createConnection({ host, port, user, password, database });
    const [dbRows2] = await conn2.query('SELECT price FROM products WHERE id = ?', [targetProdId]);
    assert(Number(dbRows2[0].price) === 180, 'MySQL product price updated to ₹180');
    await conn2.end();

    const storeJsonContent2 = JSON.parse(fs.readFileSync(storeJsonPath, 'utf8'));
    const savedInFile2 = storeJsonContent2.products.find(p => p.id === targetProdId);
    assert(savedInFile2.price === 180, 'store.json product price updated to ₹180');

    // 8. Restore original name
    await request(`/api/products/${targetProdId}`, 'PUT', {
      name: 'Lavender & Cream Waffle Laptop Sleeve',
      badge: 'Bestseller'
    }, {
      'Authorization': `Bearer ${adminToken}`
    });

  } catch (err) {
    console.error('Test error:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`🎉 PERSISTENCE VERIFICATION: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runPersistenceVerification();
