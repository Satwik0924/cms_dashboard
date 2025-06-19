import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Image,
  Settings,
  Menu,
  X,
  Users,
  LogOut,
  Tag,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardSidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  
  // Define navigation items
  const navItems = [
    { 
      title: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard' 
    },
    { 
      title: 'Posts', 
      icon: FileText, 
      path: '/dashboard/posts' 
    },
    { 
      title: 'Categories', 
      icon: FolderOpen, 
      path: '/dashboard/categories' 
    },
    {
      title:'Tags',
      icon:Tag,
      path:'/dashboard/tags'
    },
    { 
      title: 'Media', 
      icon: Image, 
      path: '/dashboard/media' 
    },
    {
      title: "AI Blog Generator",
      path: "/dashboard/ai-generator",
      icon: Brain,
    },
    // Show Users menu item only to admin users
    ...(user?.role === 'admin' ? [
      {
        title: 'Users',
        icon: Users,
        path: '/dashboard/users'
      }
    ] : []),
    // Add Settings at the bottom
    {
      title: 'Settings',
      icon: Settings,
      path: '/dashboard/settings'
    }
  ];

  return (
    <div className={cn(
      "fixed left-0 top-0 h-screen flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 z-10 shadow-md",
      isCollapsed ? "w-[70px]" : "w-[250px]"
    )}>
      <div className="flex h-14 items-center px-3 border-b border-sidebar-border">
        {!isCollapsed ? (
          <h1 className="px-2 text-xl font-bold">CMS Admin</h1>
        ) : (
          <span className="px-2 text-xl font-bold">CMS</span>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <Menu size={20} /> : <X size={20} />}
        </Button>
      </div>
      <nav className="space-y-1 px-2 py-5 flex-1 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center px-2 py-2 rounded-md font-medium transition-colors",
              location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className={cn("h-5 w-5", !isCollapsed && "mr-3")} />
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-sidebar-border">
        {!isCollapsed ? (
          <div className="flex flex-col">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{user?.username || 'User'}</p>
                <p className="text-xs text-sidebar-foreground/70">{user?.role || 'Guest'}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-3 justify-start hover:bg-sidebar-accent"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="w-full justify-center hover:bg-sidebar-accent"
            onClick={logout}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}