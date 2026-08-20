import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  MessageSquare, 
  Tag, 
  MapPin, 
  Truck, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { BUSINESS_PHONE, FORMATTED_PHONE } from '../../utils/whatsapp';

export default function CartDrawer() {
  const { 
    cart, 
    cartOpen, 
    setCartOpen, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    triggerCartCheckout 
  } = useStore();

  const { user } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoApplied, setPromoApplied] = useState('');
  const [promoError, setPromoError] = useState('');

  // Custom address
  const [customStreet, setCustomStreet] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customPincode, setCustomPincode] = useState('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  if (!cartOpen) return null;

  const defaultAddr = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'HANDMADE10') {
      setDiscount(10);
      setPromoApplied('HANDMADE10 (-₹10)');
    } else if (code === 'CROCHET20') {
      setDiscount(20);
      setPromoApplied('CROCHET20 (-₹20)');
    } else {
      setPromoError('Invalid coupon. Try "HANDMADE10" or "CROCHET20"');
    }
  };

  const finalTotal = Math.max(0, cartSubtotal - discount);

  const handleCheckout = () => {
    let customAddressObj = null;
    if (useCustomAddress && customStreet) {
      customAddressObj = {
        street: customStreet,
        city: customCity || 'Local',
        pincode: customPincode || ''
      };
    }
    triggerCartCheckout(customAddressObj, discount);
    setCartOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#E0D4F5]">
          
          {/* Header */}
          <div className="p-6 border-b border-[#EDE4D6] bg-[#FAF8F5]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#EFE9FA] text-[#5F32C4] flex items-center justify-center shadow-xs border border-[#CBB6ED]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-serif font-bold text-[#1F2421]">Shopping Basket</h3>
                  <span className="text-xs text-gray-500 font-semibold">{cart.length} artisan pieces</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="w-9 h-9 rounded-full bg-white border border-[#EDE4D6] text-gray-400 hover:text-gray-900 flex items-center justify-center cursor-pointer shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Free Delivery Bar */}
            <div className="mt-4 p-3 rounded-2xl bg-white border border-[#C4E1DE] text-xs shadow-xs">
              <div className="flex items-center justify-between text-[#1D4548] font-bold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#2B6064]" /> Free Handcrafted Delivery
                </span>
                <span>{cartSubtotal >= 300 ? 'Unlocked! 🎉' : `Add ₹${300 - cartSubtotal} more`}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#4E878C] to-[#25D366] transition-all duration-400"
                  style={{ width: `${Math.min(100, (cartSubtotal / 300) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length > 0 ? (
              cart.map((item, idx) => (
                <div 
                  key={`${item.product.id}-${item.selectedColor}-${idx}`}
                  className="flex gap-3.5 p-3.5 rounded-3xl bg-[#FAF8F5] border border-[#EDE4D6] hover:border-[#CBB6ED] transition shadow-xs"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-white shadow-xs shrink-0 bg-white"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-extrabold text-gray-900 line-clamp-1 leading-snug">
                          {item.product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id, item.selectedColor)}
                          className="text-gray-400 hover:text-red-500 transition cursor-pointer p-0.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] text-[#5F32C4] font-bold bg-[#EFE9FA] px-2.5 py-0.5 rounded-full inline-block mt-1">
                        {item.selectedColor}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100">
                      <span className="text-sm font-extrabold text-[#1D4548]">
                        ₹{item.product.price * item.quantity}
                      </span>

                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-[#EDE4D6] bg-white rounded-xl p-0.5 shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, -1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 font-extrabold text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-extrabold text-xs text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.product.id, item.selectedColor, 1)}
                          className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-100 font-extrabold text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-[#FAF8F5] text-[#8A68E8] mx-auto flex items-center justify-center mb-3 shadow-inner">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-serif font-bold text-gray-800">Your basket is empty</h4>
                <p className="text-xs text-gray-500 mt-1">Explore our crochet bags, cases, and keychains.</p>
              </div>
            )}

            {/* Address Selection */}
            {cart.length > 0 && (
              <div className="p-4 rounded-3xl bg-[#FAF8F5] border border-[#E0D4F5] text-xs space-y-2.5">
                <div className="flex items-center justify-between font-extrabold text-gray-900">
                  <span className="flex items-center gap-1.5 text-[#1D4548]">
                    <MapPin className="w-4 h-4 text-[#8A68E8]" /> Delivery Info for WhatsApp
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseCustomAddress(!useCustomAddress)}
                    className="text-[11px] text-[#5F32C4] font-bold hover:underline cursor-pointer"
                  >
                    {useCustomAddress ? 'Use Saved' : 'Custom Address'}
                  </button>
                </div>

                {!useCustomAddress && defaultAddr ? (
                  <p className="text-gray-600 line-clamp-2">
                    📍 {defaultAddr.street}, {defaultAddr.city} ({defaultAddr.pincode})
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder="Street address / House No."
                      value={customStreet}
                      onChange={(e) => setCustomStreet(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE4D6]"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={customCity}
                        onChange={(e) => setCustomCity(e.target.value)}
                        className="px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE4D6]"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={customPincode}
                        onChange={(e) => setCustomPincode(e.target.value)}
                        className="px-3 py-2 text-xs bg-white rounded-xl border border-[#EDE4D6]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Promo Code Box */}
            {cart.length > 0 && (
              <form onSubmit={handleApplyPromo} className="space-y-1.5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Promo code (HANDMADE10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-2xl border border-[#EDE4D6] bg-[#FAF8F5] uppercase font-bold"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-2xl bg-[#1D4548] text-white text-xs font-bold hover:bg-[#2B6064] transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-[11px] font-extrabold text-emerald-600 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> {promoApplied} applied!
                  </p>
                )}
                {promoError && (
                  <p className="text-[11px] text-red-500 font-semibold">{promoError}</p>
                )}
              </form>
            )}
          </div>

          {/* Footer & WhatsApp Checkout */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#EDE4D6] bg-[#FAF8F5] space-y-3.5">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">₹{cartSubtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Promo Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Coordination</span>
                  <span className="text-[#1D4548] font-bold">Free via WhatsApp</span>
                </div>
                <div className="flex justify-between text-lg font-serif font-extrabold text-[#1F2421] pt-2 border-t border-gray-200">
                  <span>Total Amount</span>
                  <span className="text-2xl text-[#1D4548]">₹{finalTotal}</span>
                </div>
              </div>

              {/* Confirm WhatsApp Order Button */}
              <button
                type="button"
                onClick={handleCheckout}
                className="w-full py-4 rounded-2xl btn-whatsapp-lux text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Confirm Order on WhatsApp ({FORMATTED_PHONE})</span>
              </button>

              <p className="text-[10px] text-center text-gray-400">
                🔒 Orders & payments are confirmed directly via our official WhatsApp business account.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
