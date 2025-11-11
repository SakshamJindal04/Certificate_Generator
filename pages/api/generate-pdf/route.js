import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, template } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    console.log(`[LOG] Certificate generated for: ${name} (Template: ${template || 'default'})`);
    return NextResponse.json({ success: true, message: 'Generation logged' });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}