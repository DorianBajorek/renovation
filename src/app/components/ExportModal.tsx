"use client";
import { useState, useEffect } from 'react';
import { Product } from '../types/product';
import { X, Download, Check, Square } from 'lucide-react';
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
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      const productIds = products.map(p => p.id).filter(id => id !== undefined);
      setSelectedProducts(new Set(productIds));
    }
  };

  const exportToPDF = async () => {
    if (selectedProducts.size === 0) {
      alert('Wybierz przynajmniej jeden produkt do eksportu');
      return;
    }

    setExporting(true);
    try {
      const selectedProductsList = products.filter(p => p.id && selectedProducts.has(p.id));
      
      const doc = new jsPDF();
      
      // Dodaj obsługę polskich znaków - użyj fontu z obsługą UTF-8
      doc.setFont('helvetica');
      
      // Tytuł
      doc.setFontSize(20);
      const title = isProjectExport ? 
        `Lista produktow projektu - ${convertPolishChars(roomName)}` :
        `Lista produktow - ${convertPolishChars(roomName)}`;
      doc.text(title, 20, 20);
      
      // Data eksportu
      doc.setFontSize(12);
      doc.text(`Data eksportu: ${new Date().toLocaleDateString('pl-PL')}`, 20, 30);
      
            let yPosition = 50;
      const startX = 20;
      const colWidths = [50, 30, 20, 30, 30];
      const headers = ['Nazwa', 'Cena', 'Ilosc', 'Wartosc', 'Pokoj'];
      
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
         Object.entries(productsByRoom).forEach(([roomName, roomProducts]) => {
           // Sprawdź czy potrzebna jest nowa strona
           if (yPosition > 250) {
             doc.addPage();
             yPosition = 20;
           }
           
                       // Nagłówek pokoju
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text(`POKÓJ: ${convertPolishChars(roomName)}`, startX, yPosition);
           yPosition += 15;
           
           // Nagłówki kolumn
           doc.setFontSize(10);
           doc.setFont(undefined, 'bold');
           let currentX = startX;
           headers.forEach((header, index) => {
             doc.text(header, currentX, yPosition);
             currentX += colWidths[index];
           });
           
           yPosition += 10;
           
           // Rysuj linię pod nagłówkami
           doc.setDrawColor(100, 100, 100);
           doc.line(startX, yPosition, startX + colWidths.reduce((a, b) => a + b, 0), yPosition);
           yPosition += 5;
           
           // Dane produktów w pokoju
           doc.setFont(undefined, 'normal');
           doc.setFontSize(9);
           
                       roomProducts.forEach((product, index) => {
              // Sprawdź czy potrzebna jest nowa strona
              if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
              }
             
             const rowData = [
               convertPolishChars(product.name),
               `${product.price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`,
               product.quantity.toString(),
               `${(product.price * product.quantity).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`,
               convertPolishChars(product.room_name || '-')
             ];
             
             currentX = startX;
             rowData.forEach((text, colIndex) => {
               // Skróć tekst jeśli jest za długi
               const maxWidth = colWidths[colIndex] - 2;
               const truncatedText = doc.getTextWidth(text) > maxWidth ? 
                 text.substring(0, Math.floor(maxWidth / 3)) + '...' : text;
               
               doc.text(truncatedText, currentX, yPosition);
               currentX += colWidths[colIndex];
             });
             
             yPosition += 8;
             
             // Dodaj linię co kilka wierszy dla lepszej czytelności
             if ((index + 1) % 5 === 0) {
               doc.setDrawColor(200, 200, 200);
               doc.line(startX, yPosition, startX + colWidths.reduce((a, b) => a + b, 0), yPosition);
               yPosition += 3;
             }
           });
           
           // Podsumowanie dla pokoju
           const roomTotal = roomProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);
           yPosition += 5;
           
           // Linia podsumowania
           doc.setDrawColor(200, 200, 200);
           doc.line(startX, yPosition, startX + colWidths.reduce((a, b) => a + b, 0), yPosition);
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
           doc.line(startX, yPosition, startX + colWidths.reduce((a, b) => a + b, 0), yPosition);
           yPosition += 10;
         });
                    } else {
         // Dla eksportu pokoi - standardowy format
         // Nagłówek sekcji
         doc.setFontSize(14);
         doc.setFont(undefined, 'bold');
         doc.text(`LISTA PRODUKTÓW - ${convertPolishChars(roomName)}`, startX, yPosition);
         yPosition += 10;
         
         // Nagłówki kolumn
         doc.setFontSize(10);
         doc.setFont(undefined, 'bold');
         let currentX = startX;
         headers.forEach((header, index) => {
           doc.text(header, currentX, yPosition);
           currentX += colWidths[index];
         });
         
         yPosition += 10;
         
         // Rysuj linię pod nagłówkami
         doc.setDrawColor(100, 100, 100);
         doc.line(startX, yPosition, startX + colWidths.reduce((a, b) => a + b, 0), yPosition);
         yPosition += 5;
         
         // Dane produktów
         doc.setFont(undefined, 'normal');
         doc.setFontSize(9);
         
                   selectedProductsList.forEach((product, index) => {
            // Sprawdź czy potrzebna jest nowa strona
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
           
           const rowData = [
             convertPolishChars(product.name),
             `${product.price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`,
             product.quantity.toString(),
             `${(product.price * product.quantity).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN`,
             convertPolishChars(product.room_name || '-')
           ];
           
           currentX = startX;
           rowData.forEach((text, colIndex) => {
             // Skróć tekst jeśli jest za długi
             const maxWidth = colWidths[colIndex] - 2;
             const truncatedText = doc.getTextWidth(text) > maxWidth ? 
               text.substring(0, Math.floor(maxWidth / 3)) + '...' : text;
             
             doc.text(truncatedText, currentX, yPosition);
             currentX += colWidths[colIndex];
           });
           
           yPosition += 8;
           
           // Dodaj linię co kilka wierszy dla lepszej czytelności
           if ((index + 1) % 5 === 0) {
             doc.setDrawColor(200, 200, 200);
             doc.line(startX, yPosition, startX + colWidths.reduce((a, b) => a + b, 0), yPosition);
             yPosition += 3;
           }
         });
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
       const fileName = isProjectExport ? 
         `projekt-${convertPolishChars(roomName)}-${new Date().toISOString().split('T')[0]}.pdf` :
         `produkty-${convertPolishChars(roomName)}-${new Date().toISOString().split('T')[0]}.pdf`;
       doc.save(fileName);
      
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
          ) : products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Brak produktów w tym pokoju</p>
            </div>
          ) : (
            <>
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
                  Zaznaczono: {selectedProducts.size} z {products.length}
                </span>
              </div>

              <div className="space-y-6">
                {(() => {
                  // Group products by room
                  const productsByRoom = products.reduce((acc, product) => {
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
                  }, {} as Record<string, typeof products>);

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
                                <p className="text-xs sm:text-sm text-blue-600 mt-1 break-all">
                                  <a href={product.link} target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">
                                    Link do produktu: {product.link}
                                  </a>
                                </p>
                              )}
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
                                <span className="bg-blue-50 px-2 py-1 rounded">Cena: {product.price.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN</span>
                                <span className="bg-green-50 px-2 py-1 rounded">Ilość: {product.quantity}</span>
                                <span className="bg-purple-50 px-2 py-1 rounded">Wartość: {(product.price * product.quantity).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN</span>
                                <span className="bg-orange-50 px-2 py-1 rounded">Status: {getStatusText(product.status)}</span>
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
                  products
                    .filter(p => p.id && selectedProducts.has(p.id))
                    .reduce((sum, product) => sum + (product.price * product.quantity), 0)
                    .toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                } PLN
              </>
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
