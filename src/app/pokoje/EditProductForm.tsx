"use client";
import { useState, useEffect } from "react";
import { Product } from "../types/product";
import { Package, X, Tag, FileText, DollarSign, Hash, ShoppingCart, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface EditProductFormProps {
  product: Product;
  onUpdate: (product: Product) => void;
  onClose: () => void;
}

export const EditProductForm = ({ product, onUpdate, onClose }: EditProductFormProps) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || "",
    price: product.price,
    quantity: product.quantity,
    category: product.category || "",
    status: product.status,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      quantity: product.quantity,
      category: product.category || "",
      status: product.status,
    });
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0 || !product.id || !user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          price: formData.price,
          quantity: formData.quantity,
          category: formData.category || undefined,
          status: formData.status,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas aktualizacji produktu');
      }

      const updatedProduct = await response.json();
      onUpdate(updatedProduct);
      onClose();
    } catch (error) {
      console.error("Błąd podczas aktualizacji produktu:", error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas aktualizacji produktu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/20">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Package size={24} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Edytuj produkt
                </h2>
                <p className="text-sm text-slate-500">
                  Zmień szczegóły produktu
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

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
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
                  value={formData.description}
                  onChange={e => handleInputChange("description", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  rows={3}
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
                    value={formData.price === 0 ? '' : formData.price.toFixed(2)}
                    onChange={e => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      // Allow only one decimal point
                      const parts = value.split('.');
                      if (parts.length > 2) return;
                      // Limit to 2 decimal places
                      if (parts.length === 2 && parts[1].length > 2) return;
                      const numValue = parseFloat(value) || 0;
                      handleInputChange("price", numValue);
                    }}
                    onBlur={() => {
                      // Format to 2 decimal places when leaving the field
                      if (formData.price > 0) {
                        handleInputChange("price", Math.round(formData.price * 100) / 100);
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
                    value={formData.quantity}
                    onChange={e => handleInputChange("quantity", Number(e.target.value))}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Kategoria */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kategoria (opcjonalnie)
              </label>
              <input
                type="text"
                placeholder="np. Materiały budowlane"
                value={formData.category}
                onChange={e => handleInputChange("category", e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("status", "planned")}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    formData.status === 'planned'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <ShoppingCart size={16} />
                  <span className="text-sm font-medium">Planowany</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("status", "purchased")}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    formData.status === 'purchased'
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
            {formData.name && formData.price > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Podsumowanie</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Produkt:</span>
                    <span className="font-medium text-slate-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cena jednostkowa:</span>
                    <span className="font-medium text-slate-900">{formData.price.toFixed(2)} PLN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ilość:</span>
                    <span className="font-medium text-slate-900">{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-medium">Wartość całkowita:</span>
                    <span className="font-semibold text-indigo-600">{(formData.price * formData.quantity).toFixed(2)} PLN</span>
                  </div>
                </div>
              </div>
            )}

            {/* Przyciski */}
            <div className="flex gap-3 pt-4">
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
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading || !formData.name || formData.price <= 0}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Zapisywanie...
                  </>
                ) : (
                  <>
                    <Package size={16} />
                    Zapisz zmiany
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
