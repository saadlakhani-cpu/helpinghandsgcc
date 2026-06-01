import pdf from "pdf-parse";

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return (data.text ?? "").trim();
}

