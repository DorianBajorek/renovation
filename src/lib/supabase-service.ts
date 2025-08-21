import { supabase } from './supabase';
import { Room } from '../app/types/room';
import { Project } from '../app/types/project';

// Room operations
export const getRooms = async (): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }

  // Transform database data to match our Room interface
  return (data || []).map((room: any) => ({
    name: room.name,
    budget: room.budget,
    icon: room.icon
  }));
};

export const addRoom = async (room: { name: string; budget: number }): Promise<Room> => {
  const { data, error } = await supabase
    .from('rooms')
    .insert([{ ...room, icon: 'Sofa' }])
    .select()
    .single();

  if (error) {
    console.error('Error adding room:', error);
    throw error;
  }

  return {
    name: data.name,
    budget: data.budget,
    icon: data.icon
  };
};

// Project operations
export const getProjects = async (): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  // Transform database data to match our Project interface
  return (data || []).map((project: any) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    budget: project.budget,
    startDate: project.start_date,
    endDate: project.end_date,
    status: project.status,
    rooms: project.rooms || [],
    icon: project.icon
  }));
};

export const addProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  // Transform project data to match database schema
  const dbProject = {
    name: project.name,
    description: project.description,
    budget: project.budget,
    start_date: project.startDate,
    end_date: project.endDate,
    status: project.status,
    rooms: project.rooms || [],
    icon: project.icon || 'Home'
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([dbProject])
    .select()
    .single();

  if (error) {
    console.error('Error adding project:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    budget: data.budget,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    rooms: data.rooms || [],
    icon: data.icon
  };
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project | null> => {
  // Transform updates to match database schema
  const dbUpdates: any = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.budget) dbUpdates.budget = updates.budget;
  if (updates.startDate) dbUpdates.start_date = updates.startDate;
  if (updates.endDate) dbUpdates.end_date = updates.endDate;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.rooms) dbUpdates.rooms = updates.rooms;
  if (updates.icon) dbUpdates.icon = updates.icon;

  const { data, error } = await supabase
    .from('projects')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    budget: data.budget,
    startDate: data.start_date,
    endDate: data.end_date,
    status: data.status,
    rooms: data.rooms || [],
    icon: data.icon
  };
};

export const deleteProject = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }

  return true;
};
