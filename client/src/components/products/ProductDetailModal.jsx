import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { 
  X, 
  Star, 
  ShoppingBag, 
  Heart, 
  MessageSquare, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Layers, 
  Feather, 
  Info,
  Truck
} from 'lucide-react';
import { BUSINESS_PHONE, FORMATTED_PHONE } from '../../utils/whatsapp';

export default function ProductDetailModal() {
  const { 
    quickViewProduct: product, 
    setQuickViewProduct, 
    addToCart, 
    wishlist, 
    toggleWishlist, 
    triggerDirectBuyNow 
  } = useStore();

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(
    product?.colorOptions?.[0] || 'Original'
  );

  if (!product) return null;

  const isSaved = wishlist.includes(product.id);
  const discountPercent = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl bg-white border border-[#E0D4F5] z-10 animate-scale-up max-h-[92vh] flex flex-col md:flex-row">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-[#FAF8F5] border border-[#EDE4D6] flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white hover:scale-105 transition cursor-pointer shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left: Product Showcase Gallery */}
        <div className="w-full md:w-1/2 bg-[#F5EFE6]/60 p-6 sm:p-8 flex flex-col items-center justify-center relative border-b md:border-b-0 md:border-r border-[#EDE4D6]">
          <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-lg bg-white border border-gray-100 group">
            <img
              src={product.image || '/images/laptop_bag_lavender.jpg'}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/laptop_bag_lavender.jpg';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            {product.badge && (
              <span className="absolute top-4 left-4 badge-artisan-lavender px-3 py-1 rounded-full text-xs font-extrabold shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#1D4548]">
            <Sparkles className="w-4 h-4 text-[#8A68E8]" />
            <span>100% Hand-stitched with double milk-cotton yarn</span>
          </div>
        </div>

        {/* Right: Product Details & Purchase Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between text-left">
          <div className="space-y-4">
            
            {/* Category & Wishlist */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#4E878C]">
                {product.category}
              </span>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full border transition cursor-pointer ${
                  isSaved
                    ? 'bg-[#E76F51] text-white border-[#E76F51] shadow-xs'
                    : 'bg-[#FAF8F5] text-gray-400 hover:text-[#E76F51] border-[#EDE4D6]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* Title */}
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F2421] leading-snug">
              {product.name}
            </h2>

            {/* Rating */}
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span className="font-extrabold text-gray-900">{product.rating}</span>
              <span className="text-gray-400">({product.reviewsCount} verified reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#1D4548]">
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through font-bold">
                  ₹{product.originalPrice}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="badge-artisan-gold px-2.5 py-0.5 rounded-full text-xs font-extrabold">
                  Save {discountPercent}%
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications Card */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EDE4D6] space-y-2 text-xs text-gray-700">
              {product.dimensions && (
                <div className="flex items-start gap-2.5">
                  <Layers className="w-4 h-4 text-[#8A68E8] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-gray-900">Dimensions: </span>
                    <span>{product.dimensions}</span>
                  </div>
                </div>
              )}
              {product.yarnMaterial && (
                <div className="flex items-start gap-2.5">
                  <Feather className="w-4 h-4 text-[#4E878C] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-gray-900">Yarn Composition: </span>
                    <span>{product.yarnMaterial}</span>
                  </div>
                </div>
              )}
              {product.careInstructions && (
                <div className="flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[#E76F51] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-gray-900">Care Instructions: </span>
                    <span>{product.careInstructions}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Color Option Selector */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div>
                <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                  Selected Colorway: <span className="text-[#8A68E8]">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colorOptions.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setSelectedColor(col)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                        selectedColor === col
                          ? 'bg-[#1D4548] text-white border-[#1D4548] shadow-xs'
                          : 'bg-white text-gray-700 border-[#EDE4D6] hover:bg-[#FAF8F5]'
                      }`}
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2">
                Quantity:
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#EDE4D6] rounded-xl bg-[#FAF8F5] p-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-white text-gray-700 font-extrabold flex items-center justify-center hover:bg-gray-100 transition cursor-pointer shadow-xs"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-extrabold text-sm text-gray-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-white text-gray-700 font-extrabold flex items-center justify-center hover:bg-gray-100 transition cursor-pointer shadow-xs"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-gray-500 font-semibold">
                  Subtotal: <strong className="text-base text-[#1D4548]">₹{product.price * quantity}</strong>
                </span>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-6 mt-4 border-t border-gray-100">
            {/* Primary Buy Now on WhatsApp */}
            <button
              type="button"
              onClick={() => {
                triggerDirectBuyNow(product, quantity, selectedColor);
                setQuickViewProduct(null);
              }}
              className="w-full py-4 rounded-2xl btn-whatsapp-lux text-sm font-extrabold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span>Buy Now via WhatsApp ({FORMATTED_PHONE})</span>
            </button>

            {/* Secondary Add to Cart */}
            <button
              type="button"
              onClick={() => {
                addToCart(product, quantity, selectedColor);
                setQuickViewProduct(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#EFE9FA] text-[#1D4548] hover:text-[#5F32C4] text-xs font-extrabold border border-[#EDE4D6] transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping Basket</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
