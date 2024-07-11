import { NextResponse } from 'next/server';

export async function POST() {
  try {

    const response = await fetch('http://127.0.0.1:8000/delete-chunks/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    return NextResponse.json({ message: result.message }, { status: 200 });
  } catch (error) {
    console.error('Error deleting chunks:', error);
    return NextResponse.json({ message: 'Error deleting chunks' }, { status: 500 });
  }
}
