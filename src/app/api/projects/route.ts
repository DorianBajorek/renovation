import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get projects with calculated expenses
    const { data: projects, error } = await supabase
      .from('projects')
      .select(`
        *,
        rooms:rooms(
          id,
          products:products(price, quantity, status)
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    // Calculate expenses for each project (only purchased products)
    const projectsWithExpenses = projects?.map(project => {
      const expenses = project.rooms?.reduce((projectSum: number, room: any) => {
        const roomExpenses = room.products?.reduce((roomSum: number, product: any) => 
          product.status === 'purchased' ? roomSum + (product.price * product.quantity) : roomSum, 0) || 0;
        return projectSum + roomExpenses;
      }, 0) || 0;
      
      return {
        ...project,
        expenses: expenses,
        rooms: undefined // Remove rooms from response
      };
    }) || [];

    return NextResponse.json(projectsWithExpenses, {
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
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.budget || !body.userId) {
      return NextResponse.json(
        { error: 'Name, description, budget, and userId are required' },
        { status: 400 }
      );
    }

    // Create new project in database
    const projectData = {
      user_id: body.userId,
      name: body.name,
      description: body.description,
      budget: body.budget,
      start_date: body.startDate || body.start_date || new Date().toISOString().split('T')[0],
      end_date: body.endDate || body.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: body.status || 'planning',
      icon: body.icon || 'Home'
    };
    
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json(newProject, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
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
