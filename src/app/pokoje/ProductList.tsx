"use client";
import { Product } from "../types/product";
import { Package, Edit, Trash2, CheckCircle, Clock, ShoppingCart } from "lucide-react";

interface ProductListProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
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

export const ProductList = ({ products, onEdit, onDelete }: ProductListProps) => {
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
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/60 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Package size={20} className="text-indigo-600" />
                  <h4 className="text-lg font-medium text-slate-900">{product.name}</h4>
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
          </div>
        ))}
      </div>
    </div>
  );
};
