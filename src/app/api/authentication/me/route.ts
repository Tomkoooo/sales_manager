import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

interface DecodedToken {
  _id: string;
}

export async function GET(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Convert the _id to ObjectId
    const userId = new ObjectId(decoded._id);

    // Retrieve user data from the database
    const client = await clientPromise;
    const db = client.db('tokos_maci');
    const user = await db.collection('users').findOne({ _id: userId });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Update lastLoginDate
    await db.collection('users').updateOne(
      { _id: userId },
      { $set: { lastLoginDate: new Date() } }
    );

    // Select only the fields that match your User interface
    const userData = {
      _id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        lastLoginDate: user.lastLogin,
        sex: user.sex
    }

    return NextResponse.json(userData);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Invalid token' }, { status: 500 });
  }
}