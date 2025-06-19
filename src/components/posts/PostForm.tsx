// Updated PostForm.tsx with Focus Keywords support
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { ApiService } from "@/services/api-service";
import { Loader2 } from "lucide-react";

import PostFormContent from "./PostFormContent";
import PostFormSeo from "./PostFormSeo";
import PostFormSidebar from "./PostFormSidebar";

const getFormSchema = (isEditing: boolean) => {
  if (isEditing) {
    return z.object({
      postTitle: z.string().min(1, { message: "Title is required" }),
      postContent: z.string().optional(),
      postExcerpt: z.string().optional(),
      customSlug: z.string().optional(),
      postStatus: z.enum(["draft", "published", "archived"]).optional(),
      categories: z.array(z.string()).optional(),
      tags: z.array(z.string()).optional(),
      featuredMediaId: z.string().optional(),
      allowIndexing: z.boolean().optional(),
      scheduledPublishDate: z.string().optional(),
      videoId: z.string().optional(),
      seoMetadata: z
        .object({
          title: z.string().optional(),
          description: z.string().optional(),
          canonicalUrl: z.string().optional(),
          focusKeyword: z.string().optional(),
        })
        .optional(),
    });
  } else {
    return z.object({
      postTitle: z.string().min(1, { message: "Title is required" }),
      postContent: z.string().min(1, { message: "Content is required" }),
      postExcerpt: z.string().min(1, { message: "Excerpt is required" }),
      customSlug: z.string().optional(),
      postStatus: z.enum(["draft", "published", "archived"]),
      categories: z
        .array(z.string())
        .min(1, { message: "At least one category is required" }),
      tags: z.array(z.string()).optional(),
      featuredMediaId: z
        .string()
        .min(1, { message: "Featured image is required" }),
      allowIndexing: z.boolean().default(true),
      scheduledPublishDate: z.string().optional(),
      videoId: z.string().optional(),
      seoMetadata: z.object({
        title: z.string().min(1, { message: "SEO title is required" }),
        description: z
          .string()
          .min(1, { message: "SEO description is required" }),
        canonicalUrl: z.string().url({ message: "Please enter a valid URL" }),
        focusKeyword: z.string().optional(),
      }),
    });
  }
};

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

interface PostFormProps {
  defaultValues?: Partial<FormValues>;
  isEditing?: boolean;
  postId?: string;
}

