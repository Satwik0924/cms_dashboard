import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ApiService } from "@/services/api-service";

interface Category {
  name: string;
  slug: string;
}

interface Tag {
  name: string;
  slug: string;
}

interface Author {
  id: string;
  username: string;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  publishedAt: string;
  createdAt: string;
  featuredImage: {
    id: string;
    spacesKey: string;
    altText?: string;
  } | null;
  videoId?: string | null;
  author: Author | null;
  categories: Category[];
  tags: Tag[];
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
}

export default function SinglePost() {
  const { slug } = useParams<{ slug: string }>();
  const { token } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      setIsLoading(true);
      
      try {
        // Use ApiService instead of direct fetch
        const response = await ApiService.getPostBySlug(slug, token);
        
        if (response) {
          setPost(response);
        } else {
          throw new Error('Failed to fetch post details');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch post details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPost();
  }, [slug, token]);

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
          description="The post you're looking for doesn't exist or couldn't be loaded."
        />
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-muted-foreground">{error || "Post not found"}</p>
              <Button onClick={() => navigate("/dashboard/posts")}>
                Back to Posts
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={post.title}
        description={`Published on ${new Date(post.publishedAt).toLocaleDateString()}`}
      />
      
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/posts")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Posts
        </Button>
        <Button size="sm" onClick={() => navigate(`/dashboard/posts/edit/${post.id}`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Post
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2 mb-3">
            {post.categories.map((category) => (
              <Badge key={category.slug} variant="secondary">
                {category.name}
              </Badge>
            ))}
          </div>
          <CardTitle className="text-2xl">{post.title}</CardTitle>
          <CardDescription>
            {post.author && (
              <span className="text-sm">
                By {post.author.username} | {new Date(post.publishedAt).toLocaleDateString()}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {post.featuredImage && (
            <div className="mb-6">
              <img 
                src={post.featuredImage.spacesKey}
                alt={post.featuredImage.altText || post.title}
                className="w-full h-auto rounded-md object-cover max-h-96"
              />
            </div>
          )}
          
          <div 
            className="prose max-w-none" 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Post Details</h3>
            
            {post.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tags:</h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag.slug} variant="outline">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Created:</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-1">Published:</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.publishedAt).toLocaleString()}
                </p>
              </div>
              {post.canonicalUrl && (
                <div className="col-span-2">
                  <h4 className="text-sm font-medium mb-1">Canonical URL:</h4>
                  <p className="text-sm text-muted-foreground break-all">
                    {post.canonicalUrl}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}