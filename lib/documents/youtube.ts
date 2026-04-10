interface YouTubeTranscript {
  text: string
  videoId: string
  title: string
}

/**
 * Extract video ID from various YouTube URL formats.
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

/**
 * Fetch transcript from a YouTube video using the innertube API.
 * This fetches auto-generated or manual captions without requiring an API key.
 */
export async function fetchYouTubeTranscript(
  url: string
): Promise<YouTubeTranscript> {
  const videoId = extractVideoId(url)
  if (!videoId) {
    throw new Error("Invalid YouTube URL")
  }

  // Fetch the video page to get title and caption track info
  const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  })

  if (!pageRes.ok) {
    throw new Error("Failed to fetch YouTube page")
  }

  const html = await pageRes.text()

  // Extract video title
  const titleMatch = html.match(/<title>(.*?)<\/title>/)
  const title = titleMatch
    ? titleMatch[1].replace(" - YouTube", "").trim()
    : `YouTube Video ${videoId}`

  // Extract captions URL from the page data
  const captionsMatch = html.match(
    /"captionTracks":\s*(\[.*?\])/
  )

  if (!captionsMatch) {
    throw new Error(
      "No captions available for this video. The video may not have subtitles enabled."
    )
  }

  let captionTracks: Array<{
    baseUrl: string
    languageCode: string
    kind?: string
  }>

  try {
    captionTracks = JSON.parse(captionsMatch[1])
  } catch {
    throw new Error("Failed to parse caption data")
  }

  if (captionTracks.length === 0) {
    throw new Error("No caption tracks found")
  }

  // Prefer manual captions over auto-generated, prefer English
  const track =
    captionTracks.find(
      (t) => t.languageCode === "en" && t.kind !== "asr"
    ) ??
    captionTracks.find((t) => t.languageCode === "en") ??
    captionTracks.find((t) => t.kind !== "asr") ??
    captionTracks[0]

  // Fetch the transcript XML
  const captionUrl = track.baseUrl.replace(/&amp;/g, "&")
  const captionRes = await fetch(captionUrl)

  if (!captionRes.ok) {
    throw new Error("Failed to fetch captions")
  }

  const xml = await captionRes.text()

  // Parse the XML transcript — extract text from <text> elements
  const textSegments: string[] = []
  const textRegex = new RegExp("<text[^>]*>(.*?)</text>", "gs")
  let match

  while ((match = textRegex.exec(xml)) !== null) {
    const segment = match[1]
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]+>/g, "") // Remove any nested tags
      .trim()

    if (segment) {
      textSegments.push(segment)
    }
  }

  if (textSegments.length === 0) {
    throw new Error("Transcript appears to be empty")
  }

  // Join segments into paragraphs (group every ~5 sentences for readability)
  const paragraphs: string[] = []
  let currentParagraph: string[] = []

  for (const segment of textSegments) {
    currentParagraph.push(segment)
    if (
      currentParagraph.length >= 5 ||
      segment.endsWith(".") ||
      segment.endsWith("?") ||
      segment.endsWith("!")
    ) {
      paragraphs.push(currentParagraph.join(" "))
      currentParagraph = []
    }
  }

  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(" "))
  }

  const text = paragraphs.join("\n\n")

  return { text, videoId, title }
}
