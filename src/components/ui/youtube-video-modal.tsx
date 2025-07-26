"use client"

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, X } from "lucide-react";
import { YouTubeVideoInfo } from "@/lib/youtube-utils";

interface YouTubeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  youtubeUrl?: string | null;
  videoInfo?: YouTubeVideoInfo | null;
}

export function YouTubeVideoModal({ isOpen, onClose, exerciseName, youtubeUrl, videoInfo }: YouTubeVideoModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  // Extract video ID from YouTube URL
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = youtubeUrl ? getVideoId(youtubeUrl) : null;

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Check if video is embeddable
  const isEmbeddable = videoInfo?.isEmbeddable ?? false;

  if (!youtubeUrl || !videoId || !isEmbeddable) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Video není k dispozici</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <X className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              Pro cvik "{exerciseName}" není k dispozici demonstrační video.
              {!isEmbeddable && videoInfo && (
                <span className="block mt-2 text-xs">
                  Video může být regionálně omezené nebo má zakázané vkládání.
                </span>
              )}
            </p>
            <Button onClick={onClose} className="mt-4">
              Zavřít
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-red-500" />
            Demonstrace cviku: {exerciseName}
          </DialogTitle>
          {videoInfo?.title && (
            <p className="text-sm text-muted-foreground">
              {videoInfo.title}
              {videoInfo.author && ` • ${videoInfo.author}`}
            </p>
          )}
        </DialogHeader>
        <div className="relative aspect-video w-full">
          {isLoading && (
            <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={`Demonstrace cviku: ${exerciseName}`}
            className="w-full h-full rounded-lg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={handleIframeLoad}
          />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Zavřít
          </Button>
          <Button asChild>
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
              Otevřít na YouTube
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}