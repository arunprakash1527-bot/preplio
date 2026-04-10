import Anthropic from "@anthropic-ai/sdk"

interface OcrResult {
  text: string
}

/**
 * Extract text from an image using Claude Vision.
 * Supports JPEG, PNG, GIF, WebP.
 */
export async function extractTextFromImage(
  buffer: Buffer,
  mimeType: string
): Promise<OcrResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured")
  }

  const client = new Anthropic({ apiKey })

  const validTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ] as const

  const mediaType = validTypes.find((t) => t === mimeType)
  if (!mediaType) {
    throw new Error(
      `Unsupported image type: ${mimeType}. Supported: JPEG, PNG, GIF, WebP`
    )
  }

  const base64 = buffer.toString("base64")

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: "text",
            text: "Extract ALL text from this image. This is a study material for a professional certification exam. Preserve the structure including headings, bullet points, numbered lists, and paragraphs. Output ONLY the extracted text, no commentary.",
          },
        ],
      },
    ],
  })

  const textBlock = response.content.find((block) => block.type === "text")
  const text = textBlock ? textBlock.text : ""

  if (!text.trim()) {
    throw new Error("No text could be extracted from the image")
  }

  return { text }
}
