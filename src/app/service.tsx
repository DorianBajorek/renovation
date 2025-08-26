import { Room, Project } from './types';
import { addRoom as addRoomToSupabase, getRooms as getRoomsFromSupabase, getProjects as getProjectsFromSupabase } from '@/lib/supabase-service';
import { Sofa, Home, Building, Briefcase } from 'lucide-react';

const iconMap: Record<string, any> = {
  Sofa,
  Home,
  Building,
  Briefcase,
};

export const getRooms = async (userId: string): Promise<Room[]> => {
  try {
    const rooms = await getRoomsFromSupabase(userId);
    return rooms.map(room => ({
      ...room,
      icon: iconMap[room.icon] || Sofa,
    }));
  } catch (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }
};

export const addRoom = async (room: { name: string }) => {
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

export const getProjects = async (userId: string): Promise<Project[]> => {
  try {
    const projects = await getProjectsFromSupabase();
    return projects.map(project => ({
      ...project,
      icon: iconMap[project.icon] || Home,
    }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};
