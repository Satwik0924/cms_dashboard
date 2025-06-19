import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
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
});

type FormValues = z.infer<typeof formSchema>;

interface TagFormProps {
  defaultValues?: Partial<FormValues>;
  isEditing?: boolean;
}

export default function TagForm({ defaultValues = {}, isEditing = false }: TagFormProps) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { tagId } = useParams<{ tagId: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tag data if editing
  useEffect(() => {
    if (isEditing && tagId) {
      const fetchTag = async () => {
        try {
          const response = await ApiService.getTagById(tagId, token);
          if (response && response.tag) {
            // Set form values with the fetched tag data
            form.setValue("name", response.tag.name);
            form.setValue("slug", response.tag.slug);
          }
        } catch (error) {
          toast.error("Error fetching tag data.");
          console.error("Error fetching tag data:", error);
        }
      };

      fetchTag();
    }
  }, [tagId, isEditing, token]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      ...defaultValues,
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditing) {
        // Update tag
        await ApiService.editTag(tagId!, data, token);
        toast.success("Tag updated successfully");
      } else {
        // Create a new tag
        await ApiService.createTag(data, token);
        toast.success("Tag created successfully");
      }

      navigate("/dashboard/tags");
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
            <CardTitle>{isEditing ? "Edit Tag" : "Create Tag"}</CardTitle>
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
                      placeholder="Enter tag name" 
                      {...field} 
                      onChange={(e) => handleNameChange(e)}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your tag as it will be displayed on your site.
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
                      placeholder="enter-tag-slug" 
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/dashboard/tags")}
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
                isEditing ? "Update Tag" : "Create Tag"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}