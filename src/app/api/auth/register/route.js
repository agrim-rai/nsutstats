import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/User';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { username, password } = await request.json();

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists. Please choose a different username.' },
        { status: 400 }
      );
    }

    // Create new user
    const user = new User({
      username,
      password
    });

    await user.save();

    // Generate token
    const token = generateToken({
      userId: user._id,
      username: user.username
    });

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'server error ' },
      { status: 500 }
    );
  }
}
