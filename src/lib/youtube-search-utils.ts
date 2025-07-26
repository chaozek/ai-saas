/**
 * YouTube Search API utilities for fallback video finding
 */

// Mapování českých názvů cviků na anglické pro vyhledávání
const exerciseNameMap: { [key: string]: string } = {
  // Základní cviky
  "kliky": "push-ups",
  "push-ups": "push-ups",
  "push ups": "push-ups",
  "dřepy": "squats",
  "squats": "squats",
  "prkno": "plank",
  "plank": "plank",
  "burpee": "burpees",
  "burpees": "burpees",
  "výpady": "lunges",
  "lunges": "lunges",
  "shyby": "pull-ups",
  "pull-ups": "pull-ups",
  "pull ups": "pull-ups",
  "dipy": "dips",
  "dips": "dips",
  "sklapovačky": "crunches",
  "crunches": "crunches",
  "mountain climbers": "mountain climbers",
  "jumping jacks": "jumping jacks",
  "skákací jacks": "jumping jacks",
  "skakaci jacks": "jumping jacks",
  "skákací jack": "jumping jacks",
  "skakaci jack": "jumping jacks",
  "skákání přes švihadlo": "jump rope",
  "jump rope": "jump rope",
  "skipping rope": "jump rope",
  "běh na místě": "running in place",
  "running in place": "running in place",
  "high knees": "high knees",
  "butterfly kicks": "butterfly kicks",
  "russian twists": "russian twists",
  "side plank": "side plank",
  "bridge": "bridge",
  "superman": "superman",
  "bird dog": "bird dog",
  "dead bug": "dead bug",

  // Silové cviky
  "bench press": "bench press",
  "mrtvý tah": "deadlift",
  "overhead press": "overhead press",
  "barbell row": "barbell row",
  "leg press": "leg press",
  "lat pulldown": "lat pulldown",
  "chest press": "chest press",
  "shoulder press": "shoulder press",
  "leg extension": "leg extension",
  "leg curl": "leg curl",

  // Kettlebell cviky
  "kettlebell swing": "kettlebell swing",
  "kettlebell goblet squat": "kettlebell goblet squat",
  "kettlebell clean": "kettlebell clean",
  "kettlebell snatch": "kettlebell snatch",

  // Funkční cviky
  "wall ball": "wall ball",
  "box jump": "box jump",
  "thruster": "thruster",
  "clean and jerk": "clean and jerk",
  "snatch": "snatch",

  // Kardio cviky
  "rowing": "rowing",
  "cycling": "cycling",
  "elliptical": "elliptical",
  "stair climber": "stair climber",
  "battle ropes": "battle ropes",

  // Strečink a mobilita
  "stretching": "stretching",
  "foam rolling": "foam rolling",
  "mobility": "mobility",
  "yoga": "yoga",
  "pilates": "pilates"
};

/**
 * Get English exercise name for search
 * @param czechName - Czech exercise name
 * @returns English exercise name or original if not found
 */
export function getEnglishExerciseName(czechName: string): string {
  const lowerName = czechName.toLowerCase().trim();
  return exerciseNameMap[lowerName] || czechName;
}

/**
 * YouTube Search API response interface
 */
interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
  };
}

/**
 * Search for YouTube videos using YouTube Data API v3
 * @param query - Search query
 * @param maxResults - Maximum number of results (default: 5)
 * @returns Array of video URLs
 */
export async function searchYouTubeVideos(query: string, maxResults: number = 5): Promise<string[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn('YouTube API key not found. Skipping video search.');
    return [];
  }

  try {
    const searchQuery = encodeURIComponent(query);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=${maxResults}&key=${apiKey}`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`YouTube Search API error: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return [];
    }

    // Extract video URLs from search results
    const videoUrls = data.items.map((item: YouTubeSearchResult) =>
      `https://www.youtube.com/watch?v=${item.id.videoId}`
    );

    return videoUrls;
  } catch (error) {
    console.warn('YouTube Search API request failed:', error);
    return [];
  }
}

/**
 * Find alternative YouTube video for exercise
 * @param exerciseName - Exercise name (can be in Czech or English)
 * @param englishName - English exercise name for YouTube search
 * @param preferredChannels - Preferred YouTube channels (default: wikiHow)
 * @returns Valid YouTube URL or null
 */
export async function findAlternativeVideo(
  exerciseName: string,
  englishName?: string,
  preferredChannels: string[] = ['wikiHow']
): Promise<string | null> {
  const searchName = englishName || getEnglishExerciseName(exerciseName);

  // Try different search strategies
  const searchStrategies = [
    // Strategy 1: Exercise name + wikiHow
    `${searchName} exercise tutorial wikiHow`,
    // Strategy 2: Exercise name + how to
    `how to do ${searchName} exercise`,
    // Strategy 3: Exercise name + fitness
    `${searchName} fitness tutorial`,
    // Strategy 4: Just exercise name
    `${searchName} exercise`
  ];

  for (const searchQuery of searchStrategies) {
    console.log(`Searching for: "${searchQuery}"`);

    const videoUrls = await searchYouTubeVideos(searchQuery, 3);

    // Try each video URL
    for (const videoUrl of videoUrls) {
      // Import here to avoid circular dependency
      const { validateYouTubeUrlBackend } = await import('./youtube-backend-utils');

      const videoInfo = await validateYouTubeUrlBackend(videoUrl);
      if (videoInfo.isEmbeddable) {
        console.log(`Found valid alternative video: ${videoUrl}`);
        return videoUrl;
      }
    }
  }

  console.log(`No valid alternative video found for: ${exerciseName}`);
  return null;
}

/**
 * Enhanced exercise validation with fallback
 * @param exercise - Exercise object with youtubeUrl and englishName
 * @returns Exercise with validated or fallback youtubeUrl
 */
export async function validateExerciseWithFallback(exercise: any): Promise<any> {
  // If no YouTube URL, try to find one
  if (!exercise.youtubeUrl) {
    console.log(`No YouTube URL for exercise "${exercise.name}", searching for one...`);
    const fallbackUrl = await findAlternativeVideo(exercise.name, exercise.englishName);
    if (fallbackUrl) {
      exercise.youtubeUrl = fallbackUrl;
      console.log(`Found fallback video for "${exercise.name}": ${fallbackUrl}`);
    }
    return exercise;
  }

  // Import here to avoid circular dependency
  const { validateYouTubeUrlBackend } = await import('./youtube-backend-utils');

  // Validate existing YouTube URL
  const videoInfo = await validateYouTubeUrlBackend(exercise.youtubeUrl);

  if (videoInfo.isEmbeddable) {
    return exercise;
  }

  // If not embeddable, try to find alternative
  console.log(`YouTube URL not embeddable for "${exercise.name}": ${exercise.youtubeUrl}`);
  console.log(`Searching for alternative video...`);

  const fallbackUrl = await findAlternativeVideo(exercise.name, exercise.englishName);

  if (fallbackUrl) {
    exercise.youtubeUrl = fallbackUrl;
    console.log(`Found fallback video for "${exercise.name}": ${fallbackUrl}`);
  } else {
    exercise.youtubeUrl = null;
    console.log(`No valid video found for "${exercise.name}"`);
  }

  return exercise;
}