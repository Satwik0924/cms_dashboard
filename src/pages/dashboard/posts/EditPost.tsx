// src/pages/dashboard/posts/EditPost.tsx - Fixed version
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PostForm from "@/components/posts/PostForm";
import { Card } from "@/components/ui/card";
import { ApiService } from "@/services/api-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      if (!id) {
        setError("Post ID is required");
        setIsLoading(false);
        return;
      }
    
      try {
        setIsLoading(true);
        console.log(`Looking for post with ID: ${id}`);
        
        // Search through pages of posts to find the one with matching ID
        let page = 1;
        let foundPost = null;
        let hasMorePages = true;
        
        // Keep searching through pages until we find the post or run out of pages
        while (!foundPost && hasMorePages) {
          console.log(`Searching for post on page ${page}`);
          const response = await ApiService.getPosts({ page, limit: 20 }, token);
          
          if (!response || !response.posts || !Array.isArray(response.posts) || response.posts.length === 0) {
            hasMorePages = false;
            continue;
          }
          
          // Find the post with matching ID
          foundPost = response.posts.find(post => String(post.id) === String(id));
          
          if (!foundPost) {
            // Check if we've reached the last page
            if (response.pagination && page >= response.pagination.totalPages) {
              hasMorePages = false;
            } else {
              page++;
            }
          }
        }
        
        if (!foundPost) {
          throw new Error('Post not found');
        }
        
        console.log('Found post:', foundPost);
        
        // Now that we have the slug, get the full post details
        if (foundPost.slug) {
          const fullPostResponse = await ApiService.getPostBySlug(foundPost.slug, token);
          
          if (fullPostResponse) {
            console.log('Fetched full post details:', fullPostResponse);
            setPost(fullPostResponse);
          } else {
            throw new Error('Failed to fetch full post details');
          }
        } else {
          // If no slug is available, use the found post data directly
          setPost(foundPost);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch post details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPostDetails();
  }, [id, token]);

  // Convert the API post data to the format expected by the PostForm component
// Convert the API post data to the format expected by the PostForm component
const formatPostForForm = (post) => {
  console.log("Formatting post data for form:", post);
  
  // Extract categories and tags correctly
  let categoryIds = [];
  let tagIds = [];
  
  // Check what data structure categories have
  if (post.categories && Array.isArray(post.categories)) {
    categoryIds = post.categories.map(cat => {
      // Check if category is an object or just an ID
      if (typeof cat === 'object' && cat !== null) {
        // Use any available id property
        return String(cat.id || cat._id || cat.categoryId || cat.slug || "");
      }
      return String(cat || ""); // If it's already an ID, convert to string
    }).filter(Boolean); // Filter out any null/undefined/empty values
  }
  
  // Check what data structure tags have
  if (post.tags && Array.isArray(post.tags)) {
    tagIds = post.tags.map(tag => {
      // Check if tag is an object or just an ID
      if (typeof tag === 'object' && tag !== null) {
        // Use any available id property
        return String(tag.id || tag._id || tag.tagId || "");
      }
      return String(tag || ""); // If it's already an ID, convert to string
    }).filter(Boolean); // Filter out any null/undefined/empty values
  }
  
  console.log("Extracted category IDs:", categoryIds);
  console.log("Extracted tag IDs:", tagIds);
  
  // Get featured image data
  let featuredMediaId = "";
  if (post.featuredImage) {
    featuredMediaId = String(
      post.featuredImage.id || 
      post.featuredImage._id || 
      post.featuredImage.mediaId || 
      ""
    );
  }
  
  console.log("Extracted featuredMediaId:", featuredMediaId);
  
  return {
    postTitle: post.title,
    postContent: post.content,
    postExcerpt: post.excerpt || "",
    customSlug: post.slug || "",
    postStatus: post.status || "draft",
    categories: categoryIds,
    tags: tagIds,
    featuredMediaId: featuredMediaId,
    allowIndexing: post.allowIndexing !== undefined ? post.allowIndexing : true,
    scheduledPublishDate: post.publishedAt ? new Date(post.publishedAt).toISOString().split('T')[0] : undefined,
    seoMetadata: {
      title: post.metaTitle || post.title || "",
      description: post.metaDescription || post.excerpt || "",
      canonicalUrl: post.canonicalUrl || '',
      focusKeyword: post.focusKeyword || ''
    }
  };
};

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Post Not Found" 
          description="The post you're looking for doesn't exist." 
        />
        <div className="bg-muted p-6 rounded-md text-center">
          <p>{error || "The post could not be found."}</p>
        </div>
      </div>
    );
  }

  // Format the post data for the form
  const formattedPost = formatPostForForm(post);
  console.log("Formatted post data for form:", formattedPost);

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title={`Edit Post: ${post.title}`} 
        description="Update your blog post content and settings." 
      />
      <Card className="bg-white rounded-lg border-0 shadow-sm">
        <PostForm 
          defaultValues={formattedPost} 
          isEditing={true} 
          postId={post.id}
        />
      </Card>
    </div>
  );
}