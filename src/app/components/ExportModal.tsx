"use client";
import { useState, useEffect } from 'react';
import { Product } from '../types/product';
import { X, Download, Check, Square, Filter, Copy, ExternalLink } from 'lucide-react';
import jsPDF from 'jspdf';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  userId?: string;
  projectId?: string;
  isProjectExport?: boolean;
}

export const ExportModal = ({ isOpen, onClose, roomId, roomName, userId, projectId, isProjectExport }: ExportModalProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<string[]>([]);
  
  // Nowe stany dla filtrowania
  const [selectedShop, setSelectedShop] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [availableShops, setAvailableShops] = useState<string[]>([]);

  useEffect(() => {
    console.log('ExportModal useEffect - isOpen:', isOpen, 'roomId:', roomId, 'roomId type:', typeof roomId);
    if (isOpen && roomId && roomId.trim() !== '') {
      console.log('ExportModal useEffect - calling fetchProducts');
      fetchProducts();
    } else {
      console.log('ExportModal useEffect - conditions not met:', { isOpen, roomId, roomIdTrimmed: roomId?.trim() });
    }
  }, [isOpen, roomId]);

  const fetchProducts = async () => {
    console.log('fetchProducts called with roomId:', roomId, 'isProjectExport:', isProjectExport, 'projectId:', projectId, 'userId:', userId);
    setLoading(true);
    try {
      let url: string;
      if (isProjectExport && projectId) {
        // Pobierz wszystkie produkty z konkretnego projektu
        if (!userId) {
          console.error('User ID is required for fetching project products');
          return;
        }
        url = `/api/projects/${projectId}/products?userId=${userId}`;
      } else if (roomId === 'all') {
        // Pobierz wszystkie produkty użytkownika
        if (!userId) {
          console.error('User ID is required for fetching all products');
          return;
        }
        url = `/api/products/all?userId=${userId}`;
      } else {
        // Pobierz produkty dla konkretnego pokoju
        url = `/api/products?roomId=${roomId}`;
      }
      
      const response = await fetch(url);
      console.log('ExportModal - URL:', url);
      console.log('ExportModal - Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('ExportModal - Response data:', data);
        
        let productsList: Product[];
        if (isProjectExport && projectId) {
          // Dla eksportu konkretnego projektu, używamy products z odpowiedzi
          productsList = data.products || [];
          console.log('ExportModal - Products for specific project:', productsList);
        } else {
          // Dla eksportu pokoi lub wszystkich produktów, sprawdź czy data to tablica czy obiekt
          if (Array.isArray(data)) {
            productsList = data;
          } else if (data.products && Array.isArray(data.products)) {
            productsList = data.products;
          } else if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Jeśli data to obiekt ale nie ma właściwości products, może to być pojedynczy produkt lub inna struktura
            productsList = [];
          } else {
            productsList = [];
          }
          console.log('ExportModal - Products for rooms or all:', productsList);
        }
        
        setProducts(productsList);
        
        // Wyodrębnij unikalne sklepy
        const shops = [...new Set(productsList.map(p => p.shop).filter((shop): shop is string => Boolean(shop)))];
        setAvailableShops(shops);
        
        // Domyślnie zaznacz wszystkie produkty
        const productIds = productsList.map((p: Product) => p.id).filter(id => id !== undefined);
        console.log('ExportModal - Product IDs to select:', productIds);
        setSelectedProducts(new Set(productIds));
      } else {
        console.error('ExportModal - Response not ok:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funkcja do filtrowania produktów
  const getFilteredProducts = () => {
    return products.filter(product => {
      const shopMatch = selectedShop === 'all' || product.shop === selectedShop;
      const statusMatch = selectedStatus === 'all' || product.status === selectedStatus;
      return shopMatch && statusMatch;
    });
  };

  // Funkcja do resetowania filtrów
  const resetFilters = () => {
    setSelectedShop('all');
    setSelectedStatus('all');
  };

  // Funkcja do aktualizacji zaznaczonych produktów po zmianie filtrów
  useEffect(() => {
    const filteredProducts = getFilteredProducts();
    const filteredProductIds = filteredProducts.map(p => p.id).filter(id => id !== undefined);
    
    // Zaznacz tylko produkty, które są widoczne po filtrowaniu
    setSelectedProducts(new Set(filteredProductIds));
  }, [selectedShop, selectedStatus]);

  const toggleProduct = (productId: string) => {
    if (!productId) return; // Zabezpieczenie przed pustym ID
    
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const toggleAllProducts = () => {
    const filteredProducts = getFilteredProducts();
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      const productIds = filteredProducts.map(p => p.id).filter(id => id !== undefined);
      setSelectedProducts(new Set(productIds));
    }
  };

  // Funkcja do ładowania obrazu jako base64 z obsługą CORS
  const loadImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      // Użyj naszego własnego proxy API
      const proxyUrl = `/api/images/proxy?url=${encodeURIComponent(imageUrl)}`;
      
      const response = await fetch(proxyUrl);
      
      if (!response.ok) {
        console.warn(`Failed to load image via proxy: ${response.status}`);
        return null;
      }
      
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => {
          console.warn('Failed to convert image to base64');
          resolve(null);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('Error loading image via proxy, trying canvas method:', error);
      
      // Alternatywna metoda - użyj canvas do konwersji
      try {
        return await loadImageViaCanvas(imageUrl);
      } catch (canvasError) {
        console.warn('Canvas method also failed:', canvasError);
        return null;
      }
    }
  };

  // Alternatywna metoda ładowania obrazu przez canvas
  const loadImageViaCanvas = (imageUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            resolve(null);
            return;
          }
          
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataURL);
        } catch (error) {
          console.warn('Canvas conversion failed:', error);
          resolve(null);
        }
      };
      
      img.onerror = () => {
        console.warn('Image failed to load in canvas');
        resolve(null);
      };
      
      img.src = imageUrl;
    });
  };

  const exportToPDF = async () => {
    if (selectedProducts.size === 0) {
      alert('Wybierz przynajmniej jeden produkt do eksportu');
      return;
    }

    setExporting(true);
    setImageLoadErrors([]);
    try {
      const selectedProductsList = getFilteredProducts().filter(p => p.id && selectedProducts.has(p.id));
      
      const doc = new jsPDF();
      
      // Dodaj obsługę polskich znaków - użyj fontu z obsługą UTF-8
      doc.setFont('helvetica');
      
      // Branding aplikacji w prawym górnym rogu
      addAppBranding(doc);
      
      // Tytuł
      doc.setFontSize(20);
      let title = isProjectExport ? 
        `Lista produktow projektu - ${convertPolishChars(roomName)}` :
        `Lista produktow - ${convertPolishChars(roomName)}`;
      
      doc.text(title, 20, 20);
      
      let yPos = 30;
      
      // Dodaj informację o aktywnych filtrach w osobnej linii
      const activeFilters = [];
      if (selectedShop !== 'all') activeFilters.push(`Sklep: ${selectedShop}`);
      if (selectedStatus !== 'all') activeFilters.push(`Status: ${getStatusText(selectedStatus)}`);
      
      if (activeFilters.length > 0) {
        doc.setFontSize(14);
        doc.text(`Filtry: ${activeFilters.join(', ')}`, 20, yPos);
        yPos += 10;
      }
      
      // Data eksportu
      doc.setFontSize(12);
      doc.text(`Data eksportu: ${new Date().toLocaleString('pl-PL')}`, 20, yPos);
      
                   let yPosition = yPos + 20;
       const startX = 20;
       // Używamy układu kartowego - nie potrzebujemy kolumn tabeli
      
             if (isProjectExport) {
         // Dla eksportu projektu - pogrupuj produkty według pokoi
         const productsByRoom = selectedProductsList.reduce((acc, product) => {
           const roomName = product.room_name || 'Nieznany pokoj';
           if (!acc[roomName]) {
             acc[roomName] = [];
           }
           acc[roomName].push(product);
           return acc;
         }, {} as Record<string, typeof selectedProductsList>);
         
         // Eksportuj produkty pogrupowane według pokoi
         let isFirstRoom = true;
         for (const [roomName, roomProducts] of Object.entries(productsByRoom)) {
           // Każdy pokój (oprócz pierwszego) zaczyna się na nowej stronie
           if (!isFirstRoom) {
             doc.addPage();
             addAppBranding(doc);
             yPosition = 20;
           }
           isFirstRoom = false;
           
           // Nagłówek pokoju
           doc.setFontSize(16);
           doc.setFont(undefined, 'bold');
           doc.text(`POKÓJ: ${convertPolishChars(roomName)}`, startX, yPosition);
           yPosition += 15;
           
           // Brak nagłówków tabeli - używamy układu kartowego
           
           // Dane produktów w pokoju - układ kartowy
           doc.setFont(undefined, 'normal');
           
           for (let index = 0; index < roomProducts.length; index++) {
             const product = roomProducts[index];
             
             // Sprawdź czy potrzebna jest nowa strona dla produktu
             if (yPosition > 220) {
               doc.addPage();
               addAppBranding(doc);
               yPosition = 20;
               // Dodaj ponownie nagłówek pokoju na nowej stronie
               doc.setFontSize(16);
               doc.setFont(undefined, 'bold');
               doc.text(`POKÓJ: ${convertPolishChars(roomName)} (cd.)`, startX, yPosition);
               yPosition += 15;
             }
             
             // Ramka wokół produktu - kompaktowa wysokość
             const productBoxHeight = product.description ? 45 : 35;
             doc.setDrawColor(220, 220, 220);
             doc.rect(startX, yPosition - 5, 170, productBoxHeight);
             
             // Obraz produktu (jeśli istnieje)
             if (product.image_url) {
               try {
                 const imageBase64 = await loadImageAsBase64(product.image_url);
                 if (imageBase64) {
                   const imageWidth = 28;
                   const imageHeight = 28;
                   const imageX = startX + 5;
                   const imageY = yPosition;
                   
                   doc.addImage(imageBase64, 'JPEG', imageX, imageY, imageWidth, imageHeight);
                   
                   // Ramka wokół obrazu
                   doc.setDrawColor(180, 180, 180);
                   doc.rect(imageX, imageY, imageWidth, imageHeight);
                 }
               } catch (error) {
                 console.error('Error adding image to PDF:', error);
                 setImageLoadErrors(prev => [...prev, product.name]);
               }
             }
             
             // Informacje o produkcie
             const textStartX = product.image_url ? startX + 38 : startX + 5;
             
             // Nazwa produktu
             doc.setFontSize(12);
             doc.setFont(undefined, 'bold');
             const productName = convertPolishChars(product.name);
             const maxNameWidth = 100;
             const truncatedName = doc.getTextWidth(productName) > maxNameWidth ? 
               productName.substring(0, Math.floor(maxNameWidth / 4)) + '...' : productName;
             doc.text(truncatedName, textStartX, yPosition + 8);
             
             // Cena i ilość
             doc.setFontSize(10);
             doc.setFont(undefined, 'normal');
             doc.text(`Cena: ${product.price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`, textStartX, yPosition + 15);
             doc.text(`Ilosc: ${product.quantity}`, textStartX, yPosition + 20);
             
             // Sklep (jeśli istnieje)
             if (product.shop) {
               doc.text(`Sklep: ${convertPolishChars(product.shop)}`, textStartX, yPosition + 25);
             }
             
             // Opis (jeśli istnieje)
             if (product.description) {
               doc.setFontSize(9);
               const description = convertPolishChars(product.description);
               // Skróć opis jeśli jest za długi
               const maxDescWidth = 120;
               const truncatedDesc = doc.getTextWidth(description) > maxDescWidth ? 
                 description.substring(0, Math.floor(maxDescWidth / 3)) + '...' : description;
               // Umieść opis poniżej sklepu lub na pozycji 25 jeśli nie ma sklepu
               const descY = product.shop ? yPosition + 33 : yPosition + 25;
               doc.text(`Opis: ${truncatedDesc}`, textStartX, descY);
             }
             
             yPosition += productBoxHeight + 10;
           }
           
           // Podsumowanie dla pokoju
           const roomTotal = roomProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
           yPosition += 5;
           
           // Linia podsumowania
           doc.setDrawColor(200, 200, 200);
           doc.line(startX, yPosition, startX + 170, yPosition);
           yPosition += 5;
           
                       // Tekst podsumowania
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            const roomSummaryText = `Podsumowanie pokoju "${convertPolishChars(roomName)}": ${roomTotal.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN (${roomProducts.length} produktów)`;
            const roomMaxWidth = 160;
            const truncatedRoomSummary = doc.getTextWidth(roomSummaryText) > roomMaxWidth ? 
              roomSummaryText.substring(0, Math.floor(roomMaxWidth / 4)) + '...' : roomSummaryText;
            doc.text(truncatedRoomSummary, startX, yPosition);
           
           // Dodaj odstęp między pokojami
           yPosition += 20;
           
           // Linia oddzielająca pokoje
           doc.setDrawColor(100, 100, 100);
           doc.line(startX, yPosition, startX + 170, yPosition);
           yPosition += 10;
         }
                    } else {
         // Dla eksportu pokoi - standardowy format
         // Nagłówek sekcji
         doc.setFontSize(14);
         doc.setFont(undefined, 'bold');
         doc.text(`LISTA PRODUKTÓW - ${convertPolishChars(roomName)}`, startX, yPosition);
         yPosition += 10;
         
         // Brak nagłówków tabeli - używamy układu kartowego
         
         // Dane produktów - układ kartowy
         doc.setFont(undefined, 'normal');
         
         for (let index = 0; index < selectedProductsList.length; index++) {
           const product = selectedProductsList[index];
           
           // Sprawdź czy potrzebna jest nowa strona
           if (yPosition > 200) {
             doc.addPage();
             addAppBranding(doc);
             yPosition = 20;
           }
           
           // Ramka wokół produktu - kompaktowa wysokość
           const productBoxHeight = product.description ? 45 : 35;
           doc.setDrawColor(220, 220, 220);
           doc.rect(startX, yPosition - 5, 170, productBoxHeight);
           
           // Obraz produktu (jeśli istnieje)
           if (product.image_url) {
             try {
               const imageBase64 = await loadImageAsBase64(product.image_url);
               if (imageBase64) {
                 const imageWidth = 28;
                 const imageHeight = 28;
                 const imageX = startX + 5;
                 const imageY = yPosition;
                 
                 doc.addImage(imageBase64, 'JPEG', imageX, imageY, imageWidth, imageHeight);
                 
                 // Ramka wokół obrazu
                 doc.setDrawColor(180, 180, 180);
                 doc.rect(imageX, imageY, imageWidth, imageHeight);
               }
             } catch (error) {
               console.error('Error adding image to PDF:', error);
               setImageLoadErrors(prev => [...prev, product.name]);
             }
           }
           
           // Informacje o produkcie
           const textStartX = product.image_url ? startX + 38 : startX + 5;
           
           // Nazwa produktu
           doc.setFontSize(12);
           doc.setFont(undefined, 'bold');
           const productName = convertPolishChars(product.name);
           const maxNameWidth = 100;
           const truncatedName = doc.getTextWidth(productName) > maxNameWidth ? 
             productName.substring(0, Math.floor(maxNameWidth / 4)) + '...' : productName;
           doc.text(truncatedName, textStartX, yPosition + 8);
           
           // Cena i ilość
           doc.setFontSize(10);
           doc.setFont(undefined, 'normal');
           doc.text(`Cena: ${product.price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`, textStartX, yPosition + 15);
           doc.text(`Ilosc: ${product.quantity}`, textStartX, yPosition + 20);
           
           // Sklep (jeśli istnieje)
           if (product.shop) {
             doc.text(`Sklep: ${convertPolishChars(product.shop)}`, textStartX, yPosition + 25);
           }
           
           // Opis (jeśli istnieje)
           if (product.description) {
             doc.setFontSize(9);
             const description = convertPolishChars(product.description);
             // Skróć opis jeśli jest za długi
             const maxDescWidth = 120;
             const truncatedDesc = doc.getTextWidth(description) > maxDescWidth ? 
               description.substring(0, Math.floor(maxDescWidth / 3)) + '...' : description;
             // Umieść opis poniżej sklepu lub na pozycji 25 jeśli nie ma sklepu
             const descY = product.shop ? yPosition + 33 : yPosition + 25;
             doc.text(`Opis: ${truncatedDesc}`, textStartX, descY);
           }
           
           yPosition += productBoxHeight + 10;
         }
      }
      
                     // Podsumowanie
        const totalValue = selectedProductsList.reduce((sum, product) => sum + (product.price * product.quantity), 0);
        yPosition += 15;
        
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(`PODSUMOWANIE`, startX, yPosition);
        
                 doc.setFontSize(12);
         const totalValueText = `Laczna wartosc: ${totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`;
         const maxWidth = 160; // Maksymalna szerokość dla podsumowania
         const truncatedTotalValue = doc.getTextWidth(totalValueText) > maxWidth ? 
           totalValueText.substring(0, Math.floor(maxWidth / 4)) + '...' : totalValueText;
         doc.text(truncatedTotalValue, startX, yPosition + 8);
         doc.text(`Liczba produktow: ${selectedProductsList.length}`, startX, yPosition + 16);
        
        if (isProjectExport) {
          // Dla projektów dodaj informację o liczbie pokoi
          const uniqueRooms = new Set(selectedProductsList.map(p => p.room_name));
          doc.text(`Liczba pokoi: ${uniqueRooms.size}`, startX, yPosition + 24);
        }

             // Zapisz PDF
       let fileName = isProjectExport ? 
         `projekt-${convertPolishChars(roomName)}-${new Date().toISOString().split('T')[0]}.pdf` :
         `produkty-${convertPolishChars(roomName)}-${new Date().toISOString().split('T')[0]}.pdf`;
       
       // Dodaj informację o filtrach do nazwy pliku
       if (selectedShop !== 'all' || selectedStatus !== 'all') {
         const filterSuffix = [];
         if (selectedShop !== 'all') filterSuffix.push(`sklep-${selectedShop}`);
         if (selectedStatus !== 'all') filterSuffix.push(`status-${selectedStatus}`);
         fileName = fileName.replace('.pdf', `-${filterSuffix.join('-')}.pdf`);
       }
       doc.save(fileName);
      
      // Pokaż informację o błędach ładowania obrazów
      if (imageLoadErrors.length > 0) {
        alert(`PDF został wygenerowany, ale nie udało się załadować obrazów dla produktów: ${imageLoadErrors.join(', ')}. To może być spowodowane ograniczeniami CORS.`);
      }
      
      onClose();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Błąd podczas eksportu PDF');
    } finally {
      setExporting(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Planowany';
      case 'purchased': return 'Zakupiony';
      default: return 'Planowany';
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




  // Funkcja do dodawania brandingu aplikacji
  const addAppBranding = (doc: jsPDF) => {
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text('PlanRemontu', 170, 15);
    
    // Reset koloru i fontu
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'normal');
  };

  // Funkcja do konwersji polskich znaków na ASCII
  const convertPolishChars = (text: string): string => {
    return text
      .replace(/ą/g, 'a')
      .replace(/ć/g, 'c')
      .replace(/ę/g, 'e')
      .replace(/ł/g, 'l')
      .replace(/ń/g, 'n')
      .replace(/ó/g, 'o')
      .replace(/ś/g, 's')
      .replace(/ź/g, 'z')
      .replace(/ż/g, 'z')
      .replace(/Ą/g, 'A')
      .replace(/Ć/g, 'C')
      .replace(/Ę/g, 'E')
      .replace(/Ł/g, 'L')
      .replace(/Ń/g, 'N')
      .replace(/Ó/g, 'O')
      .replace(/Ś/g, 'S')
      .replace(/Ź/g, 'Z')
      .replace(/Ż/g, 'Z');
  };


  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-4xl mx-2 sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden border border-gray-200/50">

        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 pr-2">
            {isProjectExport ? `Eksport projektu - ${roomName}` : `Eksport produktów - ${roomName}`}
            {(selectedShop !== 'all' || selectedStatus !== 'all') && (
              <span className="block text-sm font-normal text-gray-600 mt-1">
                Filtry: {[
                  selectedShop !== 'all' ? `Sklep: ${selectedShop}` : null,
                  selectedStatus !== 'all' ? `Status: ${getStatusText(selectedStatus)}` : null
                ].filter(Boolean).join(', ')}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] sm:max-h-[60vh]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Ładowanie produktów...</p>
            </div>
          ) : getFilteredProducts().length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {products.length === 0 ? 'Brak produktów w tym pokoju' : 'Brak produktów spełniających wybrane filtry'}
              </p>
              {products.length > 0 && (
                <button
                  onClick={resetFilters}
                  className="mt-3 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Resetuj filtry
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Sekcja filtrów */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={18} className="text-indigo-600" />
                  <h3 className="font-medium text-gray-900">Filtry eksportu</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Filtr sklepu */}
                  <div>
                    <label htmlFor="shop-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Sklep
                    </label>
                    <select
                      id="shop-filter"
                      value={selectedShop}
                      onChange={(e) => setSelectedShop(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="all">Wszystkie sklepy</option>
                      {availableShops.map((shop) => (
                        <option key={shop} value={shop}>
                          {shop}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtr statusu */}
                  <div>
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      id="status-filter"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="all">Wszystkie statusy</option>
                      <option value="planned">Planowane</option>
                      <option value="purchased">Zakupione</option>
                    </select>
                  </div>

                  {/* Przycisk resetowania filtrów */}
                  <div className="flex items-end">
                    <button
                      onClick={resetFilters}
                      className="w-full px-3 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                    >
                      Resetuj filtry
                    </button>
                  </div>
                </div>

                {/* Informacja o liczbie przefiltrowanych produktów */}
                <div className="mt-3 text-sm text-gray-600">
                  Pokazano: {getFilteredProducts().length} z {products.length} produktów
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleAllProducts}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {selectedProducts.size === products.length ? (
                      <Check size={16} />
                    ) : (
                      <Square size={16} />
                    )}
                    <span className="hidden sm:inline">
                      {selectedProducts.size === products.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                    </span>
                    <span className="sm:hidden">
                      {selectedProducts.size === products.length ? 'Odznacz' : 'Zaznacz'}
                    </span>
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Zaznaczono: {selectedProducts.size} z {getFilteredProducts().length}
                  {(selectedShop !== 'all' || selectedStatus !== 'all') && (
                    <span className="block text-xs text-gray-500 mt-1">
                      (Filtry: {[
                        selectedShop !== 'all' ? `Sklep: ${selectedShop}` : null,
                        selectedStatus !== 'all' ? `Status: ${getStatusText(selectedStatus)}` : null
                      ].filter(Boolean).join(', ')})
                    </span>
                  )}
                </span>
              </div>

              <div className="space-y-6">
                {(() => {
                  // Użyj przefiltrowanych produktów
                  const filteredProducts = getFilteredProducts();
                  
                  // Group products by room
                  const productsByRoom = filteredProducts.reduce((acc, product) => {
                    // For single room export, use the roomName prop
                    // For project export, use the product's room_name
                    const currentRoomName = isProjectExport ? 
                      (product.room_name || 'Nieznany pokój') : 
                      roomName;
                    
                    if (!acc[currentRoomName]) {
                      acc[currentRoomName] = [];
                    }
                    acc[currentRoomName].push(product);
                    return acc;
                  }, {} as Record<string, typeof filteredProducts>);

                  return Object.entries(productsByRoom).map(([roomName, roomProducts]) => (
                    <div key={roomName} className="space-y-3">
                      {/* Room header */}
                      <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-200">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full flex-shrink-0"></div>
                        <h3 className="text-base sm:text-lg font-semibold text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg">
                          {roomName}
                        </h3>
                        <span className="text-sm text-gray-500">
                          ({roomProducts.length} produktów)
                        </span>
                      </div>
                      
                      {/* Products in this room */}
                      <div className="space-y-3 pl-2 sm:pl-4">
                        {roomProducts.map((product) => (
                          <div
                            key={product.id || `product-${Math.random()}`}
                            className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm"
                          >
                            <button
                              onClick={() => product.id && toggleProduct(product.id)}
                              className="flex-shrink-0 mt-1"
                            >
                              {product.id && selectedProducts.has(product.id) ? (
                                <Check size={18} className="text-indigo-600" />
                              ) : (
                                <Square size={18} className="text-gray-400" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm sm:text-base">{product.name}</h3>
                              {product.description && (
                                <p className="text-xs sm:text-sm text-gray-600 mt-1">{product.description}</p>
                              )}
                              {product.link && (
                                <div 
                                  className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors"
                                  onClick={() => product.link && window.open(product.link, '_blank', 'noopener,noreferrer')}
                                >
                                  <ExternalLink size={14} className="text-blue-600 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm text-blue-600 flex-1 font-medium">
                                    Link do produktu
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      product.link && copyToClipboard(product.link);
                                    }}
                                    className="p-2 hover:bg-blue-200 rounded transition-colors"
                                    title="Kopiuj link"
                                  >
                                    <Copy size={16} className="text-blue-600" />
                                  </button>
                                </div>
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                                <span className="bg-blue-50 px-2 py-1 rounded">Cena: {product.price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN</span>
                                <span className="bg-green-50 px-2 py-1 rounded">Ilość: {product.quantity}</span>
                                <span className="bg-purple-50 px-2 py-1 rounded">Wartość: {(product.price * product.quantity).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN</span>
                                <span className="bg-orange-50 px-2 py-1 rounded">Status: {getStatusText(product.status)}</span>
                                {product.shop && <span className="bg-emerald-50 px-2 py-1 rounded text-emerald-700">Sklep: {product.shop}</span>}
                                {product.category && <span className="bg-gray-50 px-2 py-1 rounded">Kategoria: {product.category}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedProducts.size > 0 && (
              <>
                Łączna wartość zaznaczonych: {
                  getFilteredProducts()
                    .filter(p => p.id && selectedProducts.has(p.id))
                    .reduce((sum, product) => sum + (product.price * product.quantity), 0)
                    .toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                } PLN
              </>
            )}
            {(selectedShop !== 'all' || selectedStatus !== 'all') && (
              <div className="text-xs text-gray-500 mt-1">
                Aktywne filtry: {[
                  selectedShop !== 'all' ? `Sklep: ${selectedShop}` : null,
                  selectedStatus !== 'all' ? `Status: ${getStatusText(selectedStatus)}` : null
                ].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm sm:text-base"
            >
              Anuluj
            </button>
            <button
              onClick={exportToPDF}
              disabled={selectedProducts.size === 0 || exporting}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Eksportuję...</span>
                  <span className="sm:hidden">Eksport...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span className="hidden sm:inline">Eksportuj PDF</span>
                  <span className="sm:hidden">PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
