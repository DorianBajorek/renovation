"use client";
import { useState, useEffect } from "react";
import { Room } from "../types";
import { Home, Sofa, Bed, Bath, Tv, Armchair } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface EditRoomFormProps {
  room: Room;
  onUpdate: (room: Room) => void;
  onClose: () => void;
}

const iconOptions = [
  { value: "Sofa", label: "Sofa", icon: Sofa },
  { value: "Bed", label: "Łóżko", icon: Bed },
  { value: "Bath", label: "Łazienka", icon: Bath },
  { value: "Tv", label: "TV", icon: Tv },
  { value: "Armchair", label: "Fotel", icon: Armchair },
  { value: "Home", label: "Dom", icon: Home },
];

export const EditRoomForm = ({ room, onUpdate, onClose }: EditRoomFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState(room.name);
  const [icon, setIcon] = useState(room.icon || 'Sofa');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(room.name);
    setIcon(room.icon || 'Sofa');
  }, [room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !room.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          icon,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas aktualizacji pokoju');
      }

      const updatedRoom = await response.json();
      onUpdate(updatedRoom);
      onClose();
    } catch (error) {
      console.error("Błąd podczas aktualizacji pokoju:", error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas aktualizacji pokoju');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-96 flex flex-col gap-6 border border-white/40"
      >
        <div className="flex items-center gap-3 mb-4">
          <Home size={28} className="text-indigo-600" />
          <h2 className="text-2xl font-semibold text-slate-900">
            Edytuj pokój
          </h2>
        </div>

        <input
          type="text"
          placeholder="Nazwa pokoju"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">
            Ikona pokoju
          </label>
          <div className="grid grid-cols-3 gap-3">
            {iconOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setIcon(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    icon === option.value
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Icon size={24} className="text-slate-700" />
                    <span className="text-sm font-medium text-slate-700">
                      {option.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

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
