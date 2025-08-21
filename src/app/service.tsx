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
  const stored = localStorage.getItem("rooms");
  const data = stored ? JSON.parse(stored) : roomsData;
  return data.map((room: any) => ({
    ...room,
    icon: iconMap[room.icon] || Sofa,
  }));
};

export const addRoom = async (room: { name: string; budget: number }) => {
  const stored = localStorage.getItem("rooms");
  const data = stored ? JSON.parse(stored) : roomsData;
  const newRoom = { ...room, icon: Sofa };
  data.push(newRoom);
  localStorage.setItem("rooms", JSON.stringify(data));
  return newRoom;
};

export const getProjects = async (): Promise<Project[]> => {
  const stored = localStorage.getItem("projects");
  const data = stored ? JSON.parse(stored) : projectsData;
  return data;
};

export const addProject = async (project: Omit<Project, 'id'>) => {
  const stored = localStorage.getItem("projects");
  const data = stored ? JSON.parse(stored) : projectsData;
  const newProject = { 
    ...project, 
    id: Date.now().toString(),
    icon: project.icon || 'Home'
  };
  data.push(newProject);
  localStorage.setItem("projects", JSON.stringify(data));
  return newProject;
};

export const updateProject = async (id: string, updates: Partial<Project>) => {
  const stored = localStorage.getItem("projects");
  const data = stored ? JSON.parse(stored) : projectsData;
  const updatedData = data.map((project: Project) => 
    project.id === id ? { ...project, ...updates } : project
  );
  localStorage.setItem("projects", JSON.stringify(updatedData));
  return updatedData.find((project: Project) => project.id === id);
};

export const deleteProject = async (id: string) => {
  const stored = localStorage.getItem("projects");
  const data = stored ? JSON.parse(stored) : projectsData;
  const filteredData = data.filter((project: Project) => project.id !== id);
  localStorage.setItem("projects", JSON.stringify(filteredData));
  return true;
};
