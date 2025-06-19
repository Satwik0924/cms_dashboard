import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ApiService } from "@/services/api-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TagForm from "@/components/tags/TagForm";
import { useAuth } from "@/contexts/AuthContext";

const EditTag = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [tag, setTag] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tag data when component mounts
  useEffect(() => {
    if (id) {
      const fetchTag = async () => {
        setIsLoading(true);
        try {
          const response = await ApiService.getTagById(id, token);
          if (response.success) {
            setTag(response.tag);
          } else {
            toast.error("Failed to load tag.");
            navigate("/dashboard/tags");
          }
        } catch (error) {
          toast.error("Error fetching tag data.");
          console.error("Error fetching tag:", error);
          navigate("/dashboard/tags");
        } finally {
          setIsLoading(false);
        }
      };
      fetchTag();
    }
  }, [id, token, navigate]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Edit Tag" 
          description="Update your tag details." 
        />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!tag) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Tag Not Found" 
          description="The tag you're looking for doesn't exist." 
        />
        <div className="flex justify-center">
          <button 
            onClick={() => navigate("/dashboard/tags")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Back to Tags
          </button>
        </div>
      </div>
    );
  }

  // Use the TagForm component with isEditing flag
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title={`Edit Tag: ${tag.name}`}
        description="Update your tag details and settings." 
      />
      <TagForm 
        isEditing={true} 
        defaultValues={{
          name: tag.name,
          slug: tag.slug
        }} 
      />
    </div>
  );
};

export default EditTag;