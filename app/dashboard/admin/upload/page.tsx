import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { UploadClient } from "./upload-client"
import { DocumentLibrary } from "./document-library"
import type { DocumentRow } from "@/lib/documents/types"

export default async function AdminUploadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Verify admin role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, certification_id")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/dashboard")

  // Fetch certifications for the dropdown
  const { data: certifications } = await supabase
    .from("certifications")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name")

  // Fetch uploaded documents
  const { data: documents } = await supabase
    .from("documents")
    .select("id, title, type, status, error_message, total_chunks, file_size, file_url, certification_id, created_at")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Upload Study Materials
        </h2>
        <p className="text-sm text-muted-foreground">
          Upload PDFs or paste text — content will be chunked for AI processing
        </p>
      </div>

      <UploadClient
        certifications={certifications ?? []}
        defaultCertId={profile.certification_id}
      />

      <DocumentLibrary documents={(documents as DocumentRow[]) ?? []} />
    </div>
  )
}
