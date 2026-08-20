import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

let pool = null;
let isConnected = false;

export const initMySQL = async () => {
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = Number(process.env.MYSQL_PORT) || 3306;
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || '';
  const database = process.env.MYSQL_DATABASE || 'stitch_hook';

  try {
    // 1. Connect to MySQL server to ensure DB exists
    const rootConn = await mysql.createConnection({ host, port, user, password });
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
      connectionLimit: 10,
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
          '9014567531',
          hashedAdminPass,
          'admin',
          1,
          'both',
          JSON.stringify([{
            id: 'addr-admin-1',
            isDefault: true,
            fullName: 'Deepu (Stitch & Hook)',
            phone: '9014567531',
            street: 'Stitch & Hook Artisan Studio, Main Road',
            city: 'Hyderabad',
            state: 'Telangana',
            pincode: '500001'
          }]),
          JSON.stringify([]),
          JSON.stringify([])
        ]
      );
      console.log('👑 [MYSQL] Seeded Admin User in MySQL: jdeep8823@gmail.com / Luckydeepu');
    }

    return true;
  } catch (err) {
    console.warn(`⚠️ [MYSQL NOTICE] Could not connect to MySQL server (${err.message}). Using unified persistent database store.`);
    isConnected = false;
    return false;
  }
};

export const getMySQLPool = () => pool;
export const isMySQLConnected = () => isConnected;
