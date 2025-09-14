import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all room IDs for the user (own rooms)
    const { data: userRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id')
      .eq('user_id', userId);

    if (roomsError) {
      console.error('Database error fetching user rooms:', roomsError);
      return NextResponse.json(
        { error: 'Failed to fetch user rooms' },
        { status: 500 }
      );
    }

    // Get all room IDs from shared projects
    const { data: sharedProjectRooms, error: sharedRoomsError } = await supabase
      .from('project_shares')
      .select(`
        projects!project_shares_project_id_fkey(
          id,
          name,
          user_id,
          rooms:rooms(
            id,
            name,
            user_id
          )
        )
      `)
      .eq('shared_with_id', userId);

    if (sharedRoomsError) {
      console.error('Database error fetching shared project rooms:', sharedRoomsError);
      return NextResponse.json(
        { error: 'Failed to fetch shared project rooms' },
        { status: 500 }
      );
    }

    // Combine all room IDs (own + shared)
    const ownRoomIds = userRooms?.map(room => room.id) || [];
    const sharedRoomIds = sharedProjectRooms?.flatMap(share => 
      share.projects?.rooms?.map((room: any) => room.id) || []
    ) || [];
    
    const allRoomIds = [...ownRoomIds, ...sharedRoomIds];

    if (allRoomIds.length === 0) {
      return NextResponse.json([], {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Get all products for user's rooms and shared project rooms
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        rooms:rooms(
          id,
          name,
          user_id,
          project_id,
          projects:projects(
            id,
            name,
            user_id,
            users:users!projects_user_id_fkey(
              first_name,
              last_name
            )
          )
        )
      `)
      .in('room_id', allRoomIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Transform data to include room name, project info, and ownership info
    const transformedProducts = products?.map(product => {
      const room = product.rooms;
      const project = room?.projects;
      const owner = project?.users;
      
      // Determine if this is a shared product
      const isShared = project?.user_id !== userId;
      const isOwnRoom = room?.user_id === userId;
      
      return {
        ...product,
        room_name: room?.name || 'Nieznany pokój',
        project_name: project?.name || 'Brak projektu',
        project_id: project?.id || null,
        is_shared: isShared,
        is_own_room: isOwnRoom,
        owner_name: isShared && owner ? `${owner.first_name} ${owner.last_name}` : 'Ty',
        rooms: undefined // Remove rooms object from response
      };
    }) || [];

    return NextResponse.json(transformedProducts, {
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
