import { Sofa, Home, Building, Briefcase } from "lucide-react";
import roomsData from "@/app/fake-db/rooms.json";
import projectsData from "@/app/fake-db/projects.json";
import { Room, Project, IconMap } from "./types";

export const iconMap: IconMap = { 
  Sofa, 
  Home, 
  Building, 
  Briefcase 
};

export const getRooms = async (): Promise<Room[]> => {
  try {
    const response = await fetch('/api/rooms');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.map((room: any) => ({
      ...room,
      icon: iconMap[room.icon] || Sofa,
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    // Fallback to local data if API fails
    return roomsData.map((room: any) => ({
      ...room,
      icon: iconMap[room.icon] || Sofa,
    }));
  }
};

export const addRoom = async (room: { name: string; budget: number }) => {
  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(room),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding room:', error);
    // Fallback: create room locally
    const newRoom = { ...room, icon: Sofa };
    return newRoom;
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate and transform the data to match our Project interface
    const projects: Project[] = data.map((project: any) => ({
      ...project,
      status: project.status as 'active' | 'planning' | 'completed'
    }));
    
    return projects;
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    // Fallback to local data if API fails
    return projectsData.map((project: any) => ({
      ...project,
      status: project.status as 'active' | 'planning' | 'completed'
    }));
  }
};

export const addProject = async (project: Omit<Project, 'id'>) => {
  try {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(project),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding project:', error);
    // Fallback: create project locally
    const newProject = { 
      ...project, 
      id: Date.now().toString(),
      icon: project.icon || 'Home'
    };
    return newProject;
  }
};

export const updateProject = async (id: string, updates: Partial<Project>) => {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

export const deleteProject = async (id: string) => {
  try {
    const response = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
};
