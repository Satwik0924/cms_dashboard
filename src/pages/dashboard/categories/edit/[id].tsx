import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ApiService } from "@/services/api-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CategoryForm from "@/components/categories/CategoryForm";
import { useAuth } from "@/contexts/AuthContext";

const EditCategory = () => {
  const { id } = useParams(); // Getting the dynamic ID from the URL params
  const navigate = useNavigate();
  const { token } = useAuth();
  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch category data when component mounts
  useEffect(() => {
    if (id) {
      const fetchCategory = async () => {
        setIsLoading(true);
        try {
          const response = await ApiService.getCategoryById(id, token);
          if (response.success) {
            setCategory(response.category);
          } else {
            toast.error("Failed to load category.");
            navigate("/dashboard/categories");
          }
        } catch (error) {
          toast.error("Error fetching category data.");
          console.error("Error fetching category:", error);
          navigate("/dashboard/categories");
        } finally {
          setIsLoading(false);
        }
      };
      fetchCategory();
    }
  }, [id, token, navigate]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Edit Category" 
          description="Update your category details." 
        />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Category Not Found" 
          description="The category you're looking for doesn't exist." 
        />
        <div className="flex justify-center">
          <button 
            onClick={() => navigate("/dashboard/categories")}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  // Use the CategoryForm component with isEditing flag
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title={`Edit Category: ${category.name}`}
        description="Update your category details and settings." 
      />
      <CategoryForm 
        isEditing={true} 
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description
        }} 
      />
    </div>
  );
};

export default EditCategory;