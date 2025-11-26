import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const userRole = searchParams.get('userRole');

    const WECLAPP_API_URL = process.env.NEXT_PUBLIC_WECLAPP_API_URL;
    const WECLAPP_API_KEY = process.env.NEXT_PUBLIC_WECLAPP_API_KEY;

    if (!WECLAPP_API_URL || !WECLAPP_API_KEY) {
      return NextResponse.json(
        { error: 'WeClapp API configuration missing' },
        { status: 500 }
      );
    }

    const response = await fetch(`${WECLAPP_API_URL}/task`, {
      headers: {
        'Content-Type': 'application/json',
        'AuthenticationToken': WECLAPP_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`WeClapp API error: ${response.status}`);
    }

    const tasks = await response.json();
    let filteredTasks = tasks;

    if (userId && userRole) {
      if (userRole === 'employee') {
        filteredTasks = tasks.filter((task: any) => 
          task.assignedUser === userId
        );
        console.log(`Mitarbeiter-Filter: ${filteredTasks.length} von ${tasks.length} Tasks für User ${userId}`);
      } else if (userRole === 'manager' || userRole === 'admin') {
        console.log(`Manager/Admin-Filter: Alle ${tasks.length} Tasks sichtbar`);
      }
    }

    return NextResponse.json({
      success: true,
      tasks: filteredTasks,
      total: filteredTasks.length
    });

  } catch (error) {
    console.error('All Tasks API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}
