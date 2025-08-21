import { Sofa, Home, Building, Briefcase } from "lucide-react";
import { Room, Project, IconMap } from "./types";
import { getRooms as getRoomsFromSupabase, addRoom as addRoomToSupabase } from "@/lib/supabase-service";
import { getProjects as getProjectsFromSupabase, addProject as addProjectToSupabase, updateProject as updateProjectInSupabase, deleteProject as deleteProjectFromSupabase } from "@/lib/supabase-service";

export const iconMap: IconMap = { 
  Sofa, 
  Home, 
  Building, 
  Briefcase 
};

export const getRooms = async (): Promise<Room[]> => {
  try {
    const rooms = await getRoomsFromSupabase();
    return rooms.map((room: any) => ({
      ...room,
      icon: iconMap[room.icon] || Sofa,
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
};

export const addRoom = async (room: { name: string; budget: number }) => {
  try {
    const newRoom = await addRoomToSupabase(room);
    return {
      ...newRoom,
      icon: iconMap[newRoom.icon] || Sofa,
    };
  } catch (error) {
    console.error('Error adding room:', error);
    throw error;
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const projects = await getProjectsFromSupabase();
    return projects.map((project: any) => ({
      ...project,
      status: project.status as 'active' | 'planning' | 'completed'
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
};

export const addProject = async (project: Omit<Project, 'id'>) => {
  try {
    const newProject = await addProjectToSupabase(project);
    return newProject;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
};

export const updateProject = async (id: string, updates: Partial<Project>) => {
  try {
    const updatedProject = await updateProjectInSupabase(id, updates);
    return updatedProject;
  } catch (error) {
    console.error('Error updating project:', error);
    return null;
  }
};

export const deleteProject = async (id: string) => {
  try {
    const result = await deleteProjectFromSupabase(id);
    return result;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
};
