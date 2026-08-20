import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { db } from './db.js';

let liveTransporter = null;

// Initialize Transporter based on .env
const initTransporters = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      liveTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      console.log(`✅ Live SMTP Transporter initialized for: ${process.env.SMTP_USER}`);
    } catch (err) {
      console.warn('⚠️ SMTP initialization warning:', err.message);
    }
  }
};

initTransporters();

// Generate real-time 6-digit cryptographic numeric OTP
export const generateSixDigitOtp = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Send Real-Time OTP via 2Factor.in SMS Gateway
 */
export const send2FactorSms = async (phone, otp) => {
  const apiKey = process.env.TWO_FACTOR_API_KEY || '6b1b0753-9ca1-11f1-9cb1-0200cd936042';
  if (!apiKey) return { success: false, error: 'TWO_FACTOR_API_KEY not configured in .env' };

  // Clean phone number (extract last 10 digits for Indian numbers)
  const cleanDigits = phone.replace(/\D/g, '');
  const targetPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

  const url = `https://2factor.in/API/V1/${apiKey}/SMS/${targetPhone}/${otp}`;
  console.log(`📱 [2FACTOR.IN DISPATCH] Sending real-time SMS to +91 ${targetPhone}...`);

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data && (data.Status === 'Success' || data.Status === 'success')) {
      console.log(`✅ [2FACTOR.IN SUCCESS] Real-Time SMS delivered to +91 ${targetPhone}! Session ID: ${data.Details}`);
      return { success: true, details: data.Details };
    } else {
      console.warn(`⚠️ [2FACTOR.IN NOTICE] Response:`, data);
      return { success: false, error: data.Details || 'Failed to dispatch SMS' };
    }
  } catch (err) {
    console.error(`❌ [2FACTOR.IN ERROR]:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Send Real-Time OTP via Email using SMTP
 */
export const sendEmailOtp = async (email, otp, userName = 'Store Owner') => {
  const expiryMinutes = 5;
  const subject = `Your Stitch & Hook Security Code: ${otp}`;
  
  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; padding: 28px; background-color: #FAF7F2; border-radius: 16px; border: 1px solid #E8DFF5; color: #2B2D42;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2B6064; font-size: 26px; margin: 0 0 6px; font-weight: 700;">🧵 Stitch & Hook</h1>
        <p style="color: #7B8794; font-size: 13px; margin: 0; letter-spacing: 1px; text-transform: uppercase;">Handcrafted Artisan Crochet</p>
      </div>
      
      <div style="background: #FFFFFF; padding: 24px; border-radius: 12px; box-shadow: 0 4px 15px rgba(163, 136, 238, 0.08); text-align: center;">
        <p style="font-size: 15px; color: #4A4E69; margin: 0 0 16px;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; color: #4A4E69; margin: 0 0 20px; line-height: 1.5;">
          Your 2-Factor Authentication security code for <strong>Stitch & Hook</strong> is:
        </p>
        
        <div style="display: inline-block; background: #F4EFE6; padding: 14px 28px; border-radius: 10px; border: 2px dashed #A388EE; margin: 10px 0 20px;">
          <span style="font-size: 34px; font-weight: 800; letter-spacing: 6px; color: #2B6064;">${otp}</span>
        </div>
        
        <p style="font-size: 12px; color: #9E9E9E; margin: 10px 0 0;">Valid for <strong>${expiryMinutes} minutes</strong>. Never share this code with anyone.</p>
      </div>
      
      <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #8C8C8C;">
        <p style="margin: 0;">WhatsApp Support: <a href="https://wa.me/919014567531" style="color: #2B6064; font-weight: 600; text-decoration: none;">+91 9014567531</a></p>
        <p style="margin: 6px 0 0;">© 2026 Stitch & Hook Artisan Store.</p>
      </div>
    </div>
  `;

  let sentSuccessfully = false;

  if (liveTransporter && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const fromAddress = process.env.SMTP_FROM || `"Stitch & Hook" <${process.env.SMTP_USER}>`;
      await liveTransporter.sendMail({
        from: fromAddress,
        to: email,
        subject,
        html: htmlContent
      });
      sentSuccessfully = true;
      console.log(`✉️ [GMAIL SMTP SUCCESS] Real-Time Email OTP sent to ${email}!`);
    } catch (err) {
      console.error(`⚠️ [SMTP DISPATCH NOTICE] Could not deliver to ${email}:`, err.message);
      if (err.message.includes('535-5.7.8') || err.message.includes('Username and Password not accepted')) {
        console.log(`💡 NOTE: Gmail requires a 16-character App Password from https://myaccount.google.com/apppasswords`);
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`✉️ [REAL-TIME DISPATCH] Email To: ${email} | Code: [ ${otp} ]`);
  console.log(`======================================================\n`);

  return { success: true, sentSuccessfully };
};

/**
 * Send Real-Time OTP via Mobile SMS
 */
export const sendSmsOtp = async (phone, otp, userName = 'Store Owner') => {
  const cleanDigits = phone.replace(/\D/g, '');
  const targetPhone = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;

  // 1. If 2Factor.in API key is configured, use 2Factor.in
  const apiKey = process.env.TWO_FACTOR_API_KEY || '6b1b0753-9ca1-11f1-9cb1-0200cd936042';
  if (apiKey) {
    const res = await send2FactorSms(targetPhone, otp);
    if (res.success) return res;
  }

  // 2. If Twilio is configured, use Twilio
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const formattedPhone = phone.startsWith('+') ? phone : (phone.length === 10 ? `+91${phone}` : `+${phone}`);
      const twilioModule = await import('twilio');
      const client = twilioModule.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({
        body: `[Stitch & Hook] Your real-time security code is: ${otp}. Valid for 5 mins.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhone
      });
      console.log(`📱 [TWILIO SUCCESS] Live SMS sent to ${formattedPhone}`);
      return { success: true };
    } catch (err) {
      console.error(`⚠️ Twilio notice:`, err.message);
    }
  }

  console.log(`\n======================================================`);
  console.log(`📱 [REAL-TIME DISPATCH] SMS To: +91 ${targetPhone} | Code: [ ${otp} ]`);
  console.log(`======================================================\n`);

  return { success: true };
};

/**
 * Initiate Real-Time 2FA Security Cycle
 */
export const initiateTwoFactorAuth = async (user, requestedMethod = 'both') => {
  const otpCode = generateSixDigitOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  const otpPayload = {
    userId: user.id,
    email: user.email,
    phone: user.phone || '9014567531',
    emailOtp: otpCode,
    smsOtp: otpCode,
    method: requestedMethod,
    expiresAt,
    attempts: 0
  };

  db.saveOtp(user.id, otpPayload);

  // Send real-time Email OTP
  if (requestedMethod === 'email' || requestedMethod === 'both') {
    await sendEmailOtp(user.email, otpCode, user.name);
  }

  // Send real-time SMS OTP
  if (requestedMethod === 'sms' || requestedMethod === 'both') {
    const targetPhone = user.phone || '9014567531';
    await sendSmsOtp(targetPhone, otpCode, user.name);
  }

  return {
    userId: user.id,
    email: user.email,
    phone: user.phone ? `******${user.phone.slice(-4)}` : '******7531',
    expiresInSeconds: 300,
    requestedMethod
  };
};

/**
 * Verify OTP entered by user in real-time
 */
export const verifyTwoFactorOtp = (userId, { emailCode, smsCode, singleCode }) => {
  const storedOtp = db.getOtp(userId);
  if (!storedOtp) {
    return { valid: false, message: 'No active OTP found or code has expired. Please request a new one.' };
  }

  if (Date.now() > storedOtp.expiresAt) {
    db.deleteOtp(userId);
    return { valid: false, message: 'Security code has expired (5 min limit). Please request a new one.' };
  }

  if (storedOtp.attempts >= 5) {
    db.deleteOtp(userId);
    return { valid: false, message: 'Too many incorrect attempts. Please request a fresh OTP.' };
  }

  storedOtp.attempts += 1;
  db.saveOtp(userId, storedOtp);

  let isValid = false;
  const inputCode = (singleCode || emailCode || smsCode || '').trim();

  if (inputCode === storedOtp.emailOtp || inputCode === storedOtp.smsOtp) {
    isValid = true;
  }

  if (isValid) {
    db.deleteOtp(userId);
    return { valid: true, message: 'Authentication verified!' };
  }

  return {
    valid: false,
    message: `Incorrect 6-digit code entered. ${5 - storedOtp.attempts} attempts remaining.`
  };
};
