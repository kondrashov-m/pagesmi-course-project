
import { createUser, findUserByEmail } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || 'test@example.com';
    const password = searchParams.get('password') || 'password';
    const displayName = searchParams.get('name') || 'Test User';

    // Check if user already exists
    if (findUserByEmail(email)) {
      return NextResponse.json(
        { 
          error: 'User already exists',
          email,
          message: 'Этот пользователь уже создан'
        },
        { status: 409 }
      );
    }

    const newUser = await createUser(email, password, displayName);
    
    return NextResponse.json({
      success: true,
      message: `Пользователь ${email} успешно создан`,
      user: newUser,
      credentials: {
        email,
        password
      }
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Ошибка при создании пользователя',
        success: false
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName } = body;

    // Validation
    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    if (findUserByEmail(email)) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Create user
    const user = await createUser(email, password, displayName);

    return NextResponse.json(
      { message: 'User created successfully', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
