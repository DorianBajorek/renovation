"use client";
import { X, Home, Building, Briefcase, Calendar } from "lucide-react";
import { useState } from "react";
import { Project, FormErrors } from "../types";
import { useAuth } from "@/hooks/useAuth";

interface AddProjectFormProps {
  onAdd: (project: Project) => void;
  onClose: () => void;
}

const iconOptions = [
  { value: "Home", label: "Dom", icon: Home },
  { value: "Building", label: "Budynek", icon: Building },
  { value: "Briefcase", label: "Biuro", icon: Briefcase },
];

const statusOptions = [
  { value: "planning", label: "Planowanie" },
  { value: "active", label: "Aktywny" },
  { value: "completed", label: "Zakończony" },
];

export function AddProjectForm({ onAdd, onClose }: AddProjectFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    budget: "",
    startDate: "",
    endDate: "",
    status: "planning" as const,
    icon: "Home",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nazwa projektu jest wymagana";
    if (!formData.description.trim()) newErrors.description = "Opis jest wymagany";
    if (!formData.budget || Number(formData.budget) <= 0) newErrors.budget = "Budżet musi być większy od 0";
    if (!formData.startDate) newErrors.startDate = "Data rozpoczęcia jest wymagana";
    if (!formData.endDate) newErrors.endDate = "Data zakończenia jest wymagana";
    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = "Data zakończenia musi być późniejsza niż data rozpoczęcia";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (!user) {
        throw new Error("Użytkownik nie jest zalogowany");
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          budget: Number(formData.budget),
          startDate: formData.startDate,
          endDate: formData.endDate,
          status: formData.status,
          icon: formData.icon,
          userId: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Błąd podczas dodawania projektu');
      }

      // Don't call onAdd here since the parent component will refresh data from server
      onClose();
    } catch (error) {
      console.error("Błąd podczas dodawania projektu:", error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas dodawania projektu');
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
            <h2 className="text-2xl font-semibold text-slate-900">Dodaj nowy projekt</h2>
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
                Opis projektu *
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
                type="number"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.budget ? "border-red-300" : "border-slate-300"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                placeholder="15000"
                min="0"
              />
              {errors.budget && (
                <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
              )}
            </div>

            {/* Daty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data rozpoczęcia *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange("startDate", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.startDate ? "border-red-300" : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Data zakończenia *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange("endDate", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.endDate ? "border-red-300" : "border-slate-300"
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>
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
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
              >
                Dodaj projekt
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
