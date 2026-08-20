import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { useAuth } from '../../context/AuthContext';
import { createCustomInquiryWhatsAppLink, BUSINESS_PHONE, FORMATTED_PHONE } from '../../utils/whatsapp';
import { X, Sparkles, MessageSquare, Palette, FileText, IndianRupee, Layers } from 'lucide-react';

export default function CustomOrderModal() {
  const { customOrderOpen, setCustomOrderOpen, showToast } = useStore();
  const { user } = useAuth();

  const [category, setCategory] = useState('Laptop Bag / Sleeve');
  const [colors, setColors] = useState('Lavender & Sage Teal');
  const [budget, setBudget] = useState('200');
  const [description, setDescription] = useState('');

  if (!customOrderOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description) {
      showToast('Please describe your custom crochet idea!', 'error');
      return;
    }

    const waLink = createCustomInquiryWhatsAppLink({
      user,
      category,
      description,
      preferredColors: colors,
      budget
    });

    showToast(`Redirecting to WhatsApp (${BUSINESS_PHONE})... 🧶`, 'success');
    window.open(waLink, '_blank', 'noopener,noreferrer');
    setCustomOrderOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={() => setCustomOrderOpen(false)}
      />

      <div className="relative w-full max-w-lg rounded-3xl sm:rounded-[36px] overflow-hidden shadow-2xl bg-white border border-[#E0D4F5] z-10 animate-scale-up text-left">
        
        {/* Header */}
        <div className="p-6 sm:p-8 bg-[#FAF8F5] border-b border-[#EDE4D6] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EFE9FA] text-[#5F32C4] flex items-center justify-center shadow-xs border border-[#CBB6ED]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1F2421]">
                Custom Crochet Commission
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Have a unique design in mind? We'll handcraft it for you.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCustomOrderOpen(false)}
            className="w-9 h-9 rounded-full bg-white border border-[#EDE4D6] text-gray-400 hover:text-gray-900 flex items-center justify-center cursor-pointer shadow-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          
          <div>
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
              Creation Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[#EDE4D6] text-xs text-gray-800 bg-[#FAF8F5] focus:border-[#8A68E8] focus:outline-none font-bold"
            >
              <option value="Laptop Bag / Sleeve">Custom Laptop Sleeve / Bag (₹150–200)</option>
              <option value="Earbuds / Buds Case">Custom Earbuds Cozy (₹70–100)</option>
              <option value="Amigurumi Keychain">Amigurumi Doll / Keychain (₹70–80)</option>
              <option value="Crochet Shoulder Tote">Crochet Shoulder Tote Bag</option>
              <option value="Special Custom Idea">Other Custom Project</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-[#8A68E8]" />
              <span>Preferred Colors & Yarn Palette</span>
            </label>
            <input
              type="text"
              value={colors}
              onChange={(e) => setColors(e.target.value)}
              placeholder="e.g. Pastel Lavender, Sage Teal & Cream"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#EDE4D6] text-xs text-gray-800 bg-[#FAF8F5] focus:border-[#8A68E8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <IndianRupee className="w-4 h-4 text-[#2B6064]" />
              <span>Target Budget (₹ INR)</span>
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 180"
              className="w-full px-4 py-2.5 rounded-2xl border border-[#EDE4D6] text-xs text-gray-800 bg-[#FAF8F5] focus:border-[#8A68E8] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#E76F51]" />
              <span>Describe Your Idea / Dimensions *</span>
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. I need a 14-inch laptop sleeve with striped pastel waffle stitch and a wooden button closure..."
              className="w-full px-4 py-2.5 rounded-2xl border border-[#EDE4D6] text-xs text-gray-800 bg-[#FAF8F5] focus:border-[#8A68E8] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl btn-whatsapp-lux text-sm font-extrabold flex items-center justify-center gap-2 shadow-lg cursor-pointer mt-2"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Send Commission Request via WhatsApp</span>
          </button>

          <p className="text-[10px] text-center text-gray-400">
            We will review your dimensions, yarn requirements, and confirm timeline on WhatsApp!
          </p>

        </form>

      </div>
    </div>
  );
}
