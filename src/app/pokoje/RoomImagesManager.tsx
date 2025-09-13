"use client";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/hooks/useAuth";
import { Plus, X, Camera, ExternalLink, Image as ImageIcon, Upload, Link, Trash2 } from "lucide-react";
import { ImageGalleryModal } from "@/components/ImageGalleryModal";
import ConfirmationModal from "@/components/ConfirmationModal";

interface RoomImagesManagerProps {
  roomId: string;
  images: string[] | null;
  onImagesUpdate: (images: string[]) => void;
  userPermission: 'read' | 'edit';
}

export const RoomImagesManager = ({ 
  roomId, 
  images, 
  onImagesUpdate, 
  userPermission 
}: RoomImagesManagerProps) => {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [loading, setLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; imageUrl: string }>({
    isOpen: false,
    imageUrl: ''
  });
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Block scrolling when modal is open
  useEffect(() => {
    if (showAddForm || loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showAddForm, loading]);

  const showError = (title: string, message: string) => {
    setErrorModal({ isOpen: true, title, message });
  };

  const handleAddImageFromUrl = async () => {
    if (!newImageUrl.trim() || !user) return;

    // Validate JPG format
    if (!newImageUrl.match(/\.(jpg|jpeg)(\?.*)?$/i)) {
      showError('Nieprawidłowy format', 'Tylko pliki JPG są obsługiwane');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/rooms/${roomId}/images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: newImageUrl,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas dodawania zdjęcia');
      }

      const data = await response.json();
      onImagesUpdate(data.room.visualization_images || []);
      resetForm();
    } catch (error) {
      console.error('Error adding image:', error);
      showError('Błąd dodawania zdjęcia', error instanceof Error ? error.message : 'Wystąpił błąd podczas dodawania zdjęcia');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (!user) return;
    
    // Get file from selectedFile state or from file input as fallback
    const fileInput = fileInputRef.current;
    const actualFile = selectedFile || fileInput?.files?.[0];
    
    if (!actualFile) {
      console.error('File upload error: no file available', {
        hasSelectedFile: !!selectedFile,
        inputHasFiles: !!fileInput?.files?.length,
        uploadMethod
      });
      showError('Błąd wyboru pliku', 'Nie można odnaleźć wybranego pliku. Spróbuj wybrać plik ponownie.');
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', actualFile);
      formData.append('userId', user.id);

      const response = await fetch(`/api/rooms/${roomId}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas uploadu zdjęcia');
      }

      const data = await response.json();
      onImagesUpdate(data.room.visualization_images || []);
      resetForm();
    } catch (error) {
      console.error('Error uploading image:', error);
      showError('Błąd uploadu zdjęcia', error instanceof Error ? error.message : 'Wystąpił błąd podczas uploadu zdjęcia');
    } finally {
      setLoading(false);
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('handleAddImage called', {
      uploadMethod,
      selectedFile: selectedFile?.name,
      newImageUrl,
      filePreview: !!filePreview,
      inputHasFiles: !!fileInputRef.current?.files?.length
    });
    
    if (uploadMethod === 'url') {
      await handleAddImageFromUrl();
    } else {
      await handleFileUpload();
    }
  };

  const resetForm = () => {
    setNewImageUrl("");
    setSelectedFile(null);
    setFilePreview(null);
    setShowAddForm(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    // Handle case when user cancels file selection (no file selected)
    if (!file) {
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/jpg')) {
      showError('Nieprawidłowy format', 'Tylko pliki JPG są obsługiwane');
      event.target.value = '';
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showError('Plik za duży', 'Rozmiar pliku musi być mniejszy niż 5MB');
      event.target.value = '';
      setSelectedFile(null);
      setFilePreview(null);
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFilePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/jpg')) {
        showError('Nieprawidłowy format', 'Tylko pliki JPG są obsługiwane');
        return;
      }

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('Plik za duży', 'Rozmiar pliku musi być mniejszy niż 5MB');
        return;
      }

      setSelectedFile(file);
      setUploadMethod('file');
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveImage = (imageUrl: string) => {
    setDeleteModal({ isOpen: true, imageUrl });
  };

  const confirmDeleteImage = async () => {
    if (!user || !deleteModal.imageUrl) return;

    try {
      setLoading(true);
      
      const response = await fetch(
        `/api/rooms/${roomId}/images?imageUrl=${encodeURIComponent(deleteModal.imageUrl)}&userId=${user.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas usuwania zdjęcia');
      }

      const data = await response.json();
      onImagesUpdate(data.room.visualization_images || []);
    } catch (error) {
      console.error('Error removing image:', error);
      showError('Błąd usuwania zdjęcia', error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania zdjęcia');
    } finally {
      setLoading(false);
      setDeleteModal({ isOpen: false, imageUrl: '' });
    }
  };

  const currentImages = images || [];

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-100">
            <ImageIcon size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Wizualizacje pokoju
            </h3>
            <p className="text-sm text-slate-600">
              Dodaj zdjęcia JPG przedstawiające wizualizację pokoju
            </p>
          </div>
        </div>
        
        {userPermission === 'edit' && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors w-full sm:w-auto"
          >
            <Plus size={18} />
            <span>Dodaj zdjęcie</span>
          </button>
        )}
      </div>

      {/* Images Grid */}
      {currentImages.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {currentImages.map((imageUrl, index) => (
            <div
              key={index}
              className="relative group bg-slate-50 rounded-xl overflow-hidden aspect-square border border-slate-200 hover:border-purple-300 transition-colors cursor-pointer"
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                src={imageUrl}
                alt={`Wizualizacja pokoju ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                  if (errorDiv) errorDiv.style.display = 'flex';
                }}
              />
              
              {/* Error fallback */}
              <div 
                className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500"
                style={{ display: 'none' }}
              >
                <div className="text-center">
                  <ImageIcon size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Nie można załadować obrazka</p>
                </div>
              </div>

              {/* Action buttons - appears only on hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                  title="Otwórz w nowej karcie"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={14} className="text-slate-700" />
                </a>
                {userPermission === 'edit' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(imageUrl);
                    }}
                    className="p-1.5 bg-red-500/90 backdrop-blur-sm rounded-lg hover:bg-red-500 transition-colors shadow-sm"
                    title="Usuń zdjęcie"
                    disabled={loading}
                  >
                    <Trash2 size={14} className="text-white" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
          <ImageIcon size={48} className="mx-auto mb-4 text-slate-400" />
          <p className="text-slate-600 mb-2">Brak zdjęć wizualizacji</p>
          <p className="text-sm text-slate-500">
            {userPermission === 'edit' 
              ? 'Dodaj pierwsze zdjęcie klikając przycisk powyżej' 
              : 'Właściciel nie dodał jeszcze żadnych zdjęć'}
          </p>
        </div>
      )}

      {/* Add Image Form Modal */}
      {showAddForm && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ zIndex: 999999 }}>
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
            <div className="flex-shrink-0 p-6 pb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-slate-900">Dodaj zdjęcie wizualizacji</h4>
                <button
                  onClick={resetForm}
                  className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6">
              {/* Upload Method Tabs */}
              <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => setUploadMethod('url')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMethod === 'url'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Link size={16} />
                <span>URL</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMethod('file')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  uploadMethod === 'file'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Upload size={16} />
                <span>Upload</span>
              </button>
            </div>

            <form id="add-image-form" onSubmit={handleAddImage} className="space-y-4">
              {uploadMethod === 'url' ? (
                /* URL Input */
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    URL zdjęcia (tylko JPG)
                  </label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required={uploadMethod === 'url'}
                    pattern=".*\.(jpg|jpeg)(\?.*)?$"
                    title="Tylko pliki JPG są obsługiwane"
                  />
                </div>
              ) : (
                /* File Upload */
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Wybierz plik (tylko JPG, max 5MB)
                  </label>
                  
                  {/* Drag & Drop Area */}
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="relative border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-purple-400 transition-colors bg-slate-50/50"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg"
                      onChange={handleFileSelect}
                      onFocus={() => {
                        // When file input gets focus, check if we need to sync state
                        const checkSync = () => {
                          const currentFiles = fileInputRef.current?.files;
                          if ((!currentFiles || currentFiles.length === 0) && selectedFile) {
                            console.log('File input cleared, syncing selectedFile state');
                            setSelectedFile(null);
                            setFilePreview(null);
                          }
                        };
                        
                        // Check after file dialog closes (user returns focus to page)
                        const handleWindowFocus = () => {
                          setTimeout(checkSync, 50);
                          window.removeEventListener('focus', handleWindowFocus);
                        };
                        
                        window.addEventListener('focus', handleWindowFocus);
                        
                        // Also check immediately
                        setTimeout(checkSync, 50);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      required={uploadMethod === 'file'}
                    />
                    <div className="text-center">
                      <Upload size={32} className="mx-auto mb-2 text-slate-400" />
                      <p className="text-sm text-slate-600">
                        {selectedFile ? selectedFile.name : 'Kliknij lub przeciągnij plik tutaj'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        JPG, max 5MB
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview */}
              {((uploadMethod === 'url' && newImageUrl && newImageUrl.match(/\.(jpg|jpeg)(\?.*)?$/i)) || 
                (uploadMethod === 'file' && filePreview)) && (
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-sm text-slate-600 mb-2">Podgląd:</p>
                  <div className="relative aspect-video max-h-48 bg-white rounded-lg overflow-hidden border border-slate-200">
                    <img
                      src={uploadMethod === 'url' ? newImageUrl : filePreview || ''}
                      alt="Podgląd zdjęcia"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const errorDiv = e.currentTarget.nextElementSibling as HTMLElement;
                        if (errorDiv) errorDiv.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-slate-100 text-slate-500"
                      style={{ display: 'none' }}
                    >
                      <div className="text-center">
                        <ImageIcon size={32} className="mx-auto mb-2" />
                        <p className="text-sm">Nie można załadować obrazka</p>
                      </div>
                    </div>
                  </div>
                  {uploadMethod === 'file' && selectedFile && (
                    <div className="mt-2 text-xs text-slate-500">
                      Rozmiar: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </div>
                  )}
                </div>
              )}
            </form>
            </div>

            {/* Fixed Bottom Buttons */}
            <div className="flex-shrink-0 p-6 pt-4 border-t border-slate-200">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                  disabled={loading}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  form="add-image-form"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  disabled={
                    loading || 
                    (uploadMethod === 'url' && !newImageUrl.match(/\.(jpg|jpeg)(\?.*)?$/i)) ||
                    (uploadMethod === 'file' && (!selectedFile && !fileInputRef.current?.files?.[0]))
                  }
                >
                  {loading 
                    ? (uploadMethod === 'url' ? 'Dodawanie...' : 'Uploading...') 
                    : 'Dodaj'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Image Gallery Modal */}
      {selectedImageIndex !== null && (
        <ImageGalleryModal
          images={currentImages}
          initialIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}

      {/* Loading overlay */}
      {loading && mounted && createPortal(
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[9998]">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/40">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <p className="text-slate-700">Przetwarzanie...</p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Image Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, imageUrl: '' })}
        onConfirm={confirmDeleteImage}
        title="Usuń zdjęcie"
        message="Czy na pewno chcesz usunąć to zdjęcie wizualizacji? Ta operacja jest nieodwracalna."
        confirmText="Usuń zdjęcie"
        cancelText="Anuluj"
        type="danger"
      />

      {/* Error Modal */}
      <ConfirmationModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        onConfirm={() => setErrorModal({ isOpen: false, title: '', message: '' })}
        title={errorModal.title}
        message={errorModal.message}
        confirmText="OK"
        cancelText=""
        type="warning"
      />
    </div>
  );
};
