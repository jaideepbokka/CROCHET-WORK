import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  ShoppingBag, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  MessageSquare, 
  Save, 
  Eye, 
  RefreshCw, 
  Layers, 
  Tag, 
  Sliders,
  ShieldCheck,
  Check,
  Image as ImageIcon,
  Upload,
  Camera,
  MapPin,
  Phone,
  User,
  AlertTriangle,
  Star
} from 'lucide-react';
import { FORMATTED_PHONE, BUSINESS_PHONE } from '../../utils/whatsapp';
import { compressImageFile } from '../../utils/imageCompressor';

export default function AdminDashboard({ isOpen, onClose }) {
  const { user, token } = useAuth();
  const { products, fetchProducts, showToast, updateProductLocal, updateProductPrice, addProductLocal, deleteProductLocal } = useStore();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'products', 'add-product', 'analytics'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Add / Edit Product Modal State
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  // Product Form Fields
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState('Laptop Bags');
  const [pPrice, setPPrice] = useState('180');
  const [pOriginalPrice, setPOriginalPrice] = useState('220');
  const [pImages, setPImages] = useState(['/images/laptop_bag_lavender.jpg']);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [activePreviewIndex, setActivePreviewIndex] = useState(0);
  const pImage = pImages[activePreviewIndex] || pImages[0] || '/images/laptop_bag_lavender.jpg';
  const [pDescription, setPDescription] = useState('Handmade with double-waffle stitch using soft milk cotton yarn.');
  const [pDimensions, setPDimensions] = useState('14" x 10.5" (Fits 13-14" laptops)');
  const [pYarn, setPYarn] = useState('100% Premium Milk Cotton Yarn');
  const [pBadge, setPBadge] = useState('New Arrival');
  const [pColors, setPColors] = useState('Pastel Lavender, Cream, Sage');
  const [pInStock, setPInStock] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  // Inline Quick Price Edit State
  const [quickPrices, setQuickPrices] = useState({});

  const curatedImageOptions = [
    { label: 'Lavender Waffle Laptop Bag', value: '/images/laptop_bag_lavender.jpg' },
    { label: 'Pastel Striped Laptop Bag', value: '/images/laptop_bag_striped.jpg' },
    { label: 'Forest Teal Cable-Knit Bag', value: '/images/laptop_bag_forest_teal.jpg' },
    { label: 'Strawberry Buds Case', value: '/images/buds_case_strawberry.jpg' },
    { label: 'Tulip Buds Case', value: '/images/buds_case_tulip.jpg' },
    { label: 'Spiderman Amigurumi Keychain', value: '/images/spiderman_keychain.jpg' },
    { label: 'Miles Morales Spidey Charm', value: '/images/spiderman_miles_keychain.jpg' },
    { label: 'Sunflower Keychain', value: '/images/keychain_sunflower.jpg' },
    { label: 'Daisy Bell Charm', value: '/images/keychain_daisy.jpg' }
  ];

  // Handler for uploading multiple custom images with automatic compression
  const handleMultipleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.type.startsWith('image/'));
    if (validFiles.length === 0) {
      showToast('Please select valid image files (PNG, JPG, WEBP, GIF)', 'error');
      return;
    }

    showToast(`Optimizing ${validFiles.length} photo${validFiles.length > 1 ? 's' : ''}... 🎨`, 'info');

    try {
      const compressedResults = await Promise.all(
        validFiles.map(file => compressImageFile(file, 1200, 0.85))
      );

      setPImages((prev) => {
        const cleanPrev = prev.filter(img => img !== '/images/laptop_bag_lavender.jpg');
        return [...cleanPrev, ...compressedResults];
      });
      setActivePreviewIndex(0);
      showToast(`${validFiles.length} photo${validFiles.length > 1 ? 's' : ''} added & optimized! 📸✨`, 'success');
    } catch (err) {
      console.error('Image upload optimization error:', err);
      showToast('Failed to optimize some images', 'error');
    }
    e.target.value = '';
  };

  const handleAddCustomImageUrl = () => {
    if (!customImageUrl.trim()) return;
    const url = customImageUrl.trim();
    if (pImages.includes(url)) {
      showToast('Image URL is already added!', 'info');
      return;
    }
    setPImages((prev) => {
      const cleanPrev = prev.filter(img => img !== '/images/laptop_bag_lavender.jpg');
      return [...cleanPrev, url];
    });
    setCustomImageUrl('');
    showToast('Image URL added to gallery! 🖼️', 'success');
  };

  const handleTogglePreset = (presetVal) => {
    setPImages((prev) => {
      if (prev.includes(presetVal)) {
        const filtered = prev.filter(item => item !== presetVal);
        return filtered.length > 0 ? filtered : [presetVal];
      } else {
        const cleanPrev = prev.filter(img => img !== '/images/laptop_bag_lavender.jpg');
        return [...cleanPrev, presetVal];
      }
    });
  };

  const handleRemoveImage = (indexToRemove) => {
    setPImages((prev) => {
      const filtered = prev.filter((_, idx) => idx !== indexToRemove);
      return filtered.length > 0 ? filtered : ['/images/laptop_bag_lavender.jpg'];
    });
    if (activePreviewIndex >= indexToRemove && activePreviewIndex > 0) {
      setActivePreviewIndex(prev => prev - 1);
    }
  };

  const handleMakeCoverImage = (index) => {
    setPImages((prev) => {
      if (index === 0 || !prev[index]) return prev;
      const target = prev[index];
      const remaining = prev.filter((_, idx) => idx !== index);
      return [target, ...remaining];
    });
    setActivePreviewIndex(0);
    showToast('Cover photo updated! ⭐', 'success');
  };

  // Fetch all orders for admin
  const fetchAdminOrders = async () => {
    const activeToken = token || localStorage.getItem('stitch_token');
    if (!activeToken) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders/all', {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.role === 'admin') {
      fetchAdminOrders();
    }
  }, [isOpen, user]);

  if (!isOpen || user?.role !== 'admin') return null;

  const resetForm = () => {
    setEditingProductId(null);
    setPName('');
    setPCategory('Laptop Bags');
    setPPrice('180');
    setPOriginalPrice('220');
    setPImages(['/images/laptop_bag_lavender.jpg']);
    setCustomImageUrl('');
    setActivePreviewIndex(0);
    setPDescription('Handmade with double-waffle stitch using soft milk cotton yarn.');
    setPDimensions('14" x 10.5" (Fits 13-14" laptops)');
    setPYarn('100% Premium Milk Cotton Yarn');
    setPBadge('New Arrival');
    setPColors('Pastel Lavender, Cream, Sage');
    setPInStock(true);
  };

  const openAddProductModal = () => {
    resetForm();
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProductId(prod.id);
    setPName(prod.name || '');
    setPCategory(prod.category || 'Laptop Bags');
    setPPrice((prod.price || '').toString());
    setPOriginalPrice((prod.originalPrice || Math.round((prod.price || 150) * 1.25)).toString());
    const initialImages = (Array.isArray(prod.images) && prod.images.length > 0)
      ? prod.images
      : [prod.image || '/images/laptop_bag_lavender.jpg'];
    setPImages(initialImages);
    setCustomImageUrl('');
    setActivePreviewIndex(0);
    setPDescription(prod.description || '');
    setPDimensions(prod.dimensions || '');
    setPYarn(prod.yarnMaterial || '');
    setPBadge(prod.badge || '');
    setPColors(prod.colorOptions ? prod.colorOptions.join(', ') : '');
    setPInStock(prod.inStock !== false);
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    if (!pName.trim()) {
      showToast('Please enter a Product Name', 'error');
      return;
    }
    if (!pPrice || isNaN(pPrice) || Number(pPrice) <= 0) {
      showToast('Please enter a valid Price in ₹', 'error');
      return;
    }

    setSavingProduct(true);
    
    const prodId = editingProductId || 'prod-' + Date.now();
    const primaryCover = pImages[0] || '/images/laptop_bag_lavender.jpg';
    const allImages = pImages.length > 0 ? pImages : [primaryCover];

    const payload = {
      id: prodId,
      name: pName.trim(),
      category: pCategory.trim(),
      categorySlug: (pCategory || 'laptop-bags').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      price: Number(pPrice),
      originalPrice: pOriginalPrice ? Number(pOriginalPrice) : Math.round(Number(pPrice) * 1.25),
      image: primaryCover,
      images: allImages,
      description: pDescription || 'Handcrafted artisan crochet design.',
      dimensions: pDimensions || 'Standard handcrafted dimensions',
      yarnMaterial: pYarn || '100% Premium Milk Cotton Yarn',
      badge: pBadge || 'New Arrival',
      colorOptions: pColors ? pColors.split(',').map(s => s.trim()).filter(Boolean) : ['Original'],
      inStock: pInStock,
      rating: 5.0,
      reviewsCount: 1,
      createdAt: new Date().toISOString()
    };

    try {
      const activeToken = token || localStorage.getItem('stitch_token');
      const url = editingProductId ? `/api/products/${encodeURIComponent(editingProductId)}` : '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server returned status ${res.status}`);
      }

      const data = await res.json();
      const savedProd = data.product || payload;

      // 1. Instantly register updated product in local store state and persistent storage
      if (editingProductId) {
        updateProductLocal(savedProd);
        updateProductPrice(editingProductId, Number(pPrice));
      } else {
        addProductLocal(savedProd);
      }

      showToast(editingProductId ? 'Product & images updated successfully! ✨' : `"${payload.name}" published to store! 🎉`, 'success');
      setProductModalOpen(false);
      resetForm();
      setActiveTab('products');
      await fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      showToast(err.message || 'Failed to save product to server', 'error');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (prodId, prodName) => {
    if (!window.confirm(`Are you sure you want to delete "${prodName}" from the store catalog?`)) return;

    // Immediately remove from UI
    deleteProductLocal(prodId);

    try {
      const activeToken = token || localStorage.getItem('stitch_token');
      const res = await fetch(`/api/products/${encodeURIComponent(prodId)}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${activeToken}`,
          'Content-Type': 'application/json'
        }
      });
      if (res.ok) {
        showToast(`"${prodName}" deleted from store catalog`, 'info');
        await fetchProducts();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Failed to delete product from server', 'error');
        await fetchProducts();
      }
    } catch (err) {
      console.error('Delete product error:', err);
      showToast('Deleted locally from browser catalog', 'info');
      await fetchProducts();
    }
  };

  const handleQuickPriceUpdate = async (prodId) => {
    const rawVal = quickPrices[prodId];
    if (rawVal === undefined || rawVal === '' || isNaN(rawVal) || Number(rawVal) <= 0) return;
    const newPrice = Number(rawVal);

    // Clear editing buffer immediately
    setQuickPrices((prev) => {
      const next = { ...prev };
      delete next[prodId];
      return next;
    });

    // Immediately update price across state, overrides, custom products, and backend
    await updateProductPrice(prodId, newPrice);
    showToast(`Price updated to ₹${newPrice}! 🎉`, 'success');

    // Refresh products to sync everything
    try {
      await fetchProducts();
    } catch {}
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      const activeToken = token || localStorage.getItem('stitch_token');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showToast(`Order #${orderId} marked as "${newStatus}"`, 'success');
        fetchAdminOrders();
      }
    } catch {
      showToast('Failed to update order status', 'error');
    }
  };

  // Delete Individual Order Handler
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId} permanently from database?`)) return;

    try {
      const activeToken = token || localStorage.getItem('stitch_token');
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (res.ok) {
        showToast(`Order #${orderId} deleted successfully`, 'info');
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        const data = await res.json();
        showToast(data.error || 'Failed to delete order', 'error');
      }
    } catch (err) {
      showToast('Error deleting order', 'error');
    }
  };

  // Clear All Orders Handler
  const handleClearAllOrders = async () => {
    if (orders.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ALL ${orders.length} orders from the database? This action cannot be undone.`)) return;

    try {
      const activeToken = token || localStorage.getItem('stitch_token');
      const res = await fetch('/api/orders/all/clear', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (res.ok) {
        showToast('All customer orders cleared from database', 'info');
        setOrders([]);
      } else {
        showToast('Failed to clear orders', 'error');
      }
    } catch (err) {
      showToast('Error clearing orders', 'error');
    }
  };

  const totalOrderRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <>
      <div 
        className="fixed inset-0 flex items-center justify-center p-2 sm:p-5 overflow-y-auto"
        style={{ zIndex: 9990 }}
      >
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
          onClick={onClose}
        />

        {/* Admin Panel Container */}
        <div className="relative w-full max-w-6xl rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl bg-white border border-[#CBB6ED] z-10 animate-scale-up max-h-[92vh] flex flex-col text-left">
          
          {/* 1. Header (Fixed Height, No Overlap) */}
          <div className="px-6 py-5 sm:px-8 sm:py-6 bg-gradient-to-r from-[#1D4548] via-[#2B6064] to-[#1D4548] text-white flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-[#E9C46A] flex items-center justify-center border border-white/20 shadow-inner">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-tight">
                    Stitch & Hook Administrator Portal
                  </h2>
                  <span className="bg-[#E9C46A] text-[#133032] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Admin Active
                  </span>
                </div>
                <p className="text-xs text-[#C4E1DE] mt-0.5">
                  Logged in as <strong>{user.email}</strong> • WhatsApp Orders: <strong>+91 {BUSINESS_PHONE}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openAddProductModal}
                className="px-4 py-2.5 rounded-2xl bg-[#E9C46A] hover:bg-[#fcd264] text-[#133032] text-xs font-extrabold transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Product</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer border border-white/20"
                title="Close Admin Portal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 2. Navigation Tabs (Clean Pill Style, Perfectly Aligned) */}
          <div className="bg-[#F6F2EB] border-b border-[#EDE4D6] px-6 sm:px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
            {[
              { id: 'orders', label: `Customer WhatsApp Orders (${orders.length})`, icon: MessageSquare },
              { id: 'products', label: `Manage Products (${products.length})`, icon: Package },
              { id: 'add-product', label: '+ Create Product Form', icon: Plus },
              { id: 'analytics', label: 'Store Overview & Metrics', icon: TrendingUp }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'add-product') resetForm();
                  }}
                  className={`py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer whitespace-nowrap shadow-2xs ${
                    active
                      ? 'bg-[#1D4548] text-white shadow-md'
                      : 'bg-white/80 text-gray-600 hover:text-gray-950 hover:bg-white border border-[#EDE4D6]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-[#E9C46A]' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* 3. Main Body Scrollable Content */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-[#FAF8F5]/60">
            
            {/* TAB 1: WhatsApp Orders Management */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                
                {/* Header Action Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EDE4D6] shadow-xs">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-serif">Customer WhatsApp Orders</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Direct WhatsApp orders recorded for fulfillment on <strong>+91 {BUSINESS_PHONE}</strong>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {orders.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAllOrders}
                        className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-extrabold border border-red-200 flex items-center gap-1.5 cursor-pointer transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Clear All Orders
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={fetchAdminOrders}
                      className="px-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EDE4D6] text-xs font-bold text-gray-700 hover:bg-white flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} /> Refresh Orders
                    </button>
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="py-16 text-center text-xs text-gray-400 bg-white rounded-3xl border border-[#EDE4D6]">
                    <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-2 text-[#8A68E8]" />
                    Loading customer orders from database...
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((ord) => (
                      <div 
                        key={ord.id}
                        className="p-5 sm:p-6 rounded-3xl bg-white border border-[#EDE4D6] shadow-xs hover:shadow-md transition space-y-4 text-left"
                      >
                        {/* Order Top Bar: ID, Date, Customer & Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
                          <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-mono font-extrabold text-sm text-[#1D4548] bg-[#F5EFE6] px-2.5 py-0.5 rounded-lg border border-[#EDE4D6]">
                                #{ord.id}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(ord.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-gray-800 mt-1 flex items-center gap-1">
                              <span>Customer:</span>
                              <strong className="text-[#1D4548]">{ord.customerName}</strong>
                              {ord.customerPhone && (
                                <span className="text-gray-500 font-semibold">(📞 {ord.customerPhone})</span>
                              )}
                            </p>
                          </div>

                          {/* Status Dropdown & Delete Button */}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1 rounded-xl border border-[#EDE4D6]">
                              <span className="text-[11px] font-bold text-gray-500">Status:</span>
                              <select
                                value={ord.status || 'WhatsApp Checkout Initiated'}
                                onChange={(e) => handleOrderStatusUpdate(ord.id, e.target.value)}
                                className="text-xs font-extrabold text-gray-800 bg-transparent focus:outline-none cursor-pointer"
                              >
                                <option value="WhatsApp Checkout Initiated">WhatsApp Initiated</option>
                                <option value="Payment Confirmed">Payment Confirmed</option>
                                <option value="Crocheting in Progress">Crocheting in Progress</option>
                                <option value="Shipped">Dispatched / Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </div>

                            {/* Delete Order Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(ord.id)}
                              className="p-2 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-600 transition cursor-pointer border border-transparent hover:border-red-200"
                              title="Delete this order"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Order Items List */}
                        <div className="bg-[#FAF8F5] p-4 rounded-2xl space-y-2 text-xs text-gray-700 border border-[#EDE4D6]/50">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                            Items Ordered:
                          </span>
                          {ord.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center font-medium">
                              <span className="text-gray-900 font-bold">
                                • {item.name} {item.selectedColor ? <span className="text-[#8A68E8] font-semibold">[{item.selectedColor}]</span> : ''} × {item.quantity}
                              </span>
                              <span className="font-extrabold text-[#1D4548]">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Bottom Bar: Address, Total & WhatsApp Action */}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                          {ord.shippingAddress ? (
                            <span className="text-gray-600 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-[#E76F51] shrink-0" />
                              <span>
                                <strong>Ship to:</strong> {ord.shippingAddress.street}, {ord.shippingAddress.city} ({ord.shippingAddress.pincode})
                              </span>
                            </span>
                          ) : (
                            <span className="text-gray-400 italic flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-gray-300" /> Direct coordinate via WhatsApp
                            </span>
                          )}

                          <div className="flex items-center gap-4">
                            <span className="text-base font-serif font-extrabold text-[#1D4548]">
                              Total: ₹{ord.totalAmount}
                            </span>
                            <a
                              href={`https://wa.me/91${ord.customerPhone || BUSINESS_PHONE}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-whatsapp-lux text-xs py-2 px-4 flex items-center gap-1.5 shadow-sm hover:shadow-md"
                            >
                              <MessageSquare className="w-3.5 h-3.5 fill-white" /> WhatsApp Customer
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-3xl border border-[#EDE4D6]">
                    <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-gray-600">No customer WhatsApp orders recorded yet.</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">When customers place orders, they will appear here in real-time.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Products Catalog & Inline Price Editor */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                
                {/* Action Banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#EDE4D6] shadow-xs">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-serif">Product Catalog & Pricing Control</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Instantly update prices in ₹ INR, add new crochet creations, or change stock availability.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        showToast('Syncing store catalog...', 'info');
                        await fetchProducts();
                        showToast('Catalog refreshed and synchronized! ✨', 'success');
                      }}
                      className="px-3.5 py-2.5 rounded-xl border border-[#EDE4D6] bg-white hover:bg-gray-50 text-xs font-extrabold text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-2xs transition"
                      title="Force refresh and sync store catalog"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#2B6064]" />
                      <span>Sync Store</span>
                    </button>
                    <button
                      type="button"
                      onClick={openAddProductModal}
                      className="btn-primary-artisan text-xs py-2.5 px-5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" /> Add New Item
                    </button>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-3xl border border-[#EDE4D6] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF8F5] border-b border-[#EDE4D6] text-gray-600 font-extrabold uppercase tracking-wider text-[11px]">
                          <th className="py-3.5 px-4">Creation</th>
                          <th className="py-3.5 px-4">Category</th>
                          <th className="py-3.5 px-4">Current Price (₹)</th>
                          <th className="py-3.5 px-4">Quick Price Editor</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-medium">
                        {products.map((prod) => (
                          <tr key={prod.id} className="hover:bg-[#FDFBF7] transition">
                            {/* Product Info */}
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <div 
                                className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#EDE4D6] shrink-0 bg-white group/thumb cursor-pointer shadow-xs"
                                onClick={() => openEditProductModal(prod)}
                                title="Click to change product image or details"
                              >
                                <img
                                  src={prod.image || '/images/laptop_bag_lavender.jpg'}
                                  alt={prod.name}
                                  className="w-full h-full object-cover group-hover/thumb:scale-110 transition duration-300"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/laptop_bag_lavender.jpg';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                                  <Camera className="w-3.5 h-3.5 text-white" />
                                </div>
                              </div>
                              <div>
                                <p className="font-extrabold text-gray-900 line-clamp-1">{prod.name}</p>
                                <span className="text-[10px] text-[#8A68E8] font-bold">{prod.badge || 'Handmade'}</span>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="py-3.5 px-4">
                              <span className="bg-[#EFE9FA] text-[#5F32C4] px-2.5 py-1 rounded-full text-[10px] font-bold">
                                {prod.category}
                              </span>
                            </td>

                            {/* Current Price */}
                            <td className="py-3.5 px-4">
                              <span className="text-sm font-black text-[#1D4548]">₹{prod.price}</span>
                            </td>

                            {/* Inline Quick Price Editor */}
                            <td className="py-3.5 px-4">
                              {(() => {
                                const isEditing = quickPrices[prod.id] !== undefined && quickPrices[prod.id] !== '';
                                const currentVal = isEditing ? quickPrices[prod.id] : prod.price;
                                const isDifferent = isEditing && Number(quickPrices[prod.id]) !== Number(prod.price);

                                return (
                                  <div className="flex items-center gap-1.5">
                                    <div className="relative flex items-center">
                                      <span className="absolute left-2.5 text-gray-400 font-extrabold text-xs">₹</span>
                                      <input
                                        type="number"
                                        value={currentVal}
                                        onFocus={(e) => e.target.select()}
                                        onChange={(e) => setQuickPrices({ ...quickPrices, [prod.id]: e.target.value })}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleQuickPriceUpdate(prod.id);
                                          }
                                        }}
                                        onBlur={() => {
                                          if (isDifferent) {
                                            handleQuickPriceUpdate(prod.id);
                                          }
                                        }}
                                        className={`w-24 pl-6 pr-2 py-1 text-xs font-black rounded-xl border transition cursor-text ${
                                          isDifferent
                                            ? 'border-[#25D366] bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200'
                                            : 'border-[#EDE4D6] bg-white text-gray-800 hover:border-[#8A68E8]'
                                        } focus:outline-none focus:border-[#8A68E8] focus:ring-2 focus:ring-[#8A68E8]/20`}
                                        title="Type new price and press Enter, click Save, or click away"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleQuickPriceUpdate(prod.id);
                                      }}
                                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition cursor-pointer shrink-0 shadow-xs ${
                                        isDifferent
                                          ? 'bg-[#25D366] hover:bg-[#1ebd5d] text-white shadow-md scale-105 animate-pulse'
                                          : 'bg-gray-100 text-gray-500 hover:bg-[#EFE9FA] hover:text-[#5F32C4]'
                                      }`}
                                      title={isDifferent ? `Click to save price change (or press Enter)` : 'Save Price'}
                                    >
                                      {isDifferent ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                                      <span>{isDifferent ? `Save ₹${quickPrices[prod.id]}` : 'Save'}</span>
                                    </button>
                                  </div>
                                );
                              })()}
                            </td>

                            {/* Stock Status */}
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                prod.inStock !== false
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {prod.inStock !== false ? '● In Stock' : '✕ Out of Stock'}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => openEditProductModal(prod)}
                                  className="p-1.5 rounded-xl bg-gray-100 hover:bg-[#EFE9FA] text-gray-700 hover:text-[#5F32C4] transition cursor-pointer"
                                  title="Edit Full Details"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="p-1.5 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 transition cursor-pointer"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: Embedded Create Product Form */}
            {activeTab === 'add-product' && (
              <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-[#EDE4D6] shadow-sm">
                <div className="pb-4 border-b border-gray-100 mb-6">
                  <h3 className="text-xl font-serif font-bold text-gray-900">
                    {editingProductId ? 'Edit Existing Product' : 'Add New Crochet Creation'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Fill out the form below to publish handcrafted products directly into the store catalog.
                  </p>
                </div>

                <form onSubmit={handleSaveProduct} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={pName}
                        onChange={(e) => setPName(e.target.value)}
                        placeholder="e.g. Lavender Blossom Laptop Sleeve"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] font-semibold text-gray-800 focus:outline-none focus:border-[#8A68E8]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                        Category *
                      </label>
                      <select
                        value={pCategory}
                        onChange={(e) => setPCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] font-bold text-gray-800 focus:outline-none focus:border-[#8A68E8]"
                      >
                        <option value="Laptop Bags">Laptop Bags (₹150–200)</option>
                        <option value="Buds Cases">Buds Cases (₹70–100)</option>
                        <option value="Keychains">Keychains (₹70)</option>
                        <option value="Spiderman Keychains">Spiderman Keychains (₹80)</option>
                        <option value="Tote Bags">Tote Bags</option>
                        <option value="Special Amigurumi">Special Amigurumi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                        Store Price (₹ INR) *
                      </label>
                      <input
                        type="number"
                        required
                        value={pPrice}
                        onChange={(e) => setPPrice(e.target.value)}
                        placeholder="180"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] font-extrabold text-[#1D4548] focus:outline-none focus:border-[#8A68E8]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                        Strikethrough Price (₹)
                      </label>
                      <input
                        type="number"
                        value={pOriginalPrice}
                        onChange={(e) => setPOriginalPrice(e.target.value)}
                        placeholder="220"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#8A68E8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-[#8A68E8]" />
                        <span>Product Images Gallery ({pImages.length} photo{pImages.length > 1 ? 's' : ''}) *</span>
                      </span>
                      <span className="text-[10px] text-[#8A68E8] font-bold">Select multiple photos from device, paste URLs, or choose presets</span>
                    </label>

                    <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EDE4D6] space-y-3.5">
                      {/* Action Bar: Multiple Upload + Direct URL */}
                      <div className="flex flex-col sm:flex-row gap-2.5">
                        {/* Device Multi-Photo Uploader */}
                        <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border-2 border-dashed border-[#8A68E8] text-[#5F32C4] hover:bg-[#F3EEFC] rounded-xl text-xs font-bold cursor-pointer transition shadow-xs">
                          <Upload className="w-4 h-4 text-[#8A68E8]" />
                          <span>Upload Photos from Device (Multi-Select)</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleMultipleImageUpload}
                            className="hidden"
                          />
                        </label>

                        {/* Direct URL input with Add button */}
                        <div className="flex-1 flex gap-1.5">
                          <input
                            type="text"
                            value={customImageUrl}
                            onChange={(e) => setCustomImageUrl(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomImageUrl();
                              }
                            }}
                            placeholder="or paste Image URL (https://...)"
                            className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#8A68E8]"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomImageUrl}
                            disabled={!customImageUrl.trim()}
                            className="px-3 py-2 rounded-xl bg-[#8A68E8] hover:bg-[#7454D1] disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add
                          </button>
                        </div>
                      </div>

                      {/* Artisan Presets */}
                      <div>
                        <p className="text-[10px] font-extrabold text-gray-500 mb-1.5 uppercase tracking-wider">
                          Or add artisan presets to gallery:
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {curatedImageOptions.map((opt) => {
                            const isSelected = pImages.includes(opt.value);
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleTogglePreset(opt.value)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#EFE9FA] border-[#8A68E8] text-[#5F32C4] shadow-xs ring-1 ring-[#8A68E8]'
                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                }`}
                              >
                                <img
                                  src={opt.value}
                                  alt=""
                                  className="w-4 h-4 rounded-md object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                                <span className="truncate max-w-[120px]">{opt.label}</span>
                                {isSelected ? <Check className="w-3 h-3 text-[#8A68E8]" /> : <Plus className="w-2.5 h-2.5 text-gray-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Multi-Image Thumbnail Gallery Grid */}
                      <div className="pt-2.5 border-t border-[#EDE4D6]/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                            Selected Images ({pImages.length}):
                          </span>
                          <span className="text-[10px] text-gray-400">
                            ★ Cover Image will be shown on catalog cards
                          </span>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                          {pImages.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              onClick={() => setActivePreviewIndex(idx)}
                              className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white aspect-square shadow-xs ${
                                idx === 0
                                  ? 'border-[#8A68E8] ring-2 ring-[#8A68E8]/30'
                                  : activePreviewIndex === idx
                                  ? 'border-[#4E878C] ring-2 ring-[#4E878C]/20'
                                  : 'border-gray-200 hover:border-gray-400'
                              }`}
                            >
                              <img
                                src={imgUrl}
                                alt={`Product ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = '/images/laptop_bag_lavender.jpg';
                                }}
                              />

                              {/* Primary / Cover Badge or Set Cover Button */}
                              {idx === 0 ? (
                                <span className="absolute top-1 left-1 bg-[#8A68E8] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 z-10">
                                  <Star className="w-2 h-2 fill-current" /> Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleMakeCoverImage(idx);
                                  }}
                                  className="absolute top-1 left-1 bg-black/70 hover:bg-[#8A68E8] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                                  title="Make this the catalog cover"
                                >
                                  Make Cover
                                </button>
                              )}

                              {/* Remove Button */}
                              {pImages.length > 1 && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveImage(idx);
                                  }}
                                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[10px] font-bold opacity-80 group-hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                                  title="Remove image"
                                >
                                  ✕
                                </button>
                              )}

                              {/* Currently Viewing Indicator */}
                              {activePreviewIndex === idx && (
                                <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                                  Preview
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={pDescription}
                      onChange={(e) => setPDescription(e.target.value)}
                      placeholder="Product craftsmanship details and stitch pattern..."
                      className="w-full px-3.5 py-2 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                        Badge Tag
                      </label>
                      <input
                        type="text"
                        value={pBadge}
                        onChange={(e) => setPBadge(e.target.value)}
                        placeholder="e.g. Bestseller, Trending, Artisan Pick"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EDE4D6] bg-[#FAF8F5] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                        Colorways (comma separated)
                      </label>
                      <input
                        type="text"
                        value={pColors}
                        onChange={(e) => setPColors(e.target.value)}
                        placeholder="Lavender, Teal, Cream"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EDE4D6] bg-[#FAF8F5] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="pInStockCheckForm"
                      checked={pInStock}
                      onChange={(e) => setPInStock(e.target.checked)}
                      className="rounded text-[#1D4548] accent-[#1D4548] cursor-pointer"
                    />
                    <label htmlFor="pInStockCheckForm" className="text-xs text-gray-700 font-bold cursor-pointer">
                      Product is Available In-Stock
                    </label>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveTab('products');
                      }}
                      className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingProduct}
                      className="btn-primary-artisan text-xs py-2.5 px-6 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {savingProduct ? 'Saving...' : (editingProductId ? 'Save Changes' : 'Publish Product to Store')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: Store Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-5 rounded-3xl bg-white border border-[#EDE4D6] shadow-xs">
                    <span className="text-xs font-extrabold uppercase text-gray-400 block mb-1">Active Creations</span>
                    <span className="text-3xl font-serif font-extrabold text-[#1D4548]">{products.length} Products</span>
                    <span className="text-[11px] text-[#8A68E8] font-bold block mt-1">Live in store catalog</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white border border-[#EDE4D6] shadow-xs">
                    <span className="text-xs font-extrabold uppercase text-gray-400 block mb-1">Total Order Inquiries</span>
                    <span className="text-3xl font-serif font-extrabold text-[#2B6064]">{orders.length} Orders</span>
                    <span className="text-[11px] text-emerald-600 font-bold block mt-1">WhatsApp checkouts initiated</span>
                  </div>

                  <div className="p-5 rounded-3xl bg-white border border-[#EDE4D6] shadow-xs">
                    <span className="text-xs font-extrabold uppercase text-gray-400 block mb-1">Total Inquiry Value</span>
                    <span className="text-3xl font-serif font-extrabold text-[#E76F51]">₹{totalOrderRevenue}</span>
                    <span className="text-[11px] text-gray-500 font-bold block mt-1">Gross WhatsApp pipeline</span>
                  </div>
                </div>

                {/* Price Compliance Guidelines */}
                <div className="p-6 rounded-3xl bg-white border border-[#E0D4F5] shadow-xs space-y-3">
                  <h4 className="text-base font-serif font-bold text-gray-900">Configured Price Tier Guidelines</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EDE4D6]">
                      <span className="font-bold text-gray-500 block">Laptop Bags</span>
                      <span className="text-sm font-extrabold text-[#1D4548]">₹150 – ₹200</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EDE4D6]">
                      <span className="font-bold text-gray-500 block">Buds Cases</span>
                      <span className="text-sm font-extrabold text-[#1D4548]">₹70 – ₹100</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EDE4D6]">
                      <span className="font-bold text-gray-500 block">Keychains</span>
                      <span className="text-sm font-extrabold text-[#1D4548]">₹70</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EDE4D6]">
                      <span className="font-bold text-gray-500 block">Spiderman Keychains</span>
                      <span className="text-sm font-extrabold text-[#1D4548]">₹80</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      {/* Pop-up Add / Edit Product Modal with Top-Level inline zIndex */}
      {productModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          style={{ zIndex: 99999 }}
        >
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-xs" 
            onClick={() => setProductModalOpen(false)} 
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl border border-[#CBB6ED] p-6 sm:p-8 max-h-[92vh] overflow-y-auto text-left animate-scale-up" style={{ zIndex: 100000 }}>
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
              <div>
                <h3 className="text-xl font-serif font-bold text-gray-900">
                  {editingProductId ? 'Edit Product & Price' : 'Add New Crochet Creation'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Publish handcrafted items to the live customer catalog in real-time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProductModalOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:text-gray-900 flex items-center justify-center cursor-pointer shadow-2xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Lavender Blossom Laptop Sleeve"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] font-semibold text-gray-800 focus:outline-none focus:border-[#8A68E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] font-bold text-gray-800 focus:outline-none focus:border-[#8A68E8]"
                  >
                    <option value="Laptop Bags">Laptop Bags (₹150–200)</option>
                    <option value="Buds Cases">Buds Cases (₹70–100)</option>
                    <option value="Keychains">Keychains (₹70)</option>
                    <option value="Spiderman Keychains">Spiderman Keychains (₹80)</option>
                    <option value="Tote Bags">Tote Bags</option>
                    <option value="Special Amigurumi">Special Amigurumi</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Store Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="180"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] font-extrabold text-[#1D4548] focus:outline-none focus:border-[#8A68E8]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Strikethrough Price (₹)
                  </label>
                  <input
                    type="number"
                    value={pOriginalPrice}
                    onChange={(e) => setPOriginalPrice(e.target.value)}
                    placeholder="220"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] focus:outline-none focus:border-[#8A68E8]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#8A68E8]" />
                    <span>Product Images Gallery ({pImages.length} photo{pImages.length > 1 ? 's' : ''}) *</span>
                  </span>
                  <span className="text-[10px] text-[#8A68E8] font-bold">Select multiple photos from device, paste URLs, or choose presets</span>
                </label>

                <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#EDE4D6] space-y-3.5">
                  {/* Action Bar: Multiple Upload + Direct URL */}
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    {/* Device Multi-Photo Uploader */}
                    <label className="flex-1 flex items-center justify-center gap-2 px-3.5 py-2.5 bg-white border-2 border-dashed border-[#8A68E8] text-[#5F32C4] hover:bg-[#F3EEFC] rounded-xl text-xs font-bold cursor-pointer transition shadow-xs">
                      <Upload className="w-4 h-4 text-[#8A68E8]" />
                      <span>Upload Photos from Device (Multi-Select)</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleImageUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Direct URL input with Add button */}
                    <div className="flex-1 flex gap-1.5">
                      <input
                        type="text"
                        value={customImageUrl}
                        onChange={(e) => setCustomImageUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomImageUrl();
                          }
                        }}
                        placeholder="or paste Image URL (https://...)"
                        className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-[#8A68E8]"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomImageUrl}
                        disabled={!customImageUrl.trim()}
                        className="px-3 py-2 rounded-xl bg-[#8A68E8] hover:bg-[#7454D1] disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>

                  {/* Artisan Presets */}
                  <div>
                    <p className="text-[10px] font-extrabold text-gray-500 mb-1.5 uppercase tracking-wider">
                      Or add artisan presets to gallery:
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                      {curatedImageOptions.map((opt) => {
                        const isSelected = pImages.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleTogglePreset(opt.value)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                              isSelected
                                ? 'bg-[#EFE9FA] border-[#8A68E8] text-[#5F32C4] shadow-xs ring-1 ring-[#8A68E8]'
                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            <img
                              src={opt.value}
                              alt=""
                              className="w-4 h-4 rounded-md object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            <span className="truncate max-w-[120px]">{opt.label}</span>
                            {isSelected ? <Check className="w-3 h-3 text-[#8A68E8]" /> : <Plus className="w-2.5 h-2.5 text-gray-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-Image Thumbnail Gallery Grid */}
                  <div className="pt-2.5 border-t border-[#EDE4D6]/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-gray-700">
                        Selected Images ({pImages.length}):
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ★ Cover Image will be shown on catalog cards
                      </span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                      {pImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          onClick={() => setActivePreviewIndex(idx)}
                          className={`relative group rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white aspect-square shadow-xs ${
                            idx === 0
                              ? 'border-[#8A68E8] ring-2 ring-[#8A68E8]/30'
                              : activePreviewIndex === idx
                              ? 'border-[#4E878C] ring-2 ring-[#4E878C]/20'
                              : 'border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          <img
                            src={imgUrl}
                            alt={`Product ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/laptop_bag_lavender.jpg';
                            }}
                          />

                          {/* Primary / Cover Badge or Set Cover Button */}
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-[#8A68E8] text-white text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 z-10">
                              <Star className="w-2 h-2 fill-current" /> Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMakeCoverImage(idx);
                              }}
                              className="absolute top-1 left-1 bg-black/70 hover:bg-[#8A68E8] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                              title="Make this the catalog cover"
                            >
                              Make Cover
                            </button>
                          )}

                          {/* Remove Button */}
                          {pImages.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveImage(idx);
                              }}
                              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[10px] font-bold opacity-80 group-hover:opacity-100 transition shadow-xs cursor-pointer z-10"
                              title="Remove image"
                            >
                              ✕
                            </button>
                          )}

                          {/* Currently Viewing Indicator */}
                          {activePreviewIndex === idx && (
                            <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[8px] px-1 py-0.5 rounded font-bold">
                              Preview
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={pDescription}
                  onChange={(e) => setPDescription(e.target.value)}
                  placeholder="Product craftsmanship details and stitch pattern..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#EDE4D6] text-xs bg-[#FAF8F5] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={pBadge}
                    onChange={(e) => setPBadge(e.target.value)}
                    placeholder="e.g. Bestseller, Trending, Artisan Pick"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EDE4D6] bg-[#FAF8F5] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1">
                    Colorways (comma separated)
                  </label>
                  <input
                    type="text"
                    value={pColors}
                    onChange={(e) => setPColors(e.target.value)}
                    placeholder="Lavender, Teal, Cream"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EDE4D6] bg-[#FAF8F5] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pInStockCheckModalPop"
                  checked={pInStock}
                  onChange={(e) => setPInStock(e.target.checked)}
                  className="rounded text-[#1D4548] accent-[#1D4548] cursor-pointer"
                />
                <label htmlFor="pInStockCheckModalPop" className="text-xs text-gray-700 font-bold cursor-pointer">
                  Product is Available In-Stock
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="btn-primary-artisan text-xs py-2.5 px-6 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {savingProduct ? 'Saving...' : (editingProductId ? 'Save Changes' : 'Publish Product to Store')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
