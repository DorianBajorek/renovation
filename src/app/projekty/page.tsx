"use client";
import { Plus, FolderOpen, ChevronRight, PieChart, Download, Calendar, Users, Home, Building, Briefcase, Trash2, Edit } from "lucide-react";
import { useEffect, useState } from "react";
import { Project } from "../types";
import { AddProjectForm } from "../projekty/AddProjectForm";
import { EditProjectForm } from "../projekty/EditProjectForm";
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
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
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
    if (user) {
      setLoading(true);
      fetch(`/api/projects?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            // Map database fields to frontend format and deduplicate by ID
            const mappedProjects = data.map(project => ({
              ...project,
              startDate: project.start_date || project.startDate,
              endDate: project.end_date || project.endDate,
            }));
            
            // Remove duplicates based on ID
            const uniqueProjects = mappedProjects.filter((project, index, self) => 
              index === self.findIndex(p => p.id === project.id)
            );
            
            setProjects(uniqueProjects);
          }
        })
        .catch(error => {
          console.error('Error fetching projects:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const handleAddProject = async (project: Project) => {
    if (!user) return;

    try {
      setLoading(true);
      // Refresh data from server after successful addition
      const refreshResponse = await fetch(`/api/projects?userId=${user.id}`);
      if (refreshResponse.ok) {
        const refreshedData = await refreshResponse.json();
        if (Array.isArray(refreshedData)) {
          const mappedProjects = refreshedData.map(project => ({
            ...project,
            startDate: project.start_date || project.startDate,
            endDate: project.end_date || project.endDate,
          }));
          setProjects(mappedProjects);
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
      const response = await fetch(`/api/projects/${deleteModal.projectId}`, {
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

  const totalBudget = projects.reduce((sum, project) => sum + project.budget, 0);
  const activeProjects = projects.filter(project => project.status === 'active').length;
  const completedProjects = projects.filter(project => project.status === 'completed').length;

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
      <div className="flex justify-center py-10 px-6">
        <div className="flex items-center gap-3 bg-white/80 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-lg border border-white/30">
          <FolderOpen size={32} className="text-black" />
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">
            Twoje Projekty
          </h1>
        </div>
      </div>

      <div className="px-6 md:px-12 mb-8">
        <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6 border border-white/60">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex-1">
              <h2 className="text-lg font-medium text-slate-700 mb-2">
                Przegląd projektów
              </h2>
              <div className="flex items-baseline gap-4">
                <div>
                  <span className="text-3xl md:text-4xl font-bold text-slate-900">
                    {totalBudget.toLocaleString()} PLN
                  </span>
                  <span className="text-sm text-slate-500 ml-2">całkowity budżet</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">{activeProjects} aktywnych</span>
                  <span className="text-gray-600">{completedProjects} zakończonych</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button className="flex items-center gap-2 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition-colors">
                <PieChart size={18} />
                <span>Podgląd budżetu</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                <Download size={18} />
                <span>Eksportuj</span>
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">Aktywne projekty</span>
              </div>
              <span className="text-2xl font-bold text-green-900">{activeProjects}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Zakończone</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{completedProjects}</span>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 px-6 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => {
            const iconMap: Record<string, any> = { Home, Building, Briefcase };
            const Icon = iconMap[project.icon] || FolderOpen;
            return (
              <div
                key={project.id}
                className="group p-6 rounded-3xl bg-white/90 backdrop-blur-md shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/60 hover:-translate-y-2"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon size={32} strokeWidth={1.5} className="text-black" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-slate-900 mb-2">
                  {project.name}
                </h2>
                
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {project.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Budżet</span>
                    <span className="font-semibold text-slate-900">{project.budget.toLocaleString()} PLN</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Wydatki</span>
                    <span className="font-semibold text-indigo-600">{(project.expenses || 0).toLocaleString()} PLN</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Pokoje</span>
                    <span className="font-medium text-slate-700">Zobacz pokoje</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">Okres</span>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">
                        {new Date(project.startDate).toLocaleDateString('pl-PL')} - {new Date(project.endDate).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => project.id && router.push(`/projekty/${project.id}/pokoje`)}
                    className="flex-1 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                    disabled={!project.id}
                  >
                    Otwórz
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button 
                    onClick={() => handleEditProject(project)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    title="Edytuj projekt"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => project.id && handleDeleteProject(project.id, project.name)}
                    className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Usuń projekt"
                    disabled={!project.id}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}

          <div
            className="group p-6 rounded-3xl border-2 border-dashed border-slate-300/70 hover:border-indigo-300 transition-all duration-300 flex flex-col items-center justify-center gap-4 bg-white/50 backdrop-blur-md hover:bg-white/70 cursor-pointer min-h-[300px]"
            onClick={() => setShowForm(true)}
          >
            <div className="p-4 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:scale-110 transition-all duration-300">
              <Plus size={32} strokeWidth={1.5} className="text-black" />
            </div>
            <h2 className="text-xl font-medium text-slate-500 group-hover:text-indigo-600 text-center transition-colors">
              Dodaj nowy projekt
            </h2>
            <p className="text-sm text-slate-400 text-center">
              Utwórz nowy projekt remontowy
            </p>
          </div>
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
      </div>
    </ProtectedRoute>
  );
}
