import { supabase } from './supabase';
import { Room, Project } from '@/app/types';

export const getRooms = async (userId: string): Promise<Room[]> => {
  const { data, error } = await supabase
    .from('rooms')
    .select(`
      *,
      products:products(price, quantity)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching rooms:', error);
    throw error;
  }

  // Calculate expenses for each room
  return data?.map(room => {
    const expenses = room.products?.reduce((sum: number, product: any) => 
      sum + (product.price * product.quantity), 0) || 0;
    
    return {
      id: room.id,
      user_id: room.user_id,
      project_id: room.project_id,
      name: room.name,
      expenses: expenses,
      icon: room.icon
    };
  }) || [];
};

export const addRoom = async (room: { name: string }): Promise<Room> => {
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
    expenses: 0,
    icon: data.icon
  };
};

// Project operations
export const getProjects = async (userId: string): Promise<Project[]> => {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      rooms:rooms(
        id,
        products:products(price, quantity)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  // Calculate expenses for each project
  return data?.map(project => {
    const expenses = project.rooms?.reduce((projectSum: number, room: any) => {
      const roomExpenses = room.products?.reduce((roomSum: number, product: any) => 
        roomSum + (product.price * product.quantity), 0) || 0;
      return projectSum + roomExpenses;
    }, 0) || 0;
    
    return {
      id: project.id,
      user_id: project.user_id,
      name: project.name,
      description: project.description,
      budget: project.budget,
      expenses: expenses,
      startDate: project.start_date,
      endDate: project.end_date,
      status: project.status,
      icon: project.icon
    };
  }) || [];
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
