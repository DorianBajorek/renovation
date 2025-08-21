import { NextResponse } from 'next/server';
import projectsData from '@/app/fake-db/projects.json';

export async function GET() {
  try {
    // Return the projects data with proper headers
    return NextResponse.json(projectsData, {
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.budget) {
      return NextResponse.json(
        { error: 'Name, description, and budget are required' },
        { status: 400 }
      );
    }

    // Create new project (in a real app, you'd save to database)
    const newProject = {
      id: Date.now().toString(),
      name: body.name,
      description: body.description,
      budget: body.budget,
      startDate: body.startDate || new Date().toISOString().split('T')[0],
      endDate: body.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: body.status || 'planning',
      rooms: body.rooms || [],
      icon: body.icon || 'Home'
    };

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
