"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

interface Product {
  id: string;
  room_id: string;
  name: string;
  description: string | null;
  link: string | null;
  shop: string | null;
  price: number;
  quantity: number;
  category: string | null;
  status: 'planned' | 'purchased';
  image_url: string | null;
  created_at: string;
  updated_at: string;
  room_name?: string;
}

export default function ProductDatabasePage() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShop, setFilterShop] = useState<string>('all');
  const [filterRoom, setFilterRoom] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (user?.id && !authLoading) {
      fetchAllProducts();
    }
  }, [user, authLoading]);

  const fetchAllProducts = async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/products/all?userId=${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Błąd podczas ładowania produktów');
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


  // Get unique products by link (if product has link) or by id (if no link)
  const uniqueProducts = products.reduce((acc, product) => {
    const key = product.link || product.id;
    if (!acc[key] || acc[key].created_at < product.created_at) {
      acc[key] = product;
    }
    return acc;
  }, {} as Record<string, Product>);

  const uniqueProductsList = Object.values(uniqueProducts);

  // Get unique shops and rooms for filters
  const shops = [...new Set(uniqueProductsList.map(p => p.shop).filter((shop): shop is string => Boolean(shop)))];
  const rooms = [...new Set(uniqueProductsList.map(p => p.room_name).filter((room): room is string => Boolean(room)))];

  // Filter products based on search term, shop and room
  const filteredProducts = uniqueProductsList.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.room_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesShop = filterShop === 'all' || product.shop === filterShop;
    const matchesRoom = filterRoom === 'all' || product.room_name === filterRoom;

    return matchesSearch && matchesShop && matchesRoom;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price * a.quantity;
        bValue = b.price * b.quantity;
        break;
      case 'shop':
        aValue = a.shop?.toLowerCase() || '';
        bValue = b.shop?.toLowerCase() || '';
        break;
      case 'created':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    } else {
      return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    }
  });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Baza moich produktów</h1>
              <p className="text-gray-600 mt-1">
                Unikalne produkty ze wszystkich projektów ({sortedProducts.length} z {uniqueProductsList.length} produktów)
              </p>
            </div>
            <Link 
              href="/projekty"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Wróć do projektów
            </Link>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtry i sortowanie</h3>
          
          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Szukaj</label>
              <input
                type="text"
                placeholder="Nazwa, opis, sklep..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pokój</label>
              <select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Wszystkie pokoje</option>
                {rooms.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sklep</label>
              <select
                value={filterShop}
                onChange={(e) => setFilterShop(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Wszystkie sklepy</option>
                {shops.map(shop => (
                  <option key={shop} value={shop}>{shop}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Sorting Row */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sortowanie</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleSort('name')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'name' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Nazwa {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => toggleSort('price')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'price' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cena {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => toggleSort('shop')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'shop' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sklep {sortBy === 'shop' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => toggleSort('created')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'created' 
                    ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Data dodania {sortBy === 'created' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchAllProducts}
              className="text-blue-600 hover:text-blue-500"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchTerm || filterRoom !== 'all' || filterShop !== 'all'
                ? 'Brak produktów spełniających kryteria' 
                : 'Brak produktów'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterRoom !== 'all' || filterShop !== 'all'
                ? 'Spróbuj zmienić filtry wyszukiwania' 
                : 'Dodaj pierwszy produkt w swoich projektach'}
            </p>
            <Link 
              href="/projekty"
              className="text-blue-600 hover:text-blue-500"
            >
              Przejdź do projektów
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4">
                {/* Image */}
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full flex items-center justify-center text-gray-400 text-3xl ${product.image_url ? 'hidden' : ''}`}>
                    📦
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {product.room_name} • {product.quantity} szt.
                    </p>
                  </div>

                  {/* Price */}
                  <div className="text-lg font-bold text-green-600">
                    {formatCurrency(product.price * product.quantity)}
                  </div>

                  {/* Shop */}
                  {product.shop && (
                    <div className="text-sm text-gray-600 truncate">
                      🏪 {product.shop}
                    </div>
                  )}

                  {/* Link */}
                  {product.link && (
                    <div className="pt-2">
                      <a 
                        href={product.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        🔗 Zobacz produkt
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
