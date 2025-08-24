"use client";
import { 
  Plus, 
  Home, 
  ChevronRight, 
  PieChart, 
  Download, 
  ArrowLeft, 
  Sofa, 
  Bed, 
  Bath, 
  Tv, 
  Armchair, 
  Edit, 
  Trash2,
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
import { Room } from "../../../types";
import { AddRoomForm } from "../../../pokoje/AddRoomForm";
import { EditRoomForm } from "../../../pokoje/EditRoomForm";
import { ExportModal } from "../../../components/ExportModal";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

interface ProjectRoomsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectRoomsPage({ params }: ProjectRoomsPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [project, setProject] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    const getProjectId = async () => {
      const { id } = await params;
      setProjectId(id);
    };
    getProjectId();
  }, [params]);

  useEffect(() => {
    if (user && projectId) {
      // Fetch project details
      fetch(`/api/projects/${projectId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Error fetching project:', data.error);
            return;
          }
          setProject(data);
        })
        .catch(error => {
          console.error('Error fetching project:', error);
        });

      // Fetch rooms for this project
      fetch(`/api/rooms?userId=${user.id}&projectId=${projectId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const mappedRooms = data.map(room => ({
              ...room,
              icon: room.icon || 'Home',
            }));
            setRooms(mappedRooms);
          }
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching rooms:', error);
          setLoading(false);
        });
    }
  }, [user, projectId]);

  const handleAddRoom = async (room: Room) => {
    if (!user || !project) return;

    try {
      setLoading(true);
      // Refresh rooms list
      const refreshResponse = await fetch(`/api/rooms?userId=${user.id}&projectId=${projectId}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        if (Array.isArray(refreshedData)) {
          const mappedRooms = refreshedData.map(room => ({
            ...room,
            icon: room.icon || 'Home',
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
            <p className="text-slate-600">Ładowanie...</p>
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
              Pokoje projektu: {project?.name || 'Ładowanie...'}
            </h1>
          </div>
        </div>

        <div className="px-6 md:px-12 mb-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/30 text-slate-700 hover:bg-white transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              <span>Powrót do projektu</span>
            </button>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/60">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-slate-700 mb-2">
                    Wydatki pokoi w projekcie
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
                    <span>Podgląd budżetu</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (!user?.id || !projectId) {
                        alert('Brak ID użytkownika lub projektu');
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

              {project && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-medium text-slate-700 mb-2">Informacje o projekcie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <span className="ml-2 font-medium text-slate-700">
                        {project.status === 'active' ? 'Aktywny' : 
                         project.status === 'completed' ? 'Zakończony' : project.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Budżet projektu:</span>
                      <span className="ml-2 font-medium text-slate-700">
                        {project.budget?.toLocaleString()} PLN
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Okres:</span>
                      <span className="ml-2 font-medium text-slate-700">
                        {project.start_date && project.end_date ? 
                          `${new Date(project.start_date).toLocaleDateString('pl-PL')} - ${new Date(project.end_date).toLocaleDateString('pl-PL')}` : 
                          'Nie określono'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

                <main className="flex-1 px-6 md:px-12 pb-16 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {rooms.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/60">
                  <Home size={64} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-slate-700 mb-2">
                    Brak pokoi w tym projekcie
                  </h3>
                  <p className="text-slate-500 mb-6">
                    Dodaj pierwszy pokój do tego projektu, aby rozpocząć planowanie remontu.
                  </p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors mx-auto"
                  >
                    <Plus size={20} />
                    <span>Dodaj pierwszy pokój</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Pokoje w projekcie ({rooms.length})
                  </h3>
                  <div className="text-sm text-slate-500">
                    Kliknij "Otwórz" aby zobaczyć produkty
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                         className="group p-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 flex flex-col min-h-[280px] hover:-translate-y-1"
                       >
                         <div className="flex flex-col items-center gap-4 mb-4">
                                                       <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <Icon size={40} strokeWidth={1.5} className="text-slate-700 transition-colors" />
                            </div>
                           <div className="text-center">
                             <h2 className="text-lg font-semibold text-slate-900 mb-2">
                               {room.name}
                             </h2>
                             <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium text-sm group-hover:bg-indigo-100 transition-colors">
                               {(room.expenses || 0).toLocaleString()} PLN
                             </span>
                           </div>
                         </div>
                         
                         <div className="mt-auto space-y-3">
                           <div className="flex gap-2">
                             <button 
                               onClick={() => room.id && router.push(`/pokoje/${room.id}`)}
                               className="flex-1 px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 text-sm"
                               disabled={!room.id}
                             >
                               Otwórz
                               <ChevronRight size={16} />
                             </button>
                           </div>
                           
                           <div className="flex gap-2">
                             <button
                               onClick={() => {
                                 setEditingRoom(room);
                                 setShowEditForm(true);
                               }}
                               className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-sm"
                               title="Edytuj pokój"
                             >
                               <Edit size={16} className="mx-auto" />
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
                               className="flex-1 px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm"
                               title="Usuń pokój"
                             >
                               <Trash2 size={16} className="mx-auto" />
                             </button>
                           </div>
                         </div>
                       </div>
                    );
                  })}

                  <div
                    className="group p-6 rounded-2xl border-2 border-dashed border-slate-300/70 hover:border-indigo-300 transition-all duration-300 flex flex-col items-center justify-center gap-4 min-h-[280px] bg-white/50 backdrop-blur-md hover:bg-white/70 cursor-pointer"
                    onClick={() => setShowForm(true)}
                  >
                    <div className="p-4 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                      <Plus size={40} strokeWidth={1.5} className="text-slate-500" />
                    </div>
                    <div className="text-center">
                      <h2 className="text-lg font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                        Dodaj pokój
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">
                        Nowy pokój do projektu
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

         {showForm && (
           <AddRoomForm
             onAdd={handleAddRoom}
             onClose={handleRoomFormClose}
             projectId={projectId}
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
             roomId="all"
             roomName={project?.name || "Projekt"}
             userId={user?.id}
             projectId={projectId}
             isProjectExport={true}
           />
         )}
         

      </div>
    </ProtectedRoute>
  );
}
