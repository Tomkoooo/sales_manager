import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs-react';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key'; // Replace with your secret key

export async function POST(request: Request) {
  if (request.method !== 'POST') {
    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
  }

  const { usernameOrEmail, password } = await request.json();

  if (!usernameOrEmail || !password) {
    return NextResponse.json({ message: 'Missing username/email or password' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db('tokos_maci'); // Replace with your database name

    const user = await db.collection('users').findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid username/email or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ message: 'Invalid username/email or password' }, { status: 401 });
    }

    if(user.status === 'inactive') {
      return NextResponse.json({ message: 'User is inactive' }, { status: 403 });
    }

    // Remove password from user object
    const { password: _, ...userData } = user;

    // Create JWT
    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1000h' });

    return NextResponse.json({ ...userData, token });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

POST.config = {
  api: {
    bodyParser: true,
  },
};