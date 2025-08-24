"use client";
import { useEffect, useState } from "react";
import { Room } from "../../types";
import { Product } from "../../types/product";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, FileText, Download, Package } from "lucide-react";
import { AddProductForm } from "../AddProductForm";
import { ProductList } from "../ProductList";

interface RoomPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<string>('');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);

  useEffect(() => {
    const getRoomId = async () => {
      const { id } = await params;
      setRoomId(id);
    };
    getRoomId();
  }, [params]);

  useEffect(() => {
    if (user && roomId) {
      // Fetch room details
      fetch(`/api/rooms/${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Error fetching room:', data.error);
            return;
          }
          setRoom(data);
        })
        .catch(error => {
          console.error('Error fetching room:', error);
        });

      // Fetch products for this room
      fetch(`/api/products?roomId=${roomId}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Error fetching products:', data.error);
            return;
          }
          setProducts(data);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, roomId]);

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
        <div className="flex justify-center py-10 px-6">
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-lg border border-white/30">
            <div className="p-2 rounded-xl bg-indigo-100">
              <FileText size={32} className="text-indigo-600" />
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
              {room.name}
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
              <span>Powrót</span>
            </button>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/60">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-slate-700 mb-2">
                    Wydatki pokoju
                  </h2>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-bold text-slate-900">
                      {(room.expenses || 0).toLocaleString()} PLN
                    </span>
                    <span className="text-sm text-slate-500">
                      całkowite wydatki
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                    <FileText size={18} />
                    <span>Podgląd wydatków</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                    <Download size={18} />
                    <span>Eksportuj</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 px-6 md:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-slate-900">Produkty w pokoju</h2>
              <button
                onClick={() => setShowAddProductForm(true)}
                className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                <Plus size={20} />
                <span>Dodaj produkt</span>
              </button>
            </div>

            <ProductList 
              products={products}
              onEdit={(product) => {
                // TODO: Implement edit functionality
                console.log('Edit product:', product);
              }}
              onDelete={(productId) => {
                // TODO: Implement delete functionality
                console.log('Delete product:', productId);
              }}
            />
          </div>
        </main>

        {showAddProductForm && (
          <AddProductForm
            roomId={roomId}
            onAdd={async (newProduct) => {
              setAddingProduct(true);
              setProducts(prev => [newProduct, ...prev]);
              setShowAddProductForm(false);
              
              // Refresh room data to update expenses
              if (user && roomId) {
                try {
                  const roomResponse = await fetch(`/api/rooms/${roomId}`);
                  if (roomResponse.ok) {
                    const roomData = await roomResponse.json();
                    setRoom(roomData);
                  }
                } catch (error) {
                  console.error('Error refreshing room data:', error);
                }
              }
              setAddingProduct(false);
            }}
            onClose={() => setShowAddProductForm(false)}
          />
        )}

        {addingProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-white/40">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Dodawanie produktu...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
