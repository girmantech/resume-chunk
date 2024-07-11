import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { readPdf } from 'lib/parse-resume-from-pdf/read-pdf';
import { groupTextItemsIntoLines } from 'lib/parse-resume-from-pdf/group-text-items-into-lines';
import { groupLinesIntoSections } from 'lib/parse-resume-from-pdf/group-lines-into-sections';
import { sectionsToChunk } from 'lib/parse-resume-from-pdf/sections-to-chunk';
import { extractResumeFromSections } from 'lib/parse-resume-from-pdf/extract-resume-from-sections';

export async function GET(req: NextRequest) {
  const resumesDir = path.join(process.cwd(), 'resumes');
  const files = fs.readdirSync(resumesDir).filter(file => file.endsWith('.pdf'));

  return NextResponse.json({ files });
}

export async function POST(req: NextRequest) {
  try {
    const { file } = await req.json();
    const filePath = path.join(process.cwd(), 'resumes', file);
    console.log('Processing resume:', filePath);
    const textItems = await readPdf(filePath);
    const lines = groupTextItemsIntoLines(textItems);
    const sections = groupLinesIntoSections(lines);
    const resume = extractResumeFromSections(sections);

    const { name, chunkedSections } = sectionsToChunk(sections, resume.profile.name);

    const jsonObject = {
      name: name,
      chunk_array: chunkedSections
    };
    console.log('jsonObject:', jsonObject);
    const outputPath = path.join(process.cwd(), 'data', `${name}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(jsonObject, null, 2));

    return NextResponse.json({ message: `Processed ${file} successfully.` });
  } catch (error) {
    console.error('Error processing resume:', error);
    return NextResponse.json({ error: 'Failed to process resume' }, { status: 500 });
  }
}
