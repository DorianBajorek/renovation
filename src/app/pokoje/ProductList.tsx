"use client";
import { Product } from "../types/product";
import { Package, Edit, Trash2, CheckCircle, Clock, ShoppingCart, TrendingUp, Minus, TrendingDown, Search, X, Copy, ExternalLink } from "lucide-react";
import { useState, useMemo } from "react";
import { ImageModal } from "../../components/ImageModal";

interface ProductListProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  userPermission?: 'read' | 'edit';
}

// Function to parse text and convert URLs to clickable links
const parseTextWithLinks = (text: string) => {
  // Regex to match URLs (http, https, www)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
  
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      // Ensure URL has protocol
      const url = part.startsWith('www.') ? `https://${part}` : part;
      return (
        <a
          key={index}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:text-indigo-800 underline break-all"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'planned':
      return <Clock size={16} className="text-slate-500" />;
    case 'purchased':
      return <ShoppingCart size={16} className="text-blue-500" />;
    default:
      return <Clock size={16} className="text-slate-500" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'planned':
      return 'Planowany';
    case 'purchased':
      return 'Zakupiony';
    default:
      return 'Planowany';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'planned':
      return 'bg-slate-100 text-slate-700';
    case 'purchased':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

// Funkcja do kopiowania linku do schowka
const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    // Można dodać toast notification tutaj
  } catch (err) {
    console.error('Failed to copy text: ', err);
  }
};


interface ProductGroup {
  name: string;
  products: Product[];
  totalValue: number;
  maxPrice: number;
  minPrice: number;
  avgPrice: number;
  totalQuantity: number;
}

const groupProductsByName = (products: Product[]): ProductGroup[] => {
  const groups: Record<string, Product[]> = {};
  
  products.forEach(product => {
    // Normalize product name to lowercase for grouping
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
    
    // Calculate median
    const medianPrice = prices.length % 2 === 0 
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];
    
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

    // Use the first product's name as the display name (preserves original casing)
    const displayName = products[0].name;

    return {
      name: displayName,
      products,
      totalValue,
      maxPrice,
      minPrice,
      avgPrice: medianPrice, // Using median instead of average
      totalQuantity
    };
  }).sort((a, b) => b.totalValue - a.totalValue); // Sort by total value descending
};

