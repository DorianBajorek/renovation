import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Pobierz udostępnienia dla danego projektu
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { data: shares, error } = await supabase
      .from('project_shares')
      .select(`
        *,
        shared_with:users!project_shares_shared_with_id_fkey(first_name, last_name, email),
        owner:users!project_shares_owner_id_fkey(first_name, last_name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch project shares' },
        { status: 500 }
      );
    }

    return NextResponse.json(shares, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching project shares:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project shares' },
      { status: 500 }
    );
  }
}

// POST - Udostępnij projekt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.projectId || !body.userEmail || !body.permissionType) {
      return NextResponse.json(
        { error: 'Project ID, user email, and permission type are required' },
        { status: 400 }
      );
    }

    // Znajdź użytkownika po emailu
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name')
      .eq('email', body.userEmail)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Sprawdź czy projekt istnieje i pobierz właściciela
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

    // Sprawdź czy nie próbujemy udostępnić sobie
    if (project.user_id === user.id) {
      return NextResponse.json(
        { error: 'Cannot share project with yourself' },
        { status: 400 }
      );
    }

    // Sprawdź czy już nie jest udostępniony
    const { data: existingShare } = await supabase
      .from('project_shares')
      .select('id')
      .eq('project_id', body.projectId)
      .eq('shared_with_id', user.id)
      .single();

    if (existingShare) {
      return NextResponse.json(
        { error: 'Project is already shared with this user' },
        { status: 400 }
      );
    }

    // Utwórz udostępnienie
    const shareData = {
      project_id: body.projectId,
      owner_id: project.user_id,
      shared_with_id: user.id,
      permission_type: body.permissionType
    };

    const { data: newShare, error } = await supabase
      .from('project_shares')
      .insert(shareData)
      .select(`
        *,
        shared_with:users!project_shares_shared_with_id_fkey(first_name, last_name, email)
      `)
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to share project' },
        { status: 500 }
      );
    }

    return NextResponse.json(newShare, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error sharing project:', error);
    return NextResponse.json(
      { error: 'Failed to share project' },
      { status: 500 }
    );
  }
}

// DELETE - Usuń udostępnienie
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const sharedWithId = searchParams.get('sharedWithId');

    if (!projectId || !sharedWithId) {
      return NextResponse.json(
        { error: 'Project ID and shared with ID are required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('project_shares')
      .delete()
      .eq('project_id', projectId)
      .eq('shared_with_id', sharedWithId);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to remove project share' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error removing project share:', error);
    return NextResponse.json(
      { error: 'Failed to remove project share' },
      { status: 500 }
    );
  }
}
