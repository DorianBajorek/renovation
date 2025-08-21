"use client";
import { Plus, Home, ChevronRight, PieChart, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { getRooms, addRoom } from "../service";
import { Room } from "../types";
import { AddRoomForm } from "./AddRoomForm";

interface AddRoomFormProps {
  onAdd: (room: Room) => void;
  onClose: () => void;
}

export default function PokojePage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getRooms().then(setRooms);
  }, []);

  const handleAddRoom = (room: Room) => {
    setRooms((prev) => [...prev, room]);
  };

  const totalBudget = rooms.reduce((sum, room) => sum + room.budget, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 font-inter flex flex-col">
      <div className="flex justify-center py-10 px-6">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-lg border border-white/30">
          <Home size={32} className="text-black" />
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Twoje Pokoje
          </h1>
        </div>
      </div>

      <div className="px-6 md:px-12 mb-8">
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-medium text-slate-700 mb-2">
                Całkowity budżet remontu
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-slate-900">
                  {totalBudget} PLN
                </span>
                <span className="text-sm text-slate-500">
                  dla {rooms.length} pomieszczeń
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                <PieChart size={18} />
                <span>Podgląd budżetu</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                <Download size={18} />
                <span>Eksportuj</span>
              </button>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600">Wydatki do tej pory</span>
              <span className="text-sm font-medium text-slate-700">
                1,240 PLN / {totalBudget} PLN
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full"
                style={{ width: `${(1240 / totalBudget) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {rooms.map((room, idx) => {
            const Icon = room.icon;
            return (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-white/90 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/60 flex flex-col items-center justify-between aspect-square hover:-translate-y-2"
              >
                <div className="flex flex-col items-center gap-5">
                  <div className="p-5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon size={48} strokeWidth={1.5} className="text-black" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-slate-900 text-center">
                    {room.name}
                  </h2>
                  <span className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-semibold text-sm group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                    {room.budget} PLN
                  </span>
                </div>
                <button className="mt-6 w-full px-6 py-3 rounded-xl bg-white text-slate-700 font-medium hover:bg-indigo-50 transition-all duration-300 border border-slate-200/60 flex items-center justify-center gap-2 group-hover:border-indigo-200 group-hover:text-indigo-700">
                  Otwórz{" "}
                  <ChevronRight
                    size={18}
                    className="text-black group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            );
          })}

          <div
            className="group p-8 rounded-3xl border-2 border-dashed border-slate-300/70 hover:border-indigo-300 transition-all duration-300 flex flex-col items-center justify-center gap-5 aspect-square bg-white/50 backdrop-blur-md hover:bg-white/70 cursor-pointer"
            onClick={() => setShowForm(true)}
          >
            <div className="p-5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <Plus size={48} strokeWidth={1.5} className="text-black" />
            </div>
            <h2 className="text-xl md:text-2xl font-medium text-slate-500 group-hover:text-indigo-600 text-center transition-colors">
              Dodaj pokój
            </h2>
          </div>
        </div>
      </main>

      {showForm && (
        <AddRoomForm
          onAdd={handleAddRoom}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
