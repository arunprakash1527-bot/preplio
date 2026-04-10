export interface ChunkOptions {
  chunkSize?: number
  chunkOverlap?: number
}

export interface ChunkResult {
  content: string
  chunkIndex: number
}

export interface DocumentRow {
  id: string
  title: string
  type: string
  status: string
  error_message: string | null
  total_chunks: number
  file_size: number | null
  file_url: string | null
  certification_id: string
  created_at: string
}
