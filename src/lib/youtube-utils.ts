/**
 * YouTube video validation utilities
 */

export interface YouTubeVideoInfo {
  isEmbeddable: boolean;
  title?: string;
  author?: string;
  thumbnail?: string;
}

/**
 * Check if a YouTube video is embeddable using oEmbed API
 * @param youtubeUrl - The YouTube URL to check
 * @returns Promise<YouTubeVideoInfo>
 */
export async function checkYouTubeVideo(youtubeUrl: string): Promise<YouTubeVideoInfo> {
  try {
    // Extract video ID from URL
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return { isEmbeddable: false };
    }

    // Use oEmbed API to check if video exists and is embeddable
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;

    const response = await fetch(oEmbedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return { isEmbeddable: false };
    }

    const data = await response.json();

    return {
      isEmbeddable: true,
      title: data.title,
      author: data.author_name,
      thumbnail: data.thumbnail_url,
    };
  } catch (error) {
    console.warn('YouTube video check failed:', error);
    return { isEmbeddable: false };
  }
}

/**
 * Extract video ID from various YouTube URL formats
 * @param url - YouTube URL
 * @returns Video ID or null
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate YouTube URL format
 * @param url - URL to validate
 * @returns boolean
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractVideoId(url) !== null;
}