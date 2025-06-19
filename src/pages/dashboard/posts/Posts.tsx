// src/pages/dashboard/posts/Posts.tsx - Updated with Search
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PostsTable from "@/components/posts/PostsTable";
import { PostsSearchComponent } from "@/components/search/UniversalSearchComponent";
import { Plus } from "lucide-react";

export default function Posts() {
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Posts" 
        description="Create and manage your blog posts." 
        action={{
          label: "Add Post",
          icon: <Plus className="h-4 w-4 mr-2" />,
          href: "/dashboard/posts/new"
        }}
        showSearch={false} // We'll use a more specific search
      />
      
      {/* Posts-specific search */}
      <div className="flex justify-between items-center">
        <PostsSearchComponent />
      </div>
      
      <PostsTable />
    </div>
  );
}