import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roomId = id;
  const body = await request.json();
  const { imageUrl, userId } = body;

  if (!imageUrl || !userId) {
    return NextResponse.json({ 
      error: 'Image URL and user ID are required' 
    }, { status: 400 });
  }

  try {
    // Check permissions - user must have edit access to room
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

    // Check if user is owner of room or project
    const project = roomCheck.projects as any;
    let hasEditPermission = false;

    if (roomCheck.user_id === userId || project?.user_id === userId) {
      hasEditPermission = true;
    } else if (roomCheck.project_id) {
      // Check project shares
      const { data: share, error: shareError } = await supabase
        .from('project_shares')
        .select('permission_type')
        .eq('project_id', roomCheck.project_id)
        .eq('shared_with_id', userId)
        .single();

      if (share && share.permission_type === 'edit') {
        hasEditPermission = true;
      }
    }

    if (!hasEditPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to add images to this room' 
      }, { status: 403 });
    }

    // Validate image URL (basic check for JPG format)
    if (!imageUrl.match(/\.(jpg|jpeg)(\?.*)?$/i)) {
      return NextResponse.json({ 
        error: 'Only JPG images are supported' 
      }, { status: 400 });
    }

    // Get current room data to update visualization_images
    const { data: currentRoom, error: getCurrentRoomError } = await supabase
      .from('rooms')
      .select('visualization_images')
      .eq('id', roomId)
      .single();

    if (getCurrentRoomError) {
      return NextResponse.json({ 
        error: getCurrentRoomError.message 
      }, { status: 500 });
    }

    // Add new image URL to existing array (or create new array if none exists)
    const currentImages = currentRoom.visualization_images || [];
    
    // Check if image URL already exists
    if (currentImages.includes(imageUrl)) {
      return NextResponse.json({ 
        error: 'This image is already added to the room' 
      }, { status: 400 });
    }

    const updatedImages = [...currentImages, imageUrl];

    // Update room with new visualization_images array
    const { data: updatedRoom, error: updateError } = await supabase
      .from('rooms')
      .update({
        visualization_images: updatedImages,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ 
        error: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Image added successfully',
      room: updatedRoom
    }, { status: 200 });

  } catch (error) {
    console.error('Error adding image to room:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roomId = id;
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('imageUrl');
  const userId = searchParams.get('userId');

  if (!imageUrl || !userId) {
    return NextResponse.json({ 
      error: 'Image URL and user ID are required' 
    }, { status: 400 });
  }

  try {
    // Check permissions - same as POST
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

    // Check permissions
    const project = roomCheck.projects as any;
    let hasEditPermission = false;

    if (roomCheck.user_id === userId || project?.user_id === userId) {
      hasEditPermission = true;
    } else if (roomCheck.project_id) {
      const { data: share, error: shareError } = await supabase
        .from('project_shares')
        .select('permission_type')
        .eq('project_id', roomCheck.project_id)
        .eq('shared_with_id', userId)
        .single();

      if (share && share.permission_type === 'edit') {
        hasEditPermission = true;
      }
    }

    if (!hasEditPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions to remove images from this room' 
      }, { status: 403 });
    }

    // Get current room data
    const { data: currentRoom, error: getCurrentRoomError } = await supabase
      .from('rooms')
      .select('visualization_images')
      .eq('id', roomId)
      .single();

    if (getCurrentRoomError) {
      return NextResponse.json({ 
        error: getCurrentRoomError.message 
      }, { status: 500 });
    }

    const currentImages = currentRoom.visualization_images || [];
    
    // Check if image exists
    if (!currentImages.includes(imageUrl)) {
      return NextResponse.json({ 
        error: 'Image not found in room' 
      }, { status: 404 });
    }

    // Remove image URL from array
    const updatedImages = currentImages.filter((img: string) => img !== imageUrl);

    // Update room with new visualization_images array
    const { data: updatedRoom, error: updateError } = await supabase
      .from('rooms')
      .update({
        visualization_images: updatedImages.length > 0 ? updatedImages : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', roomId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ 
        error: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Image removed successfully',
      room: updatedRoom
    }, { status: 200 });

  } catch (error) {
    console.error('Error removing image from room:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
