import { NextResponse } from 'next/server';
import { authenticateAdmin, generateAdminToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Authenticate admin
    const isAdmin = authenticateAdmin(username, password);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Generate admin token
    const token = generateAdminToken();

    return NextResponse.json({
      message: 'Admin login successful',
      user: {
        id: 'admin',
        username: process.env.ADMIN_USERNAME,
        role: 'admin'
      },
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
