import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { extractTextFromPdf } from "@/lib/documents/pdf-parser"
import { chunkText } from "@/lib/documents/chunker"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Auth + admin check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const admin = createAdminClient()

    // Fetch document
    const { data: doc, error: docError } = await admin
      .from("documents")
      .select("*")
      .eq("id", id)
      .single()

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (doc.status === "completed") {
      return NextResponse.json({ error: "Document already processed" }, { status: 400 })
    }

    if (!doc.file_url) {
      return NextResponse.json({ error: "No file to process" }, { status: 400 })
    }

    // Update status to processing
    await admin
      .from("documents")
      .update({ status: "processing" })
      .eq("id", id)

    // Download file from Storage
    const { data: fileData, error: downloadError } = await admin.storage
      .from("documents")
      .download(doc.file_url)

    if (downloadError || !fileData) {
      await admin
        .from("documents")
        .update({ status: "failed", error_message: "Failed to download file" })
        .eq("id", id)
      return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
    }

    // Extract text from PDF
    const buffer = Buffer.from(await fileData.arrayBuffer())
    const { text, numPages } = await extractTextFromPdf(buffer)

    if (!text.trim()) {
      await admin
        .from("documents")
        .update({
          status: "failed",
          error_message: "No text could be extracted. The PDF may be scanned/image-based (OCR not yet supported).",
        })
        .eq("id", id)
      return NextResponse.json(
        { error: "No text extracted — PDF may be scanned" },
        { status: 422 }
      )
    }

    // Chunk text
    const chunks = chunkText(text)

    // Batch insert chunks
    if (chunks.length > 0) {
      const chunkRows = chunks.map((c) => ({
        document_id: id,
        content: c.content,
        chunk_index: c.chunkIndex,
      }))

      // Insert in batches of 100 to avoid payload limits
      const batchSize = 100
      for (let i = 0; i < chunkRows.length; i += batchSize) {
        const batch = chunkRows.slice(i, i + batchSize)
        const { error: insertError } = await admin.from("chunks").insert(batch)
        if (insertError) throw insertError
      }
    }

    // Update document as completed
    await admin
      .from("documents")
      .update({
        status: "completed",
        total_chunks: chunks.length,
      })
      .eq("id", id)

    return NextResponse.json({
      success: true,
      totalChunks: chunks.length,
      numPages,
    })
  } catch (error) {
    console.error("Process error:", error)

    // Update document as failed
    const admin = createAdminClient()
    await admin
      .from("documents")
      .update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Processing failed",
      })
      .eq("id", id)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Processing failed" },
      { status: 500 }
    )
  }
}
