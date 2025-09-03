import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get room ID from query parameters
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    let userPermission = 'edit'; // Domyślnie właściciel ma pełne uprawnienia

    // Sprawdź uprawnienia do pokoju przez projekt
    if (userId) {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select(`
          user_id,
          project_id,
          projects!rooms_project_id_fkey(user_id)
        `)
        .eq('id', roomId)
        .single();

      if (roomError || !room) {
        return NextResponse.json(
          { error: 'Room not found' },
          { status: 404 }
        );
      }

      // Sprawdź czy użytkownik jest właścicielem pokoju lub projektu
      const project = room.projects as any;
      if (room.user_id !== userId && project?.user_id !== userId) {
        // Sprawdź udostępnienia projektu
        if (room.project_id) {
          const { data: share, error: shareError } = await supabase
            .from('project_shares')
            .select('permission_type')
            .eq('project_id', room.project_id)
            .eq('shared_with_id', userId)
            .single();

          if (shareError || !share) {
            return NextResponse.json(
              { error: 'Access denied to this room' },
              { status: 403 }
            );
          }
          
          // Ustaw uprawnienia na podstawie udostępnienia
          userPermission = share.permission_type;
        } else {
          return NextResponse.json(
            { error: 'Access denied to this room' },
            { status: 403 }
          );
        }
      }
    }

    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        rooms:rooms(
          id,
          name
        )
      `)
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Transform products to include room name
    const transformedProducts = products?.map(product => ({
      ...product,
      room_name: product.rooms?.name || 'Nieznany pokój',
      rooms: undefined // Remove rooms object from response
    })) || [];

    return NextResponse.json({
      products: transformedProducts,
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
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.price || !body.roomId || !body.userId) {
      return NextResponse.json(
        { error: 'Name, price, roomId, and userId are required' },
        { status: 400 }
      );
    }

    // Sprawdź uprawnienia do edycji pokoju przez projekt
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select(`
        user_id,
        project_id,
        projects!rooms_project_id_fkey(user_id)
      `)
      .eq('id', body.roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Sprawdź czy użytkownik jest właścicielem pokoju lub projektu
    const project = room.projects as any;
    if (room.user_id !== body.userId && project?.user_id !== body.userId) {
      // Sprawdź udostępnienia projektu
      if (room.project_id) {
        const { data: share, error: shareError } = await supabase
          .from('project_shares')
          .select('permission_type')
          .eq('project_id', room.project_id)
          .eq('shared_with_id', body.userId)
          .single();

        if (shareError || !share || share.permission_type !== 'edit') {
          return NextResponse.json(
            { error: 'Insufficient permissions to add products to this room' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Insufficient permissions to add products to this room' },
          { status: 403 }
        );
      }
    }

    // Create new product in database
    const { data: newProduct, error } = await supabase
      .from('products')
      .insert({
        room_id: body.roomId,
        name: body.name,
        description: body.description || null,
        link: body.link || null,
        shop: body.shop || null,
        price: body.price,
        quantity: body.quantity || 1,
        category: body.category || null,
        status: body.status || 'planned',
        image_url: body.image_url || null
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json(newProduct, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
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
