"use client";
import { useEffect, useState } from "react";
import { Room } from "../../../types";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
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
  Sun,
  Image as ImageIcon
} from "lucide-react";
import { RoomImagesManager } from "../../RoomImagesManager";

interface RoomVisualizationsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RoomVisualizationsPage({ params }: RoomVisualizationsPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [userPermission, setUserPermission] = useState<'read' | 'edit'>('read');

  useEffect(() => {
    const getRoomId = async () => {
      const { id } = await params;
      setRoomId(id);
    };
    getRoomId();
    
    // Get projectId from URL parameters
    const projectIdFromUrl = searchParams.get('projectId');
    if (projectIdFromUrl) {
      setProjectId(projectIdFromUrl);
    }
  }, [params, searchParams]);

  useEffect(() => {
    if (user && roomId) {
      // Fetch room details
      const roomUrl = projectId 
        ? `/api/rooms/${roomId}?userId=${user.id}&projectId=${projectId}`
        : `/api/rooms/${roomId}?userId=${user.id}`;
      
      fetch(roomUrl)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Error fetching room:', data.error);
            return;
          }
          setRoom(data.room);
          setUserPermission(data.userPermission);
        })
        .catch(error => {
          console.error('Error fetching room:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, roomId, projectId]);

  const goBackToRoom = () => {
    const backUrl = projectId 
      ? `/pokoje/${roomId}?projectId=${projectId}`
      : `/pokoje/${roomId}`;
    router.push(backUrl);
  };

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

  if (!room) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 font-inter flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">Pokój nie został znaleziony</h2>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
            >
              Powrót
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 font-inter flex flex-col">
        <div className="flex justify-center py-6 sm:py-10 px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-lg px-4 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg border border-white/30">
            <div className="p-1 sm:p-2 rounded-xl bg-indigo-100">
              {(() => {
                const iconMap: Record<string, any> = { 
                  Home, Sofa, Bed, Bath, Tv, Armchair, Utensils, Car, DoorOpen, 
                  TrendingUp, Monitor, Dumbbell, Baby, BookOpen, Palette, Music, 
                  Gamepad2, WashingMachine, TreePine, Sun 
                };
                const Icon = iconMap[room.icon] || Home;
                return <Icon size={24} className="sm:w-8 sm:h-8 text-indigo-600" />;
              })()}
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
                {room.name}
              </h1>
              <span className="text-slate-400">•</span>
              <div className="flex items-center gap-1 text-purple-600">
                <ImageIcon size={20} className="sm:w-6 sm:h-6" />
                <span className="text-lg sm:text-xl font-medium">Wizualizacje</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-12 mb-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={goBackToRoom}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/30 text-slate-700 hover:bg-white transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              <span>Powrót do pokoju</span>
            </button>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-purple-100">
                    <ImageIcon size={32} className="text-purple-600" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    Wizualizacje pokoju
                  </h2>
                </div>
                <p className="text-slate-600 text-lg">
                  Przeglądaj i zarządzaj zdjęciami wizualizacji dla pokoju <strong>{room.name}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 px-4 sm:px-6 md:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            <RoomImagesManager
              roomId={roomId}
              images={room.visualization_images}
              onImagesUpdate={(images) => {
                setRoom(prev => prev ? { ...prev, visualization_images: images } : null);
              }}
              userPermission={userPermission}
            />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