export const ProductList = ({ products, onEdit, onDelete, userPermission = 'edit' }: ProductListProps) => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; alt: string }>({
    isOpen: false,
    imageUrl: '',
    alt: ''
  });
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCard = (cardId: string) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(cardId)) {
      newFlipped.delete(cardId);
    } else {
      newFlipped.add(cardId);
    }
    setFlippedCards(newFlipped);
  };

  const openImageModal = (imageUrl: string, alt: string) => {
    setImageModal({ isOpen: true, imageUrl, alt });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, imageUrl: '', alt: '' });
  };

  // Filter products based on search term only
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.shop?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={64} className="text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-slate-700 mb-2">
          Brak produktów w tym pokoju
        </h3>
        <p className="text-slate-500">
          Dodaj pierwszy produkt, aby rozpocząć śledzenie wydatków.
        </p>
      </div>
    );
  }

  const totalPurchasedValue = products
    .filter(product => product.status === 'purchased')
    .reduce((sum, product) => sum + (product.price * product.quantity), 0);
  
  // Calculate scenarios based on actual product prices within groups (same logic as GroupedProductList)
  const calculateScenarios = () => {
    const allGroups = groupProductsByName(products);

    let expensiveScenario = totalPurchasedValue;
    let averageScenario = totalPurchasedValue;
    let cheapScenario = totalPurchasedValue;

    allGroups.forEach(group => {
      const purchasedProducts = group.products.filter(p => p.status === 'purchased');
      const plannedProducts = group.products.filter(p => p.status === 'planned');
      
      // If we already have purchased products in this group, use their actual cost
      if (purchasedProducts.length > 0) {
        // Already included in totalPurchasedValue, so skip
        return;
      }
      
      // If no purchased products, use planned products for scenarios
      if (plannedProducts.length > 0) {
        const plannedPrices = plannedProducts.map(p => p.price * p.quantity).sort((a, b) => a - b);
        
        // For expensive scenario: use the highest price
        const maxValue = Math.max(...plannedPrices);
        expensiveScenario += maxValue;
        
        // For average scenario: use median price
        const medianValue = plannedPrices.length % 2 === 0 
          ? (plannedPrices[plannedPrices.length / 2 - 1] + plannedPrices[plannedPrices.length / 2]) / 2
          : plannedPrices[Math.floor(plannedPrices.length / 2)];
        averageScenario += medianValue;
        
        // For cheap scenario: use the lowest price
        const minValue = Math.min(...plannedPrices);
        cheapScenario += minValue;
      }
    });

    return { expensiveScenario, averageScenario, cheapScenario };
  };

  const scenarios = calculateScenarios();

  return (
    <div className="space-y-6">
      {/* Original Summary Section with 3D Cards */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Scenariusze wydatków</h3>
        </div>
        <div className="mb-4 p-3 bg-white rounded-lg border border-indigo-200">
          <div className="text-center">
            <span className="text-sm text-slate-600">Już wydane: </span>
            <span className="text-lg font-bold text-indigo-600">
              {totalPurchasedValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Scenariusz najdroższy */}
          <div 
            className="relative h-48 cursor-pointer perspective-1000"
            onClick={() => toggleCard('expensive')}
          >
            <div className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
              flippedCards.has('expensive') ? 'rotate-y-180' : ''
            }`}>
              {/* Front */}
              <div className="absolute inset-0 bg-white rounded-xl p-4 border border-indigo-200 backface-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={20} className="text-red-500" />
                  <span className="text-sm font-medium text-slate-600">Scenariusz najdroższy</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {scenarios.expensiveScenario.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kliknij aby zobaczyć wyjaśnienie
                </p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200 backface-hidden rotate-y-180">
                <div className="h-full flex flex-col justify-center">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">Jak obliczany jest scenariusz najdroższy?</h4>
                  <ul className="text-xs text-red-700 space-y-1">
                    <li>• Dla każdej grupy produktów:</li>
                    <li>• Jeśli produkt został zakupiony → używa jego ceny</li>
                    <li>• Jeśli nie zakupiono → bierze najdroższy z planowanych</li>
                    <li>• Sumuje wszystkie wartości</li>
                  </ul>
                  <p className="text-xs text-red-600 mt-2 font-medium">
                    Kliknij ponownie aby wrócić
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scenariusz średni */}
          <div 
            className="relative h-48 cursor-pointer perspective-1000"
            onClick={() => toggleCard('average')}
          >
            <div className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
              flippedCards.has('average') ? 'rotate-y-180' : ''
            }`}>
              {/* Front */}
              <div className="absolute inset-0 bg-white rounded-xl p-4 border border-indigo-200 backface-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <Minus size={20} className="text-blue-500" />
                  <span className="text-sm font-medium text-slate-600">Scenariusz średni</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {scenarios.averageScenario.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kliknij aby zobaczyć wyjaśnienie
                </p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 backface-hidden rotate-y-180">
                <div className="h-full flex flex-col justify-center">
                  <h4 className="text-sm font-semibold text-blue-800 mb-2">Jak obliczany jest scenariusz średni?</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Dla każdej grupy produktów:</li>
                    <li>• Jeśli produkt został zakupiony → używa jego ceny</li>
                    <li>• Jeśli nie zakupiono → bierze medianę z planowanych</li>
                    <li>• Sumuje wszystkie wartości</li>
                  </ul>
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    Kliknij ponownie aby wrócić
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scenariusz najtańszy */}
          <div 
            className="relative h-48 cursor-pointer perspective-1000"
            onClick={() => toggleCard('cheap')}
          >
            <div className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
              flippedCards.has('cheap') ? 'rotate-y-180' : ''
            }`}>
              {/* Front */}
              <div className="absolute inset-0 bg-white rounded-xl p-4 border border-indigo-200 backface-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown size={20} className="text-green-500" />
                  <span className="text-sm font-medium text-slate-600">Scenariusz najtańszy</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {scenarios.cheapScenario.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Kliknij aby zobaczyć wyjaśnienie
                </p>
              </div>
              {/* Back */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200 backface-hidden rotate-y-180">
                <div className="h-full flex flex-col justify-center">
                  <h4 className="text-sm font-semibold text-green-800 mb-2">Jak obliczany jest scenariusz najtańszy?</h4>
                  <ul className="text-xs text-green-700 space-y-1">
                    <li>• Dla każdej grupy produktów:</li>
                    <li>• Jeśli produkt został zakupiony → używa jego ceny</li>
                    <li>• Jeśli nie zakupiono → bierze najtańszy z planowanych</li>
                    <li>• Sumuje wszystkie wartości</li>
                  </ul>
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Kliknij ponownie aby wrócić
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Search Header */}
          <div className="flex items-center gap-2 mb-2">
            <Search size={20} className="text-indigo-600" />
            <h3 className="text-lg font-medium text-slate-900">Wyszukiwarka produktów</h3>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Szukaj produktów po nazwie, opisie, sklepie lub kategorii..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-slate-700 placeholder-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search Results Info */}
          {searchTerm && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Znaleziono: <span className="font-semibold text-slate-900">{filteredProducts.length}</span> z {products.length} produktów
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Wyczyść wyszukiwanie
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      {searchTerm && filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <Search size={64} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-700 mb-2">
            Nie znaleziono produktów
          </h3>
          <p className="text-slate-500 mb-4">
            Spróbuj zmienić kryteria wyszukiwania.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Wyczyść wyszukiwanie
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 relative">
              {/* Action Buttons - Always visible */}
              {userPermission === 'edit' && (
                <div className="absolute top-2 right-2 flex gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-sm border border-gray-200 z-10">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(product)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-all duration-200"
                      title="Edytuj produkt"
                    >
                      <Edit size={14} />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(product.id!)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                      title="Usuń produkt"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Image */}
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => openImageModal(product.image_url!, product.name)}
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
                    {product.quantity} szt. • {getStatusText(product.status)}
                  </p>
                </div>

                {/* Price */}
                <div className="text-lg font-bold text-green-600">
                  {(product.price * product.quantity).toLocaleString('pl-PL', { 
                    style: 'currency', 
                    currency: 'PLN' 
                  })}
                </div>

                {/* Shop */}
                {product.shop && (
                  <div className="text-base text-gray-700 truncate font-medium">
                    🏪 {product.shop}
                  </div>
                )}

                {/* Category */}
                {product.category && (
                  <div className="text-xs text-gray-500 truncate">
                    📂 {product.category}
                  </div>
                )}

                {/* Link */}
                {product.link && (
                  <div className="pt-2">
                    <a 
                      href={product.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-base font-semibold flex items-center gap-1"
                    >
                      🔗 Zobacz produkt
                    </a>
                  </div>
                )}

                {/* Description tooltip */}
                {product.description && (
                  <div className="pt-2">
                    <div 
                      className="text-xs text-gray-500 line-clamp-2 cursor-help"
                      title={product.description}
                    >
                      {product.description}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.isOpen}
        onClose={closeImageModal}
        imageUrl={imageModal.imageUrl}
        alt={imageModal.alt}
      />
    </div>
  );
};
