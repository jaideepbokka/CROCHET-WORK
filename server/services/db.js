import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import fs from 'fs';
import bcrypt from 'bcryptjs';
import { initMySQL, getMySQLPool, isMySQLConnected } from './mysql.js';

const DB_FILE = path.join(__dirname, '..', 'data', 'store.json');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initial seed products matching exact requested specifications and price ranges
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

// Persistent Database Store with MySQL synchronization
class Store {
  constructor() {
    this.data = {
      users: [],
      products: initialProducts,
      orders: [],
      otps: {}
    };
    this.load();
    this.seedUsers();
    initMySQL();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        this.data.users = parsed.users || [];
        if (!parsed.products || parsed.products.length === 0) {
          this.data.products = initialProducts;
        } else {
          this.data.products = parsed.products;
        }
        this.data.orders = parsed.orders || [];
        this.data.otps = parsed.otps || {};
      } else {
        this.save();
      }
    } catch (err) {
      console.error('Error loading db file:', err.message);
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving db file:', err.message);
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

    this.data.users = [adminUser];
    this.save();
  }

  // User methods
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
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
    return user;
  }

  updateUser(id, updates) {
    const idx = this.data.users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    this.data.users[idx] = { ...this.data.users[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.users[idx];
  }

  // Product methods
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

  addProduct(productData) {
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
    return newProduct;
  }

  updateProduct(id, updates) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return null;
    if (updates.price) updates.price = Number(updates.price);
    if (updates.originalPrice) updates.originalPrice = Number(updates.originalPrice);
    if (updates.category && !updates.categorySlug) {
      updates.categorySlug = updates.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    this.data.products[idx] = { ...this.data.products[idx], ...updates, updatedAt: new Date().toISOString() };
    this.save();
    return this.data.products[idx];
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }

  // Order methods
  createOrder(orderData) {
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
    return order;
  }

  getAllOrders() {
    return this.data.orders;
  }

  getOrdersByUserId(userId) {
    return this.data.orders.filter(o => o.userId === userId);
  }

  updateOrderStatus(orderId, status) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  deleteOrder(orderId) {
    const idx = this.data.orders.findIndex(o => o.id === orderId);
    if (idx === -1) return false;
    this.data.orders.splice(idx, 1);
    this.save();
    return true;
  }

  clearAllOrders() {
    this.data.orders = [];
    this.save();
    return true;
  }

  // OTP Store methods
  saveOtp(targetKey, otpData) {
    this.data.otps[targetKey] = {
      ...otpData,
      createdAt: Date.now()
    };
    this.save();
  }

  getOtp(targetKey) {
    return this.data.otps[targetKey];
  }

  deleteOtp(targetKey) {
    delete this.data.otps[targetKey];
    this.save();
  }
}

export const db = new Store();
