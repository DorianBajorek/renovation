import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = id;

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = id;
  const body = await request.json();
  const userId = body.userId;

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Sprawdź uprawnienia do edycji produktu przez pokój i projekt
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        room_id,
        rooms!products_room_id_fkey(
          user_id,
          project_id,
          projects!rooms_project_id_fkey(user_id)
        )
      `)
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const room = product.rooms as any;
    const project = room?.projects as any;

    // Sprawdź czy użytkownik jest właścicielem pokoju lub projektu
    if (room.user_id !== userId && project?.user_id !== userId) {
      // Sprawdź udostępnienia projektu
      if (room.project_id) {
        const { data: share, error: shareError } = await supabase
          .from('project_shares')
          .select('permission_type')
          .eq('project_id', room.project_id)
          .eq('shared_with_id', userId)
          .single();

        if (shareError || !share || share.permission_type !== 'edit') {
          return NextResponse.json(
            { error: 'Insufficient permissions to edit this product' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Insufficient permissions to edit this product' },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from('products')
      .update({
        name: body.name,
        description: body.description,
        link: body.link,
        shop: body.shop,
        price: body.price,
        quantity: body.quantity,
        category: body.category,
        status: body.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
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
  const productId = id;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  try {
    // Sprawdź uprawnienia do usuwania produktu przez pokój i projekt
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        room_id,
        rooms!products_room_id_fkey(
          user_id,
          project_id,
          projects!rooms_project_id_fkey(user_id)
        )
      `)
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const room = product.rooms as any;
    const project = room?.projects as any;

    // Sprawdź czy użytkownik jest właścicielem pokoju lub projektu
    if (room.user_id !== userId && project?.user_id !== userId) {
      // Sprawdź udostępnienia projektu
      if (room.project_id) {
        const { data: share, error: shareError } = await supabase
          .from('project_shares')
          .select('permission_type')
          .eq('project_id', room.project_id)
          .eq('shared_with_id', userId)
          .single();

        if (shareError || !share || share.permission_type !== 'edit') {
          return NextResponse.json(
            { error: 'Insufficient permissions to delete this product' },
            { status: 403 }
          );
        }
      } else {
        return NextResponse.json(
          { error: 'Insufficient permissions to delete this product' },
          { status: 403 }
        );
      }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
