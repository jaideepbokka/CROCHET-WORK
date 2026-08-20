import React from 'react';
import { useStore } from '../../context/StoreContext';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';

export default function WishlistDrawer() {
  const { 
    wishlist, 
    wishlistOpen, 
    setWishlistOpen, 
    products, 
    toggleWishlist, 
    addToCart, 
    triggerDirectBuyNow 
  } = useStore();

  if (!wishlistOpen) return null;

  const savedProducts = products.filter(p => wishlist.includes(p.id));

  const handleMoveAllToCart = () => {
    savedProducts.forEach(p => addToCart(p, 1));
    setWishlistOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={() => setWishlistOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-[#E8DFF5]">
          
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-gray-100 bg-[#FAF7F2]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#FCD5CE] text-[#E76F51] flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-[#E76F51]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-serif text-[#2B2D42]">Your Saved Favorites</h3>
                  <span className="text-xs text-gray-500 font-medium">{savedProducts.length} items saved</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setWishlistOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {savedProducts.length > 0 ? (
              savedProducts.map((product) => (
                <div 
                  key={product.id}
                  className="flex gap-3.5 p-3 rounded-2xl bg-[#FAF7F2]/60 border border-[#E5DCD0]/60 hover:border-[#E76F51] transition"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded-xl object-cover border border-white shadow-xs shrink-0 bg-white"
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1 leading-snug">
                          {product.name}
                        </h4>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          className="text-gray-400 hover:text-red-500 transition cursor-pointer p-0.5"
                          title="Remove from favorites"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] font-extrabold text-[#2B6064] mt-0.5 block">
                        ₹{product.price}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => addToCart(product, 1)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-white border border-[#E5DCD0] hover:border-[#2B6064] text-[#2B6064] text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Move to Bag</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => triggerDirectBuyNow(product, 1)}
                        className="py-1.5 px-2.5 rounded-lg bg-[#25D366] text-white text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                      >
                        <span>Buy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#FAF7F2] text-[#E76F51] mx-auto flex items-center justify-center mb-3">
                  <Heart className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-gray-800">Your wishlist is empty</h4>
                <p className="text-xs text-gray-500 mt-1">Click the heart icon on any design to save it for later.</p>
              </div>
            )}
          </div>

          {/* Footer Action */}
          {savedProducts.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-gray-100 bg-[#FAF7F2]">
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="w-full py-3.5 rounded-xl btn-artisan text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Move All {savedProducts.length} Items to Shopping Bag</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
