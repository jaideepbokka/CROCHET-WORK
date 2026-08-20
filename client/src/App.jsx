import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import ProductGrid from './components/products/ProductGrid';
import ProductDetailModal from './components/products/ProductDetailModal';
import AuthModal from './components/auth/AuthModal';
import CartDrawer from './components/cart/CartDrawer';
import WishlistDrawer from './components/cart/WishlistDrawer';
import UserDashboard from './components/dashboard/UserDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import CustomOrderModal from './components/common/CustomOrderModal';
import Toast from './components/common/Toast';
import Footer from './components/layout/Footer';

function MainApp() {
  const { adminDashboardOpen, setAdminDashboardOpen } = useStore();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1F2421] font-sans antialiased selection:bg-[#E0D4F5] selection:text-[#1D4548]">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow">
        <Hero />
        <ProductGrid />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <ProductDetailModal />
      <AuthModal />
      <CartDrawer />
      <WishlistDrawer />
      <UserDashboard />
      <AdminDashboard 
        isOpen={adminDashboardOpen} 
        onClose={() => setAdminDashboardOpen(false)} 
      />
      <CustomOrderModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <MainApp />
      </StoreProvider>
    </AuthProvider>
  );
}
