
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MediaGrid from "@/components/media/MediaGrid";

export default function Media() {
  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Media Library" 
        description="Manage your images and other media files." 
      />
      <MediaGrid />
    </div>
  );
}
