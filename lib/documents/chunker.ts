import type { ChunkOptions, ChunkResult } from "./types"

const DEFAULT_CHUNK_SIZE = 1000 // characters
const DEFAULT_CHUNK_OVERLAP = 200 // characters

/**
 * Split text into overlapping chunks for RAG.
 * Splits on paragraph boundaries first, then merges small paragraphs.
 */
export function chunkText(
  text: string,
  options?: ChunkOptions
): ChunkResult[] {
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE
  const chunkOverlap = options?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP

  // Normalize whitespace
  const cleaned = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

  if (!cleaned) return []

  // If text is shorter than chunk size, return single chunk
  if (cleaned.length <= chunkSize) {
    return [{ content: cleaned, chunkIndex: 0 }]
  }

  // Split into paragraphs
  const paragraphs = cleaned.split(/\n\n+/)

  const chunks: ChunkResult[] = []
  let currentChunk = ""
  let chunkIndex = 0

  for (const para of paragraphs) {
    const trimmed = para.trim()
    if (!trimmed) continue

    // If adding this paragraph exceeds chunk size
    if (currentChunk && (currentChunk.length + trimmed.length + 2) > chunkSize) {
      // Save current chunk
      chunks.push({ content: currentChunk.trim(), chunkIndex })
      chunkIndex++

      // Start new chunk with overlap from end of previous
      const overlapStart = Math.max(0, currentChunk.length - chunkOverlap)
      currentChunk = currentChunk.slice(overlapStart).trim() + "\n\n" + trimmed
    } else {
      // Append to current chunk
      currentChunk = currentChunk
        ? currentChunk + "\n\n" + trimmed
        : trimmed
    }

    // Handle very long paragraphs (longer than chunk size)
    while (currentChunk.length > chunkSize * 1.5) {
      const splitPoint = findSplitPoint(currentChunk, chunkSize)
      chunks.push({
        content: currentChunk.slice(0, splitPoint).trim(),
        chunkIndex,
      })
      chunkIndex++

      const overlapStart = Math.max(0, splitPoint - chunkOverlap)
      currentChunk = currentChunk.slice(overlapStart).trim()
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), chunkIndex })
  }

  return chunks
}

/**
 * Find a good split point near the target position.
 * Prefer splitting at sentence boundaries, then at word boundaries.
 */
function findSplitPoint(text: string, target: number): number {
  // Look for sentence end near the target
  const searchRange = text.slice(
    Math.max(0, target - 100),
    Math.min(text.length, target + 100)
  )
  const offset = Math.max(0, target - 100)

  // Try sentence boundaries (. ! ?)
  const sentenceEnd = searchRange.lastIndexOf(". ")
  if (sentenceEnd > 0) return offset + sentenceEnd + 2

  const excl = searchRange.lastIndexOf("! ")
  if (excl > 0) return offset + excl + 2

  const question = searchRange.lastIndexOf("? ")
  if (question > 0) return offset + question + 2

  // Try word boundary
  const space = text.lastIndexOf(" ", target)
  if (space > target * 0.5) return space + 1

  // Fallback: split at target
  return target
}
