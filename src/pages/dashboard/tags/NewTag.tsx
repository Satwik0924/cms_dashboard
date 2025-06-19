import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TagForm from "@/components/tags/TagForm";

export default function NewTag() {
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Create New Tag" 
        description="Add a new tag to your content." 
      />
      <TagForm />
    </div>
  );
}