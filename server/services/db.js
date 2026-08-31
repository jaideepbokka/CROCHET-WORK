import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
  dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });
} catch {}

import fs from 'fs';
import bcrypt from 'bcryptjs';
import { 
  initMySQL, 
  isMySQLConnected, 
  getMySQLProducts, 
  upsertMySQLProduct, 
  seedMySQLProducts, 
  deleteMySQLProduct, 
  getMySQLUsers, 
  upsertMySQLUser, 
  getMySQLOrders, 
  upsertMySQLOrder, 
  deleteMySQLOrder, 
  clearMySQLOrders, 
  saveMySQLOtp, 
  getMySQLOtp, 
  deleteMySQLOtp 
} from './mysql.js';

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
const DB_FILE = isServerless
  ? path.join(os.tmpdir(), 'stitch_store.json')
  : path.join(__dirname, '..', 'data', 'store.json');

// Initial seed products
const initialProducts = [
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

class Store {
  constructor() {
    this.data = {
      users: [],
      products: [...initialProducts],
      orders: [],
      otps: {}
    };
    this.seedUsers();
    this.load();
    this.initDatabaseSync();
  }

  async initDatabaseSync() {
    try {
      const mysqlOk = await initMySQL();
      if (mysqlOk && isMySQLConnected()) {
        // 1. Products Sync (Merge & Ensure all items exist)
        const mysqlProds = await getMySQLProducts();
        const productMap = new Map();
        
        // Base products from memory / JSON
        for (const p of (this.data.products || [])) {
          if (p && p.id) productMap.set(p.id, p);
        }
        // Fallback initial seeds if anything is missing
        for (const p of initialProducts) {
          if (p && p.id && !productMap.has(p.id)) {
            productMap.set(p.id, p);
          }
        }
        // Overwrite / incorporate items from MySQL
        if (mysqlProds && mysqlProds.length > 0) {
          for (const p of mysqlProds) {
            if (p && p.id) productMap.set(p.id, p);
          }
        }

        this.data.products = Array.from(productMap.values());
        this.save();

        // Seed / Upsert all into MySQL
        for (const p of this.data.products) {
          await upsertMySQLProduct(p);
        }

        // 2. Users Sync
        const mysqlUsers = await getMySQLUsers();
        if (mysqlUsers && mysqlUsers.length > 0) {
          const userMap = new Map();
          for (const u of (this.data.users || [])) {
            if (u && u.id) userMap.set(u.id, u);
          }
          for (const u of mysqlUsers) {
            if (u && u.id) userMap.set(u.id, u);
          }
          this.data.users = Array.from(userMap.values());
          this.save();
        } else if (this.data.users && this.data.users.length > 0) {
          for (const u of this.data.users) {
            await upsertMySQLUser(u);
          }
        }

        // 3. Orders Sync
        const mysqlOrders = await getMySQLOrders();
        if (mysqlOrders && mysqlOrders.length > 0) {
          const orderMap = new Map();
          for (const o of (this.data.orders || [])) {
            if (o && o.id) orderMap.set(o.id, o);
          }
          for (const o of mysqlOrders) {
            if (o && o.id) orderMap.set(o.id, o);
          }
          this.data.orders = Array.from(orderMap.values());
          this.save();
        } else if (this.data.orders && this.data.orders.length > 0) {
          for (const o of this.data.orders) {
            await upsertMySQLOrder(o);
          }
        }
      }
    } catch (err) {
      console.warn('Database initialization sync notice:', err.message);
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.users.length > 0) this.data.users = parsed.users;
        if (parsed.products && parsed.products.length > 0) this.data.products = parsed.products;
        if (parsed.orders) this.data.orders = parsed.orders;
        if (parsed.otps) this.data.otps = parsed.otps;
      }
    } catch {
      // Graceful in-memory fallback
    }
  }

  save() {
    try {
      if (!isServerless) {
        const dir = path.dirname(DB_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch {
      // In-memory store continues smoothly
    }
  }

  seedUsers() {
    const adminEmail = 'jdeep8823@gmail.com';
    const hashedAdminPass = bcrypt.hashSync('Luckydeepu', 10);

    const adminUser = {
      id: 'usr-admin-1',
      name: 'Deepu (Administrator)',
      email: adminEmail,
      phone: '9014567531',
      password: hashedAdminPass,
      role: 'admin',
      twoFactorEnabled: true,
      preferredOtpMethod: 'both',
      addresses: [
        {
          id: 'addr-admin-1',
          isDefault: true,
          fullName: 'Deepu (Stitch & Hook)',
          phone: '9014567531',
          street: 'Stitch & Hook Artisan Studio, Main Road',
          city: 'Hyderabad',
          state: 'Telangana',
          pincode: '500001'
        }
      ],
      wishlist: [],
      cart: [],
      createdAt: new Date().toISOString()
    };

    if (!this.data.users || this.data.users.length === 0) {
      this.data.users = [adminUser];
    } else {
      const exists = this.data.users.some(u => u.email.toLowerCase() === adminEmail.toLowerCase());
      if (!exists) this.data.users.push(adminUser);
    }
  }

  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  async createUser(userData) {
    const user = {
      id: 'usr-' + Date.now(),
      name: userData.name,
      email: userData.email.toLowerCase(),
      phone: userData.phone || '',
      password: userData.password,
      role: userData.role || 'customer',
      twoFactorEnabled: true,
      preferredOtpMethod: userData.preferredOtpMethod || 'both',
      addresses: userData.addresses || [],
      wishlist: [],
      cart: [],
      createdAt: new Date().toISOString()
    };
    this.data.users.push(user);
    this.save();
    try { await upsertMySQLUser(user); } catch {}
    return user;
  }

  async updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    try { await upsertMySQLUser(this.data.users[idx]); } catch {}
    return this.data.users[idx];
  }

  getProducts(filters = {}) {
    let result = [...this.data.products];
    if (filters.category && filters.category !== 'all') {
      result = result.filter(p => p.categorySlug === filters.category || p.category.toLowerCase() === filters.category.toLowerCase());
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (filters.maxPrice) {
      result = result.filter(p => p.price <= Number(filters.maxPrice));
    }
    if (filters.minPrice) {
      result = result.filter(p => p.price >= Number(filters.minPrice));
    }
    if (filters.sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (filters.sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }
    return result;
  }

  getProductById(id) {
    return this.data.products.find(p => p.id === id);
  }

  async addProduct(productData) {
    const slug = productData.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newProduct = {
      id: 'prod-' + Date.now(),
      name: productData.name,
      category: productData.category,
      categorySlug: productData.categorySlug || slug,
      price: Number(productData.price),
      originalPrice: productData.originalPrice ? Number(productData.originalPrice) : Math.round(Number(productData.price) * 1.25),
      rating: productData.rating || 5.0,
      reviewsCount: productData.reviewsCount || 1,
      image: productData.image || '/images/laptop_bag_lavender.jpg',
      description: productData.description || 'Handmade artisan crochet creation.',
      dimensions: productData.dimensions || 'Handcrafted size',
      yarnMaterial: productData.yarnMaterial || '100% Premium Milk Cotton Yarn',
      badge: productData.badge || 'New Arrival',
      colorOptions: Array.isArray(productData.colorOptions) ? productData.colorOptions : (productData.colorOptions ? productData.colorOptions.split(',').map(s => s.trim()) : ['Original']),
      careInstructions: productData.careInstructions || 'Gentle hand wash cold.',
      inStock: productData.inStock !== false,
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.save();
    try { await upsertMySQLProduct(newProduct); } catch {}
    return newProduct;
  }

  async updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.originalPrice !== undefined) updates.originalPrice = Number(updates.originalPrice);
    if (updates.category && !updates.categorySlug) {
      updates.categorySlug = updates.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    this.data.products[idx] = { ...this.data.products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    try { await upsertMySQLProduct(this.data.products[idx]); } catch {}
    return this.data.products[idx];
  }

  async deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    try { await deleteMySQLProduct(id); } catch {}
    return true;
  }

  async createOrder(orderData) {
    const order = {
      id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      userId: orderData.userId || null,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      shippingAddress: orderData.shippingAddress,
      items: orderData.items,
      subtotal: orderData.subtotal,
      shippingFee: orderData.shippingFee || 0,
      totalAmount: orderData.totalAmount,
      whatsappNumber: orderData.whatsappNumber || '9014567531',
      status: 'WhatsApp Checkout Initiated',
      createdAt: new Date().toISOString()
    };
    this.data.orders.unshift(order);
    this.save();
    try { await upsertMySQLOrder(order); } catch {}
    return order;
  }

  getAllOrders() {
    return this.data.orders;
  }

  getOrdersByUserId(userId) {
    return this.data.orders.filter(o => o.userId === userId);
  }

  async updateOrderStatus(orderId, status) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.save();
    try { await upsertMySQLOrder(order); } catch {}
    return order;
  }

  async deleteOrder(orderId) {
    const idx = this.data.orders.findIndex(o => o.id === orderId);
    if (idx === -1) return false;
    this.data.orders.splice(idx, 1);
    this.save();
    try { await deleteMySQLOrder(orderId); } catch {}
    return true;
  }

  async clearAllOrders() {
    this.data.orders = [];
    this.save();
    try { await clearMySQLOrders(); } catch {}
    return true;
  }

  async saveOtp(targetKey, otpData) {
    this.data.otps[targetKey] = {
      ...otpData,
      createdAt: Date.now()
    };
    this.save();
    try { await saveMySQLOtp(targetKey, otpData); } catch {}
  }

  getOtp(targetKey) {
    return this.data.otps[targetKey];
  }

  async deleteOtp(targetKey) {
    delete this.data.otps[targetKey];
    this.save();
    try { await deleteMySQLOtp(targetKey); } catch {}
  }
}

export const db = new Store();
