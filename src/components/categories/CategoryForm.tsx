import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { ApiService } from "@/services/api-service";
import { useAuth } from "@/contexts/AuthContext";

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  slug: z.string().min(1, { message: "Slug is required" }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  defaultValues?: Partial<FormValues>;
  isEditing?: boolean;
}

export default function CategoryForm({ defaultValues, isEditing = false }: CategoryFormProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { categoryId } = useParams(); // Get category ID from URL params
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch category data if editing
  useEffect(() => {
    if (isEditing && categoryId) {
      const fetchCategory = async () => {
        try {
          const response = await ApiService.getCategoryById(categoryId, token); // Fetch category by ID
          if (response && response.category) {
            // Set form values with the fetched category data
            form.setValue("name", response.category.name);
            form.setValue("slug", response.category.slug);
            form.setValue("description", response.category.description || "");
          }
        } catch (error) {
          toast.error("Error fetching category data.");
          console.error("Error fetching category data:", error);
        }
      };

      fetchCategory();
    }
  }, [categoryId, isEditing, token]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      ...defaultValues,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Update category
        await ApiService.editCategory(categoryId!, data, token);
        toast.success("Category updated successfully");
      } else {
        // Create a new category
        await ApiService.createCategory(data, token);
        toast.success("Category created successfully");
      }

      navigate("/dashboard/categories");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);

    // Only auto-generate slug if it hasn't been manually edited or is empty
    if (!form.getValues("slug") || form.getValues("slug") === defaultValues?.slug) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      form.setValue("slug", slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Category" : "Create Category"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter category name" 
                      {...field} 
                      onChange={(e) => handleNameChange(e)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your category as it will be displayed on your site.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="enter-category-slug" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The URL-friendly version of the name. It is usually all lowercase and contains only letters, numbers, and hyphens.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter category description (optional)" 
                      className="resize-none" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The description is not prominent by default; however, some themes may show it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard/categories")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                isEditing ? "Update Category" : "Create Category"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
