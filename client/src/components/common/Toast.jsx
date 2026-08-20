import React from 'react';
import { useStore } from '../../context/StoreContext';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';

export default function Toast() {
  const { toasts } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-[#2B2D42] text-white border-gray-700';
        let Icon = Info;

        if (toast.type === 'success') {
          bgClass = 'bg-[#1B3B3E] text-white border-[#4E878C]';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgClass = 'bg-red-900 text-white border-red-700';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-center gap-3 animate-slide-up text-xs font-semibold ${bgClass}`}
          >
            <Icon className="w-5 h-5 shrink-0 text-[#E8DFF5]" />
            <span className="flex-1 leading-snug">{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}
