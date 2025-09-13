"use client";
import { 
  Home, 
  ArrowLeft, 
  PieChart, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calculator,
  Users,
  Sofa, 
  Bed, 
  Bath, 
  Tv, 
  Armchair, 
  Utensils, 
  Car, 
  DoorOpen, 
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
import { Room } from "../../types";
import { Product } from "../../types/product";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useRouter } from "next/navigation";

interface RoomExpenseData {
  room: Room;
  totalExpenses: number;
  productCount: number;
  averageProductCost: number;
  purchasedAmount: number;
  plannedAmount: number;
  expensiveScenario: number;
  averageScenario: number;
  cheapScenario: number;
}


// Component for CSS-based pie chart
const PieChartCSS = ({ data, title, size = 200 }: { 
  data: Array<{ label: string; value: number; color: string }>, 
  title: string,
  size?: number 
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (total === 0) {
    return (
      <div className="flex flex-col items-center">
        <div 
          className="relative rounded-full border-8 border-gray-300 flex items-center justify-center text-gray-500"
          style={{ width: size, height: size }}
        >
          Brak danych
        </div>
        <h3 className="text-lg font-semibold mt-4 text-center">{title}</h3>
      </div>
    );
  }

  let cumulativePercentage = 0;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={size / 2 - 4}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const circumference = 2 * Math.PI * (size / 2 - 4);
            const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
            
            cumulativePercentage += percentage;
            
            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={size / 2 - 4}
                fill="transparent"
                stroke={item.color}
                strokeWidth="8"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-300 hover:stroke-width-10"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {total.toLocaleString('pl-PL', { maximumFractionDigits: 0 })}
            </div>
            <div className="text-sm text-slate-600">PLN</div>
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold mt-4 text-center">{title}</h3>
      <div className="mt-2 space-y-1">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-slate-700">
              {item.label}: {item.value.toLocaleString('pl-PL', { maximumFractionDigits: 0 })} PLN 
              ({((item.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function RoomsDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          // Fetch all user's rooms
          const roomsResponse = await fetch(`/api/rooms?userId=${user.id}`);
          const roomsData = await roomsResponse.json();
          
          if (Array.isArray(roomsData)) {
            const mappedRooms = roomsData.map((room: any) => ({
              ...room,
              icon: room.icon || 'Home',
            }));
            setRooms(mappedRooms);

            // Fetch all products from all rooms
            const allProductsPromises = mappedRooms.map((room: Room) => 
              fetch(`/api/products?roomId=${room.id}&userId=${user.id}`)
                .then(res => res.json())
                .then(data => data.products || [])
                .catch(() => [])
            );

            const allProductsArrays = await Promise.all(allProductsPromises);
            const allProductsFlat = allProductsArrays.flat();
            setAllProducts(allProductsFlat);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [user]);

  // Function to group products by name (within the same room context)
  const groupProductsByName = (products: Product[]): Array<{
    name: string;
    products: Product[];
    totalValue: number;
    maxPrice: number;
    minPrice: number;
    avgPrice: number;
    totalQuantity: number;
  }> => {
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

  // Function to calculate scenarios for a single room
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

  // Calculate room expense data
  const roomExpenseData: RoomExpenseData[] = rooms.map(room => {
    const roomProducts = allProducts.filter(product => product.room_id === room.id);
    const totalExpenses = roomProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const productCount = roomProducts.length;
    const averageProductCost = productCount > 0 ? totalExpenses / productCount : 0;
    
    // Calculate purchased and planned amounts
    const purchasedAmount = roomProducts
      .filter(product => product.status === 'purchased')
      .reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    const plannedAmount = roomProducts
      .filter(product => product.status === 'planned')
      .reduce((sum, product) => sum + (product.price * product.quantity), 0);
    
    // Calculate scenarios
    const scenarios = calculateRoomScenarios(roomProducts);
    
    return {
      room,
      totalExpenses,
      productCount,
      averageProductCost,
      purchasedAmount,
      plannedAmount,
      expensiveScenario: scenarios.expensiveScenario,
      averageScenario: scenarios.averageScenario,
      cheapScenario: scenarios.cheapScenario
    };
  }).filter(data => data.totalExpenses > 0);


  // Prepare chart data
  const roomChartData = roomExpenseData.map((data, index) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
      '#EC4899', '#6B7280', '#14B8A6', '#F97316', '#84CC16'
    ];
    
    return {
      label: data.room.name,
      value: data.totalExpenses,
      color: colors[index % colors.length]
    };
  });


  // Calculate statistics
  const totalExpenses = roomExpenseData.reduce((sum, data) => sum + data.totalExpenses, 0);
  const averageRoomExpense = roomExpenseData.length > 0 ? totalExpenses / roomExpenseData.length : 0;
  const mostExpensiveRoom = roomExpenseData.reduce((max, current) => 
    current.totalExpenses > max.totalExpenses ? current : max, 
    { room: { name: 'N/A' }, totalExpenses: 0 } as RoomExpenseData
  );
  const cheapestRoom = roomExpenseData.reduce((min, current) => 
    current.totalExpenses < min.totalExpenses ? current : min, 
    { room: { name: 'N/A' }, totalExpenses: Infinity } as RoomExpenseData
  );

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 font-inter flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Ładowanie dashboardu...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 font-inter">
        {/* Header */}
        <div className="flex justify-center py-6 sm:py-10 px-4 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-lg px-4 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg border border-white/30">
            <BarChart3 size={24} className="sm:w-8 sm:h-8 text-indigo-600" />
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
              Dashboard pokoi
            </h1>
          </div>
        </div>

        <div className="px-4 sm:px-6 md:px-12 pb-16">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-lg rounded-xl shadow-lg border border-white/30 text-slate-700 hover:bg-white transition-colors mb-4 sm:mb-6"
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Powrót do pokoi</span>
            </button>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
                <div className="flex items-center gap-3 mb-2">
                  <Calculator className="text-indigo-600" size={24} />
                  <span className="text-slate-600 font-medium">Całkowite wydatki</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {totalExpenses.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="text-blue-600" size={24} />
                  <span className="text-slate-600 font-medium">Średnia na pokój</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {averageRoomExpense.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="text-red-600" size={24} />
                  <span className="text-slate-600 font-medium">Najdroższy pokój</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">
                  {mostExpensiveRoom.room.name}
                </div>
                <div className="text-sm text-slate-600">
                  {mostExpensiveRoom.totalExpenses.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingDown className="text-green-600" size={24} />
                  <span className="text-slate-600 font-medium">Najtańszy pokój</span>
                </div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">
                  {cheapestRoom.totalExpenses !== Infinity ? cheapestRoom.room.name : 'N/A'}
                </div>
                <div className="text-sm text-slate-600">
                  {cheapestRoom.totalExpenses !== Infinity 
                    ? `${cheapestRoom.totalExpenses.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`
                    : 'Brak danych'
                  }
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                  <div className="flex-shrink-0">
                    <PieChartCSS 
                      data={roomChartData} 
                      title="Wydatki według pokoi" 
                      size={280}
                    />
                  </div>
                  <div className="flex-1 lg:pl-6">
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Analiza wydatków</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-600 font-medium">Łączna kwota:</span>
                        <span className="text-lg font-bold text-slate-900">
                          {roomExpenseData.reduce((sum, data) => sum + data.totalExpenses, 0).toLocaleString('pl-PL', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })} PLN
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-600 font-medium">Liczba pokoi:</span>
                        <span className="text-lg font-bold text-slate-900">{roomExpenseData.length}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-slate-600 font-medium">Średnia na pokój:</span>
                        <span className="text-lg font-bold text-slate-900">
                          {(roomExpenseData.reduce((sum, data) => sum + data.totalExpenses, 0) / Math.max(roomExpenseData.length, 1)).toLocaleString('pl-PL', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })} PLN
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Room Statistics */}
            <div className="mt-6 sm:mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6">
                Szczegóły pokoi
              </h2>
              {roomExpenseData.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-8 border border-white/60">
                    <PieChart size={64} className="text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-700 mb-2">
                      Brak danych do wyświetlenia
                    </h3>
                    <p className="text-slate-500">
                      Dodaj pokoje i produkty, aby zobaczyć statystyki wydatków.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {roomExpenseData.map((data, index) => {
                    const iconMap: Record<string, any> = { 
                      Home, Sofa, Bed, Bath, Tv, Armchair, Utensils, Car, DoorOpen, 
                      TrendingUp, Monitor, Dumbbell, Baby, BookOpen, Palette, Music, 
                      Gamepad2, WashingMachine, TreePine, Sun 
                    };
                    const Icon = iconMap[data.room.icon] || Home;
                    
                    return (
                      <div key={index} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-slate-50">
                            <Icon size={24} className="text-slate-700" />
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">{data.room.name}</h3>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <div className="text-xs text-slate-500 font-medium mb-1">Wydano dotychczas</div>
                              <div className="text-sm font-bold text-slate-900">
                                {data.purchasedAmount.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                              </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                              <div className="text-xs text-slate-500 font-medium mb-1">Produktów</div>
                              <div className="text-sm font-bold text-slate-900">{data.productCount}</div>
                            </div>
                          </div>
                          
                          {data.plannedAmount > 0 && (
                            <div className="border-t border-slate-200 pt-3">
                              <h4 className="text-sm font-semibold text-slate-700 mb-2">Estymaty kosztów</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center p-2 bg-red-50 rounded border border-red-200">
                                  <span className="text-xs text-red-600">Najdroższy:</span>
                                  <span className="text-sm font-bold text-red-700">
                                    {data.expensiveScenario.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded border border-yellow-200">
                                  <span className="text-xs text-yellow-600">Średni:</span>
                                  <span className="text-sm font-bold text-yellow-700">
                                    {data.averageScenario.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                                  <span className="text-xs text-green-600">Najtańszy:</span>
                                  <span className="text-sm font-bold text-green-700">
                                    {data.cheapScenario.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
