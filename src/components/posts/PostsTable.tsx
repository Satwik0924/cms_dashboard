import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Edit, Plus, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
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
import { toast } from "sonner";
import { ApiService } from "@/services/api-service";

interface Category {
  name: string;
  slug: string;
}

interface FeaturedImage {
  id: string;
  spacesKey: string;
  altText?: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  featuredImage?: FeaturedImage;
  videoId?: string | null;
  categories: Category[];
}

interface PostsResponse {
  totalPosts: number;
  page: number;
  limit: number;
  posts: Post[];
}

export default function PostsTable() {
  const { token } = useAuth();
  const [statusFilter, setStatusFilter] = useState('published'); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery<PostsResponse>({
    queryKey: ["posts", currentPage, itemsPerPage, statusFilter], // Add statusFilter to the key
    queryFn: async () => {
      // Use ApiService instead of direct fetch
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter
      };
      
      return await ApiService.getPosts(params, token);
    }
  });

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    // Reset to page 1 when changing filters
    setCurrentPage(1);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      setIsDeleting(true); // Start loading state

      await ApiService.deletePost(postId, token);

      toast.success("Post deleted successfully");
      setPostToDelete(null);
      refetch(); // Refresh the posts list
    } catch (error) {
      // Handle specific error cases
      const errorMessage = error instanceof Error ? error.message : "Failed to delete post";

      if (errorMessage.includes("Cannot delete post")) {
        // This could be a custom error from your backend about constraints
        toast.error(errorMessage);
      } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        // Permission error
        toast.error("You don't have permission to delete this post");
      } else if (errorMessage.includes("404") || errorMessage.includes("Not Found")) {
        // Post not found error - this could happen if someone else deleted it
        toast.error("This post no longer exists");
        refetch(); // Refresh to update the UI
      } else {
        // Generic error
        toast.error("Failed to delete post. Please try again.");
      }

      console.error("Error deleting post:", error);
    } finally {
      setIsDeleting(false); // End loading state
    }
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    if (!data) return null;

    const totalPages = Math.ceil(data.totalPosts / itemsPerPage);
    const currentPage = data.page;
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

    // Calculate visible page range
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust if at the start
    if (currentPage <= 3) {
      endPage = Math.min(4, totalPages - 1);
    }

    // Adjust if at the end
    if (currentPage >= totalPages - 2) {
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

    // Generate middle page links
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
    if (endPage < totalPages - 1 && totalPages > 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
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

  // Calculate pagination metadata
  const hasNextPage = data ? (data.page * data.limit) < data.totalPosts : false;
  const hasPrevPage = data ? data.page > 1 : false;
  const totalPages = data ? Math.ceil(data.totalPosts / data.limit) : 0;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-destructive">
        <p className="mb-4">Error loading posts</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  const posts = data?.posts || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium">Status:</span>
        <Select 
          value={statusFilter} 
          onValueChange={(value) => handleStatusFilterChange(value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="all">All Posts</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

      {posts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">No posts found. Create your first post!</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <div>{post.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {post.excerpt}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {post.categories.map((cat) => (
                        <Badge key={cat.slug} variant="secondary">
                          {cat.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </TableCell>
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
                          <Link to={`/dashboard/posts/${post.slug}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>View</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={`/dashboard/posts/edit/${post.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => {
                            e.preventDefault();
                            setPostToDelete(post.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {data && data.totalPosts > itemsPerPage && (
            <div className="py-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => hasPrevPage && handlePageChange(currentPage - 1)}
                      className={!hasPrevPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => hasNextPage && handlePageChange(currentPage + 1)}
                      className={!hasNextPage ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      )}

      {/* Delete Post Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => postToDelete && handleDeletePost(postToDelete)}
              disabled={isDeleting} // Disable button during deletion
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}