import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../services/db.js';
import { initiateTwoFactorAuth, verifyTwoFactorOtp } from '../services/otpService.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'stitch_hook_secret_key_2026';

// Middleware to verify JWT authentication
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please log in to continue.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User session expired. Please log in again.' });
    }
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

// Middleware to enforce Admin privileges
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Please log in as administrator.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findUserById(decoded.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
    }
    const { password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired admin session token.' });
  }
};

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, preferredOtpMethod } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = db.createUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      preferredOtpMethod: preferredOtpMethod || 'both'
    });

    const twoFactorDetails = await initiateTwoFactorAuth(newUser, newUser.preferredOtpMethod);

    return res.status(201).json({
      message: 'Account created! Real-time 2FA security code dispatched.',
      requires2FA: true,
      ...twoFactorDetails
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, preferredOtpMethod } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter both email and password.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const method = preferredOtpMethod || user.preferredOtpMethod || 'both';
    const twoFactorDetails = await initiateTwoFactorAuth(user, method);

    return res.status(200).json({
      message: 'Credentials verified! Real-time 2FA code sent to your registered channels.',
      requires2FA: true,
      role: user.role,
      ...twoFactorDetails
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login process failed. Please try again.' });
  }
});

/**
 * POST /api/auth/forgot-password
 * Initiates real-time OTP dispatch to reset forgotten password
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Please enter your registered email address.' });
    }

    const user = db.findUserByEmail(email.trim());
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    const twoFactorDetails = await initiateTwoFactorAuth(user, 'both');

    return res.status(200).json({
      message: 'Password reset code sent to your registered email and mobile number.',
      userId: user.id,
      email: user.email,
      ...twoFactorDetails
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ error: 'Failed to initiate password reset. Please try again.' });
  }
});

/**
 * POST /api/auth/reset-password
 * Validates OTP and updates the password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body;

    if (!userId || !otp || !newPassword) {
      return res.status(400).json({ error: 'Please provide user ID, 6-digit OTP, and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    const verifyResult = verifyTwoFactorOtp(userId, { singleCode: otp });
    if (!verifyResult.valid) {
      return res.status(400).json({ error: verifyResult.message || 'Invalid or expired OTP code.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    db.updateUser(userId, { password: hashedPassword });

    return res.status(200).json({
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    return res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

/**
 * POST /api/auth/send-otp
 */
router.post('/send-otp', async (req, res) => {
  try {
    const { userId, method } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required to send OTP.' });
    }

    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const twoFactorDetails = await initiateTwoFactorAuth(user, method || user.preferredOtpMethod || 'both');
    return res.status(200).json({
      message: 'Fresh real-time security OTP sent successfully.',
      ...twoFactorDetails
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ error: 'Failed to resend OTP.' });
  }
});

/**
 * POST /api/auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, singleCode, emailCode, smsCode } = req.body;

    if (!userId || (!singleCode && !emailCode && !smsCode)) {
      return res.status(400).json({ error: 'Please enter the 6-digit security code.' });
    }

    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const verifyResult = verifyTwoFactorOtp(userId, { singleCode, emailCode, smsCode });
    if (!verifyResult.valid) {
      return res.status(400).json({ error: verifyResult.message });
    }

    // Generate JWT auth token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password, ...safeUser } = user;

    return res.status(200).json({
      message: 'Authentication successful! Welcome to Stitch & Hook.',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({ user: req.user });
});

/**
 * PUT /api/auth/profile
 */
router.put('/profile', requireAuth, (req, res) => {
  try {
    const { name, phone, preferredOtpMethod } = req.body;
    const updatedUser = db.updateUser(req.user.id, {
      name: name ? name.trim() : req.user.name,
      phone: phone ? phone.trim() : req.user.phone,
      preferredOtpMethod: preferredOtpMethod || req.user.preferredOtpMethod
    });
    const { password, ...safeUser } = updatedUser;
    return res.status(200).json({ message: 'Profile updated successfully!', user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

/**
 * POST /api/auth/addresses
 */
router.post('/addresses', requireAuth, (req, res) => {
  try {
    const { fullName, phone, street, city, state, pincode, isDefault } = req.body;
    if (!street || !city || !pincode) {
      return res.status(400).json({ error: 'Please provide full address details.' });
    }

    const currentAddresses = req.user.addresses || [];
    const newAddress = {
      id: 'addr-' + Date.now(),
      fullName: fullName || req.user.name,
      phone: phone || req.user.phone,
      street,
      city,
      state: state || '',
      pincode,
      isDefault: isDefault || currentAddresses.length === 0
    };

    let updatedAddresses = [...currentAddresses];
    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(a => ({ ...a, isDefault: false }));
    }
    updatedAddresses.push(newAddress);

    const updatedUser = db.updateUser(req.user.id, { addresses: updatedAddresses });
    const { password, ...safeUser } = updatedUser;
    return res.status(200).json({ message: 'Address saved!', user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add address.' });
  }
});

/**
 * DELETE /api/auth/addresses/:id
 */
router.delete('/addresses/:id', requireAuth, (req, res) => {
  try {
    const addressId = req.params.id;
    const currentAddresses = req.user.addresses || [];
    const filtered = currentAddresses.filter(a => a.id !== addressId);
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    const updatedUser = db.updateUser(req.user.id, { addresses: filtered });
    const { password, ...safeUser } = updatedUser;
    return res.status(200).json({ message: 'Address removed.', user: safeUser });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete address.' });
  }
});

export default router;
