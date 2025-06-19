// src/pages/users/edit/[userId].tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ApiService } from "@/services/api-service";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: string;
  status: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  status: string;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

const EditUser = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  
  const form = useForm<UserFormData>({
    defaultValues: {
      username: "",
      email: "",
      password: "", // Empty by default - only updates if filled
      role: "author",
      status: "active"
    }
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        toast.error("User ID is missing");
        navigate('/dashboard/users');
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if user has permission to edit other users
        if (currentUser?.role !== 'admin' && currentUser?.userId !== userId) {
          toast.error("You don't have permission to edit this user");
          navigate('/dashboard/users');
          return;
        }
        
        const response = await ApiService.getUserById(userId, token);
        
        if (response && response.success && response.user) {
          setUser(response.user);
          
          // Set form values
          form.reset({
            username: response.user.username,
            email: response.user.email,
            password: "", // Don't populate password field
            role: response.user.role,
            status: response.user.status
          });
        } else {
          toast.error("Failed to load user data");
          navigate('/dashboard/users');
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load user");
        navigate('/dashboard/users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [userId, token, navigate, form, currentUser]);

  const onSubmit = async (data: UserFormData) => {
    if (!userId) return;
    
    try {
      setIsSaving(true);
      
      // Only include password if it was entered
      const userData = {
        ...data,
        password: data.password.trim() !== "" ? data.password : undefined
      };
      
      const response = await ApiService.updateUser(userId, userData, token);
      
      if (response && response.success) {
        toast.success("User updated successfully");
        navigate('/dashboard/users');
      } else {
        toast.error(response?.message || "Failed to update user");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error(error instanceof Error ? error.message : "An error occurred while updating the user");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Edit User" 
        description="Modify user details and permissions." 
        action={{
          label: "Back to Users",
          icon: <ArrowLeft className="h-4 w-4 mr-2" />,
          href: "/dashboard/users"
        }}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Update the user's profile and access settings.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Email address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="password" 
                        placeholder="Leave blank to keep current password" 
                      />
                    </FormControl>
                    <FormDescription>
                      Only fill this if you want to change the password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Only admins can change role and status */}
              {currentUser?.role === 'admin' && (
                <>
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="editor">Editor</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard/users')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default EditUser;