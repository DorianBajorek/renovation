"use client";
import { useState, useEffect } from "react";
import { Product } from "../types/product";
import { Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface EditProductFormProps {
  product: Product;
  onUpdate: (product: Product) => void;
  onClose: () => void;
}

const statusOptions = [
  { value: "planned", label: "Planowany" },
  { value: "purchased", label: "Zakupiony" },
  { value: "installed", label: "Zainstalowany" },
];

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-96 max-h-[90vh] overflow-y-auto flex flex-col gap-6 border border-white/40"
      >
        <div className="flex items-center gap-3 mb-4">
          <Package size={28} className="text-indigo-600" />
          <h2 className="text-2xl font-semibold text-slate-900">
            Edytuj produkt
          </h2>
        </div>

        <input
          type="text"
          placeholder="Nazwa produktu"
          value={formData.name}
          onChange={e => handleInputChange("name", e.target.value)}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          required
        />

        <textarea
          placeholder="Opis (opcjonalnie)"
          value={formData.description}
          onChange={e => handleInputChange("description", e.target.value)}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all resize-none"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Cena (PLN)"
            value={formData.price}
            onChange={e => handleInputChange("price", Number(e.target.value))}
            className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            required
            min="0"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Ilość"
            value={formData.quantity}
            onChange={e => handleInputChange("quantity", Number(e.target.value))}
            className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            required
            min="1"
          />
        </div>

        <input
          type="text"
          placeholder="Kategoria (opcjonalnie)"
          value={formData.category}
          onChange={e => handleInputChange("category", e.target.value)}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
        />

        <select
          value={formData.status}
          onChange={e => handleInputChange("status", e.target.value)}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
            disabled={loading}
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Zapisywanie...' : 'Zapisz'}
          </button>
        </div>
      </form>
    </div>
  );
};
