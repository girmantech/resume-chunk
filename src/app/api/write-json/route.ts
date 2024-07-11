import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { chunks, name } = await req.json();

    const jsonObject = {
      name: name,
      chunk_array: chunks
    };

    const filePath = path.join(process.cwd(), 'data', `${name}.json`);

    fs.writeFile(filePath, JSON.stringify(jsonObject, null, 2), (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return NextResponse.json({ error: 'Failed to write to file' }, { status: 500 });
      } else {
        console.log(`File has been saved at ${filePath}`);
        return NextResponse.json({ message: 'File written successfully' }, { status: 200 });
      }
    });

    return NextResponse.json({ message: 'JSON Saved' }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
