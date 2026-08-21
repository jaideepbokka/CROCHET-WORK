import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Search, 
  Menu, 
  X, 
  Sparkles, 
  LogOut, 
  ChevronDown,
  MapPin,
  Clock,
  ShieldCheck,
  ArrowRight,
  MessageSquare
} from 'lucide-react';
import { BUSINESS_PHONE, FORMATTED_PHONE } from '../../utils/whatsapp';

export default function Navbar() {
  const { user, logout, openAuthModal } = useAuth();
  const { 
    totalCartCount, 
    cartSubtotal, 
    setCartOpen, 
    wishlist, 
    setWishlistOpen, 
    setDashboardOpen,
    setAdminDashboardOpen,
    searchQuery, 
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    setCustomOrderOpen
  } = useStore();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const categoriesList = [
    { id: 'all', name: 'All Creations' },
    { id: 'laptop-bags', name: 'Laptop Bags (₹150–200)' },
    { id: 'buds-cases', name: 'Buds Cases (₹70–100)' },
    { id: 'spiderman-keychains', name: 'Spiderman (₹80)' },
    { id: 'keychains', name: 'Keychains (₹70)' }
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-lg border-b border-[#E0D4F5]/80 transition-all shadow-xs w-full max-w-full">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-[#1D4548] via-[#2B6064] to-[#1D4548] text-white py-1.5 px-3 sm:px-4 text-center text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-1.5 sm:gap-2 overflow-hidden">
        <Sparkles className="w-3.5 h-3.5 text-[#E9C46A] animate-pulse shrink-0" />
        <span className="truncate sm:overflow-visible">
          Handcrafted Boutique • WhatsApp: <strong>+91 {BUSINESS_PHONE}</strong>
        </span>
        <span className="hidden md:inline-block bg-white/20 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shrink-0">
          Free Delivery &gt; ₹300
        </span>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Logo & Calligraphy Brand Identity */}
          <div 
            className="flex items-center gap-2 cursor-pointer shrink-0 group" 
            onClick={() => setSelectedCategory('all')}
          >
            <div className="h-9 sm:h-13 flex items-center py-0.5 sm:py-1">
              <img 
                src="/images/logo.jpg" 
                alt="Stitch & Hook Logo" 
                className="h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
              />
            </div>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptop bags (₹150), buds cases (₹70), spidey charms (₹80)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#EDE4D6] bg-white text-xs sm:text-sm focus:outline-none focus:border-[#8A68E8] focus:ring-3 focus:ring-[#E0D4F5]/70 transition text-gray-800 placeholder:text-gray-400 shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            
            {/* Admin Dashboard Quick Button (When logged in as Admin) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setAdminDashboardOpen(true)}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-[#1D4548] text-[#E9C46A] text-[11px] sm:text-xs font-extrabold transition shadow-md flex items-center gap-1.5 cursor-pointer border border-[#E9C46A]/50 hover:bg-[#2B6064] shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#E9C46A]" />
                <span className="hidden sm:inline">Admin Portal</span>
              </button>
            )}

            {/* Custom Commission Button */}
            <button
              type="button"
              onClick={() => setCustomOrderOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#EFE9FA] to-[#E1EFEF] hover:from-[#e0d4f5] hover:to-[#c4e1de] text-[#1D4548] text-xs font-extrabold transition shadow-xs cursor-pointer border border-[#8A68E8]/30 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8A68E8]" />
              Custom Order
            </button>

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => setWishlistOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-[#1F2421] border border-[#EDE4D6] transition cursor-pointer shadow-xs shrink-0"
              title="Saved Wishlist"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-[#E76F51]" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 bg-[#E76F51] text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Basket Button */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-2 sm:px-3.5 rounded-full bg-white border border-[#EDE4D6] hover:border-[#8A68E8] transition shadow-xs cursor-pointer group shrink-0"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-[#1D4548] group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-extrabold text-xs text-[#1F2421]">
                ₹{cartSubtotal}
              </span>
              {totalCartCount > 0 && (
                <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 bg-[#1D4548] text-white text-[10px] sm:text-[11px] font-extrabold rounded-full flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile / Sign In */}
            {user ? (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 py-1 sm:py-1.5 px-2 sm:px-3 rounded-full bg-white border border-[#C4E1DE] hover:border-[#4E878C] transition cursor-pointer shadow-xs"
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-tr from-[#1D4548] to-[#2B6064] text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
                    {isAdmin ? '👑' : (user.name ? user.name[0].toUpperCase() : 'U')}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold text-[#1F2421] max-w-[90px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-3xl shadow-xl border border-[#E0D4F5] py-2 z-50 animate-scale-up text-left">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-[#FAF8F5]">
                      <p className="text-xs font-extrabold text-gray-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      <span className={`inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-full font-extrabold ${
                        isAdmin ? 'bg-[#1D4548] text-[#E9C46A]' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {isAdmin ? '👑 Store Administrator' : '🔒 2FA Protected'}
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setAdminDashboardOpen(true);
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-xs font-extrabold text-[#1D4548] bg-[#FFF9E5] hover:bg-[#FEF0C0] flex items-center gap-2 cursor-pointer border-b border-gray-100"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#E9C46A]" />
                        <span>Admin Control Dashboard</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setDashboardOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#2B6064]" />
                      My Profile & Dashboard
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDashboardOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#8A68E8]" />
                      Saved Delivery Addresses
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDashboardOpen(true);
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-[#FAF8F5] flex items-center gap-2 cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5 text-[#E76F51]" />
                      WhatsApp Order History
                    </button>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 sm:py-2.5 sm:px-4.5 rounded-full bg-gradient-to-r from-[#1D4548] via-[#2B6064] to-[#173638] text-white text-xs font-bold transition shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 border border-white/15 cursor-pointer whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#E0D4F5]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl text-gray-700 hover:bg-white border border-[#EDE4D6] transition cursor-pointer shrink-0 shadow-xs"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-[#1D4548]" />
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-2.5 pt-0">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crochet bags, cases, spidey..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#EDE4D6] bg-white text-xs text-gray-800 focus:outline-none focus:border-[#8A68E8] shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar border-t border-[#E0D4F5]/60 text-xs font-medium">
          {categoriesList.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 sm:px-4 py-1.5 rounded-full transition-all cursor-pointer font-bold text-xs ${
                  isActive
                    ? 'bg-[#1D4548] text-white shadow-xs scale-102'
                    : 'bg-white/90 hover:bg-white text-gray-700 border border-[#EDE4D6]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Menu Slide-Out Drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileNavOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative ml-auto w-[85%] max-w-sm h-full bg-[#FAF8F5] shadow-2xl flex flex-col justify-between p-5 border-l border-[#E0D4F5] z-10 overflow-y-auto animate-slide-left">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#EDE4D6]">
                <div className="h-10 flex items-center">
                  <img 
                    src="/images/logo.jpg" 
                    alt="Stitch & Hook Logo" 
                    className="h-full w-auto object-contain" 
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  className="p-2 rounded-full bg-white border border-[#EDE4D6] text-gray-600 hover:text-gray-900 shadow-xs cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Account Quick Block */}
              <div className="mt-5 p-4 rounded-2xl bg-white border border-[#EDE4D6] shadow-xs">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1D4548] to-[#2B6064] text-white text-sm font-bold flex items-center justify-center">
                        {isAdmin ? '👑' : (user.name ? user.name[0].toUpperCase() : 'U')}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            setAdminDashboardOpen(true);
                            setMobileNavOpen(false);
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[#1D4548] bg-[#FFF9E5] border border-[#FDE495] cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#E9C46A]" />
                          <span>Admin Control Dashboard</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setDashboardOpen(true);
                          setMobileNavOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#FAF8F5] cursor-pointer"
                      >
                        <UserIcon className="w-4 h-4 text-[#2B6064]" />
                        <span>My Profile & Dashboard</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setMobileNavOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-3">
                    <p className="text-xs text-gray-600 font-medium">Sign in to track orders, save favorites & checkout faster</p>
                    <button
                      type="button"
                      onClick={() => {
                        openAuthModal('login');
                        setMobileNavOpen(false);
                      }}
                      className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#1D4548] via-[#2B6064] to-[#173638] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-[#E0D4F5]" />
                      <span>Sign In / Create Account</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Navigation Links */}
              <div className="mt-5 space-y-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400 px-1">Discover Creations</p>
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setMobileNavOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#1D4548] text-white'
                        : 'bg-white text-gray-700 hover:bg-[#EFE9FA] border border-[#EDE4D6]'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                  </button>
                ))}
              </div>

              {/* Custom Commission Button in Mobile Menu */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setCustomOrderOpen(true);
                    setMobileNavOpen(false);
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#EFE9FA] to-[#E1EFEF] border border-[#8A68E8]/30 text-[#1D4548] text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-[#8A68E8]" />
                  <span>Request Custom Commission</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-6 border-t border-[#EDE4D6] space-y-3">
              <a
                href={`https://wa.me/91${BUSINESS_PHONE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp: {FORMATTED_PHONE}</span>
              </a>
              <p className="text-[11px] text-gray-400 text-center">Handcrafted in India with 100% Milk Cotton</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
