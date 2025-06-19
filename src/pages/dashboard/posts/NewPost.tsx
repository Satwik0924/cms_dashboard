// src/pages/dashboard/posts/NewPost.tsx
// Replace your existing NewPost.tsx with this updated version

import { useEffect, useState } from 'react';
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import PostForm from "@/components/posts/PostForm";
import { Card } from "@/components/ui/card";
import { toast } from 'sonner';

export default function NewPost() {
  const [aiGeneratedData, setAiGeneratedData] = useState(null);

  useEffect(() => {
    // Check if there's AI-generated content in session storage
    const storedContent = sessionStorage.getItem('aiGeneratedContent');
    if (storedContent) {
      try {
        const parsedContent = JSON.parse(storedContent);
        setAiGeneratedData(parsedContent);
        
        // Clear the session storage after using it
        sessionStorage.removeItem('aiGeneratedContent');
        
        // Check if YouTube video data is included
        if (parsedContent.videoId) {
          toast.success('AI-generated content with video recommendations loaded! 🤖📹');
        } else {
          toast.success('AI-generated content loaded! 🤖');
        }
      } catch (error) {
        console.error('Error parsing AI-generated content:', error);
        sessionStorage.removeItem('aiGeneratedContent'); // Clear invalid data
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Create New Post" 
        description={
          aiGeneratedData 
            ? (aiGeneratedData.videoId 
                ? "AI-generated content with video recommendations loaded and ready to customize!" 
                : "AI-generated content loaded and ready to customize!")
            : "Add a new post to your blog with content and SEO optimization."
        } 
      />
      <Card className="bg-white rounded-lg border-0 shadow-sm">
        <PostForm defaultValues={aiGeneratedData} />
      </Card>
    </div>
  );
}