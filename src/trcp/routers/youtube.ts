import { z } from "zod";
import { createTRPCRouter, baseProcedure } from "@/trcp/init";

export const youtubeRouter = createTRPCRouter({
  validateYoutubeUrl: baseProcedure
    .input(z.object({ url: z.string() }))
    .query(async ({ input }) => {
      const { url } = input;
      try {
        // Extract video ID (simple regex)
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (!match) return { isEmbeddable: false };
        const videoId = match[1];
        const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const res = await fetch(oEmbedUrl);
        if (!res.ok) return { isEmbeddable: false };
        const data = await res.json();
        return {
          isEmbeddable: true,
          title: data.title,
          author: data.author_name,
          thumbnail: data.thumbnail_url,
        };
      } catch (e) {
        return { isEmbeddable: false };
      }
    }),

  findAlternativeVideo: baseProcedure
    .input(z.object({ exerciseName: z.string() }))
    .query(async ({ input }) => {
      const { exerciseName } = input;
      try {
        // Import here to avoid circular dependency
        const { findAlternativeVideo } = await import('@/lib/youtube-search-utils');
        const alternativeUrl = await findAlternativeVideo(exerciseName);
        return {
          success: true,
          url: alternativeUrl,
          found: !!alternativeUrl
        };
      } catch (e) {
        console.error('Error finding alternative video:', e);
        return {
          success: false,
          url: null,
          found: false,
          error: e instanceof Error ? e.message : 'Unknown error'
        };
      }
    }),
});