"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { YouTubeVideoModal } from "./youtube-video-modal";
import { checkYouTubeVideo, YouTubeVideoInfo } from "@/lib/youtube-utils";

interface YouTubeButtonProps {
  exerciseName: string;
  youtubeUrl?: string | null;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
}

export function YouTubeButton({
  exerciseName,
  youtubeUrl,
  size = "sm",
  variant = "outline"
}: YouTubeButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (youtubeUrl) {
      setIsChecking(true);
      checkYouTubeVideo(youtubeUrl)
        .then((info) => {
          setVideoInfo(info);
        })
        .catch((error) => {
          console.warn('Failed to check YouTube video:', error);
          setVideoInfo({ isEmbeddable: false });
        })
        .finally(() => {
          setIsChecking(false);
        });
    }
  }, [youtubeUrl]);

  // Don't render if no URL or video is not embeddable
  if (!youtubeUrl || (videoInfo && !videoInfo.isEmbeddable)) {
    return null;
  }

  // Show loading state
  if (isChecking) {
    return (
      <Button
        size={size}
        variant={variant}
        disabled
        className="flex items-center gap-2"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="hidden sm:inline">Kontrola...</span>
      </Button>
    );
  }

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2"
        title={`Zobrazit demonstrační video${videoInfo?.title ? `: ${videoInfo.title}` : ''}`}
      >
        <Play className="w-4 h-4 text-red-500" />
        <span className="hidden sm:inline">Video</span>
      </Button>

      <YouTubeVideoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        exerciseName={exerciseName}
        youtubeUrl={youtubeUrl}
        videoInfo={videoInfo}
      />
    </>
  );
}