"use client";
import { useState } from "react";
import { Product } from "../types/product";
import { Package } from "lucide-react";

interface AddProductFormProps {
  onAdd: (product: Product) => void;
  onClose: () => void;
  roomId: string;
}

export const AddProductForm = ({ onAdd, onClose, roomId }: AddProductFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<'planned' | 'purchased' | 'installed'>('planned');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;
    
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          price,
          quantity,
          category: category || undefined,
          status,
          roomId,
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
    }
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
            Dodaj nowy produkt
          </h2>
        </div>

        <input
          type="text"
          placeholder="Nazwa produktu"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          required
        />

        <textarea
          placeholder="Opis (opcjonalnie)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all resize-none"
          rows={3}
        />

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="Cena (PLN)"
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            required
            min="0"
            step="0.01"
          />
          <input
            type="number"
            placeholder="Ilość"
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
            min="1"
          />
        </div>

        <input
          type="text"
          placeholder="Kategoria (opcjonalnie)"
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
        />

        <select
          value={status}
          onChange={e => setStatus(e.target.value as 'planned' | 'purchased' | 'installed')}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
        >
          <option value="planned">Planowany</option>
          <option value="purchased">Zakupiony</option>
          <option value="installed">Zainstalowany</option>
        </select>

        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
          >
            Anuluj
          </button>
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold hover:from-indigo-600 hover:to-indigo-700 transition-all"
          >
            Dodaj
          </button>
        </div>
      </form>
    </div>
  );
};
