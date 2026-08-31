import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { createSingleProductWhatsAppLink, createCartWhatsAppLink, BUSINESS_PHONE } from '../utils/whatsapp';
import confetti from 'canvas-confetti';

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const { user, token } = useAuth();

  // Helper to read persistent admin overrides from localStorage
  const getStoredOverrides = () => {
    try {
      const saved = localStorage.getItem('stitch_admin_products_override');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const getDeletedIds = () => {
    try {
      const saved = localStorage.getItem('stitch_deleted_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  const getCustomProducts = () => {
    try {
      const saved = localStorage.getItem('stitch_custom_products');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };

  // Merge server products with client persistent overrides
  const applyOverrides = (backendProducts) => {
    if (!Array.isArray(backendProducts)) return [];
    const overrides = getStoredOverrides();
    const deletedIds = getDeletedIds();
    const customProds = getCustomProducts();

    // 1. Remove deleted products
    let merged = backendProducts.filter((p) => !deletedIds.includes(p.id));

    // 2. Apply admin edits (e.g. updated prices, titles, etc.)
    merged = merged.map((p) => {
      if (overrides[p.id]) {
        return { ...p, ...overrides[p.id] };
      }
      return p;
    });

    // 3. Include any newly created products
    for (const cp of customProds) {
      if (!deletedIds.includes(cp.id) && !merged.some((p) => p.id === cp.id)) {
        merged.unshift(overrides[cp.id] ? { ...cp, ...overrides[cp.id] } : cp);
      }
    }

    return merged;
  };

  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('stitch_products_cache');
      if (cached) {
        return applyOverrides(JSON.parse(cached));
      }
      return [];
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(250);
  const [sortBy, setSortBy] = useState('featured');

  // Drawers & Modals
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);
  const [customOrderOpen, setCustomOrderOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Cart & Wishlist
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('stitch_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('stitch_wishlist');
      return saved ? JSON.parse(saved) : ['prod-lb-1', 'prod-kc-1'];
    } catch {
      return [];
    }
  });

  // Toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Optimistic & Persistent Product Update Helper
  const updateProductLocal = (updatedProduct) => {
    if (!updatedProduct || !updatedProduct.id) return;
    
    // Save to persistent overrides in localStorage
    try {
      const overrides = getStoredOverrides();
      overrides[updatedProduct.id] = { ...(overrides[updatedProduct.id] || {}), ...updatedProduct };
      localStorage.setItem('stitch_admin_products_override', JSON.stringify(overrides));
    } catch {}

    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p));
      try {
        localStorage.setItem('stitch_products_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Optimistic & Persistent Add Product Helper
  const addProductLocal = (newProduct) => {
    if (!newProduct || !newProduct.id) return;
    try {
      const customProds = getCustomProducts();
      customProds.unshift(newProduct);
      localStorage.setItem('stitch_custom_products', JSON.stringify(customProds));
    } catch {}

    setProducts((prev) => {
      const updated = [newProduct, ...prev.filter((p) => p.id !== newProduct.id)];
      try {
        localStorage.setItem('stitch_products_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Optimistic & Persistent Delete Product Helper
  const deleteProductLocal = (productId) => {
    if (!productId) return;
    try {
      const deletedIds = getDeletedIds();
      if (!deletedIds.includes(productId)) {
        deletedIds.push(productId);
        localStorage.setItem('stitch_deleted_products', JSON.stringify(deletedIds));
      }
      const overrides = getStoredOverrides();
      delete overrides[productId];
      localStorage.setItem('stitch_admin_products_override', JSON.stringify(overrides));
      
      const customProds = getCustomProducts().filter((p) => p.id !== productId);
      localStorage.setItem('stitch_custom_products', JSON.stringify(customProds));
    } catch {}

    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        localStorage.setItem('stitch_products_cache', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Fetch Products & Categories
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);
      if (maxPrice < 250) params.append('maxPrice', maxPrice);
      if (sortBy !== 'featured') params.append('sort', sortBy);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products)) {
          const finalMerged = applyOverrides(data.products);
          setProducts(finalMerged);
          if (selectedCategory === 'all' && !searchQuery && maxPrice >= 250 && sortBy === 'featured') {
            try {
              localStorage.setItem('stitch_products_cache', JSON.stringify(finalMerged));
            } catch {}
          }
        }
      }

      const catRes = await fetch('/api/products/categories');
      if (catRes.ok) {
        const catData = await catRes.json();
        if (catData.categories) setCategories(catData.categories);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, maxPrice, sortBy]);

  // Persist Cart & Wishlist
  useEffect(() => {
    localStorage.setItem('stitch_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('stitch_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Add to Cart
  const addToCart = (product, quantity = 1, selectedColor = '') => {
    const color = selectedColor || product.colorOptions?.[0] || 'Original';
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedColor === color
      );

      if (existingIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { product, quantity, selectedColor: color }];
      }
    });

    showToast(`Added "${product.name}" to your basket! 🧺`, 'success');
  };

  // Update Cart Quantity
  const updateCartQuantity = (productId, selectedColor, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId && item.selectedColor === selectedColor) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  // Remove from Cart
  const removeFromCart = (productId, selectedColor) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.selectedColor === selectedColor)
      )
    );
    showToast('Item removed from basket', 'info');
  };

  // Clear Cart
  const clearCart = () => {
    setCart([]);
  };

  // Toggle Wishlist
  const toggleWishlist = (productId) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from saved wishlist', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Saved to your wishlist! 💖', 'success');
        return [...prev, productId];
      }
    });
  };

  // Single Item Direct Buy Now (WhatsApp)
  const triggerDirectBuyNow = async (product, quantity = 1, selectedColor = '') => {
    const color = selectedColor || product.colorOptions?.[0] || 'Original';
    
    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.75 },
        colors: ['#8A68E8', '#2B6064', '#FCD5CE', '#E9C46A']
      });
    } catch {}

    // Record order in backend
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: user?.name || 'Customer',
          customerPhone: user?.phone || '',
          customerEmail: user?.email || '',
          shippingAddress: user?.addresses?.find(a => a.isDefault) || null,
          items: [{
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity,
            selectedColor: color
          }],
          totalAmount: product.price * quantity,
          whatsappNumber: BUSINESS_PHONE
        })
      });
    } catch (e) {
      console.warn('Could not record order backend trace:', e);
    }

    const waLink = createSingleProductWhatsAppLink({
      product,
      quantity,
      selectedColor: color,
      user
    });

    showToast(`Directing to WhatsApp (+91 ${BUSINESS_PHONE})... 💬`, 'success');
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  // Full Cart Checkout Flow
  const triggerCartCheckout = async (customAddress = null, promoDiscount = 0) => {
    if (cart.length === 0) {
      showToast('Your basket is empty!', 'error');
      return;
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#25D366', '#8A68E8', '#4E878C', '#FCD5CE']
      });
    } catch {}

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalAmount = Math.max(0, subtotal - promoDiscount);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || null,
          customerName: user?.name || customAddress?.fullName || 'Customer',
          customerPhone: user?.phone || customAddress?.phone || '',
          customerEmail: user?.email || '',
          shippingAddress: customAddress || user?.addresses?.find(a => a.isDefault) || null,
          items: cart.map(i => ({
            productId: i.product.id,
            name: i.product.name,
            price: i.product.price,
            quantity: i.quantity,
            selectedColor: i.selectedColor
          })),
          subtotal,
          shippingFee: 0,
          totalAmount,
          whatsappNumber: BUSINESS_PHONE
        })
      });
    } catch (e) {
      console.warn('Could not record order backend trace:', e);
    }

    const waLink = createCartWhatsAppLink({
      cartItems: cart,
      user,
      customAddress,
      promoDiscount
    });

    showToast(`Opening WhatsApp order with Stitch & Hook... 💬`, 'success');
    window.open(waLink, '_blank', 'noopener,noreferrer');
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        loadingProducts,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        maxPrice,
        setMaxPrice,
        sortBy,
        setSortBy,
        cart,
        wishlist,
        cartOpen,
        setCartOpen,
        wishlistOpen,
        setWishlistOpen,
        dashboardOpen,
        setDashboardOpen,
        adminDashboardOpen,
        setAdminDashboardOpen,
        customOrderOpen,
        setCustomOrderOpen,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        showToast,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        triggerDirectBuyNow,
        triggerCartCheckout,
        totalCartCount,
        cartSubtotal,
        fetchProducts,
        updateProductLocal,
        addProductLocal,
        deleteProductLocal
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
