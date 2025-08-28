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
export const getProjects = async (): Promise<Project[]> => {
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      rooms:rooms(
        id,
        products:products(price, quantity, status)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }

  return projects?.map(project => {
    // Calculate expenses for each project (only purchased products)
    const expenses = project.rooms?.reduce((projectSum: number, room: any) => {
      const roomExpenses = room.products?.reduce((roomSum: number, product: any) => 
        product.status === 'purchased' ? roomSum + (product.price * product.quantity) : roomSum, 0) || 0;
      return projectSum + roomExpenses;
    }, 0) || 0;
    
    return {
      id: project.id,
      user_id: project.user_id,
      name: project.name,
      description: project.description,
      budget: project.budget,
      expenses: expenses,
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

// Google OAuth functions
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) {
    console.error('Google sign in error:', error);
    throw error;
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error) {
    console.error('Get current user error:', error);
    throw error;
  }

  return user;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};
