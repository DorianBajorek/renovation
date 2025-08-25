"use client";
import { Product } from "../types/product";
import { Package, Edit, Trash2, CheckCircle, Clock, ShoppingCart, ChevronDown, ChevronRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";

interface ProductListProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
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

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'planned':
      return <Clock size={16} className="text-slate-500" />;
    case 'purchased':
      return <ShoppingCart size={16} className="text-blue-500" />;
    case 'installed':
      return <CheckCircle size={16} className="text-green-500" />;
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
    case 'installed':
      return 'Zainstalowany';
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
    case 'installed':
      return 'bg-green-100 text-green-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
};

const groupProductsByName = (products: Product[]): ProductGroup[] => {
  const groups: Record<string, Product[]> = {};
  
  products.forEach(product => {
    if (!groups[product.name]) {
      groups[product.name] = [];
    }
    groups[product.name].push(product);
  });

  return Object.entries(groups).map(([name, products]) => {
    const prices = products.map(p => p.price).sort((a, b) => a - b);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    
    // Calculate median
    const medianPrice = prices.length % 2 === 0 
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];
    
    const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);

    return {
      name,
      products,
      totalValue,
      maxPrice,
      minPrice,
      avgPrice: medianPrice, // Using median instead of average
      totalQuantity
    };
  }).sort((a, b) => b.totalValue - a.totalValue); // Sort by total value descending
};