export default function PostForm({
  defaultValues = {},
  isEditing = false,
  postId,
}: PostFormProps) {
  const navigate = useNavigate();
  const { token } = useAuth();

  // FIXED: Single source of truth for editor content
  const [editorContent, setEditorContent] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("content");
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState({
    categories: true,
    tags: true,
    media: true,
  });

  // FIXED: Ref to track if content was initialized
  const contentInitialized = useRef(false);

  const formSchema = getFormSchema(isEditing);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      postTitle: "",
      postContent: "",
      postExcerpt: "",
      customSlug: "",
      postStatus: "draft",
      categories: [],
      tags: [],
      featuredMediaId: "",
      allowIndexing: true,
      scheduledPublishDate: new Date().toISOString().split("T")[0],
      seoMetadata: {
        title: "",
        description: "",
        canonicalUrl: "",
        focusKeyword: "",
      },
      videoId: "",
      ...defaultValues,
    },
    mode: "onChange",
  });

  // FIXED: Initialize editor content and sync with form
  useEffect(() => {
    if (
      defaultValues &&
      defaultValues.postContent &&
      !contentInitialized.current
    ) {
      console.log("Initializing editor content:", defaultValues.postContent);
      setEditorContent(defaultValues.postContent);
      form.setValue("postContent", defaultValues.postContent);
      contentInitialized.current = true;
    }
  }, [defaultValues, form]);

  // FIXED: Improved content change handler
  const handleEditorContentChange = useCallback(
    (content: string) => {
      console.log("Editor content changed:", content.length, "characters");
      setEditorContent(content);
      form.setValue("postContent", content, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form]
  );

  // FIXED: Better featured image handling
  useEffect(() => {
    if (defaultValues?.featuredMediaId) {
      const fetchMediaItem = async () => {
        try {
          setIsLoading((prev) => ({ ...prev, media: true }));
          console.log("Fetching media with ID:", defaultValues.featuredMediaId);

          try {
            const response = await ApiService.get(
              `media/${defaultValues.featuredMediaId}`,
              {},
              token
            );
            if (response && response.success && response.media) {
              console.log("Found featured image:", response.media);
              const mediaUrl = response.media.link || response.media.spacesKey;
              setFeaturedImage(mediaUrl);
              setIsLoading((prev) => ({ ...prev, media: false }));
              return;
            }
          } catch (error) {
            console.log(
              "Error with direct API approach, trying alternative..."
            );
          }

          const mediaResponse = await ApiService.getMedia({}, token);
          if (
            mediaResponse &&
            mediaResponse.media &&
            Array.isArray(mediaResponse.media)
          ) {
            const foundItem = mediaResponse.media.find(
              (item) =>
                String(item.id) === String(defaultValues.featuredMediaId)
            );

            if (foundItem) {
              console.log("Found media item in media list:", foundItem);
              const mediaUrl = foundItem.link || foundItem.spacesKey;
              setFeaturedImage(mediaUrl);
            } else {
              console.log("Media item not found in any source");
            }
          }
        } catch (error) {
          console.error("Error fetching featured image:", error);
        } finally {
          setIsLoading((prev) => ({ ...prev, media: false }));
        }
      };

      fetchMediaItem();
    } else {
      setIsLoading((prev) => ({ ...prev, media: false }));
    }
  }, [defaultValues?.featuredMediaId, token]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories with token...");
        const data = await ApiService.getCategories(token);
        console.log("Categories API response:", data);

        if (data && data.categories && Array.isArray(data.categories)) {
          console.log(`Processing ${data.categories.length} categories`);
          setCategories(data.categories);
        } else {
          console.error("Unexpected categories response format:", data);
          toast.error("Categories data format unexpected");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading((prev) => ({ ...prev, categories: false }));
      }
    };

    fetchCategories();
  }, [token]);

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        console.log("Fetching all tags for the form...");
        setIsLoading((prev) => ({ ...prev, tags: true }));

        const tagsData = await ApiService.getAllTags(token);

        if (Array.isArray(tagsData)) {
          console.log(`Retrieved ${tagsData.length} tags for selection`);
          setTags(tagsData);
        } else {
          console.error("Unexpected tags data format:", tagsData);
          toast.error("Failed to load tags");
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        toast.error("Failed to load tags");
      } finally {
        setIsLoading((prev) => ({ ...prev, tags: false }));
      }
    };

    fetchTags();
  }, [token]);

  // Auto-generate slug from title
  const autoGenerateSlug = useCallback(() => {
    const title = form.getValues("postTitle");
    if (title && !form.getValues("customSlug")) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      form.setValue("customSlug", slug);
    }
  }, [form]);

  // Auto-fill SEO title if empty
  const autoFillSeoTitle = useCallback(() => {
    const title = form.getValues("postTitle");
    if (title && !form.getValues("seoMetadata.title")) {
      form.setValue("seoMetadata.title", title);
    }
  }, [form]);

  // FIXED: Improved onSubmit function
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      // CRITICAL FIX: Always use the current editor content
      const currentEditorContent =
        editorContent || form.getValues("postContent") || "";

      const submissionData = {
        ...data,
        postContent: currentEditorContent,
        videoId: data.videoId // Use current editor content
      };

      console.log("Form submission data:", submissionData);
      console.log("Editor content length:", currentEditorContent.length);

      let response;
      if (isEditing && postId) {
        // For editing, create a clean payload with only changed/provided fields
        const editPayload: any = {};

        // Always include basic fields if they have values
        if (submissionData.postTitle?.trim())
          editPayload.postTitle = submissionData.postTitle.trim();
        if (currentEditorContent.trim())
          editPayload.postContent = currentEditorContent.trim();
        if (submissionData.postExcerpt?.trim())
          editPayload.postExcerpt = submissionData.postExcerpt.trim();
        if (submissionData.customSlug?.trim())
          editPayload.customSlug = submissionData.customSlug.trim();
        if (submissionData.postStatus)
          editPayload.postStatus = submissionData.postStatus;
        if (submissionData.allowIndexing !== undefined)
          editPayload.allowIndexing = submissionData.allowIndexing;
        if (submissionData.scheduledPublishDate)
          editPayload.scheduledPublishDate =
            submissionData.scheduledPublishDate;

        // Handle categories
        if (
          submissionData.categories &&
          Array.isArray(submissionData.categories) &&
          submissionData.categories.length > 0
        ) {
          editPayload.categories = submissionData.categories.filter(Boolean);
        }

        // Handle tags
        if (
          submissionData.tags &&
          Array.isArray(submissionData.tags) &&
          submissionData.tags.length > 0
        ) {
          editPayload.tags = submissionData.tags.filter(Boolean);
        }

        // Handle featured image
        if (
          submissionData.featuredMediaId &&
          submissionData.featuredMediaId.trim()
        ) {
          editPayload.featuredMediaId = submissionData.featuredMediaId.trim();
        }

       if (submissionData.videoId?.trim()) {
        editPayload.videoId = submissionData.videoId.trim();
      }

        // Handle SEO metadata
        if (submissionData.seoMetadata) {
          const seo = submissionData.seoMetadata;
          editPayload.seoMetadata = {};

          if (seo.title?.trim())
            editPayload.seoMetadata.title = seo.title.trim();
          if (seo.description?.trim())
            editPayload.seoMetadata.description = seo.description.trim();
          if (seo.canonicalUrl?.trim())
            editPayload.seoMetadata.canonicalUrl = seo.canonicalUrl.trim();
          if (seo.focusKeyword?.trim())
            editPayload.seoMetadata.focusKeyword = seo.focusKeyword.trim();

          if (Object.keys(editPayload.seoMetadata).length === 0) {
            delete editPayload.seoMetadata;
          }
        }

        console.log("Sending edit payload:", editPayload);
        response = await ApiService.editPost(postId, editPayload, token);
      } else {
        // For creating new posts, send complete data
        console.log("Creating new post with data:", submissionData);
        response = await ApiService.createPost(submissionData, token);
      }

      if (response && response.success) {
        toast.success(
          isEditing ? "Post updated successfully" : "Post created successfully"
        );
        navigate("/dashboard/posts");
      } else {
        throw new Error(response?.message || "Unexpected response format");
      }
    } catch (error) {
      console.error("Error saving post:", error);

      let errorMessage = "Failed to save post";
      if (error instanceof Error) {
        if (error.message.includes("validation")) {
          errorMessage =
            "Please check that all required fields are filled correctly";
        } else if (error.message.includes("categories")) {
          errorMessage = "Please check your category selections";
        } else if (error.message.includes("tags")) {
          errorMessage = "Please check your tag selections";
        } else if (error.message.includes("featured")) {
          errorMessage = "Please select a valid featured image";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                {/* Title Field at the top */}
                <div className="border-b bg-gray-50 rounded-t-lg p-6">
                  <Input
                    placeholder="Enter post title"
                    className="text-xl font-medium border-0 px-0 focus-visible:ring-0 placeholder:text-gray-400 bg-transparent"
                    {...form.register("postTitle")}
                    onBlur={() => {
                      autoGenerateSlug();
                      autoFillSeoTitle();
                    }}
                  />
                  {form.formState.errors.postTitle && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.postTitle.message}
                    </p>
                  )}
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="flex items-center border-b bg-gray-50 px-4">
                    <TabsList className="h-12 bg-transparent gap-2">
                      <TabsTrigger
                        value="content"
                        className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                      >
                        Content
                      </TabsTrigger>
                      <TabsTrigger
                        value="seo"
                        className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                      >
                        SEO
                      </TabsTrigger>
                      <TabsTrigger
                        value="preview"
                        className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none"
                      >
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="content" className="space-y-6 p-6">
                    <PostFormContent
                      form={form}
                      isEditing={isEditing}
                      editorContent={editorContent}
                      onEditorContentChange={handleEditorContentChange}
                    />
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-6 p-6">
                    <PostFormSeo form={form} />
                  </TabsContent>

                  <TabsContent value="preview" className="p-6">
                    <div className="prose max-w-none">
                      <h1 className="text-2xl font-bold mb-4">
                        {form.getValues("postTitle")}
                      </h1>
                      <div
                        dangerouslySetInnerHTML={{
                          __html:
                            editorContent ||
                            form.getValues("postContent") ||
                            "<p>No content to preview</p>",
                        }}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard/posts")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating Post..." : "Publishing Post..."}
                    </>
                  ) : isEditing ? (
                    "Update Post"
                  ) : (
                    "Publish Post"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PostFormSidebar
              form={form}
              isSubmitting={isSubmitting}
              featuredImage={featuredImage}
              setFeaturedImage={setFeaturedImage}
              categories={categories}
              tags={tags}
              isLoading={isLoading}
            />
          </div>
        </div>
      </form>
    </Form>
  );
}
