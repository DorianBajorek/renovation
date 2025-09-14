"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface UserStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  planningProjects: number;
  totalRooms: number;
  totalProducts: number;
  totalExpenses: number;
  mostExpensiveProject: {
    name: string;
    expenses: number;
  } | null;
  averageProjectCost: number;
  mostActiveRoom: {
    name: string;
    productCount: number;
  } | null;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchUserStats();
    }
  }, [user, authLoading]);

  const fetchUserStats = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch projects with their rooms and products
      const projectsResponse = await fetch(`/api/projects?userId=${user.id}`);
      if (!projectsResponse.ok) throw new Error('Failed to fetch projects');
      const projects = await projectsResponse.json();

      // Fetch all rooms
      const roomsResponse = await fetch(`/api/rooms?userId=${user.id}`);
      if (!roomsResponse.ok) throw new Error('Failed to fetch rooms');
      const roomsData = await roomsResponse.json();
      const rooms = roomsData.rooms || [];

      // Calculate statistics
      const totalProjects = projects.length;
      const activeProjects = projects.filter((p: any) => p.status === 'active').length;
      const completedProjects = projects.filter((p: any) => p.status === 'completed').length;
      const planningProjects = projects.filter((p: any) => p.status === 'planning').length;
      const totalRooms = rooms.length;
      
      // Calculate total products by fetching from each room
      let totalProducts = 0;
      let totalExpenses = 0;
      let mostActiveRoom = null;
      let maxProductCount = 0;

      for (const room of rooms) {
        try {
          const productsResponse = await fetch(`/api/products?roomId=${room.id}&userId=${user.id}`);
          if (productsResponse.ok) {
            const { products } = await productsResponse.json();
            totalProducts += products.length;
            
            // Calculate expenses for purchased products
            const roomExpenses = products
              .filter((p: any) => p.status === 'purchased')
              .reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0);
            totalExpenses += roomExpenses;

            // Find most active room
            if (products.length > maxProductCount) {
              maxProductCount = products.length;
              mostActiveRoom = {
                name: room.name,
                productCount: products.length
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching products for room ${room.id}:`, error);
        }
      }

      const averageProjectCost = totalProjects > 0 ? totalExpenses / totalProjects : 0;

      // Find most expensive project
      const mostExpensiveProject = projects.length > 0 
        ? projects.reduce((max: any, p: any) => p.expenses > max.expenses ? p : max, projects[0])
        : null;

      setStats({
        totalProjects,
        activeProjects,
        completedProjects,
        planningProjects,
        totalRooms,
        totalProducts,
        totalExpenses,
        mostExpensiveProject: mostExpensiveProject ? {
          name: mostExpensiveProject.name,
          expenses: mostExpensiveProject.expenses
        } : null,
        averageProjectCost,
        mostActiveRoom
      });

    } catch (error) {
      console.error('Error fetching user stats:', error);
      setError('Błąd podczas ładowania statystyk');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAccountAge = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `${diffDays} dni`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} miesięcy`;
    } else {
      const years = Math.floor(diffDays / 365);
      const months = Math.floor((diffDays % 365) / 30);
      return months > 0 ? `${years} lat ${months} miesięcy` : `${years} lat`;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Nie jesteś zalogowany</h1>
          <Link href="/login" className="text-blue-600 hover:text-blue-500">
            Przejdź do logowania
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            <Link 
              href="/projekty"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Moje Projekty
            </Link>
          </div>
        </div>

        {/* Personal Information Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informacje o koncie</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Imię i nazwisko</label>
                  <p className="mt-1 text-lg text-gray-900">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="mt-1 text-lg text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Data utworzenia konta</label>
                  <p className="mt-1 text-lg text-gray-900">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Aktywność konta</label>
                  <p className="mt-1 text-lg text-gray-900">{getAccountAge(user.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Overview */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Podsumowanie aktywności</h2>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={fetchUserStats}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Spróbuj ponownie
                  </button>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-700">Projekty</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.totalProjects}</p>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        🏠
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-700">Pokoje</p>
                        <p className="text-2xl font-bold text-green-900">{stats.totalRooms}</p>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        🚪
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-700">Produkty</p>
                        <p className="text-2xl font-bold text-purple-900">{stats.totalProducts}</p>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        📦
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-700">Wydatki</p>
                        <p className="text-xl font-bold text-red-900">{formatCurrency(stats.totalExpenses)}</p>
                      </div>
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        💸
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Detailed Statistics */}
        {stats && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Project Status Breakdown */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status projektów</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">Aktywne</span>
                  </div>
                  <span className="text-lg font-bold text-green-900">{stats.activeProjects}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm font-medium text-yellow-700">W planowaniu</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-900">{stats.planningProjects}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Zakończone</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stats.completedProjects}</span>
                </div>
              </div>
            </div>

            {/* Additional Statistics */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dodatkowe statystyki</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Średnie wydatki na projekt</label>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{formatCurrency(stats.averageProjectCost)}</p>
                </div>
                
                {stats.mostExpensiveProject && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Najdroższy projekt</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{stats.mostExpensiveProject.name}</p>
                    <p className="text-sm text-gray-600">{formatCurrency(stats.mostExpensiveProject.expenses)} wydane</p>
                  </div>
                )}

                {stats.mostActiveRoom && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Najaktywniejszy pokój</label>
                    <p className="mt-1 text-lg font-semibold text-gray-900">{stats.mostActiveRoom.name}</p>
                    <p className="text-sm text-gray-600">{stats.mostActiveRoom.productCount} produktów</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
