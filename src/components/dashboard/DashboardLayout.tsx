import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />
      <main className="flex-1 ml-[250px]"> {/* Adjust margin to match sidebar width */}
        <div className="container px-4 md:px-6 py-4 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}