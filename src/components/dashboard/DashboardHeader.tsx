// src/components/dashboard/DashboardHeader.tsx - Updated with Search
import { Button } from "@/components/ui/button";
import { Bell, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { HeaderSearchComponent } from "@/components/search/UniversalSearchComponent";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: React.ReactNode;
    href: string;
    onClick?: () => void;
  };
  showSearch?: boolean;
}

export default function DashboardHeader({ 
  title, 
  description, 
  action,
  showSearch = true
}: DashboardHeaderProps) {
  const location = useLocation();
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-6 border-b space-y-4 sm:space-y-0">
      <div className="flex-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      
      {/* Search Component - Desktop */}
      {showSearch && (
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <HeaderSearchComponent />
        </div>
      )}
      
      <div className="flex items-center gap-2 mt-4 sm:mt-0">
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        {action && (
          action.onClick ? (
            <Button onClick={action.onClick}>
              {action.icon || <Plus className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          ) : (
            <Button asChild>
              <Link to={action.href}>
                {action.icon || <Plus className="h-4 w-4 mr-2" />}
                {action.label}
              </Link>
            </Button>
          )
        )}
      </div>
      
      {/* Search Component - Mobile */}
      {showSearch && (
        <div className="md:hidden w-full">
          <HeaderSearchComponent />
        </div>
      )}
    </div>
  );
}