export const GroupedProductList = ({ products, onEdit, onDelete }: ProductListProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [showSummary, setShowSummary] = useState(true);

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package size={48} className="text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-700 mb-2">
          Brak produktów w tym pokoju
        </h3>
        <p className="text-slate-500">
          Dodaj pierwszy produkt, aby rozpocząć śledzenie wydatków.
        </p>
      </div>
    );
  }

  const groupedProducts = groupProductsByName(products);
  
  // Calculate total value of purchased products only
  const totalPurchasedValue = products
    .filter(product => product.status === 'purchased')
    .reduce((sum, product) => sum + (product.price * product.quantity), 0);

  // Calculate summary statistics for different scenarios
  const calculateScenarioCosts = () => {
    const plannedAndPurchasedProducts = products.filter(p => p.status === 'planned' || p.status === 'purchased');
    
    if (plannedAndPurchasedProducts.length === 0) {
      return {
        expensiveScenario: 0,
        averageScenario: 0,
        cheapScenario: 0
      };
    }

    // Group products by name
    const groups: Record<string, Product[]> = {};
    plannedAndPurchasedProducts.forEach(product => {
      if (!groups[product.name]) {
        groups[product.name] = [];
      }
      groups[product.name].push(product);
    });

    let expensiveScenario = 0;
    let averageScenario = 0;
    let cheapScenario = 0;

    Object.values(groups).forEach(groupProducts => {
      const prices = groupProducts.map(p => p.price).sort((a, b) => a - b);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      // Calculate median
      const medianPrice = prices.length % 2 === 0 
        ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
        : prices[Math.floor(prices.length / 2)];

      expensiveScenario += maxPrice;
      averageScenario += medianPrice;
      cheapScenario += minPrice;
    });

    return {
      expensiveScenario: Math.round(expensiveScenario),
      averageScenario: Math.round(averageScenario),
      cheapScenario: Math.round(cheapScenario)
    };
  };

  const scenarioCosts = calculateScenarioCosts();

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      {showSummary && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                     <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-slate-900">Scenariusze wydatków</h3>
           </div>
           <div className="mb-4 p-3 bg-white rounded-lg border border-indigo-200">
             <div className="text-center">
               <span className="text-sm text-slate-600">Już wydane: </span>
               <span className="text-lg font-bold text-indigo-600">
                 {totalPurchasedValue.toLocaleString()} PLN
               </span>
             </div>
           </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="bg-white rounded-xl p-4 border border-indigo-200">
               <div className="flex items-center gap-2 mb-2">
                 <TrendingUp size={20} className="text-red-500" />
                 <span className="text-sm font-medium text-slate-600">Scenariusz najdroższy</span>
               </div>
               <div className="text-2xl font-bold text-red-600">
                 {scenarioCosts.expensiveScenario.toLocaleString()} PLN
               </div>
               <p className="text-xs text-slate-500 mt-1">
                 Najdroższe produkty z każdej grupy
               </p>
             </div>
             <div className="bg-white rounded-xl p-4 border border-indigo-200">
               <div className="flex items-center gap-2 mb-2">
                 <Minus size={20} className="text-blue-500" />
                 <span className="text-sm font-medium text-slate-600">Scenariusz średni</span>
               </div>
               <div className="text-2xl font-bold text-blue-600">
                 {scenarioCosts.averageScenario.toLocaleString()} PLN
               </div>
                               <p className="text-xs text-slate-500 mt-1">
                  Mediany cen z każdej grupy
                </p>
             </div>
             <div className="bg-white rounded-xl p-4 border border-indigo-200">
               <div className="flex items-center gap-2 mb-2">
                 <TrendingDown size={20} className="text-green-500" />
                 <span className="text-sm font-medium text-slate-600">Scenariusz najtańszy</span>
               </div>
               <div className="text-2xl font-bold text-green-600">
                 {scenarioCosts.cheapScenario.toLocaleString()} PLN
               </div>
               <p className="text-xs text-slate-500 mt-1">
                 Najtańsze produkty z każdej grupy
               </p>
             </div>
           </div>
        </div>
      )}

      {/* Grouped Products */}
      <div className="space-y-4">
        {groupedProducts.map((group) => {
          const isExpanded = expandedGroups.has(group.name);
          const hasMultipleProducts = group.products.length > 1;

          return (
            <div
              key={group.name}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 overflow-hidden"
            >
              {/* Group Header */}
              <div 
                className={`group relative p-6 transition-all duration-200 ${hasMultipleProducts ? 'cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50' : 'cursor-default'}`}
                onClick={() => hasMultipleProducts && toggleGroup(group.name)}
              >
                {/* Hover effect overlay */}
                {hasMultipleProducts && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-2xl pointer-events-none"></div>
                )}
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                      <Package size={20} className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-slate-900 group-hover:text-indigo-700 transition-colors">{group.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                        <span>{group.products.length} produkt{group.products.length === 1 ? '' : group.products.length < 5 ? 'y' : 'ów'}</span>
                        <span>Łącznie: {group.totalQuantity} szt.</span>
                        <span>Zakupione: {group.products.filter(p => p.status === 'purchased').reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()} PLN</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {hasMultipleProducts && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-red-600 font-medium">
                          Max: {group.maxPrice.toLocaleString()} PLN
                        </span>
                        <span className="text-blue-600 font-medium">
                          Śr: {group.avgPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })} PLN
                        </span>
                        <span className="text-green-600 font-medium">
                          Min: {group.minPrice.toLocaleString()} PLN
                        </span>
                      </div>
                    )}
                    {hasMultipleProducts && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {isExpanded ? 'Zwiń' : 'Rozwiń'}
                        </span>
                        <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-100 transition-colors duration-200">
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                          ) : (
                            <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Products */}
              {isExpanded && hasMultipleProducts && (
                <div className="border-t border-slate-200 bg-slate-50/50">
                  {group.products.map((product) => (
                    <div
                      key={product.id}
                      className="p-4 border-b border-slate-200 last:border-b-0 hover:bg-white/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                              {getStatusText(product.status)}
                            </span>
                            <span className="text-sm text-slate-500">
                              Cena: {product.price.toLocaleString()} PLN
                            </span>
                            <span className="text-sm text-slate-500">
                              Ilość: {product.quantity}
                            </span>
                          </div>
                          
                          {product.description && (
                            <p className="text-slate-600 text-sm mb-2">{product.description}</p>
                          )}
                          
                          <div className="text-sm text-slate-500">
                            Wartość: {(product.price * product.quantity).toLocaleString()} PLN
                            {product.category && (
                              <span className="ml-4">Kategoria: {product.category}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(product)}
                              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edytuj produkt"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(product.id!)}
                              className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Usuń produkt"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Single Product Display (when not expanded) */}
              {!hasMultipleProducts && (
                <div className="px-6 pb-6">
                  {group.products.map((product) => (
                    <div key={product.id} className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                            {getStatusText(product.status)}
                          </span>
                        </div>
                        
                        {product.description && (
                          <p className="text-slate-600 mb-3">{product.description}</p>
                        )}
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-slate-500">Cena:</span>
                            <span className="ml-2 font-medium text-slate-700">
                              {product.price.toLocaleString()} PLN
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Ilość:</span>
                            <span className="ml-2 font-medium text-slate-700">{product.quantity}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Wartość:</span>
                            <span className="ml-2 font-medium text-slate-700">
                              {(product.price * product.quantity).toLocaleString()} PLN
                            </span>
                          </div>
                          {product.category && (
                            <div>
                              <span className="text-slate-500">Kategoria:</span>
                              <span className="ml-2 font-medium text-slate-700">{product.category}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(product)}
                            className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edytuj produkt"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(product.id!)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Usuń produkt"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
