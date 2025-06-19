import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Image } from "lucide-react";
import { MediaUploader } from "./MediaUploader";
import { useAuth } from "@/contexts/AuthContext";
import { ApiService } from "@/services/api-service";

interface MediaItem {
  id: string;
  fileName: string;
  spacesKey: string;
  link?: string; // Added link property
  fileType: string;
  fileSize: number;
  altText?: string;
}

interface MediaSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaSelect: (media: MediaItem) => void;
}

export function MediaSelectionDialog({
  open,
  onOpenChange,
  onMediaSelect,
}: MediaSelectionDialogProps) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("upload");
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch media on dialog open
  useEffect(() => {
    if (open && activeTab === "library") {
      fetchMedia();
    }
  }, [open, activeTab]);

  const fetchMedia = async () => {
    try {
      setIsLoading(true);
      const response = await ApiService.getMedia({}, token);
      
      if (response && response.media && Array.isArray(response.media)) {
        setMedia(response.media);
      } else {
        // If API doesn't return anything usable yet, use placeholder data
        setMedia([]);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get the full URL for a media item
  const getMediaUrl = (item: MediaItem) => {
    // First check for the link property which is the CDN URL
    if (item.link && item.link.startsWith('http')) {
      return item.link;
    }
    
    // If spacesKey already has the domain, return it as is
    if (item.spacesKey.startsWith('http')) {
      return item.spacesKey;
    }
    
    // For local storage/blob URLs, return as is
    if (item.spacesKey.startsWith('blob:')) {
      return item.spacesKey;
    }
    
    // Otherwise, construct the URL from the spacesKey (if it's just a path)
    return `${item.spacesKey}`;
  };

  // Handle when a media item is selected through the uploader
  const handleMediaUpload = (url: string, mediaId?: string) => {
    // Create a new media item from the URL returned by the uploader
    const newMediaItem: MediaItem = {
      id: mediaId || `temp-${Date.now()}`,
      fileName: `image-${Date.now()}.jpg`,
      spacesKey: url,
      // Add the link property if it's a full URL
      link: url.startsWith('http') ? url : undefined,
      fileType: "image/jpeg",
      fileSize: 0,
      altText: `Image ${Date.now()}`
    };
    
    onMediaSelect(newMediaItem);
    onOpenChange(false);
  };

  // Filter media based on search query
  const filteredMedia = media.filter(item => 
    item.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="upload" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="upload">Upload New</TabsTrigger>
            <TabsTrigger value="library">Media Library</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="p-2">
            <MediaUploader 
              onImageSelected={handleMediaUpload}
            />
          </TabsContent>
          
          <TabsContent value="library" className="space-y-4 p-2">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={fetchMedia}
                title="Refresh"
              >
                Refresh
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredMedia.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed rounded-md">
                <Image className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No media found</h3>
                {searchQuery ? (
                  <p className="mt-1 text-sm text-gray-500">
                    No results match "{searchQuery}". Try a different search or upload a new image.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by uploading a new image.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-md overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => {
                      onMediaSelect(item);
                      onOpenChange(false);
                    }}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={getMediaUrl(item)}
                        alt={item.altText || item.fileName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="px-2 py-1 text-xs truncate bg-gray-50">
                      {item.fileName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}