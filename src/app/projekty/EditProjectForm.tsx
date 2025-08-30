"use client";
import { X, Home, Building, Briefcase, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { Project, FormErrors } from "../types";
import { useAuth } from "@/hooks/useAuth";

interface EditProjectFormProps {
  project: Project;
  onUpdate: (project: Project) => void;
  onClose: () => void;
}

const iconOptions = [
  { value: "Home", label: "Dom", icon: Home },
  { value: "Building", label: "Mieszkanie", icon: Building },
  { value: "Briefcase", label: "Biuro", icon: Briefcase },
];

const statusOptions = [
  { value: "active", label: "Aktywny" },
  { value: "completed", label: "Zakończony" },
];

export function EditProjectForm({ project, onUpdate, onClose }: EditProjectFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    status: "active" as 'active' | 'completed',
    icon: "Home",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || "",
        budget: project.budget.toString(),
        status: project.status,
        icon: project.icon,
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nazwa projektu jest wymagana";
    if (!formData.budget || Number(formData.budget) <= 0) newErrors.budget = "Budżet musi być większy od 0";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      if (!user || !project.id) {
        throw new Error("Użytkownik nie jest zalogowany lub brak ID projektu");
      }

      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description,
          budget: Number(formData.budget),
          status: formData.status,
          icon: formData.icon,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas aktualizacji projektu');
      }

      const updatedProject = await response.json();
      onUpdate(updatedProject);
      onClose();
    } catch (error) {
      console.error("Błąd podczas aktualizacji projektu:", error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas aktualizacji projektu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900">Edytuj projekt</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={24} className="text-slate-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nazwa projektu */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nazwa projektu *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name ? "border-red-300" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="np. Remont mieszkania"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Opis */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Opis projektu
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.description ? "border-red-300" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="Opisz swój projekt remontowy..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Budżet */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Budżet (PLN) *
              </label>
              <input
                type="text"
                value={formData.budget === "" ? "" : Number(formData.budget).toFixed(2)}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9.]/g, '');
                  // Allow only one decimal point
                  const parts = value.split('.');
                  if (parts.length > 2) return;
                  // Limit to 2 decimal places
                  if (parts.length === 2 && parts[1].length > 2) return;
                  handleInputChange("budget", value);
                }}
                onBlur={() => {
                  // Format to 2 decimal places when leaving the field
                  if (formData.budget && Number(formData.budget) > 0) {
                    handleInputChange("budget", Number(formData.budget).toFixed(2));
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.budget ? "border-red-300" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="15000.00"
              />
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status projektu
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ikona */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ikona projektu
              </label>
              <div className="grid grid-cols-3 gap-3">
                {iconOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange("icon", option.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.icon === option.value
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Icon size={24} className="text-slate-700" />
                        <span className="text-sm font-medium text-slate-700">
                          {option.label}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Przyciski */}
            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                disabled={loading}
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Zapisywanie..." : "Zapisz zmiany"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
