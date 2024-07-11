"use client";
import { useState, useEffect, useCallback } from "react";
import { readPdf } from "lib/parse-resume-from-pdf/read-pdf";
import type { TextItems } from "lib/parse-resume-from-pdf/types";
import { groupTextItemsIntoLines } from "lib/parse-resume-from-pdf/group-text-items-into-lines";
import { groupLinesIntoSections } from "lib/parse-resume-from-pdf/group-lines-into-sections";
import { sectionsToChunk } from "lib/parse-resume-from-pdf/sections-to-chunk";
import { extractResumeFromSections } from "lib/parse-resume-from-pdf/extract-resume-from-sections";
import { ResumeDropzone } from "components/ResumeDropzone";
import { Heading } from "components/documentation";
import { ResumeTable } from "resume-parser/ResumeTable";
import { FlexboxSpacer } from "components/FlexboxSpacer";
import { ResumeParserAlgorithmArticle } from "resume-parser/ResumeParserAlgorithmArticle";

export default function ResumeParser() {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [textItems, setTextItems] = useState<TextItems>([]);
  const [message, setMessage] = useState('');
  const [correctName, setCorrectName] = useState<string>('');
  const [resumes, setResumes] = useState<string[]>([]);
  const [currentResumeIndex, setCurrentResumeIndex] = useState<number>(0);

  const lines = groupTextItemsIntoLines(textItems || []);
  const sections = groupLinesIntoSections(lines);
  const resume = extractResumeFromSections(sections);

  async function deleteChunks() {
    setMessage('Deleting chunks...');
    try {
      const response = await fetch('/api/delete-chunks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete chunks');
      }
      setMessage('Chunks deleted successfully');
    } catch (error) {
      setMessage('Error deleting chunks');
    }
  }

  const sendChunksToBackend = useCallback(async (chunkedSections: string[]) => {
    if (fileUrl === "") return;

    try {
      const response = await fetch('/api/upload-chunks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunkedSections),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      setMessage(result.message);
    } catch (error) {
      console.error('Error sending chunks:', error);
      setMessage('Error sending chunks');
    }
  }, [fileUrl]);

  const handleSumbit = () => {
    setMessage('Sending chunks to backend...');
    const { name, chunkedSections } = sectionsToChunk(sections, correctName || resume.profile.name);
    setMessage("JSON file created successfully");
    // sendChunksToBackend(chunkedSections);
  };

  // const processNextResume = async () => {
  //   if (currentResumeIndex >= resumes.length) {
  //     setMessage('All resumes processed.');
  //     return;
  //   }

  //   const resumeFile = resumes[currentResumeIndex];
  //   setMessage(`Processing ${resumeFile}...`);

  //   try {
  //     const response = await fetch('/api/process-resumes', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ file: resumeFile }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to process resume');
  //     }

  //     const result = await response.json();
  //     setMessage(result.message);

  //     setCurrentResumeIndex(currentResumeIndex + 1);
  //   } catch (error) {
  //     console.error('Error processing resume:', error);
  //     setMessage('Error processing resume');
  //   }
  // };

  // const fetchAndProcessResumes = async () => {
  //   setMessage('Fetching resumes...');
  //   try {
  //     const response = await fetch('/api/process-resumes');
  //     const result = await response.json();

  //     if (result.files) {
  //       setResumes(result.files);
  //       setCurrentResumeIndex(0);
  //       processNextResume();
  //     } else {
  //       setMessage('No resumes found.');
  //     }
  //   } catch (error) {
  //     console.error('Error fetching resumes:', error);
  //     setMessage('Error fetching resumes');
  //   }
  // };

  // useEffect(() => {
  //   if (currentResumeIndex < resumes.length) {
  //     processNextResume();
  //   }
  // }, [currentResumeIndex]);

  useEffect(() => {
    async function fetchTextItems() {
      if (fileUrl.length === 0) {
        setMessage('');
        setCorrectName('');
        return;
      }
      console.log('Reading PDF:', fileUrl);
      const textItemsFromPDF = await readPdf(fileUrl);
      setTextItems(textItemsFromPDF);
    }
    fetchTextItems();
  }, [fileUrl]);

  return (
    <main className="h-full w-full overflow-hidden">
      <div className="grid md:grid-cols-2">
        {fileUrl.length > 0 ? <div className="flex justify-center md:justify-end">
          <section className="mt-5 grow px-4 md:max-w-[750px] md:px-0">
            <div className="aspect-h-[9.5] aspect-w-7">
              <iframe src={`${fileUrl}#navpanes=0`} className="h-full w-full" />
            </div>
          </section>
          <FlexboxSpacer maxWidth={45} className="hidden md:block" />
        </div> : <div className="flex justify-center mt-10">Upload a PDF</div>}
        <div className="flex px-6 text-gray-900 md:h-100vh md:overflow-y-scroll">
          <FlexboxSpacer maxWidth={45} className="hidden md:block" />
          <section className="max-w-[750px] grow">
            <Heading className="text-primary !mt-4">
              Resume Parser Playground
            </Heading>
            <div className="mt-3">
              {message}
              <ResumeDropzone
                onFileUrlChange={(fileUrl) =>
                  setFileUrl(fileUrl || "")
                }
                playgroundView={true}
              />
            </div>
            <input 
              type="text" 
              value={correctName} 
              onChange={(e) => setCorrectName(e.target.value)} 
              placeholder="Correct Name" 
              className="border border-gray-300 rounded-md p-2 w-full" 
            />
            <button 
              onClick={handleSumbit} 
              className="bg-blue-500 text-white rounded-md p-2 mt-2"
            >
              Parse
            </button>
            <button 
              onClick={deleteChunks} 
              className="bg-red-500 text-white rounded-md p-2 mt-2 ml-2"
            >
              Delete All Chunks
            </button>
            {/* <button 
              onClick={fetchAndProcessResumes} 
              className="bg-green-500 text-white rounded-md p-2 mt-2 ml-2"
            >
              Process All Resumes
            </button> */}
            <ResumeTable resume={resume} />
            <ResumeParserAlgorithmArticle
              textItems={textItems}
              lines={lines}
              sections={sections}
            />
            <div className="pt-24" />
          </section>
        </div>
      </div>
    </main>
  );
}
