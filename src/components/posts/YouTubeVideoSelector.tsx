import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Youtube, ExternalLink, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const YouTubeVideoSelector = ({
  value,
  onChange,
  disabled = false,
  className = "",
}) => {
  const [videoId, setVideoId] = useState("");
  const [videoData, setVideoData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize component with existing value
  useEffect(() => {
    if (value && value !== videoId) {
      setVideoId(value);
      fetchVideoData(value);
    }
  }, [value]);

  // Extract video ID from various YouTube URL formats
  const extractVideoId = (url) => {
    if (!url) return "";

    // If it's already just an ID (11 characters), return it
    if (url.length === 11 && /^[a-zA-Z0-9_-]+$/.test(url)) {
      return url;
    }

    // Extract from various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return "";
  };

  // Fetch video data from YouTube API (using a simple method without API key)
  const fetchVideoData = async (id) => {
    if (!id) {
      setVideoData(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create a simple video data object with thumbnail
      // In a real app, you might want to use YouTube API for title/description
      const thumbnailUrl = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;

      // Test if thumbnail exists
      const img = new Image();
      img.onload = () => {
        setVideoData({
          id: id,
          title: `YouTube Video ${id}`,
          thumbnail: thumbnailUrl,
          url: `https://www.youtube.com/watch?v=${id}`,
        });
        setIsLoading(false);
      };
      img.onerror = () => {
        setError("Invalid YouTube video ID or video not accessible");
        setVideoData(null);
        setIsLoading(false);
      };
      img.src = thumbnailUrl;
    } catch (err) {
      setError("Failed to fetch video data");
      setVideoData(null);
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (inputValue) => {
    const extractedId = extractVideoId(inputValue);
    setVideoId(extractedId);

    if (extractedId) {
      fetchVideoData(extractedId);
      onChange?.(extractedId);
    } else {
      setVideoData(null);
      setError(null);
      onChange?.("");
    }
  };

  // Clear video
  const clearVideo = () => {
    setVideoId("");
    setVideoData(null);
    setError(null);
    onChange?.("");
  };

  // Get thumbnail URL with fallback
  const getThumbnailUrl = (id) => {
    return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="youtube-input" className="flex items-center gap-2">
          <Youtube className="h-4 w-4 text-red-500" />
          YouTube Video
        </Label>

        <div className="flex gap-2">
          <Input
            id="youtube-input"
            placeholder="Paste YouTube URL or Video ID"
            value={videoId}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={disabled}
            className="flex-1"
          />
          {videoId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearVideo}
              disabled={disabled}
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Enter a YouTube URL (e.g., https://youtube.com/watch?v=abc123) or just
          the video ID (abc123)
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-4 border border-dashed rounded-lg">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            Loading video...
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Video Preview */}
      {videoData && !isLoading && !error && (
        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="relative">
            <img
              src={videoData.thumbnail}
              alt={videoData.title}
              className="w-full h-48 object-cover"
              onError={(e) => {
                // Fallback to standard quality thumbnail
                const target = e.target as HTMLImageElement;
                target.src = `https://img.youtube.com/vi/${videoData.id}/hqdefault.jpg`;
              }}
            />

            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-red-600 rounded-full p-3">
                <Youtube className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">
                  {videoData.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Video ID: {videoData.id}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                asChild
                className="flex-shrink-0"
              >
                <a
                  href={videoData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="text-xs">View</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!videoId && !isLoading && !error && (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <Youtube className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-1">
            No YouTube video selected
          </p>
          <p className="text-xs text-gray-400">
            Add a YouTube video to enhance your post
          </p>
        </div>
      )}
    </div>
  );
};

export default YouTubeVideoSelector;
