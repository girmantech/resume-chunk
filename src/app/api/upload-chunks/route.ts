import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const chunkedSections = await req.json(); 

    const payload = { chunks: chunkedSections };

    const response = await fetch('http://127.0.0.1:8000/chunk-upload/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    return NextResponse.json({ message: "PDF Parsed" }, { status: 200 });
  } catch (error) {
    console.error('Error sending chunks:', error);
    return NextResponse.json({ message: 'Error sending chunks' }, { status: 500 });
  }
}
