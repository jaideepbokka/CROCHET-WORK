import 'dotenv/config';
import { db } from './services/db.js';
import { isMySQLConnected, getMySQLPool } from './services/mysql.js';

async function inspectDatabase() {
  console.log('\n======================================================');
  console.log('🐬 STITCH & HOOK - DATABASE INSPECTOR');
  console.log('======================================================\n');

  console.log('📊 DATABASE STATUS:');
  console.log(`- MySQL Connection: ${isMySQLConnected() ? '✅ CONNECTED (stitch_hook DB)' : 'ℹ️ Using Persistent JSON Store (server/data/store.json)'}`);
  console.log(`- Storage Location: ${isMySQLConnected() ? 'MySQL Server (localhost:3306)' : 'd:\\PROJECTS\\CROCHET WORK\\server\\data\\store.json'}`);

  console.log('\n------------------------------------------------------');
  console.log('👤 USERS TABLE (Accounts):');
  console.log('------------------------------------------------------');
  const users = db.data.users || [];
  if (users.length === 0) {
    console.log('No users found.');
  } else {
    users.forEach((u, i) => {
      console.log(`[#${i + 1}] ID: ${u.id}`);
      console.log(`    Name:  ${u.name}`);
      console.log(`    Email: ${u.email} (${u.role.toUpperCase()})`);
      console.log(`    Phone: ${u.phone}`);
      console.log(`    2FA:   ${u.twoFactorEnabled ? 'Enabled' : 'Disabled'} (Preferred: ${u.preferredOtpMethod})`);
      console.log(`    Addresses: ${u.addresses?.length || 0} saved`);
      console.log('');
    });
  }

  console.log('------------------------------------------------------');
  console.log(`📦 PRODUCTS TABLE (${db.data.products?.length || 0} Total Creations):`);
  console.log('------------------------------------------------------');
  const products = db.data.products || [];
  products.forEach((p, i) => {
    console.log(`[${i + 1}] ₹${p.price.toString().padEnd(4)} | ${(p.category || '').padEnd(20)} | ${p.name}`);
    console.log(`    Badge: ${p.badge || 'None'} | Stock: ${p.inStock !== false ? 'In Stock' : 'Out of Stock'}`);
  });

  console.log('\n------------------------------------------------------');
  console.log(`🛍️ ORDERS TABLE (${db.data.orders?.length || 0} WhatsApp Orders):`);
  console.log('------------------------------------------------------');
  const orders = db.data.orders || [];
  if (orders.length === 0) {
    console.log('No orders placed yet.');
  } else {
    orders.forEach((o, i) => {
      console.log(`[#${i + 1}] Order ID: #${o.id} - ${new Date(o.createdAt).toLocaleString()}`);
      console.log(`    Customer: ${o.customerName} (${o.customerPhone || 'No phone'})`);
      console.log(`    Total: ₹${o.totalAmount} | Status: ${o.status}`);
      console.log(`    Items: ${o.items?.map(it => `${it.name} (x${it.quantity})`).join(', ')}`);
      console.log('');
    });
  }

  console.log('======================================================\n');
}

inspectDatabase();
