import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Edit, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TagsSearchComponent } from "@/components/search/UniversalSearchComponent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { ApiService } from "@/services/api-service";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

interface PaginationMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function Tags() {
  const { token } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagToDelete, setTagToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  // Fetch tags from API with pagination
  const fetchTags = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await ApiService.getTags(token, page);
      
      if (response && response.success) {
        setTags(response.tags || []);
        
        // Update pagination state
        setPagination({
          total: response.pagination?.total || response.total || 0,
          totalPages: response.pagination?.totalPages || Math.ceil((response.total || 0) / 10) || 1,
          currentPage: response.pagination?.currentPage || page,
          limit: response.pagination?.limit || 10
        });
      } else {
        toast.error("Failed to load tags");
        setError("Failed to load tags data");
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      toast.error("Error loading tags");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete tag
// Improved deleteTag function
const deleteTag = async (tagId: string) => {
  try {
    // First check if tag has posts
    const tag = tags.find(t => t.id === tagId);
    
    if (tag && tag.postCount > 0) {
      toast.error(`Cannot delete tag "${tag.name}". It is used in ${tag.postCount} post${tag.postCount === 1 ? '' : 's'}. Remove the tag from all posts first.`);
      setTagToDelete(null);
      return;
    }
    
    // If no posts are using this tag, proceed with deletion
    const response = await ApiService.deleteTag(tagId, token);
    
    if (response && response.success) {
      toast.success("Tag deleted successfully");
      
      // If deleting the last item on the current page, go to previous page (if not on first page)
      if (tags.length === 1 && pagination.currentPage > 1) {
        fetchTags(pagination.currentPage - 1);
      } else {
        // Otherwise refresh the current page
        fetchTags(pagination.currentPage);
      }
    } else {
      toast.error(response?.message || "Failed to delete tag");
    }
  } catch (error) {
    console.error("Error deleting tag:", error);
    
    // Check if error message contains information about tag being in use
    const errorMessage = error instanceof Error ? error.message : "Failed to delete tag";
    
    if (errorMessage.includes("Cannot delete tag") || 
        errorMessage.includes("currently used in posts")) {
      toast.error(errorMessage);
    } else {
      toast.error("Failed to delete tag. Please try again.");
    }
  } finally {
    setTagToDelete(null);
  }
};

  // Load initial data when component mounts
  useEffect(() => {
    fetchTags(1);
  }, [token]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pagination.totalPages) {
      fetchTags(page);
    }
  };

  // Generate pagination links
  const renderPaginationLinks = () => {
    const { currentPage, totalPages } = pagination;
    const items = [];

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink 
          onClick={() => handlePageChange(1)} 
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Logic for showing ellipsis and surrounding pages
    if (totalPages > 1) {
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust for edge cases
      if (currentPage <= 3) {
        endPage = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }

      // Show ellipsis after first page if needed
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Generate middle pages
      for (let i = startPage; i <= endPage; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => handlePageChange(i)} 
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Always show last page if total pages > 1
      items.push(
        <PaginationItem key="last">
          <PaginationLink 
            onClick={() => handlePageChange(totalPages)} 
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Tags" 
        description="Create and manage your content tags." 
        action={{
          label: "Add Tag",
          icon: <Plus className="h-4 w-4 mr-2" />,
          href: "/dashboard/tags/new"
        }}
      />

          <div className="flex justify-between items-center">
        <TagsSearchComponent />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 rounded-md">
          Failed to load tags. Please try again.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Posts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                    No tags found. Create your first tag!
                  </TableCell>
                </TableRow>
              ) : (
                tags.map((tag) => (
                  <TableRow key={tag.id}>
                    <TableCell className="font-medium">{tag.name}</TableCell>
                    <TableCell>{tag.slug}</TableCell>
                    <TableCell>{tag.postCount}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <span className="sr-only">Open menu</span>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                            >
                              <path
                                d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/dashboard/tags/edit/${tag.id}`}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setTagToDelete(tag.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="py-4 border-t">
              <Pagination>
                <PaginationContent>
                  {/* Previous Page Button */}
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => pagination.currentPage > 1 && handlePageChange(pagination.currentPage - 1)}
                      className={pagination.currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                  
                  {/* Page Numbers */}
                  {renderPaginationLinks()}
                  
                  {/* Next Page Button */}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => 
                        pagination.currentPage < pagination.totalPages && 
                        handlePageChange(pagination.currentPage + 1)
                      }
                      className={
                        pagination.currentPage >= pagination.totalPages 
                        ? "pointer-events-none opacity-50" 
                        : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Delete Tag Confirmation Dialog */}
      <AlertDialog open={!!tagToDelete} onOpenChange={(open) => !open && setTagToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete tag
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the tag and remove it from all posts.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => tagToDelete && deleteTag(tagToDelete)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}