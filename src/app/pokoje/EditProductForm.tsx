"use client";
import { useState, useEffect } from "react";
import { Product } from "../types/product";
import { Package, X, Tag, FileText, Banknote, Hash, ShoppingCart, CheckCircle, Link, Store } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface EditProductFormProps {
  product: Product;
  onUpdate: (product: Product) => void;
  onClose: () => void;
}

export const EditProductForm = ({ product, onUpdate, onClose }: EditProductFormProps) => {
  const { user } = useAuth();
  
  // Function to extract shop name from URL
  const extractShopFromUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      let hostname = urlObj.hostname;
      
      // Remove www. prefix if present
      if (hostname.startsWith('www.')) {
        hostname = hostname.substring(4);
      }
      
      // Extract domain name (everything before the first dot after www removal)
      const domainParts = hostname.split('.');
      if (domainParts.length > 0) {
        return domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
      }
      
      return hostname;
    } catch (error) {
      // If URL parsing fails, try to extract manually
      let urlString = url.toLowerCase();
      
      // Remove protocol
      urlString = urlString.replace(/^https?:\/\//, '');
      
      // Remove www. prefix
      if (urlString.startsWith('www.')) {
        urlString = urlString.substring(4);
      }
      
      // Extract domain name
      const domainParts = urlString.split('.');
      if (domainParts.length > 0) {
        return domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
      }
      
      return '';
    }
  };

  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || "",
    link: product.link || "",
    shop: product.shop || "",
    price: product.price,
    quantity: product.quantity,
    category: product.category || "",
    status: product.status,
    image_url: product.image_url || "",
  });
  const [priceText, setPriceText] = useState(product.price > 0 ? product.price.toFixed(2) : "");
  const [quantityText, setQuantityText] = useState(product.quantity.toString());
  const [loading, setLoading] = useState(false);
  const [extractingImage, setExtractingImage] = useState(false);
  const [manualImageUrl, setManualImageUrl] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState(false);

  useEffect(() => {
    setFormData({
      name: product.name,
      description: product.description || "",
      link: product.link || "",
      shop: product.shop || "",
      price: product.price,
      quantity: product.quantity,
      category: product.category || "",
      status: product.status,
      image_url: product.image_url || "",
    });
    setPriceText(product.price > 0 ? product.price.toFixed(2) : "");
    setQuantityText(product.quantity.toString());
    setShowManualInput(false);
    setManualImageUrl("");
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0 || !product.id || !user) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          link: formData.link || undefined,
          shop: formData.shop || undefined,
          price: formData.price,
          quantity: formData.quantity,
          category: formData.category || undefined,
          status: formData.status,
          image_url: formData.image_url || undefined,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas aktualizacji produktu');
      }

      const updatedProduct = await response.json();
      onUpdate(updatedProduct);
      onClose();
    } catch (error) {
      console.error("Błąd podczas aktualizacji produktu:", error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas aktualizacji produktu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle link change and auto-fill shop
  const handleLinkChange = (newLink: string) => {
    setFormData(prev => ({ ...prev, link: newLink }));
    if (newLink && !formData.shop) {
      const extractedShop = extractShopFromUrl(newLink);
      setFormData(prev => ({ ...prev, shop: extractedShop }));
    }
  };

  // Function to extract image and price from URL
  const extractImageFromUrl = async (url: string) => {
    if (!url) return;
    
    try {
      setExtractingImage(true);
      const response = await fetch('/api/products/extract-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        let successMessage = '';
        
        // Handle image extraction
        if (data.image_url) {
          setFormData(prev => ({ ...prev, image_url: data.image_url }));
          setShowManualInput(false);
          successMessage += 'Znaleziono obrazek';
        }
        
        // Handle price extraction
        if (data.price) {
          const cleanPrice = data.price.replace(/[^\d.,]/g, '').replace(',', '.');
          const numericPrice = parseFloat(cleanPrice);
          
          if (!isNaN(numericPrice) && numericPrice > 0) {
            setFormData(prev => ({ ...prev, price: numericPrice }));
            setPriceText(numericPrice.toFixed(2));
            successMessage += successMessage ? ' i cenę' : 'Znaleziono cenę';
            successMessage += ` (${data.price})`;
          }
        }
        
        // Handle no results silently  
        if (!successMessage && !data.image_url) {
          setShowManualInput(true);
        }
        
      } else {
        const errorData = await response.json();
        console.error('Error extracting data:', errorData.error || 'Unknown error');
        setShowManualInput(true);
      }
    } catch (error) {
      console.error('Error extracting data:', error);
      setShowManualInput(true);
    } finally {
      setExtractingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col border border-white/20">
        {/* Header - Fixed */}
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Package size={24} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Edytuj produkt
                </h2>
                <p className="text-sm text-slate-500">
                  Zmień szczegóły produktu
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          <form id="edit-product-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Nazwa produktu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nazwa produktu *
              </label>
              <div className="relative">
                <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="np. Płytki łazienkowe"
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Link do produktu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Link do produktu (opcjonalnie)
              </label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Link size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="url"
                    placeholder="https://example.com/product"
                    value={formData.link}
                    onChange={e => handleLinkChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                {formData.link && (
                  <button
                    type="button"
                    onClick={() => extractImageFromUrl(formData.link)}
                    disabled={extractingImage}
                    className="px-4 py-3 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all disabled:opacity-50 border border-indigo-200 hover:border-indigo-300 flex items-center gap-2 whitespace-nowrap"
                    title="Pobierz obrazek z linku"
                  >
                    {extractingImage ? (
                      <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium">Pobierz zdjęcie i cenę</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Product Image Preview */}
            {formData.image_url && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Obrazek produktu
                </label>
                <div className="relative">
                  <img
                    src={formData.image_url}
                    alt="Podgląd produktu"
                    className="w-32 h-24 object-cover rounded-xl border border-slate-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image_url: "" }))}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Usuń obrazek"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Ręczne dodanie obrazka - pokazuje się tylko po nieudanej próbie */}
            {showManualInput && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Wklej link do obrazka ręcznie
                </label>
                <div className="space-y-3">
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={manualImageUrl}
                    onChange={e => setManualImageUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                  {manualImageUrl && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, image_url: manualImageUrl }));
                          setManualImageUrl("");
                          setShowManualInput(false);
                        }}
                        className="flex-1 px-4 py-3 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-xl transition-all border border-green-200 hover:border-green-300 text-sm font-medium"
                      >
                        Zastosuj
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setManualImageUrl("");
                          setShowManualInput(false);
                        }}
                        className="flex-1 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all border border-red-200 hover:border-red-300 text-sm font-medium"
                      >
                        Anuluj
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Jeśli automatyczne pobieranie nie działa, skopiuj link do obrazka ze strony i wklej tutaj
                </p>
              </div>
            )}

            {/* Opis */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Opis (opcjonalnie)
              </label>
              <div className="relative">
                <FileText size={18} className="absolute left-3 top-3 text-slate-400" />
                <textarea
                  placeholder="Dodatkowe informacje o produkcie..."
                  value={formData.description}
                  onChange={e => handleInputChange("description", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                />
              </div>
            </div>

            {/* Sklep */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Sklep (opcjonalnie)
              </label>
              <div className="relative">
                <Store size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="np. Brico"
                  value={formData.shop}
                  onChange={e => handleInputChange("shop", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Cena i ilość */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Cena (PLN) *
                </label>
                <div className="relative">
                  <Banknote size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="0.00"
                    value={priceText}
                    onChange={e => {
                      const value = e.target.value;
                      // Allow only numbers, dots, and commas
                      if (/^[0-9.,]*$/.test(value)) {
                        setPriceText(value);
                        const numValue = parseFloat(value.replace(',', '.')) || 0;
                        handleInputChange("price", numValue);
                      }
                    }}
                    onBlur={e => {
                      // Format the value on blur to show proper decimal places
                      const value = e.target.value;
                      if (value && !isNaN(parseFloat(value.replace(',', '.')))) {
                        const numValue = parseFloat(value.replace(',', '.'));
                        handleInputChange("price", numValue);
                        setPriceText(numValue.toFixed(2));
                      } else if (value === '') {
                        handleInputChange("price", 0);
                        setPriceText('');
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Ilość *
                </label>
                <div className="relative">
                  <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    placeholder="1"
                    value={quantityText}
                    onChange={e => {
                      const value = e.target.value;
                      setQuantityText(value);
                      // Convert to number only if not empty, otherwise keep current quantity
                      if (value.trim() !== "") {
                        const numValue = Number(value);
                        if (!isNaN(numValue) && numValue > 0) {
                          handleInputChange("quantity", numValue);
                        }
                      }
                    }}
                    onBlur={() => {
                      // On blur, ensure we have a valid number
                      if (quantityText.trim() === "" || Number(quantityText) <= 0 || isNaN(Number(quantityText))) {
                        setQuantityText("1");
                        handleInputChange("quantity", 1);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Kategoria */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kategoria (opcjonalnie)
              </label>
              <input
                type="text"
                placeholder="np. Materiały budowlane"
                value={formData.category}
                onChange={e => handleInputChange("category", e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("status", "planned")}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    formData.status === 'planned'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <ShoppingCart size={16} />
                  <span className="text-sm font-medium">Planowany</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("status", "purchased")}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    formData.status === 'purchased'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <CheckCircle size={16} />
                  <span className="text-sm font-medium">Zakupiony</span>
                </button>
              </div>
            </div>

            {/* Podsumowanie */}
            {formData.name && formData.price > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Podsumowanie</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Produkt:</span>
                    <span className="font-medium text-slate-900">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cena jednostkowa:</span>
                    <span className="font-medium text-slate-900">{formData.price.toFixed(2)} PLN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ilość:</span>
                    <span className="font-medium text-slate-900">{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-medium">Wartość całkowita:</span>
                    <span className="font-semibold text-indigo-600">{(formData.price * formData.quantity).toFixed(2)} PLN</span>
                  </div>
                </div>
              </div>
            )}

          </form>
        </div>

        {/* Footer - Fixed */}
        <div className="p-6 sm:p-8 border-t border-slate-200 bg-white">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Anuluj
            </button>
            <button
              type="submit"
              form="edit-product-form"
              className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading || !formData.name || formData.price <= 0}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Zapisywanie...
                </>
              ) : (
                <>
                  <Package size={16} />
                  Zapisz zmiany
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
