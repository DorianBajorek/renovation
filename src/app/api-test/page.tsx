"use client";
import { useEffect, useState } from 'react';
import { Project } from '../types';

export default function ApiTestPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">API Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">GET /api/projects</h2>
          
          {loading && (
            <div className="text-blue-600">Loading projects...</div>
          )}
          
          {error && (
            <div className="text-red-600 mb-4">
              Error: {error}
            </div>
          )}
          
          {!loading && !error && (
            <div>
              <div className="text-green-600 mb-4">
                ✅ API call successful! Found {projects.length} projects
              </div>
              
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded p-4">
                    <h3 className="font-semibold">{project.name}</h3>
                    <p className="text-gray-600">{project.description || "Brak opisu"}</p>
                    <div className="text-sm text-gray-500 mt-2">
                      Budget: {project.budget} PLN | Status: {project.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
