// src/pages/dashboard/categories/Categories.tsx - Updated with Search
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CategoriesTable from "@/components/categories/CategoriesTable";
import { CategoriesSearchComponent } from "@/components/search/UniversalSearchComponent";
import { Plus } from "lucide-react";

export default function Categories() {
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Categories" 
        description="Create and manage your blog categories." 
        action={{
          label: "Add Category",
          icon: <Plus className="h-4 w-4 mr-2" />,
          href: "/dashboard/categories/new"
        }}
        showSearch={false} // We'll use a more specific search
      />
      
      {/* Categories-specific search */}
      <div className="flex justify-between items-center">
        <CategoriesSearchComponent />
      </div>
      
      <CategoriesTable />
    </div>
  );
}