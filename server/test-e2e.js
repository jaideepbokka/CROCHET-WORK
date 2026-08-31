import http from 'http';
import app from './server.js';

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: data ? JSON.parse(data) : null, raw: data });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting Stitch & Hook Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data?.status === 'online', 'Health endpoint status is online');
    assert(health.data?.businessWhatsApp === '9014567531', 'WhatsApp business number is configured as 9014567531');

    // 2. Product Catalog Check
    const prodRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'GET'
    });
    assert(prodRes.status === 200 && prodRes.data?.products?.length >= 9, `Loaded ${prodRes.data?.products?.length} products`);

    // 3. Admin Authentication & Real-time OTP Flow
    console.log('\n🔐 Testing Admin Login Flow for jdeep8823@gmail.com / Luckydeepu...');
    const adminLogin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'jdeep8823@gmail.com',
      password: 'Luckydeepu'
    });

    assert(adminLogin.status === 200 && adminLogin.data?.requires2FA === true, 'Admin credentials validated, 2FA triggered');
    assert(adminLogin.data?.role === 'admin', 'Admin role verified in login response');
    assert(adminLogin.data?.devCodes === undefined, 'Security confirmed: No OTP code leaked in API response payload');

    // Fetch the active real-time OTP from DB store to simulate real-time email reception
    const { db } = await import('./services/db.js');
    const storedAdminOtp = db.getOtp(adminLogin.data.userId);
    assert(storedAdminOtp && storedAdminOtp.emailOtp?.length === 6, 'Real-time 6-Digit 2FA OTP successfully generated in backend store');
    console.log(`🔑 Dispatched Real-Time Admin OTP: ${storedAdminOtp.emailOtp}`);

    // Verify OTP
    const verifyAdmin = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/verify-otp',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      userId: adminLogin.data.userId,
      singleCode: storedAdminOtp.emailOtp
    });

    assert(verifyAdmin.status === 200 && verifyAdmin.data?.token, 'Real-time 2FA verified and Admin JWT session token issued');
    const adminToken = verifyAdmin.data.token;

    // 4. Admin CRUD Product Management
    console.log('\n📦 Testing Admin Product Management (Add, Edit Price, Delete)...');
    
    // Add New Product
    const addProductRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/products',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      name: 'Artisan Pastel Rainbow Tote Bag',
      category: 'Laptop Bags',
      price: 190,
      originalPrice: 230,
      description: 'Handcrafted rainbow tote bag woven with soft organic cotton.',
      image: '/images/laptop_bag_striped.jpg',
      badge: 'Admin Custom Addition'
    });

    assert(addProductRes.status === 201 && addProductRes.data?.product?.id, 'Admin successfully added a new product');
    const newProdId = addProductRes.data?.product?.id;

    // Edit Product Price
    const updatePriceRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/products/${newProdId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, {
      price: 175
    });

    assert(updatePriceRes.status === 200 && updatePriceRes.data?.product?.price === 175, 'Admin changed product price to ₹175');

    // 5. Admin View All Orders
    const allOrdersRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders/all',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(allOrdersRes.status === 200 && Array.isArray(allOrdersRes.data?.orders), 'Admin can view all customer WhatsApp orders');

    // 6. Delete Test Product
    const deleteRes = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: `/api/products/${newProdId}`,
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminToken}`
      }
    });
    assert(deleteRes.status === 200, 'Admin successfully deleted the test product from store catalog');

    // 7. Verify Frontend (if running)
    try {
      const frontendRes = await makeRequest({
        hostname: 'localhost',
        port: 5173,
        path: '/',
        method: 'GET'
      });
      if (frontendRes.status === 200) {
        assert(frontendRes.raw.includes('Stitch & Hook'), 'Vite Frontend is serving Stitch & Hook web application');
      }
    } catch {
      console.log('ℹ️ [INFO] Vite client dev server not currently active on :5173 (Skipping Vite check)');
    }

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  }

  console.log('\n========================================');
  console.log(`🎉 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('========================================\n');
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
