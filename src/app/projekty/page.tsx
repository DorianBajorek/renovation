"use client";
import { Plus, FolderOpen, ChevronRight, PieChart, Download, Calendar, Users, Home, Building, Briefcase, Trash2, Edit, Share2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { Project } from "../types";
import { AddProjectForm } from "../projekty/AddProjectForm";
import { EditProjectForm } from "../projekty/EditProjectForm";
import { ExportModal } from "../components/ExportModal";
import { ShareProjectModal } from "../projekty/ShareProjectModal";
import { useAuth } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useRouter } from "next/navigation";

export default function ProjektyPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sharingProject, setSharingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'own' | 'shared'>('own');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    projectId: string | null;
    projectName: string;
  }>({
    isOpen: false,
    projectId: null,
    projectName: ''
  });

  useEffect(() => {
    console.log("SIEMAA");
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const includeShared = activeTab === 'shared';
      fetch(`/api/projects?userId=${user.id}&includeShared=${includeShared}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProjects(data);
          }
        })
        .catch(error => {
          console.error('Error fetching projects:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user, activeTab]);

  const handleAddProject = async (project: Project) => {
    if (!user) return;

    try {
      setLoading(true);
      // Refresh data from server after successful addition
      const refreshResponse = await fetch(`/api/projects?userId=${user.id}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        if (Array.isArray(refreshedData)) {
          setProjects(refreshedData);
        }
      }
    } catch (error) {
      console.error('Error adding project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectFormClose = () => {
    setShowForm(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditForm(true);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prevProjects => 
      prevProjects.map(project => 
        project.id === updatedProject.id ? updatedProject : project
      )
    );
  };

  const handleEditFormClose = () => {
    setShowEditForm(false);
    setEditingProject(null);
  };

  const handleShareProject = (project: Project) => {
    setSharingProject(project);
    setShowShareModal(true);
  };

  const handleShareModalClose = () => {
    setShowShareModal(false);
    setSharingProject(null);
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    setDeleteModal({
      isOpen: true,
      projectId,
      projectName
    });
  };

  const confirmDeleteProject = async () => {
    if (!deleteModal.projectId || !user) return;

    try {
      const response = await fetch(`/api/projects/${deleteModal.projectId}?userId=${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the project from the local state
        setProjects(prevProjects => 
          prevProjects.filter(project => project.id !== deleteModal.projectId)
        );
      } else {
        console.error('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const ownProjects = projects.filter(project => !project.is_shared);
  const sharedProjects = projects.filter(project => project.is_shared);
  
  // Liczenie projektów aktywnych i zakończonych w zależności od aktywnej zakładki
  const activeProjects = activeTab === 'own' 
    ? ownProjects.filter(project => project.status === 'active').length
    : sharedProjects.filter(project => project.status === 'active').length;
  const completedProjects = activeTab === 'own'
    ? ownProjects.filter(project => project.status === 'completed').length
    : sharedProjects.filter(project => project.status === 'completed').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Aktywny';
      case 'completed': return 'Zakończony';
      default: return status;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 font-inter flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Ładowanie projektów...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800 font-inter flex flex-col">
      <div className="flex justify-center py-6 sm:py-10 px-4 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 bg-white/80 backdrop-blur-lg px-4 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-lg border border-white/30">
          <FolderOpen size={24} className="sm:w-8 sm:h-8 text-black" />
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 tracking-tight">
            Twoje Projekty
          </h1>
        </div>
      </div>

      <div className="px-4 sm:px-6 md:px-12 mb-8">
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 border border-white/60">
          {/* Zakładki */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('own')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === 'own'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Moje projekty
            </button>
            <button
              onClick={() => setActiveTab('shared')}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === 'shared'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Udostępnione mi
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-base sm:text-lg font-medium text-slate-700 mb-2">
                {activeTab === 'own' ? 'Przegląd projektów' : 'Projekty udostępnione'}
              </h2>
              {activeTab === 'own' && (
                <div className="text-xs sm:text-sm text-gray-600">
                  {ownProjects.length} projektów
                </div>
              )}
              {activeTab === 'shared' && (
                <div className="text-xs sm:text-sm text-gray-600">
                  {sharedProjects.length} projektów udostępnionych
                </div>
              )}
            </div>

            {activeTab === 'own' && (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button 
                  onClick={() => {
                    if (!user?.id) {
                      alert('Brak ID użytkownika');
                      return;
                    }
                    setShowExportModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors text-sm sm:text-base"
                >
                  <Download size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span>Eksportuj</span>
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-green-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-green-700">Aktywne projekty</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-green-900">{activeProjects}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-xs sm:text-sm font-medium text-gray-700">Zakończone</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-gray-900">{completedProjects}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-6 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                     {projects.map((project) => {
             const iconMap: Record<string, any> = { Home, Building, Briefcase };
             const Icon = iconMap[project.icon] || FolderOpen;
             return (
                               <div
                  key={project.id}
                  className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/60 hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer"
                  onClick={() => project.id && router.push(`/projekty/${project.id}/pokoje`)}
                >
                 <div className="flex items-start justify-between mb-3 sm:mb-4">
                   <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                     <Icon size={24} className="sm:w-8 sm:h-8 strokeWidth={1.5} text-black" />
                   </div>
                   <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                     {getStatusText(project.status)}
                   </span>
                 </div>

                 <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">
                   {project.name}
                 </h2>
                 
                 {project.is_shared && project.owner_name && (
                   <div className="mb-2">
                     <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                       Właściciel: {project.owner_name}
                     </span>
                   </div>
                 )}
                 
                 <p className="text-xs sm:text-sm text-slate-600 mb-3 sm:mb-4 line-clamp-2">
                   {project.description || "Brak opisu"}
                 </p>

                 <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                   <div className="flex items-center justify-between">
                     <span className="text-xs sm:text-sm text-slate-500">Budżet</span>
                     <span className="font-semibold text-slate-900 text-xs sm:text-sm">{project.budget.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN</span>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-xs sm:text-sm text-slate-500">Wydatki</span>
                     <span className="font-semibold text-indigo-600 text-xs sm:text-sm">{(project.expenses || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} PLN</span>
                   </div>
                   
                   {/* Pasek postępu budżetu */}
                   <div className="space-y-1">
                     <div className="flex items-center justify-between text-xs text-slate-500">
                       <span>Wykorzystanie budżetu</span>
                       <span>{Math.round(((project.expenses || 0) / project.budget) * 100)}%</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div 
                         className={`h-2 rounded-full transition-all duration-300 ${
                           (project.expenses || 0) / project.budget > 0.9 
                             ? 'bg-red-500' 
                             : (project.expenses || 0) / project.budget > 0.7 
                               ? 'bg-yellow-500' 
                               : 'bg-green-500'
                         }`}
                         style={{ 
                           width: `${Math.min(((project.expenses || 0) / project.budget) * 100, 100)}%` 
                         }}
                       ></div>
                     </div>
                   </div>
                   
                   <div className="flex items-center justify-between">
                     <span className="text-xs sm:text-sm text-slate-500">Pokoje</span>
                     <span className="font-medium text-slate-700 text-xs sm:text-sm">Zobacz pokoje</span>
                   </div>
                 </div>

                 <div className="flex gap-2">
                                       <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        project.id && router.push(`/projekty/${project.id}/pokoje`);
                      }}
                      className="flex-1 px-3 sm:px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      disabled={!project.id}
                    >
                     Otwórz
                     <ChevronRight size={14} className="sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                   </button>
                   {!project.is_shared && (
                     <>
                                               <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProject(project);
                          }}
                          className="px-3 sm:px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Edytuj projekt"
                        >
                         <Edit size={14} className="sm:w-4 sm:h-4" />
                       </button>
                                               <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareProject(project);
                          }}
                          className="px-3 sm:px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          title="Udostępnij projekt"
                        >
                         <Share2 size={14} className="sm:w-4 sm:h-4" />
                       </button>
                                               <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            project.id && handleDeleteProject(project.id, project.name);
                          }}
                          className="px-3 sm:px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Usuń projekt"
                          disabled={!project.id}
                        >
                         <Trash2 size={14} className="sm:w-4 sm:h-4" />
                       </button>
                     </>
                   )}
                   {project.is_shared && (
                     <div className="px-3 sm:px-4 py-2 rounded-xl bg-purple-50 text-purple-600 flex items-center gap-1">
                       {project.permission_type === 'read' ? (
                         <Eye size={14} className="sm:w-4 sm:h-4" />
                       ) : (
                         <Edit size={14} className="sm:w-4 sm:h-4" />
                       )}
                       <span className="text-xs sm:text-sm">
                         {project.permission_type === 'read' ? 'Odczyt' : 'Edycja'}
                       </span>
                     </div>
                   )}
                 </div>
               </div>
             );
           })}

           {/* Przycisk "Dodaj nowy projekt" tylko w sekcji "Moje projekty" */}
           {activeTab === 'own' && (
             <div
               className="group p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-300/70 hover:border-indigo-300 transition-all duration-300 flex flex-col items-center justify-center gap-3 sm:gap-4 bg-white/50 backdrop-blur-md hover:bg-white/70 cursor-pointer min-h-[250px] sm:min-h-[300px]"
               onClick={() => setShowForm(true)}
             >
               <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                 <Plus size={24} className="sm:w-8 sm:h-8 strokeWidth={1.5} text-black" />
               </div>
               <h2 className="text-lg sm:text-xl font-medium text-slate-500 group-hover:text-indigo-600 text-center transition-colors">
                 Dodaj nowy projekt
               </h2>
               <p className="text-xs sm:text-sm text-slate-400 text-center">
                 Utwórz nowy projekt remontowy
               </p>
             </div>
           )}
        </div>
      </main>

      {showForm && (
        <AddProjectForm
          onAdd={handleAddProject}
          onClose={handleProjectFormClose}
        />
      )}

      {showEditForm && editingProject && (
        <EditProjectForm
          project={editingProject}
          onUpdate={handleUpdateProject}
          onClose={handleEditFormClose}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, projectId: null, projectName: '' })}
        onConfirm={confirmDeleteProject}
        title="Usuń projekt"
        message={`Czy na pewno chcesz usunąć projekt "${deleteModal.projectName}"? Ta operacja jest nieodwracalna.`}
        confirmText="Usuń"
        cancelText="Anuluj"
        type="danger"
      />

      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          roomId={"all"}
          roomName="Wszystkie projekty"
          userId={user?.id}
          isProjectExport={true}
          projectId={undefined}
        />
      )}

      {showShareModal && sharingProject && (
        <ShareProjectModal
          isOpen={showShareModal}
          onClose={handleShareModalClose}
          projectId={sharingProject.id!}
          projectName={sharingProject.name}
        />
      )}

      </div>
    </ProtectedRoute>
  );
}