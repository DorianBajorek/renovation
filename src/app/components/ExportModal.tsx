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
        
        if (isProjectExport && projectId) {
          // Dla eksportu konkretnego projektu, używamy products z odpowiedzi
          const productsList = data.products || [];
          console.log('ExportModal - Products for specific project:', productsList);
          setProducts(productsList);
        } else {
          // Dla eksportu pokoi lub wszystkich produktów, używamy bezpośrednio danych
          console.log('ExportModal - Products for rooms or all:', data);
          setProducts(data);
        }
        
        // Domyślnie zaznacz wszystkie produkty
        let productIds: string[];
        if (isProjectExport && projectId) {
          productIds = (data.products || []).map((p: Product) => p.id!);
        } else {
          productIds = data.map((p: Product) => p.id!);
        }
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
      setSelectedProducts(new Set(products.map(p => p.id!)));
    }
  };

  const exportToPDF = async () => {
    if (selectedProducts.size === 0) {
      alert('Wybierz przynajmniej jeden produkt do eksportu');
      return;
    }

    setExporting(true);
    try {
      const selectedProductsList = products.filter(p => selectedProducts.has(p.id!));
      
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
          doc.setFontSize(14);
          doc.setFont(undefined, 'bold');
          doc.text(`Pokoj: ${convertPolishChars(roomName)}`, startX, yPosition);
          yPosition += 8;
          
          // Nagłówki kolumn
          doc.setFontSize(10);
          let currentX = startX;
          headers.forEach((header, index) => {
            doc.text(header, currentX, yPosition);
            currentX += colWidths[index];
          });
          
          yPosition += 10;
          
          // Rysuj linię pod nagłówkami
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
              `${product.price.toLocaleString()} PLN`,
              product.quantity.toString(),
              `${(product.price * product.quantity).toLocaleString()} PLN`,
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
              doc.line(startX, yPosition, startX + colWidths.reduce((a, b) => a + b, 0), yPosition);
              yPosition += 3;
            }
          });
          
          // Dodaj odstęp między pokojami
          yPosition += 15;
        });
      } else {
        // Dla eksportu pokoi - standardowy format
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
            `${product.price.toLocaleString()} PLN`,
            product.quantity.toString(),
            `${(product.price * product.quantity).toLocaleString()} PLN`,
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
            doc.line(startX, yPosition, startX + colWidths.reduce((a, b) => a + b, 0), yPosition);
            yPosition += 3;
          }
        });
      }
      
             // Podsumowanie
       const totalValue = selectedProductsList.reduce((sum, product) => sum + (product.price * product.quantity), 0);
       yPosition += 10;
       
       doc.setFontSize(12);
       doc.setFont(undefined, 'bold');
       doc.text(`Laczna wartosc: ${totalValue.toLocaleString()} PLN`, 20, yPosition);
       doc.text(`Liczba produktow: ${selectedProductsList.length}`, 20, yPosition + 10);
       
       if (isProjectExport) {
         // Dla projektów dodaj informację o liczbie pokoi
         const uniqueRooms = new Set(selectedProductsList.map(p => p.room_name));
         doc.text(`Liczba pokoi: ${uniqueRooms.size}`, 20, yPosition + 20);
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
      case 'installed': return 'Zainstalowany';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                     <h2 className="text-xl font-semibold text-gray-900">
             {isProjectExport ? `Eksport projektu - ${roomName}` : `Eksport produktów - ${roomName}`}
           </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
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
              <div className="flex items-center justify-between mb-4">
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
                    {selectedProducts.size === products.length ? 'Odznacz wszystkie' : 'Zaznacz wszystkie'}
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  Zaznaczono: {selectedProducts.size} z {products.length}
                </span>
              </div>

              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <button
                      onClick={() => toggleProduct(product.id!)}
                      className="flex-shrink-0"
                    >
                      {selectedProducts.has(product.id!) ? (
                        <Check size={20} className="text-indigo-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      {product.description && (
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span>Cena: {product.price.toLocaleString()} PLN</span>
                        <span>Ilość: {product.quantity}</span>
                        <span>Wartość: {(product.price * product.quantity).toLocaleString()} PLN</span>
                        <span>Status: {getStatusText(product.status)}</span>
                        {product.category && <span>Kategoria: {product.category}</span>}
                        {product.room_name && <span>Pokój: {product.room_name}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedProducts.size > 0 && (
              <>
                Łączna wartość zaznaczonych: {
                  products
                    .filter(p => selectedProducts.has(p.id!))
                    .reduce((sum, product) => sum + (product.price * product.quantity), 0)
                    .toLocaleString()
                } PLN
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Anuluj
            </button>
            <button
              onClick={exportToPDF}
              disabled={selectedProducts.size === 0 || exporting}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Eksportuję...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Eksportuj PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
