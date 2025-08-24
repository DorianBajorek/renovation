"use client";
import { 
  Plus, 
  Home, 
  ChevronRight, 
  PieChart, 
  Download, 
  Edit, 
  Trash2,
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
import { useEffect, useState } from "react";
import { Room } from "../types";
import { AddRoomForm } from "./AddRoomForm";
import { EditRoomForm } from "./EditRoomForm";
import { ExportModal } from "../components/ExportModal";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

interface AddRoomFormProps {
  onAdd: (room: Room) => void;
  onClose: () => void;
}

export default function PokojePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetch(`/api/rooms?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Map database fields to frontend format and deduplicate by ID
            const mappedRooms = data.map(room => ({
              ...room,
              icon: room.icon || 'Sofa', // Ensure icon is always set
            }));
            
            // Remove duplicates based on ID
            const uniqueRooms = mappedRooms.filter((room, index, self) => 
              index === self.findIndex(r => r.id === room.id)
            );
            
            setRooms(uniqueRooms);
          }
        })
        .catch(error => {
          console.error('Error fetching rooms:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const handleAddRoom = async (room: Room) => {
    if (!user) return;

    try {
      setLoading(true);
      // Refresh data from server after successful addition
      const refreshResponse = await fetch(`/api/rooms?userId=${user.id}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        if (Array.isArray(refreshedData)) {
          const mappedRooms = refreshedData.map(room => ({
            ...room,
            icon: room.icon || 'Sofa', // Ensure icon is always set
          }));
          setRooms(mappedRooms);
        }
      }
    } catch (error) {
      console.error('Error adding room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomFormClose = () => {
    setShowForm(false);
  };

  const totalExpenses = rooms.reduce((sum, room) => sum + (room.expenses || 0), 0);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 font-inter flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Ładowanie pokoi...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
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
                Całkowite wydatki
              </h2>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-slate-900">
                  {totalExpenses.toLocaleString()} PLN
                </span>
                <span className="text-sm text-slate-500">
                  dla {rooms.length} pomieszczeń
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                <PieChart size={18} />
                <span>Podgląd wydatków</span>
              </button>
              <button 
                onClick={() => {
                  if (!user?.id) {
                    alert('Brak ID użytkownika');
                    return;
                  }
                  setShowExportModal(true);
                }}
                className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
              >
                <Download size={18} />
                <span>Eksportuj</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {rooms.map((room, idx) => {
            const iconMap: Record<string, any> = { 
              Home, Sofa, Bed, Bath, Tv, Armchair, Utensils, Car, DoorOpen, 
              TrendingUp, Monitor, Dumbbell, Baby, BookOpen, Palette, Music, 
              Gamepad2, WashingMachine, TreePine, Sun 
            };
            const Icon = iconMap[room.icon] || Home;
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
                    {(room.expenses || 0).toLocaleString()} PLN
                  </span>
                </div>
                                 <div className="mt-6 w-full flex gap-2">
                   <button 
                     onClick={() => room.id && router.push(`/pokoje/${room.id}`)}
                     className="flex-1 px-4 py-3 rounded-xl bg-white text-slate-700 font-medium hover:bg-indigo-50 transition-all duration-300 border border-slate-200/60 flex items-center justify-center gap-2 group-hover:border-indigo-200 group-hover:text-indigo-700"
                     disabled={!room.id}
                   >
                     Otwórz
                     <ChevronRight
                       size={18}
                       className="text-black group-hover:translate-x-1 transition-transform"
                     />
                   </button>
                   <button
                     onClick={() => {
                       setEditingRoom(room);
                       setShowEditForm(true);
                     }}
                     className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                     title="Edytuj pokój"
                   >
                     <Edit size={18} />
                   </button>
                   <button
                     onClick={async () => {
                       if (room.id && confirm('Czy na pewno chcesz usunąć ten pokój? Wszystkie produkty w tym pokoju również zostaną usunięte.')) {
                         try {
                           const response = await fetch(`/api/rooms/${room.id}`, {
                             method: 'DELETE',
                           });
                           
                           if (response.ok) {
                             setRooms(prev => prev.filter(r => r.id !== room.id));
                           } else {
                             alert('Błąd podczas usuwania pokoju');
                           }
                         } catch (error) {
                           console.error('Error deleting room:', error);
                           alert('Błąd podczas usuwania pokoju');
                         }
                       }
                     }}
                     className="px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                     title="Usuń pokój"
                   >
                     <Trash2 size={18} />
                   </button>
                 </div>
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
           onClose={handleRoomFormClose}
         />
       )}

       {showEditForm && editingRoom && (
         <EditRoomForm
           room={editingRoom}
           onUpdate={(updatedRoom) => {
             setRooms(prev => prev.map(r => r.id === updatedRoom.id ? updatedRoom : r));
             setShowEditForm(false);
             setEditingRoom(null);
           }}
           onClose={() => {
             setShowEditForm(false);
             setEditingRoom(null);
           }}
         />
       )}

       {showExportModal && (
         <ExportModal
           isOpen={showExportModal}
           onClose={() => setShowExportModal(false)}
           roomId={"all"}
           roomName="Wszystkie pokoje"
           userId={user?.id}
           isProjectExport={false}
         />
       )}
       
       
      </div>
    </ProtectedRoute>
  );
}
