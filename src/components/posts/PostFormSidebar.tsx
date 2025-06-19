import React, { useEffect, useState } from "react";
import {
  FormField,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Loader2, ChevronDown, ChevronUp, X, Plus, FolderPlus, TagIcon, RefreshCw } from "lucide-react";
import { MediaSelectionDialog } from "../media/MediaSelectionDialog";
import YouTubeVideoSelector from "./YouTubeVideoSelector";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ApiService } from "@/services/api-service";
import { useAuth } from "@/contexts/AuthContext";

// Custom MultiSelect component with Quick Add functionality
const MultiSelect = ({ 
  items, 
  value = [], 
  onChange, 
  placeholder = "Select items",
  isLoading = false,
  disabled = false,
  type = "category", // "category" or "tag"
  onItemAdded,
  onRefresh
}) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemSlug, setNewItemSlug] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { token } = useAuth();

  // Update selected items when value changes externally
  useEffect(() => {
    const normalizedValues = Array.isArray(value) ? value.map(item => {
      if (typeof item === 'object' && item !== null) {
        return String(item.id || "");
      }
      return String(item || "");
    }).filter(Boolean) : [];

    setSelected(normalizedValues);
  }, [value]);

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setNewItemName(name);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setNewItemSlug(slug);
  };

  // Create new category or tag
  const handleQuickAdd = async () => {
    if (!newItemName.trim()) {
      toast.error(`${type === 'category' ? 'Category' : 'Tag'} name is required`);
      return;
    }

    setIsCreating(true);
    try {
      const itemData = {
        name: newItemName.trim(),
        slug: newItemSlug.trim() || newItemName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        ...(type === 'category' && newItemDescription.trim() && { description: newItemDescription.trim() })
      };

      let response;
      if (type === 'category') {
        response = await ApiService.createCategory(itemData, token);
      } else {
        response = await ApiService.createTag(itemData, token);
      }

      if (response && response.success) {
        const newItem = response[type] || response.data;
        toast.success(`${type === 'category' ? 'Category' : 'Tag'} created successfully!`);
        
        // Reset form
        setNewItemName("");
        setNewItemSlug("");
        setNewItemDescription("");
        setShowQuickAdd(false);
        
        // Notify parent component to refresh the list and add the new item
        if (onItemAdded) {
          onItemAdded(newItem);
        }
        
        // Auto-select the new item
        if (newItem && newItem.id) {
          const newSelection = [...selected, String(newItem.id)];
          setSelected(newSelection);
          if (onChange) {
            onChange(newSelection);
          }
        }

        // Refresh the list to ensure we have the latest data
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        throw new Error(response?.message || `Failed to create ${type}`);
      }
    } catch (error) {
      console.error(`Error creating ${type}:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to create ${type}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        toast.success(`${type === 'category' ? 'Categories' : 'Tags'} refreshed!`);
      } catch (error) {
        toast.error(`Failed to refresh ${type}s`);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const getItemById = (id: string) => {
    return items.find(item => String(item.id) === id);
  };

  const getItemNameById = (id: string) => {
    const item = getItemById(id);
    return item ? item.name : `${type} ${id.substring(0, 6)}...`;
  };

  const handleSelect = (itemId: string) => {
    const itemIdStr = String(itemId);
    const isSelected = selected.includes(itemIdStr);
    
    let newSelection;
    if (isSelected) {
      newSelection = selected.filter(id => id !== itemIdStr);
    } else {
      newSelection = [...selected, itemIdStr];
    }
    
    setSelected(newSelection);
    
    if (onChange) {
      onChange(newSelection);
    }
  };

  const mostUsedItems = items.slice(0, Math.min(5, items.length));
  const displayItems = activeTab === "all" ? items : mostUsedItems;

  return (
    <div className="relative w-full">
      {/* Custom trigger */}
      <Button
        type="button"
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className="w-full justify-between font-normal"
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        {selected.length > 0 
          ? `${selected.length} selected` 
          : placeholder}
        <div className="ml-1 h-4 w-4 shrink-0 opacity-50">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </Button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-full border border-input bg-white shadow-md rounded-md">
          {/* Header with Quick Add and Refresh buttons */}
          <div className="flex items-center justify-between p-2 border-b">
            <span className="text-sm font-medium">Select {type}s</span>
            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className="h-7 px-2 text-xs"
                title={`Refresh ${type}s`}
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowQuickAdd(true)}
                className="h-7 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add New
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All {type}s
            </button>
            <button
              type="button"
              className={`flex-1 py-2 px-4 text-sm font-medium ${activeTab === 'most' ? 'border-b-2 border-blue-500 text-blue-600' : ''}`}
              onClick={() => setActiveTab('most')}
            >
              Most Used
            </button>
          </div>
          
          {/* Items List */}
          <div className="max-h-72 overflow-y-auto p-1">
            {isLoading || isRefreshing ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>{isRefreshing ? 'Refreshing...' : 'Loading...'}</span>
              </div>
            ) : displayItems.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <p>No {type}s found</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowQuickAdd(true)}
                  className="mt-2"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Create your first {type}
                </Button>
              </div>
            ) : (
              displayItems.map((item) => {
                const itemId = String(item.id);
                const isItemSelected = selected.includes(itemId);
                return (
                  <div
                    key={itemId}
                    className={`px-2 py-1 rounded-md hover:bg-gray-100 cursor-pointer ${isItemSelected ? 'bg-gray-50' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(itemId);
                    }}
                  >
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        checked={isItemSelected}
                        onChange={() => {}}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="ml-2 text-sm">{item.name}</span>
                    </label>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Quick Add Dialog */}
      <Dialog open={showQuickAdd} onOpenChange={setShowQuickAdd}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {type === 'category' ? <FolderPlus className="h-5 w-5" /> : <TagIcon className="h-5 w-5" />}
              Add New {type === 'category' ? 'Category' : 'Tag'}
            </DialogTitle>
            <DialogDescription>
              Create a new {type} and automatically select it for this post.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="item-name">Name</Label>
              <Input
                id="item-name"
                placeholder={`Enter ${type} name`}
                value={newItemName}
                onChange={(e) => handleNameChange(e.target.value)}
                disabled={isCreating}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="item-slug">Slug</Label>
              <Input
                id="item-slug"
                placeholder="auto-generated-slug"
                value={newItemSlug}
                onChange={(e) => setNewItemSlug(e.target.value)}
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                URL-friendly version (auto-generated from name)
              </p>
            </div>
            {type === 'category' && (
              <div className="grid gap-2">
                <Label htmlFor="item-description">Description (Optional)</Label>
                <Input
                  id="item-description"
                  placeholder="Brief description of this category"
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  disabled={isCreating}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowQuickAdd(false);
                setNewItemName("");
                setNewItemSlug("");
                setNewItemDescription("");
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleQuickAdd}
              disabled={isCreating || !newItemName.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create {type === 'category' ? 'Category' : 'Tag'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default function PostFormSidebar({
  form,
  isSubmitting,
  featuredImage,
  setFeaturedImage,
  categories,
  tags,
  isLoading,
}) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [localCategories, setLocalCategories] = useState(categories);
  const [localTags, setLocalTags] = useState(tags);
  const { token } = useAuth();
  
  // Update local state when props change
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  useEffect(() => {
    setLocalTags(tags);
  }, [tags]);

  // Refresh categories from API
  const refreshCategories = async () => {
    try {
      const data = await ApiService.getCategories(token);
      if (data && data.categories && Array.isArray(data.categories)) {
        setLocalCategories(data.categories);
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
      throw error;
    }
  };

  // Refresh tags from API
  const refreshTags = async () => {
    try {
      const tagsData = await ApiService.getAllTags(token);
      if (Array.isArray(tagsData)) {
        setLocalTags(tagsData);
      }
    } catch (error) {
      console.error('Error refreshing tags:', error);
      throw error;
    }
  };

  // Handle new category added
  const handleCategoryAdded = async (newCategory) => {
    // Add to local state immediately for instant feedback
    setLocalCategories(prev => {
      // Check if category already exists to avoid duplicates
      const exists = prev.some(cat => cat.id === newCategory.id);
      if (exists) return prev;
      return [...prev, newCategory];
    });
    
    // Also refresh from server to ensure we have the latest data
    try {
      await refreshCategories();
    } catch (error) {
      console.error('Error refreshing categories after add:', error);
    }
    
    toast.success("Category added and selected!");
  };

  // Handle new tag added
  const handleTagAdded = async (newTag) => {
    // Add to local state immediately for instant feedback
    setLocalTags(prev => {
      // Check if tag already exists to avoid duplicates
      const exists = prev.some(tag => tag.id === newTag.id);
      if (exists) return prev;
      return [...prev, newTag];
    });
    
    // Also refresh from server to ensure we have the latest data
    try {
      await refreshTags();
    } catch (error) {
      console.error('Error refreshing tags after add:', error);
    }
    
    toast.success("Tag added and selected!");
  };

  // Normalize form data on mount
  useEffect(() => {
    const normalizeCategories = () => {
      const currentCategories = form.getValues("categories") || [];
      
      if (currentCategories.length > 0 && localCategories.length > 0) {
        const needsNormalization = currentCategories.some(cat => 
          typeof cat === 'object' && cat !== null
        );
        
        if (needsNormalization) {
          const normalizedIds = currentCategories.map(cat => {
            if (typeof cat === 'object' && cat !== null) {
              return String(cat.id || "");
            }
            return String(cat || "");
          }).filter(Boolean);
          
          form.setValue("categories", normalizedIds);
        }
      }
    };
    
    const normalizeTags = () => {
      const currentTags = form.getValues("tags") || [];
      
      if (currentTags.length > 0 && localTags.length > 0) {
        const needsNormalization = currentTags.some(tag => 
          typeof tag === 'object' && tag !== null
        );
        
        if (needsNormalization) {
          const normalizedIds = currentTags.map(tag => {
            if (typeof tag === 'object' && tag !== null) {
              return String(tag.id || "");
            }
            return String(tag || "");
          }).filter(Boolean);
          
          form.setValue("tags", normalizedIds);
        }
      }
    };
    
    if (localCategories.length > 0) {
      normalizeCategories();
    }
    
    if (localTags.length > 0) {
      normalizeTags();
    }
  }, [localCategories, localTags, form]);

  const handleCategoryChange = (selectedIds) => {
    console.log("Selected category IDs:", selectedIds);
    form.setValue("categories", selectedIds);
  };

  const handleTagChange = (selectedIds) => {
    console.log("Selected tag IDs:", selectedIds);
    form.setValue("tags", selectedIds);
  };

  const handleMediaSelect = (media) => {
    setFeaturedImage(media.spacesKey);
    form.setValue("featuredMediaId", media.id);
  };

  const formCategories = form.watch("categories") || [];
  const formTags = form.watch("tags") || [];

  return (
    <div className="space-y-6">
      {/* Post Status */}
      <FormField
        control={form.control}
        name="postStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <FormControl>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={field.value || "draft"}
                onChange={field.onChange}
                disabled={isSubmitting}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Categories with Quick Add */}
      <FormField
        control={form.control}
        name="categories"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Categories
            </FormLabel>
            <FormControl>
              <MultiSelect
                items={localCategories}
                value={formCategories}
                onChange={handleCategoryChange}
                placeholder="Select categories"
                isLoading={isLoading.categories}
                disabled={isSubmitting}
                type="category"
                onItemAdded={handleCategoryAdded}
                onRefresh={refreshCategories}
              />
            </FormControl>
            <FormDescription>
              Select existing categories or create new ones
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Tags with Quick Add */}
      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem>
            <FormLabel className="flex items-center gap-2">
              <TagIcon className="h-4 w-4" />
              Tags
            </FormLabel>
            <FormControl>
              <MultiSelect
                items={localTags}
                value={formTags}
                onChange={handleTagChange}
                placeholder="Select tags"
                isLoading={isLoading.tags}
                disabled={isSubmitting}
                type="tag"
                onItemAdded={handleTagAdded}
                onRefresh={refreshTags}
              />
            </FormControl>
            <FormDescription>
              Select existing tags or create new ones
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Publish Date */}
      <FormField
        control={form.control}
        name="scheduledPublishDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Publish Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} disabled={isSubmitting} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Featured Image */}
      <FormField
        control={form.control}
        name="featuredMediaId"
        render={() => (
          <FormItem>
            <FormLabel>Featured Image</FormLabel>
            <FormControl>
              <div className="space-y-4 pt-4">
                {featuredImage ? (
                  <div className="relative">
                    <img
                      src={featuredImage}
                      alt="Featured"
                      className="w-full h-auto rounded-md object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setFeaturedImage(null);
                        form.setValue("featuredMediaId", "");
                      }}
                      disabled={isSubmitting}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-32 border-dashed"
                    onClick={() => setMediaDialogOpen(true)}
                    disabled={isSubmitting}
                  >
                    <Image className="h-6 w-6 mr-2" />
                    Select from Media Library
                  </Button>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
  control={form.control}
  name="videoId"
  render={({ field }) => (
    <FormItem>
      <FormControl>
        <YouTubeVideoSelector
          value={field.value || ""}
          onChange={field.onChange}
          disabled={isSubmitting}
        />
      </FormControl>
      <FormDescription>
        Add a YouTube video to embed in your post
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>

      <MediaSelectionDialog
        open={mediaDialogOpen}
        onOpenChange={setMediaDialogOpen}
        onMediaSelect={handleMediaSelect}
      />
    </div>
  );
}