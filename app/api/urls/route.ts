import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import UrlModel from '@/lib/models/url';

export async function GET() {
  try {
    await connectDB();
    const urls = await UrlModel.find({}, {
      password: 0,
      __v: 0
    }).sort({ createdAt: -1 });

    return NextResponse.json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Create new URL document
    const url = await UrlModel.create({
      url: body.url,
      checkInterval: body.checkInterval,
      password: hashedPassword,
      nextCheck: new Date(Date.now() + body.checkInterval * 24 * 60 * 60 * 1000)
    });

    // Return the URL without sensitive data
    const { password, __v, ...urlData } = url.toObject();
    return NextResponse.json(urlData);
  } catch (error) {
    console.error('Error adding URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}