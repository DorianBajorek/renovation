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
  TrendingDown,
  Minus,
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
import { Product } from "../../../types/product";
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

interface ProductGroup {
  name: string;
  products: Product[];
  totalValue: number;
  maxPrice: number;
  minPrice: number;
  avgPrice: number;
  totalQuantity: number;
}

export default function ProjectRoomsPage({ params }: ProjectRoomsPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [project, setProject] = useState<any>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [projectId, setProjectId] = useState<string>('');
  const [userPermission, setUserPermission] = useState<'read' | 'edit'>('read');
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  // Function to toggle cost scenario cards
  const toggleCard = (cardId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) {
      newFlipped.delete(cardId);
    } else {
      newFlipped.add(cardId);
    }
    setFlippedCards(newFlipped);
  };

  // Function to group products by name (within the same room context)
  const groupProductsByName = (products: Product[]): ProductGroup[] => {
    const groups: Record<string, Product[]> = {};
    
    products.forEach(product => {
      const normalizedName = product.name.toLowerCase().trim();
      if (!groups[normalizedName]) {
        groups[normalizedName] = [];
      }
      groups[normalizedName].push(product);
    });

    return Object.entries(groups).map(([normalizedName, products]) => {
      const prices = products.map(p => p.price).sort((a, b) => a - b);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      const medianPrice = prices.length % 2 === 0 
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];
      
      const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
      const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
      const displayName = products[0].name;

      return {
        name: displayName,
        products,
        totalValue,
        maxPrice,
        minPrice,
        avgPrice: medianPrice,
        totalQuantity
      };
    }).sort((a, b) => b.totalValue - a.totalValue);
  };

  // Function to calculate scenarios for a single room (same logic as GroupedProductList)
  const calculateRoomScenarios = (roomProducts: Product[]) => {
    const roomGroups = groupProductsByName(roomProducts);
    
    const totalPurchasedValue = roomProducts
      .filter(product => product.status === 'purchased')
      .reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    let expensiveScenario = totalPurchasedValue;
    let averageScenario = totalPurchasedValue;
    let cheapScenario = totalPurchasedValue;

    roomGroups.forEach(group => {
      const purchasedProducts = group.products.filter(p => p.status === 'purchased');
      const plannedProducts = group.products.filter(p => p.status === 'planned');
      
      if (plannedProducts.length > 0 && purchasedProducts.length === 0) {
        const plannedValues = plannedProducts.map(p => p.price * p.quantity).sort((a, b) => a - b);
        
        const maxValue = Math.max(...plannedValues);
        const minValue = Math.min(...plannedValues);
        const medianValue = plannedValues.length % 2 === 0 
          ? (plannedValues[plannedValues.length / 2 - 1] + plannedValues[plannedValues.length / 2]) / 2
          : plannedValues[Math.floor(plannedValues.length / 2)];
        
        expensiveScenario += maxValue;
        averageScenario += medianValue;
        cheapScenario += minValue;
      }
    });

    return { expensiveScenario, averageScenario, cheapScenario };
  };

  // Function to calculate cost scenarios for all products
  // Oblicza scenariusze dla każdego pokoju osobno, potem sumuje wyniki
  const calculateProjectScenarios = () => {
    if (allProducts.length === 0) {
      return { 
        expensiveScenario: 0,
        averageScenario: 0,
        cheapScenario: 0,
        totalPurchasedValue: 0,
        totalPlannedValue: 0
      };
    }
    
    const totalPurchasedValue = allProducts
      .filter(product => product.status === 'purchased')
      .reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    const totalPlannedValue = allProducts
      .filter(product => product.status === 'planned')
      .reduce((sum, product) => sum + (product.price * product.quantity), 0);

    // Grupuj produkty według pokoji i oblicz scenariusze dla każdego pokoju osobno
    const productsByRoom = new Map<string, Product[]>();
    allProducts.forEach(product => {
      const roomId = product.room_id || 'unknown';
      if (!productsByRoom.has(roomId)) {
        productsByRoom.set(roomId, []);
      }
      productsByRoom.get(roomId)!.push(product);
    });

    // Sumuj scenariusze ze wszystkich pokoi
    let totalExpensiveScenario = 0;
    let totalAverageScenario = 0;
    let totalCheapScenario = 0;

    productsByRoom.forEach((roomProducts, roomId) => {
      const roomScenarios = calculateRoomScenarios(roomProducts);
      totalExpensiveScenario += roomScenarios.expensiveScenario;
      totalAverageScenario += roomScenarios.averageScenario;
      totalCheapScenario += roomScenarios.cheapScenario;
    });

    return { 
      expensiveScenario: totalExpensiveScenario,
      averageScenario: totalAverageScenario,
      cheapScenario: totalCheapScenario,
      totalPurchasedValue,
      totalPlannedValue
    };
  };

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
          if (data.rooms && Array.isArray(data.rooms)) {
            const mappedRooms = data.rooms.map((room: any) => ({
              ...room,
              icon: room.icon || 'Home',
            }));
            setRooms(mappedRooms);
          // Store user permission for conditional rendering
          setUserPermission(data.userPermission);

          // Fetch all products from all rooms in the project
          const fetchAllProducts = async () => {
            try {
              const allProductsPromises = mappedRooms.map((room: Room) => 
                fetch(`/api/products?roomId=${room.id}&userId=${user.id}&projectId=${projectId}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.error) {
                      console.error('Error fetching products for room:', room.id, data.error);
                      return [];
                    }
                    return data.products || [];
                  })
                  .catch(error => {
                    console.error('Error fetching products for room:', room.id, error);
                    return [];
                  })
              );

              const allProductsArrays = await Promise.all(allProductsPromises);
              const allProductsFlat = allProductsArrays.flat();
              setAllProducts(allProductsFlat);
            } catch (error) {
              console.error('Error fetching all products:', error);
            }
          };

          fetchAllProducts();
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
        if (refreshedData.rooms && Array.isArray(refreshedData.rooms)) {
          const mappedRooms = refreshedData.rooms.map((room: any) => ({
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

  // Use project expenses from API instead of summing room expenses
  const totalExpenses = project?.expenses || 0;
  
  // Calculate scenarios
  const scenarios = calculateProjectScenarios();

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
        <div className="flex justify-center py-6 sm:py-10 px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-lg px-4 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg border border-white/30">
            <Home size={24} className="sm:w-8 sm:h-8 text-black" />
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
              Pokoje projektu: {project?.name || 'Ładowanie...'}
            </h1>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-12 mb-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => router.push('/projekty')}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/30 text-slate-700 hover:bg-white transition-colors mb-4 sm:mb-6"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Powrót do projektów</span>
            </button>

            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-base sm:text-lg font-medium text-slate-700 mb-2">
                    Wydatki i przewidywania projektu
                  </h2>
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2 mb-3">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                      {totalExpenses.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                    </span>
                    <span className="text-xs sm:text-sm text-slate-500">
                      wydane z {rooms.length} pomieszczeń
                    </span>
                  </div>

                  
                  {/* Pasek postępu budżetu projektu */}
                  {project?.budget && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm text-slate-600">
                        <span>Wykorzystanie budżetu projektu</span>
                        <span>{Math.round((totalExpenses / project.budget) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-300 ${
                            totalExpenses / project.budget > 0.9 
                              ? 'bg-red-500' 
                              : totalExpenses / project.budget > 0.7 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((totalExpenses / project.budget) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>Budżet projektu: {project.budget?.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN</span>
                        <span>Pozostało: {(project.budget - totalExpenses).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => {
                      router.push(`/projekty/${projectId}/dashboard`);
                    }}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-indigo-100 text-indigo-700 rounded-xl font-medium hover:bg-indigo-200 transition-colors text-sm sm:text-base"
                  >
                    <PieChart size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Dashboard</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (!user?.id || !projectId) {
                        alert('Brak ID użytkownika lub projektu');
                        return;
                      }
                      setShowExportModal(true);
                    }}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm sm:text-base"
                  >
                    <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                    <span>Eksportuj</span>
                  </button>
                </div>
              </div>

              {/* Cost Scenarios Section - Only show if we have products */}
              {allProducts.length > 0 && (
                <div className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-indigo-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">Scenariusze kosztów całego projektu</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Scenariusz najdroższy */}
                    <div 
                      className="relative h-40 cursor-pointer perspective-1000"
                      onClick={() => toggleCard('expensive')}
                    >
                      <div className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
                        flippedCards.has('expensive') ? 'rotate-y-180' : ''
                      }`}>
                        {/* Front */}
                        <div className="absolute inset-0 bg-white rounded-xl p-4 border border-indigo-200 backface-hidden">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={20} className="text-red-500" />
                            <span className="text-sm font-medium text-slate-600">Najdroższy</span>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-red-600">
                            {scenarios.expensiveScenario.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Kliknij dla szczegółów
                          </p>
                        </div>
                        {/* Back */}
                        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 backface-hidden rotate-y-180">
                          <div className="h-full flex flex-col justify-center">
                            <h4 className="text-sm font-semibold text-red-800 mb-2">Scenariusz najdroższy</h4>
                            <ul className="text-xs text-red-700 space-y-1">
                              <li>• Zakupione produkty: rzeczywista cena</li>
                              <li>• W każdym pokoju: najdroższa opcja z grup</li>
                              <li>• Sumuje się ze wszystkich pokoi</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scenariusz średni */}
                    <div 
                      className="relative h-40 cursor-pointer perspective-1000"
                      onClick={() => toggleCard('average')}
                    >
                      <div className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
                        flippedCards.has('average') ? 'rotate-y-180' : ''
                      }`}>
                        {/* Front */}
                        <div className="absolute inset-0 bg-white rounded-xl p-4 border border-indigo-200 backface-hidden">
                          <div className="flex items-center gap-2 mb-2">
                            <Minus size={20} className="text-blue-500" />
                            <span className="text-sm font-medium text-slate-600">Średni</span>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-600">
                            {scenarios.averageScenario.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Kliknij dla szczegółów
                          </p>
                        </div>
                        {/* Back */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 backface-hidden rotate-y-180">
                          <div className="h-full flex flex-col justify-center">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2">Scenariusz średni</h4>
                            <ul className="text-xs text-blue-700 space-y-1">
                              <li>• Zakupione produkty: rzeczywista cena</li>
                              <li>• W każdym pokoju: mediana cen z grup</li>
                              <li>• Najbardziej prawdopodobny koszt</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scenariusz najtańszy */}
                    <div 
                      className="relative h-40 cursor-pointer perspective-1000"
                      onClick={() => toggleCard('cheap')}
                    >
                      <div className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
                        flippedCards.has('cheap') ? 'rotate-y-180' : ''
                      }`}>
                        {/* Front */}
                        <div className="absolute inset-0 bg-white rounded-xl p-4 border border-indigo-200 backface-hidden">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingDown size={20} className="text-green-500" />
                            <span className="text-sm font-medium text-slate-600">Najtańszy</span>
                          </div>
                          <div className="text-xl sm:text-2xl font-bold text-green-600">
                            {scenarios.cheapScenario.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Kliknij dla szczegółów
                          </p>
                        </div>
                        {/* Back */}
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 backface-hidden rotate-y-180">
                          <div className="h-full flex flex-col justify-center">
                            <h4 className="text-sm font-semibold text-green-800 mb-2">Scenariusz najtańszy</h4>
                            <ul className="text-xs text-green-700 space-y-1">
                              <li>• Zakupione produkty: rzeczywista cena</li>
                              <li>• W każdym pokoju: najtańsza opcja z grup</li>
                              <li>• Minimalny możliwy koszt</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

                <main className="flex-1 px-4 sm:px-6 md:px-12 pb-16 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {rooms.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 sm:p-8 border border-white/60">
                  <Home size={48} className="sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-medium text-slate-700 mb-2">
                    Brak pokoi w tym projekcie
                  </h3>
                  <p className="text-slate-500 mb-4 sm:mb-6 text-sm sm:text-base">
                    Dodaj pierwszy pokój do tego projektu, aby rozpocząć planowanie remontu.
                  </p>
                  {userPermission === 'edit' && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors mx-auto text-sm sm:text-base"
                    >
                      <Plus size={18} className="sm:w-5 sm:h-5" />
                      <span>Dodaj pierwszy pokój</span>
                    </button>
                  )}
                  {userPermission === 'read' && (
                    <p className="text-sm text-slate-600 text-center">
                      Nie masz uprawnień do dodawania pokoi w tym projekcie.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                    Pokoje w projekcie ({rooms.length})
                  </h3>
                  <div className="text-xs sm:text-sm text-slate-500">
                    Kliknij "Otwórz" aby zobaczyć produkty
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
                         className="group p-4 sm:p-6 rounded-2xl bg-white/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white/60 flex flex-col min-h-[240px] sm:min-h-[280px] hover:-translate-y-1 cursor-pointer"
                         onClick={() => room.id && router.push(`/pokoje/${room.id}?projectId=${projectId}`)}
                       >
                         <div className="flex flex-col items-center gap-3 sm:gap-4 mb-4">
                                                       <div className="p-3 sm:p-4 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                              <Icon size={32} className="sm:w-10 sm:h-10 strokeWidth={1.5} text-slate-700 transition-colors" />
                            </div>
                           <div className="text-center">
                             <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">
                               {room.name}
                             </h2>
                             <span className="px-2 sm:px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs sm:text-sm group-hover:bg-indigo-100 transition-colors">
                               {(room.expenses || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                             </span>
                           </div>
                         </div>
                         
                         <div className="mt-auto space-y-2 sm:space-y-3">
                           <div className="flex gap-2">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 room.id && router.push(`/pokoje/${room.id}?projectId=${projectId}`);
                               }}
                               className="flex-1 px-2 sm:px-3 py-2 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                               disabled={!room.id}
                             >
                               Otwórz
                               <ChevronRight size={14} className="sm:w-4 sm:h-4" />
                             </button>
                           </div>
                           
                                                       {userPermission === 'edit' && (
                             <>
                               <div className="flex gap-2">
                                 <button
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     setEditingRoom(room);
                                     setShowEditForm(true);
                                   }}
                                   className="flex-1 px-2 sm:px-3 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors text-xs sm:text-sm"
                                   title="Edytuj pokój"
                                 >
                                   <Edit size={14} className="sm:w-4 sm:h-4 mx-auto" />
                                 </button>
                                 <button
                                   onClick={async (e) => {
                                     e.stopPropagation();
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
                                   className="flex-1 px-2 sm:px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-xs sm:text-sm"
                                   title="Usuń pokój"
                                 >
                                   <Trash2 size={14} className="sm:w-4 sm:h-4 mx-auto" />
                                 </button>
                               </div>
                             </>
                           )}
                         </div>
                       </div>
                    );
                  })}

                                     {userPermission === 'edit' && (
                     <div
                       className="group p-4 sm:p-6 rounded-2xl border-2 border-dashed border-slate-300/70 hover:border-indigo-300 transition-all duration-300 flex flex-col items-center justify-center gap-3 sm:gap-4 min-h-[240px] sm:min-h-[280px] bg-white/50 backdrop-blur-md hover:bg-white/70 cursor-pointer"
                       onClick={() => setShowForm(true)}
                     >
                       <div className="p-3 sm:p-4 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-105 transition-all duration-300">
                         <Plus size={32} className="sm:w-10 sm:h-10 strokeWidth={1.5} text-slate-500" />
                       </div>
                       <div className="text-center">
                         <h2 className="text-base sm:text-lg font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                           Dodaj pokój
                         </h2>
                         <p className="text-xs sm:text-sm text-slate-400 mt-1">
                           Nowy pokój do projektu
                         </p>
                       </div>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </main>

       {showForm && userPermission === 'edit' && (
         <AddRoomForm
           onAdd={handleAddRoom}
           onClose={handleRoomFormClose}
           projectId={projectId}
         />
       )}

       {showEditForm && editingRoom && userPermission === 'edit' && (
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
