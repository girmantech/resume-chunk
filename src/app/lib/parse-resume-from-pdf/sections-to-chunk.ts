import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";


export const sectionsToChunk = (sections: ResumeSectionToLines, name: string): { name: string, chunkedSections: string[] } => {
  let chunkedSections: string[] = [];

  for (let sectionTitle in sections) {
    let lines = sections[sectionTitle];
    let sectionText = lines
      .map(lineGroup => lineGroup.map(line => line.text).join(" "))
      .join(" ");

    let chunk = `The name of the candidate is ${name}. The section title is ${sectionTitle}. Section details - ${sectionText.trim()}`;
    chunkedSections.push(chunk);
  }

  // Save the chunks to a JSON file
  saveChunksToJsonFile(chunkedSections, name);

  return { name, chunkedSections };
};

export const saveChunksToJsonFile = async (chunks: string[], name: string) => {
  console.log('Saving chunks to JSON file...');
  const response = await fetch('/api/write-json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ chunks, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error writing file:', error);
  } else {
    const result = await response.json();
    console.log(result.message);
  }
};
