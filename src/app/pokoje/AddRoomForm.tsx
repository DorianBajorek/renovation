"use client";
import { useState } from "react";
import { addRoom, Room } from "../service";
import { Home } from "lucide-react";

interface AddRoomFormProps {
  onAdd: (room: Room) => void;
  onClose: () => void;
}

export const AddRoomForm = ({ onAdd, onClose }: AddRoomFormProps) => {
  const [name, setName] = useState("");
  const [budget, setBudget] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || budget <= 0) return;
    const newRoom = await addRoom({ name, budget });
    onAdd(newRoom);
    onClose();
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
            Dodaj nowy pokój
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
        <input
          type="number"
          placeholder="Budżet (PLN)"
          value={budget}
          onChange={e => setBudget(Number(e.target.value))}
          className="border border-slate-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
          required
        />

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
