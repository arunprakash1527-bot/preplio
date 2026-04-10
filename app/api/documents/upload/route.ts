import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { chunkText } from "@/lib/documents/chunker"
import { fetchYouTubeTranscript } from "@/lib/documents/youtube"
import { extractTextFromImage } from "@/lib/documents/ocr"

export const maxDuration = 60 // Allow up to 60s for OCR/YouTube processing

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Admin check
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, certification_id")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const certificationId = formData.get("certificationId") as string
    const type = formData.get("type") as string
    const file = formData.get("file") as File | null
    const pastedText = formData.get("pastedText") as string | null
    const youtubeUrl = formData.get("youtubeUrl") as string | null

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!certificationId) {
      return NextResponse.json({ error: "Certification is required" }, { status: 400 })
    }

    const admin = createAdminClient()

    // --- TEXT PASTE ---
    if (type === "text" && pastedText) {
      const { data: doc, error: docError } = await admin
        .from("documents")
        .insert({
          title: title.trim(),
          type: "text",
          certification_id: certificationId,
          file_size: pastedText.length,
          status: "processing",
          uploaded_by: user.id,
        })
        .select("id")
        .single()

      if (docError) throw docError

      const chunks = chunkText(pastedText)
      if (chunks.length > 0) {
        await admin.from("chunks").insert(
          chunks.map((c) => ({
            document_id: doc.id,
            content: c.content,
            chunk_index: c.chunkIndex,
          }))
        )
      }

      await admin
        .from("documents")
        .update({ status: "completed", total_chunks: chunks.length })
        .eq("id", doc.id)

      return NextResponse.json({ document: { id: doc.id, status: "completed" } })
    }

    // --- YOUTUBE URL ---
    if (type === "youtube" && youtubeUrl) {
      const { data: doc, error: docError } = await admin
        .from("documents")
        .insert({
          title: title.trim(),
          type: "youtube",
          certification_id: certificationId,
          file_url: youtubeUrl,
          status: "processing",
          uploaded_by: user.id,
        })
        .select("id")
        .single()

      if (docError) throw docError

      try {
        const transcript = await fetchYouTubeTranscript(youtubeUrl)
        const chunks = chunkText(transcript.text)

        if (chunks.length > 0) {
          await admin.from("chunks").insert(
            chunks.map((c) => ({
              document_id: doc.id,
              content: c.content,
              chunk_index: c.chunkIndex,
            }))
          )
        }

        await admin
          .from("documents")
          .update({
            status: "completed",
            total_chunks: chunks.length,
            file_size: transcript.text.length,
          })
          .eq("id", doc.id)

        return NextResponse.json({ document: { id: doc.id, status: "completed" } })
      } catch (error) {
        await admin
          .from("documents")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "Failed to fetch transcript",
          })
          .eq("id", doc.id)

        return NextResponse.json(
          { error: error instanceof Error ? error.message : "Failed to fetch transcript" },
          { status: 422 }
        )
      }
    }

    // --- IMAGE (OCR via Claude Vision) ---
    if (type === "image" && file) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Image must be under 10MB" }, { status: 400 })
      }

      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
      if (!validImageTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Supported formats: JPEG, PNG, GIF, WebP" },
          { status: 400 }
        )
      }

      // Upload image to storage
      const fileExt = file.name.split(".").pop() || "jpg"
      const storagePath = `${certificationId}/${crypto.randomUUID()}.${fileExt}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await admin.storage
        .from("documents")
        .upload(storagePath, buffer, { contentType: file.type })

      if (uploadError) throw uploadError

      const { data: doc, error: docError } = await admin
        .from("documents")
        .insert({
          title: title.trim(),
          type: "image",
          certification_id: certificationId,
          file_url: storagePath,
          file_size: file.size,
          status: "processing",
          uploaded_by: user.id,
        })
        .select("id")
        .single()

      if (docError) throw docError

      try {
        const { text } = await extractTextFromImage(buffer, file.type)
        const chunks = chunkText(text)

        if (chunks.length > 0) {
          await admin.from("chunks").insert(
            chunks.map((c) => ({
              document_id: doc.id,
              content: c.content,
              chunk_index: c.chunkIndex,
            }))
          )
        }

        await admin
          .from("documents")
          .update({ status: "completed", total_chunks: chunks.length })
          .eq("id", doc.id)

        return NextResponse.json({ document: { id: doc.id, status: "completed" } })
      } catch (error) {
        await admin
          .from("documents")
          .update({
            status: "failed",
            error_message: error instanceof Error ? error.message : "OCR failed",
          })
          .eq("id", doc.id)

        return NextResponse.json(
          { error: error instanceof Error ? error.message : "OCR failed" },
          { status: 422 }
        )
      }
    }

    // --- PDF ---
    if (type === "pdf" && file) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 })
      }

      const fileExt = file.name.split(".").pop() || "pdf"
      const storagePath = `${certificationId}/${crypto.randomUUID()}.${fileExt}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await admin.storage
        .from("documents")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/pdf",
        })

      if (uploadError) throw uploadError

      const { data: doc, error: docError } = await admin
        .from("documents")
        .insert({
          title: title.trim(),
          type: "pdf",
          certification_id: certificationId,
          file_url: storagePath,
          file_size: file.size,
          status: "pending",
          uploaded_by: user.id,
        })
        .select("id")
        .single()

      if (docError) throw docError

      return NextResponse.json({ document: { id: doc.id, status: "pending" } })
    }

    return NextResponse.json({ error: "Invalid upload type" }, { status: 400 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 500 }
    )
  }
}
