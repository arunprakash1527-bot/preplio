import { PDFParse } from "pdf-parse"

interface PdfResult {
  text: string
  numPages: number
}

/**
 * Extract text content from a PDF buffer.
 */
export async function extractTextFromPdf(
  buffer: Buffer
): Promise<PdfResult> {
  const pdf = new PDFParse({ data: buffer })
  const result = await pdf.getText()
  await pdf.destroy()

  return {
    text: result.text || "",
    numPages: result.total || 0,
  }
}
