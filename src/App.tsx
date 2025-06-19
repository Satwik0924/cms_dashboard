import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Users from "./pages/dashboard/users/Users";
import NewUser from "./pages/dashboard/users/NewUser";
import SinglePost from "./pages/dashboard/posts/SinglePost";
import EditUser from "./pages/dashboard/users/edit/[userId]";
import Tags from "./pages/dashboard/tags/Tags";
import NewTag from "./pages/dashboard/tags/NewTag";
import EditTag from "./pages/dashboard/tags/edit/[id]";
import AIBlogGenerator from "./pages/dashboard/AIBlogGenerator"; 
// Dashboard Layout and Pages
import DashboardLayout from "./components/dashboard/DashboardLayout";
import Dashboard from "./pages/dashboard/Dashboard";
import Posts from "./pages/dashboard/posts/Posts";
import NewPost from "./pages/dashboard/posts/NewPost";
import EditPost from "./pages/dashboard/posts/EditPost";
import Categories from "./pages/dashboard/categories/Categories";
import NewCategory from "./pages/dashboard/categories/NewCategory";
import EditCategory from "./pages/dashboard/categories/edit/[id]";
import Media from "./pages/dashboard/media/Media";
import Settings from './pages/dashboard/settings/Settings';


import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Dashboard routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
              
                {/* Posts */}
                <Route path="posts" element={<Posts />} />
                <Route path="posts/new" element={<NewPost />} />
                <Route path="posts/edit/:id" element={<EditPost />} />
                <Route path="posts/:slug" element={<SinglePost />} />
                
                {/* Users */}
                <Route path="users" element={<Users />} />
                <Route path="users/new" element={<NewUser />} />
                <Route path="users/edit/:userId" element={<EditUser />} />  
                <Route path="ai-generator" element={<AIBlogGenerator />} />
                {/* Categories */}
                <Route path="categories" element={<Categories />} />
                <Route path="categories/new" element={<NewCategory />} />
                <Route path="categories/edit/:id" element={<EditCategory />} />

                <Route path="tags" element={<Tags />} />
                <Route path="tags/new" element={<NewTag />} />
                <Route path="tags/edit/:id" element={<EditTag />} />
                <Route path="/dashboard/settings" element={<Settings />} />
                {/* Media */}
                <Route path="media" element={<Media />} />
                
                {/* Settings */}
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
            
            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;