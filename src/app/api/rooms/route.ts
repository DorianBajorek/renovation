import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    let roomsQuery;
    let userPermission = 'edit'; // Domyślnie właściciel ma pełne uprawnienia

    // Jeśli podano projectId, sprawdź uprawnienia do projektu
    if (projectId) {
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

      // Jeśli użytkownik nie jest właścicielem, sprawdź udostępnienia
      if (project.user_id !== userId) {
        const { data: share, error: shareError } = await supabase
          .from('project_shares')
          .select('permission_type')
          .eq('project_id', projectId)
          .eq('shared_with_id', userId)
          .single();

        if (shareError || !share) {
          return NextResponse.json(
            { error: 'Access denied to this project' },
            { status: 403 }
          );
        }
        
        // Ustaw uprawnienia na podstawie udostępnienia
        userPermission = share.permission_type;
      }

      // Pobierz pokoje dla projektu - zarówno dla właściciela jak i udostępnionych użytkowników
      roomsQuery = supabase
        .from('rooms')
        .select(`
          *,
          products:products(price, quantity, status)
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
    } else {
      // Jeśli nie podano projectId, pobierz tylko pokoje użytkownika
      roomsQuery = supabase
        .from('rooms')
        .select(`
          *,
          products:products(price, quantity, status)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    }
    
    const { data: rooms, error } = await roomsQuery;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch rooms' },
        { status: 500 }
      );
    }

    // Calculate expenses for each room (only purchased products)
    const roomsWithExpenses = rooms?.map(room => {
      const expenses = room.products?.reduce((sum: number, product: any) => 
        product.status === 'purchased' ? sum + (product.price * product.quantity) : sum, 0) || 0;
      
      return {
        ...room,
        expenses: expenses,
        products: undefined // Remove products from response
      };
    }) || [];

    return NextResponse.json({
      rooms: roomsWithExpenses,
      userPermission: userPermission
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.userId) {
      return NextResponse.json(
        { error: 'Name and userId are required' },
        { status: 400 }
      );
    }

    // Jeśli podano projectId, sprawdź uprawnienia do edycji projektu
    if (body.projectId) {
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('user_id')
        .eq('id', body.projectId)
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }

      // Sprawdź czy użytkownik jest właścicielem lub ma uprawnienia do edycji
      if (project.user_id !== body.userId) {
        const { data: share, error: shareError } = await supabase
          .from('project_shares')
          .select('permission_type')
          .eq('project_id', body.projectId)
          .eq('shared_with_id', body.userId)
          .single();

        if (shareError || !share || share.permission_type !== 'edit') {
          return NextResponse.json(
            { error: 'Insufficient permissions to add rooms to this project' },
            { status: 403 }
          );
        }
      }
    }

    // Create new room in database
    const { data: newRoom, error } = await supabase
      .from('rooms')
      .insert({
        user_id: body.userId,
        project_id: body.projectId || null,
        name: body.name,
        icon: body.icon || 'Sofa'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: 500 }
      );
    }

    return NextResponse.json(newRoom, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
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
