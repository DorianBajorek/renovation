"use client";
import { Plus, Home, ChevronRight, PieChart, Download, ArrowLeft, Sofa, Bed, Bath, Tv, Armchair } from "lucide-react";
import { useEffect, useState } from "react";
import { Room } from "../../../types";
import { AddRoomForm } from "../../../pokoje/AddRoomForm";
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
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...room,
          userId: user.id,
          projectId: projectId, // Add the project ID to the room
        }),
      });

      if (response.ok) {
        const newRoom = await response.json();
        
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
      } else {
        console.error('Failed to create room:', await response.text());
      }
    } catch (error) {
      console.error('Error adding room:', error);
    }
  };

  const handleRoomFormClose = () => {
    setShowForm(false);
  };

  const totalBudget = rooms.reduce((sum, room) => sum + room.budget, 0);

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
                    Budżet pokoi w projekcie
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-slate-900">
                      {totalBudget.toLocaleString()} PLN
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

              {project && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-medium text-slate-700 mb-2">Informacje o projekcie</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500">Status:</span>
                      <span className="ml-2 font-medium text-slate-700">
                        {project.status === 'active' ? 'Aktywny' : 
                         project.status === 'planning' ? 'Planowanie' : 
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

        <main className="flex-1 px-6 md:px-12 pb-16">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {rooms.map((room, idx) => {
                  const iconMap: Record<string, any> = { Home, Sofa, Bed, Bath, Tv, Armchair };
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
                          {room.budget.toLocaleString()} PLN
                        </span>
                      </div>
                      <button 
                        onClick={() => room.id && router.push(`/pokoje/${room.id}`)}
                        className="mt-6 w-full px-6 py-3 rounded-xl bg-white text-slate-700 font-medium hover:bg-indigo-50 transition-all duration-300 border border-slate-200/60 flex items-center justify-center gap-2 group-hover:border-indigo-200 group-hover:text-indigo-700"
                        disabled={!room.id}
                      >
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
      </div>
    </ProtectedRoute>
  );
}
