"use client";
import { useState } from "react";
import { Room } from "../types";
import { 
  Home, 
  Sofa, 
  Bed, 
  Bath, 
  Tv, 
  Armchair, 
  Utensils, 
  Car, 
  DoorOpen, 
  TrendingUp, 
  Monitor, 
  Dumbbell,
  Baby,
  BookOpen,
  Palette,
  Music,
  Gamepad2,
  WashingMachine,
  TreePine,
  Sun
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AddRoomFormProps {
  onAdd: (room: Room) => void;
  onClose: () => void;
  projectId?: string;
}

const iconOptions = [
  { value: "Sofa", label: "Salon", icon: Sofa },
  { value: "Bed", label: "Sypialnia", icon: Bed },
  { value: "Bath", label: "Łazienka", icon: Bath },
  { value: "Utensils", label: "Kuchnia", icon: Utensils },
  { value: "Tv", label: "Pokój TV", icon: Tv },
  { value: "Armchair", label: "Gabinet", icon: Armchair },
  { value: "Car", label: "Garaż", icon: Car },
  { value: "DoorOpen", label: "Przedsionek", icon: DoorOpen },
  { value: "TrendingUp", label: "Klatka schodowa", icon: TrendingUp },
  { value: "Monitor", label: "Biuro", icon: Monitor },
  { value: "Dumbbell", label: "Siłownia", icon: Dumbbell },
  { value: "Baby", label: "Pokój dziecięcy", icon: Baby },
  { value: "BookOpen", label: "Biblioteka", icon: BookOpen },
  { value: "Palette", label: "Pracownia", icon: Palette },
  { value: "Music", label: "Pokój muzyczny", icon: Music },
  { value: "Gamepad2", label: "Pokój gier", icon: Gamepad2 },
  { value: "WashingMachine", label: "Pralnia", icon: WashingMachine },
  { value: "TreePine", label: "Ogród zimowy", icon: TreePine },
  { value: "Sun", label: "Taras", icon: Sun },
  { value: "Home", label: "Inne", icon: Home },
];

export const AddRoomForm = ({ onAdd, onClose, projectId }: AddRoomFormProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Sofa");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    
    try {
      if (!user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          icon: selectedIcon,
          userId: user.id,
          projectId: projectId || null, // Include projectId if provided
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas dodawania pokoju');
      }

      const newRoom = await response.json();
      onAdd(newRoom);
      onClose();
    } catch (error) {
      console.error("Błąd podczas dodawania pokoju:", error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas dodawania pokoju');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/40"
      >
        <div className="flex items-center gap-3 mb-6">
          <Home size={28} className="text-indigo-600" />
          <h2 className="text-2xl font-semibold text-slate-900">
            Dodaj nowy pokój
          </h2>
        </div>

        <div className="space-y-6">
          {/* Nazwa pokoju */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nazwa pokoju *
            </label>
            <input
              type="text"
              placeholder="np. Salon, Sypialnia, Kuchnia..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
              required
            />
          </div>

          {/* Wybór ikony */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Wybierz ikonę pokoju
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {iconOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSelectedIcon(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedIcon === option.value
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Icon size={24} className="text-slate-700" />
                      <span className="text-xs font-medium text-slate-700 text-center">
                        {option.label}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
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
            Dodaj pokój
          </button>
        </div>
      </form>
    </div>
  );
};
