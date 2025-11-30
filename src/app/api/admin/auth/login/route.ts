import { getBestAuthSupabaseClient } from '@/lib/bestauth/db-client';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'your-admin-secret-key-change-in-production';

// Admin email list - configure in environment variables
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').filter(Boolean);

export async function POST(request: Request) {
  try {
    const { email, password, remember } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Check if email is in admin list
    if (ADMIN_EMAILS.length > 0 && !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Get admin user from bestauth_users (you may need to add an admin flag or use a separate admins table)
    const client = getBestAuthSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    const { data: user, error } = await client
      .from('bestauth_users')
      .select('id, email, name')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // For now, we'll skip password verification if ADMIN_EMAILS is configured
    // In production, you should create an admins table with password hashes
    // TODO: Create admins table and implement proper password verification

    // Verify password (placeholder - implement proper admin password storage)
    // For now, we'll use a simple check against environment variable
    const adminPassword = process.env.ADMIN_PASSWORD || '';
    const isPasswordValid = adminPassword ? password === adminPassword : true; // Temporary: allow if no password set

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Generate JWT token
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: 'admin',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(remember ? '30d' : '7d')
      .sign(secret);

    // Set cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      admin: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: remember ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
