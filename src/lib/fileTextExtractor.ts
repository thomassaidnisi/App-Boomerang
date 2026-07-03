import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

export type ExtractedFileType = 'pdf' | 'docx' | 'txt';

export function getFileType(file: File): ExtractedFileType | null {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.txt')) return 'txt';
  return null;
}

async function extractFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    pageTexts.push(pageText);
  }

  return pageTexts.join('\n\n').trim();
}

async function extractFromDocx(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  return result.value.trim();
}

async function extractFromTxt(file: File): Promise<string> {
  return (await file.text()).trim();
}

export async function extractTextFromFile(file: File): Promise<{ fileType: ExtractedFileType; content: string }> {
  const fileType = getFileType(file);
  if (!fileType) {
    throw new Error('Formato no soportado. Subí un archivo PDF, DOCX o TXT.');
  }

  let content = '';
  if (fileType === 'pdf') content = await extractFromPdf(file);
  else if (fileType === 'docx') content = await extractFromDocx(file);
  else content = await extractFromTxt(file);

  return { fileType, content };
}
