"use client";
import { Product } from "../types/product";
import { Package, Edit, Trash2, CheckCircle, Clock, ShoppingCart } from "lucide-react";

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

  const totalValue = products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 overflow-hidden hover:shadow-xl transition-all duration-200"
          >
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  {/* Product Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-indigo-100">
                        <Package size={18} className="text-indigo-600" />
                      </div>
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
        ))}
      </div>
    </div>
  );
};
