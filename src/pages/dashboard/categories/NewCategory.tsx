
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CategoryForm from "@/components/categories/CategoryForm";

export default function NewCategory() {
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Create New Category" 
        description="Add a new category to your blog." 
      />
      <CategoryForm />
    </div>
  );
}
