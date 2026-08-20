import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  User, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  ShoppingBag, 
  Heart, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  MessageSquare, 
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { FORMATTED_PHONE, BUSINESS_PHONE } from '../../utils/whatsapp';

export default function UserDashboard() {
  const { user, updateProfile, addAddress, removeAddress } = useAuth();
  const { 
    dashboardOpen, 
    setDashboardOpen, 
    setCartOpen, 
    setWishlistOpen, 
    setSelectedCategory,
    showToast 
  } = useStore();

  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [preferredMethod, setPreferredMethod] = useState(user?.preferredOtpMethod || 'both');
  const [savingProfile, setSavingProfile] = useState(false);

  // Add Address State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrPincode, setAddrPincode] = useState('');
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setPreferredMethod(user.preferredOtpMethod || 'both');
    }
  }, [user]);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('stitch_token');
      if (!token || !dashboardOpen) return;

      setLoadingOrders(true);
      try {
        const res = await fetch('/api/orders/my-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [dashboardOpen, user]);

  if (!dashboardOpen || !user) return null;

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: editName,
        phone: editPhone,
        preferredOtpMethod: preferredMethod
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    if (!addrStreet || !addrCity || !addrPincode) {
      showToast('Please fill in required address fields', 'error');
      return;
    }

    setSavingAddress(true);
    try {
      await addAddress({
        fullName: addrName || user.name,
        phone: addrPhone || user.phone,
        street: addrStreet,
        city: addrCity,
        state: addrState,
        pincode: addrPincode,
        isDefault: addrIsDefault
      });
      showToast('Address added to your address book!', 'success');
      setShowAddAddress(false);
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrPincode('');
    } catch (err) {
      showToast(err.message || 'Failed to add address', 'error');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      await removeAddress(id);
      showToast('Address removed', 'info');
    } catch (err) {
      showToast('Failed to delete address', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={() => setDashboardOpen(false)}
      />

      {/* Dashboard Card */}
      <div className="relative w-full max-w-4xl rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl bg-white border border-[#E0D4F5] z-10 animate-scale-up max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border-b border-[#EDE4D6] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1D4548] to-[#2B6064] text-white text-2xl font-bold font-serif flex items-center justify-center shadow-md border border-white/20">
              {user.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-serif font-bold text-[#1F2421]">
                  {user.name}
                </h2>
                <span className="badge-artisan-sage text-[10px] font-extrabold px-3 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1D4548]" /> 2FA Active
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{user.email} • {user.phone || 'No mobile linked'}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setDashboardOpen(false)}
            className="w-10 h-10 rounded-full bg-white border border-[#EDE4D6] text-gray-400 hover:text-gray-900 flex items-center justify-center cursor-pointer shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#F5EFE6]/60 border-b border-[#EDE4D6] px-6 overflow-x-auto no-scrollbar gap-2">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin },
            { id: 'orders', label: 'WhatsApp Orders', icon: Clock },
            { id: 'security', label: '2FA Security', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 transition cursor-pointer whitespace-nowrap ${
                  active
                    ? 'border-[#1D4548] text-[#1D4548] bg-white rounded-t-2xl shadow-xs'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-white text-left">
          
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div className="max-w-xl space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">Personal Information</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Update your contact details automatically included in WhatsApp checkout orders.
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EDE4D6] text-xs sm:text-sm text-gray-800 focus:border-[#8A68E8] focus:outline-none bg-[#FAF8F5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EDE4D6] text-xs text-gray-500 bg-gray-50 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Mobile Phone Number (for WhatsApp & SMS OTP)
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#EDE4D6] text-xs sm:text-sm text-gray-800 focus:border-[#8A68E8] focus:outline-none bg-[#FAF8F5]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn-primary-artisan text-xs py-3 px-6 shadow-md"
                >
                  {savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </form>

              {/* Quick Shortcuts */}
              <div className="pt-6 border-t border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 mb-3">
                  Store Navigation
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDashboardOpen(false);
                      setCartOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E0D4F5] hover:border-[#8A68E8] transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingBag className="w-4 h-4 text-[#1D4548]" />
                      <span className="text-xs font-extrabold text-gray-800">Shopping Basket</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDashboardOpen(false);
                      setWishlistOpen(true);
                    }}
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#FCD5CE] hover:border-[#E76F51] transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-[#E76F51]" />
                      <span className="text-xs font-extrabold text-gray-800">Saved Wishlist</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Addresses */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-900">Saved Delivery Addresses</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Saved addresses will automatically be included in your WhatsApp checkout messages.
                  </p>
                </div>

                {!showAddAddress && (
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(true)}
                    className="btn-primary-artisan text-xs py-2.5 px-4 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Address</span>
                  </button>
                )}
              </div>

              {/* Add Address Form */}
              {showAddAddress && (
                <form onSubmit={handleCreateAddress} className="p-6 rounded-3xl bg-[#FAF8F5] border border-[#E0D4F5] space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <h4 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider">New Shipping Address</h4>
                    <button
                      type="button"
                      onClick={() => setShowAddAddress(false)}
                      className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Contact Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Aisha Sharma"
                        value={addrName}
                        onChange={(e) => setAddrName(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE4D6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={addrPhone}
                        onChange={(e) => setAddrPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE4D6]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">Street Address / House No. *</label>
                    <input
                      type="text"
                      required
                      placeholder="Flat 402, Lavender Palms, 12th Main Road"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE4D6]"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">City *</label>
                      <input
                        type="text"
                        required
                        placeholder="Bengaluru"
                        value={addrCity}
                        onChange={(e) => setAddrCity(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE4D6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">State</label>
                      <input
                        type="text"
                        placeholder="Karnataka"
                        value={addrState}
                        onChange={(e) => setAddrState(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE4D6]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 mb-1">Pincode *</label>
                      <input
                        type="text"
                        required
                        placeholder="560038"
                        value={addrPincode}
                        onChange={(e) => setAddrPincode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE4D6]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="addrDefCheck"
                      checked={addrIsDefault}
                      onChange={(e) => setAddrIsDefault(e.target.checked)}
                      className="rounded text-[#1D4548] accent-[#1D4548]"
                    />
                    <label htmlFor="addrDefCheck" className="text-xs text-gray-700 font-bold">
                      Set as default shipping address
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="btn-primary-artisan text-xs py-2.5 px-5 mt-2"
                  >
                    {savingAddress ? 'Saving...' : 'Save Address'}
                  </button>
                </form>
              )}

              {/* Address List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {user.addresses && user.addresses.length > 0 ? (
                  user.addresses.map((addr) => (
                    <div 
                      key={addr.id}
                      className="p-5 rounded-3xl bg-white border border-[#EDE4D6] shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold text-gray-900">{addr.fullName || user.name}</span>
                          {addr.isDefault && (
                            <span className="badge-artisan-sage text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {addr.street}
                        </p>
                        <p className="text-xs text-gray-600 font-bold mt-1">
                          {addr.city}{addr.state ? `, ${addr.state}` : ''} - {addr.pincode}
                        </p>
                        {addr.phone && (
                          <p className="text-xs text-gray-500 mt-1">📞 {addr.phone}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-xs text-gray-400">
                    No delivery addresses saved yet. Click "Add Address" above.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WhatsApp Orders */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">Your WhatsApp Orders</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record of all orders coordinated via WhatsApp with <strong>+{BUSINESS_PHONE}</strong>.
                </p>
              </div>

              {loadingOrders ? (
                <div className="py-8 text-center text-xs text-gray-400 animate-pulse">
                  Loading your orders...
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id}
                      className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#E0D4F5] shadow-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-gray-200">
                        <div>
                          <span className="text-xs font-extrabold text-gray-900 font-mono">#{ord.id}</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {new Date(ord.createdAt).toLocaleDateString(undefined, { 
                              year: 'numeric', month: 'short', day: 'numeric' 
                            })}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold bg-[#25D366]/15 text-[#128C7E] px-3 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> WhatsApp Coordinated
                        </span>
                      </div>

                      {/* Items */}
                      <div className="space-y-1.5 text-xs text-gray-700">
                        {ord.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>• {item.name} {item.selectedColor ? `(${item.selectedColor})` : ''} × {item.quantity}</span>
                            <span className="font-extrabold">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Total */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 text-xs">
                        <span className="font-bold text-gray-800">
                          Total: <strong className="text-base text-[#1D4548]">₹{ord.totalAmount}</strong>
                        </span>
                        
                        <a
                          href={`https://wa.me/91${BUSINESS_PHONE}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-extrabold text-[#25D366] hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5 fill-[#25D366]" /> Chat with Artisan
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-[#FAF8F5] rounded-3xl border border-[#EDE4D6]">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No past WhatsApp orders yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setDashboardOpen(false);
                      setSelectedCategory('all');
                    }}
                    className="mt-3 text-xs font-extrabold text-[#1D4548] hover:underline cursor-pointer"
                  >
                    Browse Creations →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 2FA Security */}
          {activeTab === 'security' && (
            <div className="max-w-xl space-y-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-gray-900">Two-Factor Authentication (2FA)</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your account is protected by cryptographic 6-digit OTP verification via SMTP email and Mobile SMS.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold">2FA Protection is Active</h4>
                  <p className="mt-0.5 text-emerald-700">
                    One-time security codes are sent every time you log in to preserve your account safety.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Select Preferred 2FA Channel
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'both', label: 'Email & SMS OTP', desc: 'Maximum dual channel security' },
                    { id: 'email', label: 'Email Only (SMTP)', desc: 'Deliver codes to your mailbox' },
                    { id: 'sms', label: 'SMS Only (Mobile)', desc: 'Deliver codes via instant text' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPreferredMethod(opt.id)}
                      className={`p-4 rounded-2xl text-left border transition cursor-pointer ${
                        preferredMethod === opt.id
                          ? 'bg-[#FAF8F5] border-[#1D4548] ring-2 ring-[#1D4548]/20 shadow-xs'
                          : 'bg-white border-[#EDE4D6] hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold text-gray-900 block">{opt.label}</span>
                      <span className="text-[11px] text-gray-500 mt-1 block leading-tight">{opt.desc}</span>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="btn-primary-artisan text-xs py-3 px-6 shadow-md mt-4"
                >
                  {savingProfile ? 'Saving...' : 'Update Security Preferences'}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
