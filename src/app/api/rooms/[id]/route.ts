import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roomId = id;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const projectId = searchParams.get('projectId');

  try {
    let userPermission = 'edit'; // Domyślnie właściciel ma pełne uprawnienia

    // Sprawdź uprawnienia do pokoju przez projekt
    if (userId) {
      const { data: roomCheck, error: roomError } = await supabase
        .from('rooms')
        .select(`
          user_id,
          project_id,
          projects!rooms_project_id_fkey(user_id)
        `)
        .eq('id', roomId)
        .single();

      if (roomError || !roomCheck) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      // Sprawdź czy użytkownik jest właścicielem pokoju lub projektu
      const project = roomCheck.projects as any;
      if (roomCheck.user_id !== userId && project?.user_id !== userId) {
        // Sprawdź udostępnienia projektu
        if (roomCheck.project_id) {
          const { data: share, error: shareError } = await supabase
            .from('project_shares')
            .select('permission_type')
            .eq('project_id', roomCheck.project_id)
            .eq('shared_with_id', userId)
            .single();

          if (shareError || !share) {
            return NextResponse.json({ error: 'Access denied to this room' }, { status: 403 });
          }
          
          // Ustaw uprawnienia na podstawie udostępnienia
          userPermission = share.permission_type;
        } else {
          return NextResponse.json({ error: 'Access denied to this room' }, { status: 403 });
        }
      }
    }

    // Get the room with products to calculate expenses
    const { data: room, error } = await supabase
      .from('rooms')
      .select(`
        *,
        products:products(price, quantity, status)
      `)
      .eq('id', roomId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Calculate expenses for the room (only purchased products)
    const expenses = room.products?.reduce((sum: number, product: any) =>
      product.status === 'purchased' ? sum + (product.price * product.quantity) : sum, 0) || 0;

    const roomWithExpenses = {
      ...room,
      expenses: expenses,
      products: undefined // Remove products from response
    };

    return NextResponse.json({
      room: roomWithExpenses,
      userPermission: userPermission
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roomId = id;
  const body = await request.json();

  try {
    const { data, error } = await supabase
      .from('rooms')
      .update({
        name: body.name,
        icon: body.icon,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roomId = id;

  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Room deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
