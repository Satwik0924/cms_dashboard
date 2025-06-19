import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Copy, 
  Download, 
  MoreVertical, 
  Trash2, 
  ExternalLink,
  Loader2,
  Upload,
  ImagePlus,
  Search
} from "lucide-react";
import { MediaUploader } from "./MediaUploader";
import { MediaSelectionDialog } from "./MediaSelectionDialog";
import { useAuth } from "@/contexts/AuthContext";
import { ApiService } from "@/services/api-service";

interface User {
username?:string;
}

interface MediaItem {
  id: string;
  fileName: string;
  spacesKey: string;
  link?: string;
  fileType: string;
  fileSize: number;
  altText?: string;
  uploadedAt?: Date;
  uploadedBy?:{
    username:string;
  }
    createdAt?: string;
  
}

export default function MediaGrid() {
  const { token } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Function to fetch media from the API
  const fetchMedia = async (pageNum = 1, search = "") => {
    setLoading(true);
    try {
      // Prepare query parameters
      const params: Record<string, any> = {
        page: pageNum,
        limit: 12
      };
      
      // Add search if provided
      if (search) {
        params.search = search;
      }
      
      const response = await ApiService.getMedia(params, token);
      
      if (response && response.success) {
        setMedia(response.media);
      
        setTotalPages(Math.ceil(response.totalItems / response.limit));
        setPage(response.page);
      } else {
        throw new Error("Failed to load media");
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      // Show error in toast
      toast.error("Failed to load media. Please try again.");
      
      // If there's no media yet, provide an empty array to prevent UI breaking
      setMedia([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    setIsDeleting(true);
    try {
      await ApiService.deleteMedia(mediaId, token);
      
      // Close the media details dialog
      setSelectedMedia(null);
      
      // Refresh the media list
      fetchMedia(page, searchQuery);
      
      toast.success("Media deleted successfully");
    } catch (error) {
      // Check if the error is related to media being in use
      const errorMessage = error instanceof Error ? error.message : "Failed to delete media";
      
      if (errorMessage.includes("used as featured image") || 
          errorMessage.includes("currently used in posts")) {
        // Extract post count if available in the error message
        const countMatch = errorMessage.match(/(\d+) posts/);
        const postCount = countMatch ? countMatch[1] : "some";
        
        toast.error(`Cannot delete media. It is currently used as featured image in ${postCount} posts. Please update those posts first.`);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  // Initial media load
  useEffect(() => {
    fetchMedia();
  }, [token]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMedia(1, searchQuery);
  };

  // Handle media upload from MediaUploader component
  const handleMediaUpload = async (url: string, mediaId?: string) => {
    if (!mediaId) {
      // This would be a temporary local URL if the API call failed
      // Create a temporary media item
      const tempItem: MediaItem = {
        id: `temp-${Date.now()}`,
        fileName: `image-${Date.now()}.jpg`,
        spacesKey: url,
        fileType: "image/jpeg",
        fileSize: 0,
        altText: `Image ${Date.now()}`,
        uploadedAt: new Date()
      };
      
      // Add the temporary item to the media list
      setMedia(prevMedia => [tempItem, ...prevMedia]);
      toast.success("Media preview added. Refreshing from server...");
    }
    
    // Refresh the media list from the server
    setShowUploader(false);
    
    // Wait a bit before refreshing to give the server time to process
    setTimeout(() => {
      fetchMedia();
      toast.success("Media uploaded successfully");
    }, 1000);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return "Unknown";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
    // This is a fallback, typically you'd use the CDN domain + spacesKey
    return `${item.spacesKey}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
      fetchMedia(newPage, searchQuery);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and upload buttons */}
      <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center">
        <form onSubmit={handleSearch} className="flex w-full md:w-1/2">
          <Input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mr-2"
          />
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
        
        <div className="flex space-x-2">
          <Button onClick={() => setShowUploader(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload New
          </Button>
        </div>
      </div>
      
      {/* Uploader */}
      {showUploader && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Upload New Media</h3>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setShowUploader(false)}
              >
                Cancel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <MediaUploader onImageSelected={handleMediaUpload} />
          </CardContent>
        </Card>
      )}
      
      {/* Media Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading media...</span>
        </div>
      ) : error ? (
        <div className="p-6 text-center bg-red-50 rounded-md border border-red-200 text-red-600">
          <p className="mb-4">{error}</p>
          <Button onClick={() => fetchMedia()}>Try Again</Button>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-2">No media found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? `No results for "${searchQuery}"` : "Upload your first image to get started"}
          </p>
          <Button onClick={() => setShowUploader(true)}>
            Upload New Media
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {media.map((item) => (
              
              <Card key={item.id} className="overflow-hidden">
                
                <CardContent className="p-0">
                  <div 
                    className="aspect-square relative cursor-pointer"
                    onClick={() => setSelectedMedia(item)}
                  >
                    <img
                      src={getMediaUrl(item)}
                      alt={item.altText || item.fileName}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <div className="p-2 bg-card flex items-center justify-between">
                    <div className="truncate text-sm" title={item.fileName}>
                      {item.fileName}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedMedia(item)}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="mr-2"
              >
                Previous
              </Button>
              <span className="flex items-center mx-2">
                Page {page} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="ml-2"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
{/* console.log(selectedMedia); */}

      {/* Media Details Dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={(open) => !open && setSelectedMedia(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedMedia && (
            
            <>
              <DialogHeader>
                <DialogTitle>Media Details</DialogTitle>
                <DialogDescription>
                  View and manage the details of this media file.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="aspect-video relative">
                  <img
                    src={getMediaUrl(selectedMedia)}
                    alt={selectedMedia.altText || selectedMedia.fileName}
                    className="w-full h-full object-contain border rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="media-name">Name</Label>
                    <Input
                      id="media-name"
                      value={selectedMedia.fileName}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-type">Type</Label>
                    <Input
                      id="media-type"
                      value={selectedMedia.fileType}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-size">Size</Label>
                    <Input
                      id="media-size"
                      value={formatBytes(selectedMedia.fileSize)}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="media-date">Uploaded By</Label>
                    <Input
                      id="media-date"
                      value={selectedMedia.uploadedBy.username}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="media-url">URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="media-url"
                        value={getMediaUrl(selectedMedia)}
                        readOnly
                        className="bg-muted"
                      />
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={() => copyToClipboard(getMediaUrl(selectedMedia))}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="sticky bottom-0 bg-background pt-2">
                <Button variant="outline" onClick={() => window.open(getMediaUrl(selectedMedia), "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </Button>
                <Button variant="outline" onClick={() => {
                  const link = document.createElement('a');
                  link.href = getMediaUrl(selectedMedia);
                  link.download = selectedMedia.fileName;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button 
    variant="destructive" 
    onClick={() => handleDeleteMedia(selectedMedia.id)}
    disabled={isDeleting}
  >
    {isDeleting ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : (
      <Trash2 className="mr-2 h-4 w-4" />
    )}
    Delete
  </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* <MediaSelectionDialog
        open={showMediaDialog}
        onOpenChange={setShowMediaDialog}
        onMediaSelect={(media) => {
          // Handle selected media
          setMedia(prevMedia => {
            // Check if media already exists in the list
            if (!prevMedia.some(item => item.id === media.id)) {
              return [media, ...prevMedia];
            }
            return prevMedia;
          });
          setShowMediaDialog(false);
          toast.success("Media selected successfully");
        }}
      /> */}
    </div>
  );
}