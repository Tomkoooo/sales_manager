// src/app/api/register/route.ts

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs-react';

interface User {
    name: string;
    username: string;
    email: string;
    password: string;
    sex: string;
    }

export async function POST(request: Request) {
  try {
    const { username, password, email, name, sex } = await request.json();

    if (!username || !password || !email) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('tokos_maci'); // Replace with your database name

    // Check if username or email already exists
    const existingUser = await db.collection('users').findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json({ message: 'Username already taken' }, { status: 409 });
      }
      if (existingUser.email === email) {
        return NextResponse.json({ message: 'Email already taken' }, { status: 408 });
      }
    }

    // Create the user
    const newUser: Omit<User, '_id'> = {
      name,
      username,
        email,
        password: await bcrypt.hashSync(password, 10),
        sex,
    };

    const result = await db.collection('users').insertOne(newUser);

    // Retrieve the inserted user document
    const user = await db.collection('users').findOne({ _id: new ObjectId(result.insertedId) });

    if (!user) {
      console.error('User not found after insertion');
      return NextResponse.json({ message: 'User not found after insertion' }, { status: 500 });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id.toString(), username: user.username, email: user.email }, 'your_secret_key', {
      expiresIn: '1h', // Token expires in 1 hour
    });

    // Remove the password from the user object before sending it back
    const { password: _, ...userData } = user;
    return NextResponse.json({ ...userData, token });
  } catch (error) {
    console.error('Error in registration:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

POST.config = {
  api: {
    bodyParser: true,
  },
};