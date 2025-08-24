import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('API - Project ID:', projectId);
    console.log('API - User ID:', userId);
    console.log('API - User ID type:', typeof userId);
    console.log('API - Project ID type:', typeof projectId);
    
    // Get all products for project's rooms that belong to the specific user
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        rooms:rooms(
          id,
          name,
          user_id,
          project_id
        )
      `)
      .eq('rooms.project_id', projectId)
      .eq('rooms.user_id', userId)
      .not('rooms.user_id', 'is', null)
      .not('rooms.project_id', 'is', null)
      .order('created_at', { ascending: false });
    
    console.log('API - Query result:', { products, error });
    console.log('API - Number of products found:', products?.length || 0);
    
    // Log detailed information about each product and its room
    if (products) {
      products.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          id: product.id,
          name: product.name,
          room_id: product.room_id,
          room_user_id: product.rooms?.user_id,
          room_project_id: product.rooms?.project_id,
          room_name: product.rooms?.name
        });
      });
    }

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Filter products to only include those with valid room data
    const validProducts = products?.filter(product => 
      product.rooms && 
      product.rooms.user_id === userId && 
      product.rooms.project_id === projectId
    ) || [];
    
    console.log('API - Valid products count:', validProducts.length);
    
    // Transform data to include room name and group by room
    const transformedProducts = validProducts.map(product => ({
      ...product,
      room_name: product.rooms?.name || 'Nieznany pokój',
      rooms: undefined // Remove rooms object from response
    }));

    // Group products by room
    const productsByRoom = transformedProducts.reduce((acc, product) => {
      const roomName = product.room_name;
      if (!acc[roomName]) {
        acc[roomName] = [];
      }
      acc[roomName].push(product);
      return acc;
    }, {} as Record<string, typeof transformedProducts>);

    return NextResponse.json({
      products: transformedProducts,
      productsByRoom,
      totalProducts: transformedProducts.length,
      totalRooms: Object.keys(productsByRoom).length
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
    console.error('Error fetching project products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project products' },
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
