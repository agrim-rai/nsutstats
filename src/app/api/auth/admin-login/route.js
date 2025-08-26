import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

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

    await connectDB();
    
    // Find admin user
    const adminUser = await User.findOne({ username, role: 'admin' });
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isValidPassword = adminUser.comparePassword(password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Generate token with actual user ID
    const token = generateToken({
      userId: adminUser._id.toString(),
      username: adminUser.username,
      role: adminUser.role
    });

    return NextResponse.json({
      message: 'Admin login successful',
      user: {
        id: adminUser._id.toString(),
        username: adminUser.username,
        role: adminUser.role
      },
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'server error ' },
      { status: 500 }
    );
  }
}
