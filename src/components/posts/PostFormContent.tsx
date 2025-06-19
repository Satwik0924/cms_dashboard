// Fixed PostFormContent.tsx - Proper Editor Integration
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import RichTextEditor from "./RichTextEditor";

interface PostFormContentProps {
  form: any;
  isEditing?: boolean;
  editorContent?: string;
  onEditorContentChange?: (content: string) => void;
}

export default function PostFormContent({ 
  form, 
  isEditing = false, 
  editorContent = "", 
  onEditorContentChange 
}: PostFormContentProps) {
  return (
    <>
      <FormField
        control={form.control}
        name="postContent"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <RichTextEditor
                defaultContent={editorContent}
                onChange={(content) => {
                  // FIXED: Use ONLY the parent handler to avoid conflicts
                  // The parent handler will update both state and form field
                  if (onEditorContentChange) {
                    onEditorContentChange(content);
                  }
                  // Don't call field.onChange here to avoid double updates
                }}
                fieldName="postContent"
                form={form}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="postExcerpt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Excerpt</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter a short excerpt for this post"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              A short summary of your post that will be displayed in list views.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}