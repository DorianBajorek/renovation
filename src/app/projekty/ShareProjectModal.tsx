"use client";
import { useState, useEffect, useCallback } from 'react';
import { X, Share2, UserPlus, Eye, Edit, Trash2 } from 'lucide-react';
import { ProjectShare, ShareProjectRequest } from '../types/project';

interface ShareProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function ShareProjectModal({ isOpen, onClose, projectId, projectName }: ShareProjectModalProps) {
  const [userEmail, setUserEmail] = useState('');
  const [permissionType, setPermissionType] = useState<'read' | 'edit'>('read');
  const [shares, setShares] = useState<ProjectShare[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Pobierz listę udostępnień - memoizowana funkcja
  const fetchShares = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/share?projectId=${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setShares(data);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
    }
  }, [projectId]);

  // Pobierz udostępnienia przy otwarciu modala
  useEffect(() => {
    if (isOpen) {
      fetchShares();
    }
  }, [isOpen, fetchShares]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const shareData: ShareProjectRequest = {
        projectId,
        userEmail,
        permissionType
      };

      const response = await fetch('/api/projects/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shareData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Projekt został udostępniony użytkownikowi ${userEmail}`);
        setUserEmail('');
        setPermissionType('read');
        // Odśwież listę udostępnień
        fetchShares();
      } else {
        setError(data.error || 'Wystąpił błąd podczas udostępniania projektu');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas udostępniania projektu');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveShare = async (sharedWithId: string) => {
    try {
      const response = await fetch(`/api/projects/share?projectId=${projectId}&sharedWithId=${sharedWithId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Udostępnienie zostało usunięte');
        fetchShares();
      } else {
        setError('Wystąpił błąd podczas usuwania udostępnienia');
      }
    } catch (error) {
      setError('Wystąpił błąd podczas usuwania udostępnienia');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/50">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Share2 size={24} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Udostępnij projekt</h2>
                <p className="text-sm text-gray-600">{projectName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Formularz udostępniania */}
          <form onSubmit={handleShare} className="mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email użytkownika
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="wprowadź email użytkownika"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ uprawnień
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="permissionType"
                      value="read"
                      checked={permissionType === 'read'}
                      onChange={(e) => setPermissionType(e.target.value as 'read' | 'edit')}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-gray-600" />
                      <span className="text-sm">Tylko odczyt</span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="permissionType"
                      value="edit"
                      checked={permissionType === 'edit'}
                      onChange={(e) => setPermissionType(e.target.value as 'read' | 'edit')}
                      className="mr-3"
                    />
                    <div className="flex items-center gap-2">
                      <Edit size={16} className="text-gray-600" />
                      <span className="text-sm">Edycja</span>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <UserPlus size={20} />
                )}
                Udostępnij projekt
              </button>
            </div>
          </form>

          {/* Komunikaty */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          {/* Lista udostępnień */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Udostępnione użytkownikom</h3>
            {shares.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Share2 size={48} className="mx-auto mb-3 text-gray-300" />
                <p>Brak udostępnień</p>
                <p className="text-sm">Udostępnij projekt, aby zobaczyć listę tutaj</p>
              </div>
            ) : (
              <div className="space-y-3">
                {shares.map((share) => (
                  <div
                    key={share.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg">
                        {share.permission_type === 'read' ? (
                          <Eye size={16} className="text-gray-600" />
                        ) : (
                          <Edit size={16} className="text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {share.shared_with?.first_name} {share.shared_with?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{share.shared_with?.email}</p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-indigo-100 text-indigo-700 rounded-full">
                          {share.permission_type === 'read' ? 'Tylko odczyt' : 'Edycja'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveShare(share.shared_with_id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Usuń udostępnienie"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
