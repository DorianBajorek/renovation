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

    // Group products by name (case-insensitive)
    const groups: Record<string, Product[]> = {};
    plannedAndPurchasedProducts.forEach(product => {
      const normalizedName = product.name.toLowerCase().trim();
      if (!groups[normalizedName]) {
        groups[normalizedName] = [];
      }
      groups[normalizedName].push(product);
    });

    let expensiveScenario = 0;
    let averageScenario = 0;
    let cheapScenario = 0;

    Object.values(groups).forEach(groupProducts => {
      // Check if any product in this group has been purchased
      const purchasedProducts = groupProducts.filter(p => p.status === 'purchased');
      const plannedProducts = groupProducts.filter(p => p.status === 'planned');
      
      if (purchasedProducts.length > 0) {
        // If any product is purchased, use the purchased product's price for all scenarios
        const purchasedPrice = purchasedProducts[0].price; // Use first purchased product
        expensiveScenario += purchasedPrice;
        averageScenario += purchasedPrice;
        cheapScenario += purchasedPrice;
      } else {
        // If no product is purchased, use the original logic with planned products only
        const prices = plannedProducts.map(p => p.price).sort((a, b) => a - b);
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        
        // Calculate median
        const medianPrice = prices.length % 2 === 0 
          ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
          : prices[Math.floor(prices.length / 2)];

        expensiveScenario += maxPrice;
        averageScenario += medianPrice;
        cheapScenario += minPrice;
      }
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
                 Zakupione produkty lub najdroższe z planowanych
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
                  Zakupione produkty lub mediany z planowanych
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
                 Zakupione produkty lub najtańsze z planowanych
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
                className={`group relative p-4 sm:p-6 transition-all duration-200 ${hasMultipleProducts ? 'cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50' : 'cursor-default'}`}
                onClick={() => hasMultipleProducts && toggleGroup(group.name)}
              >
                {/* Hover effect overlay */}
                {hasMultipleProducts && (
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-t-2xl pointer-events-none"></div>
                )}
                
                <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1 sm:p-2 rounded-lg bg-indigo-100 group-hover:bg-indigo-200 transition-colors">
                      <Package size={18} className="sm:w-5 sm:h-5 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-medium text-slate-900 group-hover:text-indigo-700 transition-colors truncate">{group.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-slate-500 mt-1">
                        <span>{group.products.length} produkt{group.products.length === 1 ? '' : group.products.length < 5 ? 'y' : 'ów'}</span>
                        <span>Łącznie: {group.totalQuantity} szt.</span>
                        <span>Zakupione: {group.products.filter(p => p.status === 'purchased').reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString()} PLN</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                    {hasMultipleProducts && (
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm">
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
                      <div className="flex items-center gap-2 self-center">
                        <span className="text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block">
                          {isExpanded ? 'Zwiń' : 'Rozwiń'}
                        </span>
                        <div className="p-1 sm:p-2 rounded-lg bg-slate-100 group-hover:bg-indigo-100 transition-colors duration-200">
                          {isExpanded ? (
                            <ChevronDown size={14} className="sm:w-4 sm:h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                          ) : (
                            <ChevronRight size={14} className="sm:w-4 sm:h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
                          )}
                        </div>
                      </div>
                    )}
                    
                                         {/* Edit/Delete buttons for single products */}
                     {!hasMultipleProducts && group.products.length === 1 && (
                       <div className="flex items-center gap-1 sm:gap-2 self-center">
                         {onEdit && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               onEdit(group.products[0]);
                             }}
                             className="p-1.5 sm:p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                             title="Edytuj produkt"
                           >
                             <Edit size={14} className="sm:w-4 sm:h-4" />
                           </button>
                         )}
                         {onDelete && (
                           <button
                             onClick={(e) => {
                               e.stopPropagation();
                               onDelete(group.products[0].id!);
                             }}
                             className="p-1.5 sm:p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                             title="Usuń produkt"
                           >
                             <Trash2 size={14} className="sm:w-4 sm:h-4" />
                           </button>
                         )}
                       </div>
                     )}
                  </div>
                </div>
              </div>

                             {/* Expanded Products */}
               {isExpanded && hasMultipleProducts && (
                 <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                   {group.products.map((product, index) => (
                     <div
                       key={product.id}
                       className={`p-4 sm:p-6 border-b border-slate-200 last:border-b-0 hover:bg-white/80 transition-all duration-200 ${
                         index % 2 === 0 ? 'bg-white/30' : 'bg-slate-50/30'
                       }`}
                     >
                       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                         <div className="flex-1">
                           {/* Product Header */}
                           <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                             <h5 className="text-base font-semibold text-slate-900">{product.name}</h5>
                             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(product.status)}`}>
                               {getStatusText(product.status)}
                             </span>
                             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                               <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                 Cena: {product.price.toLocaleString()} PLN
                               </span>
                               <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                 Ilość: {product.quantity}
                               </span>
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
                       </div>
                     </div>
                   ))}
                 </div>
               )}

                                                                                                                                                                                   {/* Single Product Display (when not expanded) */}
                 {!hasMultipleProducts && (
                   <div className="border-t border-slate-200 bg-gradient-to-br from-slate-50 to-white">
                     {group.products.map((product) => (
                       <div key={product.id} className="p-4 sm:p-6 hover:bg-white/80 transition-all duration-200">
                         <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                           <div className="flex-1">
                             {/* Product Header */}
                             <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                               <h5 className="text-base font-semibold text-slate-900">{product.name}</h5>
                               <span className={`px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${getStatusColor(product.status)}`}>
                                 {getStatusText(product.status)}
                               </span>
                               <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                 <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                   Cena: {product.price.toLocaleString()} PLN
                                 </span>
                                 <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                                   Ilość: {product.quantity}
                                 </span>
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
                             
                             {/* Product Footer */}
                             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                               {product.category && (
                                 <span className="text-sm text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-300">
                                   Kategoria: {product.category}
                                 </span>
                               )}
                             </div>
                           </div>
                           
                           {/* Przyciski edycji/usuwania są w nagłówku grupy dla pojedynczych produktów */}
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
