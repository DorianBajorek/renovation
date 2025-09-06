"use client";
import { useEffect, useState } from "react";
import { Room } from "../../types";
import { Product } from "../../types/product";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  Plus, 
  FileText, 
  Download, 
  Package,
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
import { AddProductForm } from "../AddProductForm";
import { EditProductForm } from "../EditProductForm";
import { GroupedProductList } from "../GroupedProductList";
import { ProductList } from "../ProductList";
import { ExportModal } from "../../components/ExportModal";
import { ImageGalleryModal } from "@/components/ImageGalleryModal";

interface RoomPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [room, setRoom] = useState<Room | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomId, setRoomId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [userPermission, setUserPermission] = useState<'read' | 'edit'>('read');
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showEditProductForm, setShowEditProductForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);
  const [useGroupedView, setUseGroupedView] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

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
        });

      // Fetch products for this room
      const productsUrl = projectId 
        ? `/api/products?roomId=${roomId}&userId=${user.id}&projectId=${projectId}`
        : `/api/products?roomId=${roomId}&userId=${user.id}`;
      
      fetch(productsUrl)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            console.error('Error fetching products:', data.error);
            return;
          }
          setProducts(data.products);
        })
        .catch(error => {
          console.error('Error fetching products:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, roomId, projectId]);

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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
              {room.name}
            </h1>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-12 mb-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/30 text-slate-700 hover:bg-white transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              <span>Powrót</span>
            </button>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-lg font-medium text-slate-700 mb-2">
                    Wydatki pokoju
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-3">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                      {(room.expenses || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                    </span>
                    <span className="text-sm text-slate-500">
                      całkowite wydatki
                    </span>
                  </div>
                  
                  
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowExportModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors w-full sm:w-auto"
                  >
                    <Download size={18} />
                    <span>Eksportuj</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 px-4 sm:px-6 md:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Visualization Preview Section */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60 mb-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-100">
                    <ImageIcon size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-900">
                      Wizualizacje pokoju
                    </h3>
                    <p className="text-sm text-slate-600">
                      {room.visualization_images && room.visualization_images.length > 0 
                        ? `${room.visualization_images.length} ${room.visualization_images.length === 1 ? 'zdjęcie' : room.visualization_images.length < 5 ? 'zdjęcia' : 'zdjęć'}`
                        : 'Brak zdjęć wizualizacji'
                      }
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    const visualizationsUrl = projectId 
                      ? `/pokoje/${roomId}/wizualizacje?projectId=${projectId}`
                      : `/pokoje/${roomId}/wizualizacje`;
                    router.push(visualizationsUrl);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors text-sm w-full sm:w-auto"
                >
                  <ImageIcon size={16} />
                  <span>{room.visualization_images && room.visualization_images.length > 0 ? 'Zobacz wszystkie' : 'Dodaj zdjęcia'}</span>
                </button>
              </div>

              {/* Preview Images */}
              {room.visualization_images && room.visualization_images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {room.visualization_images.slice(0, 4).map((imageUrl, index) => (
                    <div
                      key={index}
                      className="relative group bg-slate-50 rounded-lg overflow-hidden aspect-square border border-slate-200 hover:border-purple-300 transition-all duration-200 cursor-pointer hover:shadow-md"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Wizualizacja pokoju ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                          if (errorDiv) errorDiv.style.display = 'flex';
                        }}
                      />
                      
                      {/* Error fallback */}
                      <div 
                        className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500"
                        style={{ display: 'none' }}
                      >
                        <div className="text-center">
                          <ImageIcon size={16} className="mx-auto mb-1" />
                          <p className="text-xs">Błąd</p>
                        </div>
                      </div>
                      
                      {/* Image counter for the last image if there are more */}
                      {index === 3 && room.visualization_images && room.visualization_images.length > 4 && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                            <p className="text-white font-semibold text-sm">+{room.visualization_images.length - 4}</p>
                            <p className="text-white/80 text-xs text-center">więcej</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty state */
                <div className="text-center py-12 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border-2 border-dashed border-purple-200">
                  <div className="max-w-sm mx-auto">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ImageIcon size={32} className="text-purple-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-800 mb-2">Brak wizualizacji</h4>
                    <p className="text-slate-600 mb-4">
                      Dodaj zdjęcia wizualizacji, aby pokazać jak pokój ma wyglądać lub jak wygląda obecnie.
                    </p>
                    {userPermission === 'edit' && (
                      <button
                        onClick={() => {
                          const visualizationsUrl = projectId 
                            ? `/pokoje/${roomId}/wizualizacje?projectId=${projectId}`
                            : `/pokoje/${roomId}/wizualizacje`;
                          router.push(visualizationsUrl);
                        }}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                      >
                        <Plus size={18} />
                        <span>Dodaj pierwsze zdjęcie</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Produkty w pokoju</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-lg rounded-xl p-1 border border-white/30 self-center">
                  <button
                    onClick={() => setUseGroupedView(true)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      useGroupedView 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Grupowane
                  </button>
                  <button
                    onClick={() => setUseGroupedView(false)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !useGroupedView 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-600 hover:text-slate-800'
                    }`}
                  >
                    Lista
                  </button>
                </div>
                                 {userPermission === 'edit' && (
                   <button
                     onClick={() => setShowAddProductForm(true)}
                     className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                   >
                     <Plus size={20} />
                     <span>Dodaj produkt</span>
                   </button>
                 )}
              </div>
            </div>

            {useGroupedView ? (
              <GroupedProductList 
                products={products}
                userPermission={userPermission}
                onEdit={(product) => {
                  setEditingProduct(product);
                  setShowEditProductForm(true);
                }}
                onDelete={async (productId) => {
                  if (confirm('Czy na pewno chcesz usunąć ten produkt?')) {
                    if (!user) return;
                    try {
                      const response = await fetch(`/api/products/${productId}?userId=${user.id}`, {
                        method: 'DELETE',
                      });

                      if (response.ok) {
                        setProducts(prev => prev.filter(p => p.id !== productId));
                        
                        // Refresh room data to update expenses
                        if (user && roomId) {
                          try {
                            const roomUrl = projectId 
                              ? `/api/rooms/${roomId}?userId=${user.id}&projectId=${projectId}`
                              : `/api/rooms/${roomId}?userId=${user.id}`;
                            const roomResponse = await fetch(roomUrl);
                            if (roomResponse.ok) {
                              const roomData = await roomResponse.json();
                              setRoom(roomData.room);
                            }
                          } catch (error) {
                            console.error('Error refreshing room data:', error);
                          }
                        }
                      } else {
                        alert('Błąd podczas usuwania produktu');
                      }
                    } catch (error) {
                      console.error('Error deleting product:', error);
                      alert('Błąd podczas usuwania produktu');
                    }
                  }
                }}
              />
            ) : (
              <ProductList 
                products={products}
                userPermission={userPermission}
                onEdit={(product) => {
                  setEditingProduct(product);
                  setShowEditProductForm(true);
                }}
                onDelete={async (productId) => {
                  if (confirm('Czy na pewno chcesz usunąć ten produkt?')) {
                    if (!user) return;
                    try {
                      const response = await fetch(`/api/products/${productId}?userId=${user.id}`, {
                        method: 'DELETE',
                      });

                      if (response.ok) {
                        setProducts(prev => prev.filter(p => p.id !== productId));
                        
                        // Refresh room data to update expenses
                        if (user && roomId) {
                          try {
                            const roomUrl = projectId 
                              ? `/api/rooms/${roomId}?userId=${user.id}&projectId=${projectId}`
                              : `/api/rooms/${roomId}?userId=${user.id}`;
                            const roomResponse = await fetch(roomUrl);
                            if (roomResponse.ok) {
                              const roomData = await roomResponse.json();
                              setRoom(roomData.room);
                            }
                          } catch (error) {
                            console.error('Error refreshing room data:', error);
                          }
                        }
                      } else {
                        alert('Błąd podczas usuwania produktu');
                      }
                    } catch (error) {
                      console.error('Error deleting product:', error);
                      alert('Błąd podczas usuwania produktu');
                    }
                  }
                }}
              />
            )}
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
                  const roomUrl = projectId 
                    ? `/api/rooms/${roomId}?userId=${user.id}&projectId=${projectId}`
                    : `/api/rooms/${roomId}?userId=${user.id}`;
                  const roomResponse = await fetch(roomUrl);
                  if (roomResponse.ok) {
                    const roomData = await roomResponse.json();
                    setRoom(roomData.room);
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

        {showEditProductForm && editingProduct && (
          <EditProductForm
            product={editingProduct}
            onUpdate={(updatedProduct) => {
              setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
              setShowEditProductForm(false);
              setEditingProduct(null);
              
              // Refresh room data to update expenses
              if (user && roomId) {
                const roomUrl = projectId 
                  ? `/api/rooms/${roomId}?userId=${user.id}&projectId=${projectId}`
                  : `/api/rooms/${roomId}?userId=${user.id}`;
                fetch(roomUrl)
                  .then(res => res.json())
                  .then(data => {
                    if (!data.error) {
                      setRoom(data.room);
                    }
                  })
                  .catch(error => {
                    console.error('Error refreshing room data:', error);
                  });
              }
            }}
            onClose={() => {
              setShowEditProductForm(false);
              setEditingProduct(null);
            }}
          />
        )}

        {showExportModal && (
          <ExportModal
            isOpen={showExportModal}
            onClose={() => setShowExportModal(false)}
            roomId={roomId}
            roomName={room.name}
            userId={user?.id}
          />
        )}

        {/* Image Gallery Modal */}
        {selectedImageIndex !== null && room.visualization_images && (
          <ImageGalleryModal
            images={room.visualization_images}
            initialIndex={selectedImageIndex}
            onClose={() => setSelectedImageIndex(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
