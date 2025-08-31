"use client";
import { useState } from "react";
import { Product } from "../types/product";
import { Package, X, Tag, FileText, DollarSign, Hash, ShoppingCart, CheckCircle, Link } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AddProductFormProps {
  onAdd: (product: Product) => void;
  onClose: () => void;
  roomId: string;
}

export const AddProductForm = ({ onAdd, onClose, roomId }: AddProductFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [status, setStatus] = useState<'planned' | 'purchased'>('planned');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0 || !user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          link: link || undefined,
          price,
          quantity,
          status,
          roomId,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas dodawania produktu');
      }

      const newProduct = await response.json();
      onAdd(newProduct);
      onClose();
    } catch (error) {
      console.error("Błąd podczas dodawania produktu:", error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas dodawania produktu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col border border-white/20">
        {/* Header - Fixed */}
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Package size={24} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Dodaj produkt
                </h2>
                <p className="text-sm text-slate-500">
                  Wypełnij szczegóły nowego produktu
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Nazwa produktu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nazwa produktu *
              </label>
              <div className="relative">
                <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="np. Płytki łazienkowe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Opis */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Opis (opcjonalnie)
              </label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  placeholder="Dodatkowe informacje o produkcie..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Link do produktu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Link do produktu (opcjonalnie)
              </label>
              <div className="relative">
                <Link size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://example.com/product"
                  value={link}
                  onChange={e => setLink(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Cena i ilość */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cena (PLN) *
                </label>
                <div className="relative">
                  <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="0.00"
                    value={price === 0 ? '' : price.toString()}
                    onChange={e => {
                      const value = e.target.value;
                      // Allow only numbers, dots, and commas
                      if (/^[0-9.,]*$/.test(value)) {
                        const numValue = parseFloat(value.replace(',', '.')) || 0;
                        setPrice(numValue);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ilość *
                </label>
                <div className="relative">
                  <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    placeholder="1"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('planned')}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    status === 'planned'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <ShoppingCart size={16} />
                  <span className="text-sm font-medium">Planowany</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('purchased')}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    status === 'purchased'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Zakupiony</span>
                </button>
              </div>
            </div>

            {/* Podsumowanie */}
            {name && price > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Podsumowanie</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Produkt:</span>
                    <span className="font-medium text-slate-900">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cena jednostkowa:</span>
                    <span className="font-medium text-slate-900">{price.toFixed(2)} PLN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ilość:</span>
                    <span className="font-medium text-slate-900">{quantity}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-medium">Wartość całkowita:</span>
                    <span className="font-semibold text-indigo-600">{(price * quantity).toFixed(2)} PLN</span>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 sm:p-8 border-t border-slate-200 bg-white">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              form="add-product-form"
              className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || !name || price <= 0}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Dodawanie...
                </>
              ) : (
                <>
                  <Package size={16} />
                  Dodaj produkt
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
