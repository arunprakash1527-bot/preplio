import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { chunkText } from "@/lib/documents/chunker"

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

    // Validation
    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!certificationId) {
      return NextResponse.json({ error: "Certification is required" }, { status: 400 })
    }

    const admin = createAdminClient()

    if (type === "text" && pastedText) {
      // Text paste — process immediately
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

      // Chunk and store
      const chunks = chunkText(pastedText)
      if (chunks.length > 0) {
        const chunkRows = chunks.map((c) => ({
          document_id: doc.id,
          content: c.content,
          chunk_index: c.chunkIndex,
        }))
        await admin.from("chunks").insert(chunkRows)
      }

      await admin
        .from("documents")
        .update({ status: "completed", total_chunks: chunks.length })
        .eq("id", doc.id)

      return NextResponse.json({ document: { id: doc.id, status: "completed" } })
    }

    if (type === "pdf" && file) {
      // Validate file
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 })
      }

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop() || "pdf"
      const storagePath = `${certificationId}/${crypto.randomUUID()}.${fileExt}`
      const buffer = Buffer.from(await file.arrayBuffer())

      const { error: uploadError } = await admin.storage
        .from("documents")
        .upload(storagePath, buffer, {
          contentType: file.type || "application/pdf",
        })

      if (uploadError) throw uploadError

      // Create document record
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
