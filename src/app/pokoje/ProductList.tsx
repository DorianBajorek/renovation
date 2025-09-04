"use client";
import { Product } from "../types/product";
import { Package, Edit, Trash2, CheckCircle, Clock, ShoppingCart, TrendingUp, Minus, TrendingDown, Search, X } from "lucide-react";
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

  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const totalPurchasedValue = products
    .filter(product => product.status === 'purchased')
    .reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const totalPlannedValue = products
    .filter(product => product.status === 'planned')
    .reduce((sum, product) => sum + (product.price * product.quantity), 0);

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
                  {totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
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
                  {(totalPurchasedValue + totalPlannedValue * 0.8).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
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
                  {(totalPurchasedValue + totalPlannedValue * 0.6).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
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

      <div className="space-y-4">
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
          filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 overflow-hidden hover:shadow-xl transition-all duration-200"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  {/* Product Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow duration-200">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onClick={() => openImageModal(product.image_url!, product.name)}
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full bg-indigo-100 flex items-center justify-center" style={{ display: 'none' }}>
                            <Package size={24} className="text-indigo-600" />
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded-lg bg-indigo-100">
                          <Package size={18} className="text-indigo-600" />
                        </div>
                      )}
                      <h4 className="text-lg font-semibold text-slate-900">{product.name}</h4>
                    </div>
                    <span className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(product.status)}`}>
                      {getStatusText(product.status)}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                      <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        Cena: {product.price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                      </span>
                      <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        Ilość: {product.quantity}
                      </span>
                      <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        Wartość: {(product.price * product.quantity).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN
                      </span>
                      {product.shop && (
                        <span className="text-sm font-medium text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                          Sklep: {product.shop}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Product Description */}
                  {product.description && (
                    <div className="mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {parseTextWithLinks(product.description)}
                      </p>
                    </div>
                  )}
                  
                  {/* Product Link */}
                  {product.link && (
                    <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-blue-700">Link do produktu:</span>
                        <a
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {product.link}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {/* Product Shop */}
                  {product.shop && (
                    <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-700">Sklep:</span>
                        <span className="text-green-600 text-sm font-medium">
                          {product.shop}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Product Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    {product.category && (
                      <span className="text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                        Kategoria: {product.category}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                {userPermission === 'edit' && (
                  <div className="flex items-center gap-2 sm:ml-4 self-start sm:self-center">
                    {onEdit && (
                      <button
                        onClick={() => onEdit(product)}
                        className="p-2 sm:p-3 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Edytuj produkt"
                      >
                        <Edit size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(product.id!)}
                        className="p-2 sm:p-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Usuń produkt"
                      >
                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          ))
        )}
      </div>

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
