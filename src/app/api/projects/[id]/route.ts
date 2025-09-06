import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Get the project from database with calculated expenses (only purchased products)
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        rooms:rooms(
          id,
          products:products(price, quantity, status)
        )
      `)
      .eq('id', projectId)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project' },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Calculate expenses for the project (only purchased products)
    const expenses = project.rooms?.reduce((projectSum: number, room: any) => {
      const roomExpenses = room.products?.reduce((roomSum: number, product: any) => 
        product.status === 'purchased' ? roomSum + (product.price * product.quantity) : roomSum, 0) || 0;
      return projectSum + roomExpenses;
    }, 0) || 0;

    const projectWithExpenses = {
      ...project,
      expenses: expenses,
      rooms: undefined // Remove rooms from response
    };

    return NextResponse.json(projectWithExpenses, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id: projectId } = await params;
    const userId = body.userId; // ID użytkownika wykonującego akcję

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Sprawdź uprawnienia do edycji projektu
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Sprawdź czy użytkownik jest właścicielem
    if (project.user_id === userId) {
      // Użytkownik jest właścicielem - może edytować
    } else {
      // Sprawdź czy użytkownik ma uprawnienia do edycji
      const { data: share, error: shareError } = await supabase
        .from('project_shares')
        .select('permission_type')
        .eq('project_id', projectId)
        .eq('shared_with_id', userId)
        .single();

      if (shareError || !share || share.permission_type !== 'edit') {
        return NextResponse.json(
          { error: 'Insufficient permissions to edit this project' },
          { status: 403 }
        );
      }
    }

    // Map frontend fields to database fields
    const updateData = {
      name: body.name,
      description: body.description,
      budget: body.budget,
      status: body.status,
      icon: body.icon,
    };

    // Update the project in database
    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    if (!updatedProject) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Map database fields to frontend format
    const mappedProject = {
      ...updatedProject,
    };

    return NextResponse.json(mappedProject, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Sprawdź czy użytkownik jest właścicielem projektu
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('user_id')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Tylko właściciel może usunąć projekt
    if (project.user_id !== userId) {
      return NextResponse.json(
        { error: 'Only project owner can delete the project' },
        { status: 403 }
      );
    }

    // First, get all rooms for this project to delete associated products
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id')
      .eq('project_id', projectId);

    if (roomsError) {
      console.error('Error fetching project rooms:', roomsError);
      return NextResponse.json(
        { error: 'Failed to fetch project rooms' },
        { status: 500 }
      );
    }

    // Delete all products in all rooms of this project (backup to CASCADE)
    if (rooms && rooms.length > 0) {
      const roomIds = rooms.map(room => room.id);
      const { error: productsError } = await supabase
        .from('products')
        .delete()
        .in('room_id', roomIds);

      if (productsError) {
        console.error('Error deleting project products:', productsError);
        return NextResponse.json(
          { error: 'Failed to delete project products' },
          { status: 500 }
        );
      }
    }

    // Delete all rooms in this project (backup to CASCADE)
    const { error: roomsDeleteError } = await supabase
      .from('rooms')
      .delete()
      .eq('project_id', projectId);

    if (roomsDeleteError) {
      console.error('Error deleting project rooms:', roomsDeleteError);
      return NextResponse.json(
        { error: 'Failed to delete project rooms' },
        { status: 500 }
      );
    }

    // Delete all project shares for this project (backup to CASCADE)
    const { error: sharesError } = await supabase
      .from('project_shares')
      .delete()
      .eq('project_id', projectId);

    if (sharesError) {
      console.error('Error deleting project shares:', sharesError);
      // Don't fail the entire operation if shares deletion fails
    }

    // Finally, delete the project itself
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Project deleted successfully' },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
