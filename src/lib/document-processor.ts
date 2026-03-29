// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse")
import mammoth from "mammoth"

export async function extractTextFromUrl(url: string, fileName: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`)

  const buffer = Buffer.from(await response.arrayBuffer())
  const ext = fileName.split(".").pop()?.toLowerCase()

  if (ext === "pdf") {
    const data = await pdfParse(buffer)
    return data.text
  }

  if (ext === "docx" || ext === "doc") {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (ext === "txt" || ext === "md") {
    return buffer.toString("utf-8")
  }

  // For xlsx/csv, return as plain text (basic)
  return buffer.toString("utf-8")
}

export async function extractTextFromBuffer(buffer: Buffer, fileName: string): Promise<string> {
  const ext = fileName.split(".").pop()?.toLowerCase()

  if (ext === "pdf") {
    const data = await pdfParse(buffer)
    return data.text
  }

  if (ext === "docx" || ext === "doc") {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  return buffer.toString("utf-8")
}
