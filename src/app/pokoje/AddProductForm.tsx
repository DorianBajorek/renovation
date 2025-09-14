"use client";
import { useState, useEffect } from "react";
import { Product } from "../types/product";
import { Package, X, Tag, FileText, Banknote, Hash, ShoppingCart, CheckCircle, Link, Store, Database, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface AddProductFormProps {
  onAdd: (product: Product) => void;
  onClose: () => void;
  roomId: string;
}

export const AddProductForm = ({ onAdd, onClose, roomId }: AddProductFormProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'database'>('new');
  
  // States for new product form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [shop, setShop] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [priceText, setPriceText] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [quantityText, setQuantityText] = useState<string>("1");
  const [status, setStatus] = useState<'planned' | 'purchased'>('planned');
  const [imageUrl, setImageUrl] = useState<string>("");
  const [manualImageUrl, setManualImageUrl] = useState<string>("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extractingImage, setExtractingImage] = useState(false);

  // States for database selection
  const [databaseProducts, setDatabaseProducts] = useState<Product[]>([]);
  const [loadingDatabase, setLoadingDatabase] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);

  // Fetch products from database
  useEffect(() => {
    if (activeTab === 'database' && user?.id) {
      fetchDatabaseProducts();
    }
  }, [activeTab, user?.id]);

  const fetchDatabaseProducts = async () => {
    if (!user?.id) return;
    
    setLoadingDatabase(true);
    try {
      const response = await fetch(`/api/products/all?userId=${user.id}`);
      if (response.ok) {
        const products = await response.json();
        setDatabaseProducts(products);
      }
    } catch (error) {
      console.error('Error fetching database products:', error);
    } finally {
      setLoadingDatabase(false);
    }
  };

  // Filter products based on search
  const filteredDatabaseProducts = databaseProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.shop?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get unique products by link (same logic as in database page)
  const uniqueProducts = filteredDatabaseProducts.reduce((acc, product) => {
    const key = product.link || product.id;
    if (!acc[key] || acc[key].created_at < product.created_at) {
      acc[key] = product;
    }
    return acc;
  }, {} as Record<string, Product>);
  
  const uniqueProductsList = Object.values(uniqueProducts);

  const handleAddFromDatabase = async () => {
    if (!selectedProduct || !user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedProduct.name,
          description: selectedProduct.description,
          link: selectedProduct.link,
          shop: selectedProduct.shop,
          price: selectedProduct.price,
          quantity: selectedQuantity,
          status: 'planned', // Default to planned when adding from database
          roomId,
          userId: user.id,
          image_url: selectedProduct.image_url,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas dodawania produktu');
      }

      const newProduct = await response.json();
      onAdd(newProduct);
      onClose();
    } catch (error) {
      console.error("Błąd podczas dodawania produktu z bazy:", error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas dodawania produktu');
    } finally {
      setLoading(false);
    }
  };

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

  // Handle link change and auto-fill shop
  const handleLinkChange = (newLink: string) => {
    setLink(newLink);
    if (newLink && !shop) {
      const extractedShop = extractShopFromUrl(newLink);
      setShop(extractedShop);
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
          setImageUrl(data.image_url);
          setShowManualInput(false);
          successMessage += 'Znaleziono obrazek';
        }
        
        // Handle price extraction
        if (data.price) {
          const cleanPrice = data.price.replace(/[^\d.,]/g, '').replace(',', '.');
          const numericPrice = parseFloat(cleanPrice);
          
          if (!isNaN(numericPrice) && numericPrice > 0) {
            setPrice(numericPrice);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0 || !user) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description: description || undefined,
          link: link || undefined,
          shop: shop || undefined,
          price,
          quantity,
          status,
          roomId,
          userId: user.id,
          image_url: imageUrl || manualImageUrl || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas dodawania produktu');
      }

      const newProduct = await response.json();
      onAdd(newProduct);
      onClose();
    } catch (error) {
      console.error("Błąd podczas dodawania produktu:", error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas dodawania produktu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col border border-white/20">
        {/* Header - Fixed */}
        <div className="p-6 sm:p-8 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Package size={24} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Dodaj produkt
                </h2>
                <p className="text-sm text-slate-500">
                  {activeTab === 'new' ? 'Wypełnij szczegóły nowego produktu' : 'Wybierz produkt z twojej bazy'}
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
          
          {/* Tabs */}
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'new'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Plus size={16} />
              Dodaj nowy
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'database'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database size={16} />
              Z bazy
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {activeTab === 'new' ? (
            <form id="add-product-form" onSubmit={handleSubmit} className="space-y-6">
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
                  value={name}
                  onChange={e => setName(e.target.value)}
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
                    value={link}
                    onChange={e => handleLinkChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
                {link && (
                  <button
                    type="button"
                    onClick={() => extractImageFromUrl(link)}
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
            {imageUrl && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Obrazek produktu
                </label>
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Podgląd produktu"
                    className="w-32 h-24 object-cover rounded-xl border border-slate-300"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
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
                          setImageUrl(manualImageUrl);
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
                  value={description}
                  onChange={e => setDescription(e.target.value)}
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
                  value={shop}
                  onChange={e => setShop(e.target.value)}
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
                        setPrice(numValue);
                      }
                    }}
                    onBlur={e => {
                      // Format the value on blur to show proper decimal places
                      const value = e.target.value;
                      if (value && !isNaN(parseFloat(value.replace(',', '.')))) {
                        const numValue = parseFloat(value.replace(',', '.'));
                        setPrice(numValue);
                        setPriceText(numValue.toFixed(2));
                      } else if (value === '') {
                        setPrice(0);
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
                          setQuantity(numValue);
                        }
                      }
                    }}
                    onBlur={() => {
                      // On blur, ensure we have a valid number
                      if (quantityText.trim() === "" || Number(quantityText) <= 0 || isNaN(Number(quantityText))) {
                        setQuantityText("1");
                        setQuantity(1);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStatus('planned')}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    status === 'planned'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <ShoppingCart size={16} />
                  <span className="text-sm font-medium">Planowany</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('purchased')}
                  className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                    status === 'purchased'
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
            {name && price > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <h3 className="text-sm font-medium text-slate-700 mb-2">Podsumowanie</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Produkt:</span>
                    <span className="font-medium text-slate-900">{name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cena jednostkowa:</span>
                    <span className="font-medium text-slate-900">{price.toFixed(2)} PLN</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Ilość:</span>
                    <span className="font-medium text-slate-900">{quantity}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200">
                    <span className="text-slate-700 font-medium">Wartość całkowita:</span>
                    <span className="font-semibold text-indigo-600">{(price * quantity).toFixed(2)} PLN</span>
                  </div>
                </div>
              </div>
            )}

          </form>
          ) : (
            /* Database Products Selection */
            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Wyszukaj produkt
                </label>
                <div className="relative">
                  <Tag size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Wpisz nazwę produktu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Products List */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dostępne produkty ({uniqueProductsList.length})
                </label>
                
                {loadingDatabase ? (
                  <div className="flex items-center justify-center py-12 text-slate-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                    Ładowanie produktów...
                  </div>
                ) : uniqueProductsList.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Database size={48} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-sm">
                      {searchTerm ? 'Brak produktów spełniających kryteria' : 'Brak produktów w bazie'}
                    </p>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2 border border-slate-200 rounded-xl">
                    {uniqueProductsList.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        className={`p-4 cursor-pointer transition-all hover:bg-slate-50 border-l-4 ${
                          selectedProduct?.id === product.id
                            ? 'border-l-indigo-500 bg-indigo-50'
                            : 'border-l-transparent'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {product.image_url ? (
                            <img 
                              src={product.image_url} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                              <Package size={20} className="text-slate-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-slate-900 truncate">{product.name}</h4>
                            <p className="text-sm text-slate-600 mb-1">
                              {new Intl.NumberFormat('pl-PL', {
                                style: 'currency',
                                currency: 'PLN'
                              }).format(product.price)}
                              {product.shop && ` • ${product.shop}`}
                            </p>
                            {product.description && (
                              <p className="text-xs text-slate-500 line-clamp-2">{product.description}</p>
                            )}
                          </div>
                          {selectedProduct?.id === product.id && (
                            <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                              <CheckCircle size={14} className="text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity for selected product */}
              {selectedProduct && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Ilość
                  </label>
                  <div className="relative">
                    <Hash size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
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
            {activeTab === 'new' ? (
              <button
                type="submit"
                form="add-product-form"
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={loading || !name || price <= 0}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Dodawanie...
                  </>
                ) : (
                  <>
                    <Package size={16} />
                    Dodaj produkt
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleAddFromDatabase}
                disabled={!selectedProduct || loading}
                className="flex-1 px-4 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Dodawanie...
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    Dodaj z bazy
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
