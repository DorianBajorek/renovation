import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const roomId = id;
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ 
        error: 'File and user ID are required' 
      }, { status: 400 });
    }

    // Validate file type (JPG only)
    if (!file.type.startsWith('image/jpeg') && !file.type.startsWith('image/jpg')) {
      return NextResponse.json({ 
        error: 'Only JPG images are supported' 
      }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size must be less than 5MB' 
      }, { status: 400 });
    }

    // Check permissions - user must have edit access to room
    const { data: roomCheck, error: roomError } = await supabase
      .from('rooms')
      .select(`
        user_id,
        project_id,
        name,
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
        error: 'Insufficient permissions to upload images to this room' 
      }, { status: 403 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `room-${roomId}-${timestamp}-${randomStr}.${fileExtension}`;
    const filePath = `room-images/${fileName}`;

    // Convert File to ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('room-images')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ 
        error: `Upload failed: ${uploadError.message}` 
      }, { status: 500 });
    }

    // Get public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('room-images')
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    // Get current room data to update visualization_images
    const { data: currentRoom, error: getCurrentRoomError } = await supabase
      .from('rooms')
      .select('visualization_images')
      .eq('id', roomId)
      .single();

    if (getCurrentRoomError) {
      // If room update fails, try to delete the uploaded file
      await supabase.storage
        .from('room-images')
        .remove([filePath]);
      
      return NextResponse.json({ 
        error: getCurrentRoomError.message 
      }, { status: 500 });
    }

    // Add new image URL to existing array (or create new array if none exists)
    const currentImages = currentRoom.visualization_images || [];
    
    // Check if image URL already exists (shouldn't happen with unique names, but just in case)
    if (currentImages.includes(imageUrl)) {
      // Delete the duplicate upload
      await supabase.storage
        .from('room-images')
        .remove([filePath]);
      
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
      // If room update fails, delete the uploaded file
      await supabase.storage
        .from('room-images')
        .remove([filePath]);
      
      return NextResponse.json({ 
        error: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Image uploaded successfully',
      room: updatedRoom,
      imageUrl: imageUrl,
      fileName: fileName
    }, { status: 200 });

  } catch (error) {
    console.error('Error uploading image:', error);
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
