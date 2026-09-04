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

async function runTest() {
  console.log('\n===============================================================');
  console.log('🧪 TESTING DELETE PERMANENCE & ITEM VISIBILITY FIXES');
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

  // Ensure DB sync is initialized
  await db.initDatabaseSync();

  try {
    // 1. Check GET /api/products for "Keychain Of Love" & "qwsedrftghujkl"
    console.log('1️⃣ Checking Catalog Items in API...');
    const allProductsRes = await request('/api/products', 'GET');
    assert(allProductsRes.status === 200, 'GET /api/products returns 200 OK');
    const products = allProductsRes.data?.products || [];

    const loveKeychain = products.find(p => p.id === 'prod-kc-love' || p.name === 'Keychain Of Love');
    assert(loveKeychain && loveKeychain.price === 80, `Keychain Of Love found with price ₹80 (got ₹${loveKeychain?.price})`);

    const qwsProduct = products.find(p => p.id === 'prod-1788500271701' || p.name === 'qwsedrftghujkl');
    assert(qwsProduct && qwsProduct.price === 250, `qwsedrftghujkl found with updated price ₹250 (got ₹${qwsProduct?.price})`);

    const deletedItem = products.find(p => p.name === 'hiiiiii2');
    assert(!deletedItem, 'Old removed item "hiiiiii2" is completely absent from GET /api/products');

    // 2. Admin login for authentication
    console.log('\n2️⃣ Admin Authentication...');
    const loginRes = await request('/api/auth/login', 'POST', {
      email: 'jdeep8823@gmail.com',
      password: 'Luckydeepu'
    });
    assert(loginRes.status === 200 && loginRes.data?.requires2FA, 'Admin credentials accepted');

    const otpData = db.getOtp(loginRes.data.userId);
    assert(otpData && otpData.emailOtp, '2FA OTP retrieved');

    const verifyRes = await request('/api/auth/verify-otp', 'POST', {
      userId: loginRes.data.userId,
      singleCode: otpData.emailOtp
    });
    assert(verifyRes.status === 200 && verifyRes.data?.token, 'Admin authenticated and JWT received');
    const adminToken = verifyRes.data.token;

    // 3. Create a temporary product to test deletion permanence
    console.log('\n3️⃣ Testing Product Creation & Persistence...');
    const tempId = `temp-test-${Date.now()}`;
    const createRes = await request('/api/products', 'POST', {
      id: tempId,
      name: 'Temp Test Crochet Coaster',
      price: 120,
      category: 'Decor',
      inStock: true
    }, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(createRes.status === 201, `Created temp product (${tempId})`);

    // Verify presence in memory, file, and MySQL
    const getCreated = await request(`/api/products/${tempId}`, 'GET');
    assert(getCreated.status === 200 && getCreated.data?.product?.name === 'Temp Test Crochet Coaster', 'Temp product is accessible via GET /api/products/:id');

    const storeJsonPath = path.join(__dirname, 'data', 'store.json');
    let storeData = JSON.parse(fs.readFileSync(storeJsonPath, 'utf8'));
    assert(storeData.products.some(p => p.id === tempId), 'Temp product saved to store.json');

    const host = process.env.MYSQL_HOST || 'localhost';
    const port = Number(process.env.MYSQL_PORT) || 3306;
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'stitch_hook';
    const conn = await mysql.createConnection({ host, port, user, password, database });

    const [mysqlCreated] = await conn.query('SELECT * FROM products WHERE id = ?', [tempId]);
    assert(mysqlCreated.length === 1, 'Temp product exists in MySQL products table');

    // 4. Delete the product via DELETE /api/products/:id
    console.log('\n4️⃣ Testing Permanent Product Deletion...');
    const deleteRes = await request(`/api/products/${encodeURIComponent(tempId)}`, 'DELETE', null, {
      'Authorization': `Bearer ${adminToken}`
    });
    assert(deleteRes.status === 200, `DELETE /api/products/${tempId} returned 200 OK`);

    // Verify absence in GET
    const getDeleted = await request(`/api/products/${tempId}`, 'GET');
    assert(getDeleted.status === 404, 'GET /api/products/:id returns 404 after deletion');

    const allAfterDelete = await request('/api/products', 'GET');
    assert(!allAfterDelete.data?.products?.some(p => p.id === tempId), 'Deleted product absent from GET /api/products list');

    // Verify absence in store.json and presence in deletedProductIds
    storeData = JSON.parse(fs.readFileSync(storeJsonPath, 'utf8'));
    assert(!storeData.products.some(p => p.id === tempId), 'Deleted product removed from store.json products array');
    assert(storeData.deletedProductIds?.includes(tempId), 'Deleted product ID recorded in store.json deletedProductIds');

    // Verify MySQL products table deletion and deleted_products table recording
    const [mysqlRows] = await conn.query('SELECT * FROM products WHERE id = ?', [tempId]);
    assert(mysqlRows.length === 0, 'Deleted product removed from MySQL products table');

    const [deletedRows] = await conn.query('SELECT * FROM deleted_products WHERE id = ?', [tempId]);
    assert(deletedRows.length === 1, 'Deleted product ID recorded in MySQL deleted_products table');

    // 5. Test Resurrection Prevention (Simulate Server Restart / Sync)
    console.log('\n5️⃣ Testing Resurrection Prevention on DB Sync / Server Restart...');
    await db.initDatabaseSync();

    const allAfterSync = await request('/api/products', 'GET');
    assert(!allAfterSync.data?.products?.some(p => p.id === tempId), 'Deleted product remains deleted after initDatabaseSync (NO RESURRECTION)');

    // 6. Clean up temp entry from deleted_products in MySQL and store.json to keep DB pristine
    await conn.query('DELETE FROM deleted_products WHERE id = ?', [tempId]);
    storeData = JSON.parse(fs.readFileSync(storeJsonPath, 'utf8'));
    storeData.deletedProductIds = storeData.deletedProductIds.filter(id => id !== tempId);
    fs.writeFileSync(storeJsonPath, JSON.stringify(storeData, null, 2));
    db.data.deletedProductIds = db.data.deletedProductIds.filter(id => id !== tempId);
    await conn.end();

    console.log('Cleaned up temporary test record cleanly.');

  } catch (err) {
    console.error('Test error:', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTest();
