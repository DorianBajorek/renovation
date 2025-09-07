"use client";
import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageGalleryModal = ({ images, initialIndex, onClose }: ImageGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft') {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (event.key === 'ArrowRight') {
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length, onClose]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (images.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-lg"
        >
          <X size={24} />
        </button>

        {/* Navigation arrows - only show if more than 1 image */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 p-3 sm:p-2 text-white hover:text-gray-300 transition-colors z-20 bg-black/70 hover:bg-black/90 rounded-lg touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              <ChevronLeft size={28} className="sm:w-8 sm:h-8" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 p-3 sm:p-2 text-white hover:text-gray-300 transition-colors z-20 bg-black/70 hover:bg-black/90 rounded-lg touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center"
            >
              <ChevronRight size={28} className="sm:w-8 sm:h-8" />
            </button>
          </>
        )}

        {/* Image container */}
        <div className="relative max-w-[90vw] max-h-[90vh] mx-4">
          <img
            src={images[currentIndex]}
            alt={`Wizualizacja pokoju ${currentIndex + 1}`}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Image counter - positioned at top on mobile, bottom on desktop */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 sm:bottom-4 sm:left-1/2 sm:top-auto sm:transform sm:-translate-x-1/2 px-3 py-1 bg-black/70 text-white text-sm rounded-lg z-10">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail navigation - show if more than 1 image */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/70 p-2 rounded-lg max-w-[90vw] overflow-x-auto z-10">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`relative w-12 h-12 sm:w-12 sm:h-12 rounded-md overflow-hidden border-2 transition-all touch-manipulation min-w-[48px] min-h-[48px] flex-shrink-0 ${
                  index === currentIndex 
                    ? 'border-white' 
                    : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`Miniatura ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
