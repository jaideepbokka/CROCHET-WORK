import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const parseSafeJson = async (res) => {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(res.ok ? 'Unexpected response format' : `Server response error (${res.status})`);
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('stitch_token') || null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState('login'); // 'login', 'register', '2fa', 'forgot-password', 'reset-password'
  const [pending2FAData, setPending2FAData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify existing session
  useEffect(() => {
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('stitch_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        });
        if (res.ok) {
          const data = await parseSafeJson(res);
          setUser(data.user);
          setToken(storedToken);
        } else {
          localStorage.removeItem('stitch_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Session verify failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  // Initiate Login
  const login = async ({ email, password, preferredOtpMethod = 'both' }) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, preferredOtpMethod })
    });

    const data = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    if (data.requires2FA) {
      setPending2FAData(data);
      setAuthModalView('2fa');
      return { requires2FA: true, data };
    }

    // Direct login fallback if 2FA disabled
    if (data.token) {
      localStorage.setItem('stitch_token', data.token);
      setToken(data.token);
      setUser(data.user);
      setAuthModalOpen(false);
      return { requires2FA: false, user: data.user };
    }
  };

  // Initiate Register
  const register = async ({ name, email, phone, password, preferredOtpMethod = 'both' }) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password, preferredOtpMethod })
    });

    const data = await parseSafeJson(res);
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    if (data.requires2FA) {
      setPending2FAData(data);
      setAuthModalView('2fa');
      return { requires2FA: true, data };
    }
  };

  // Finalize 2FA Login
  const handleTwoFactorSuccess = (authPayload) => {
    localStorage.setItem('stitch_token', authPayload.token);
    setToken(authPayload.token);
    setUser(authPayload.user);
    setPending2FAData(null);
    setAuthModalOpen(false);
    setAuthModalView('login');
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('stitch_token');
    setToken(null);
    setUser(null);
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (!token) return;
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await parseSafeJson(res);
    if (res.ok) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.error || 'Profile update failed');
  };

  // Add Address
  const addAddress = async (addressData) => {
    if (!token) return;
    const res = await fetch('/api/auth/addresses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(addressData)
    });
    const data = await parseSafeJson(res);
    if (res.ok) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.error || 'Failed to add address');
  };

  // Delete Address
  const deleteAddress = async (addressId) => {
    if (!token) return;
    const res = await fetch(`/api/auth/addresses/${addressId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await parseSafeJson(res);
    if (res.ok) {
      setUser(data.user);
      return data.user;
    }
    throw new Error(data.error || 'Failed to remove address');
  };

  const openAuthModal = (view = 'login') => {
    setAuthModalView(view);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setPending2FAData(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        authModalOpen,
        authModalView,
        pending2FAData,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
        handleTwoFactorSuccess,
        openAuthModal,
        closeAuthModal,
        setAuthModalView
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
