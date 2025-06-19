// Updated PostFormSeo.tsx with Gemini AI auto-generation
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface PostFormSeoProps {
  form: any;
}

interface GeneratedSEO {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export default function PostFormSeo({ form }: PostFormSeoProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSEO, setGeneratedSEO] = useState<GeneratedSEO | null>(null);

  // Gemini API configuration
  const GEMINI_API_KEY = "AIzaSyDQcKppZ3Zjrhwv4Tpc1ZrQzUiurxuKYdk";
  const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const generateSEOContent = async () => {
    try {
      setIsGenerating(true);
      
      // Get the current form values
      const postTitle = form.getValues("postTitle") || "";
      const postContent = form.getValues("postContent") || "";
      const postExcerpt = form.getValues("postExcerpt") || "";
      
      // Check if we have enough content to generate SEO
      if (!postTitle.trim() && !postContent.trim() && !postExcerpt.trim()) {
        toast.error("Please add a title, content, or excerpt before generating SEO metadata.");
        return;
      }

      // Create the prompt for Gemini
      const prompt = `
        Based on the following blog post content, generate SEO metadata:

        Title: ${postTitle}
        Content: ${postContent.replace(/<[^>]*>/g, '').substring(0, 1000)}...
        Excerpt: ${postExcerpt}

        Please generate:
        1. An SEO-optimized meta title (50-60 characters, compelling and descriptive)
        2. A meta description (150-160 characters, engaging and informative)
        3. Relevant keywords (5-10 keywords/phrases separated by commas)

        Return the response in this exact JSON format:
        {
          "metaTitle": "Your generated title here",
          "metaDescription": "Your generated description here",
          "keywords": "keyword1, keyword2, keyword3"
        }

        Make sure the meta title and description are engaging, include the main topic, and are optimized for search engines.
      `;

      // Make API call to Gemini
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      // Extract the generated text
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!generatedText) {
        throw new Error("No response from AI service");
      }

      // Parse the JSON response
      let parsedSEO: GeneratedSEO;
      try {
        // Clean the response text (remove markdown code blocks if present)
        const cleanedText = generatedText.replace(/```json\n?|\n?```/g, '').trim();
        parsedSEO = JSON.parse(cleanedText);
      } catch (parseError) {
        console.error('Failed to parse JSON, raw response:', generatedText);
        
        // Fallback: try to extract information manually
        const titleMatch = generatedText.match(/"metaTitle":\s*"([^"]*)"/);
        const descMatch = generatedText.match(/"metaDescription":\s*"([^"]*)"/);
        const keywordsMatch = generatedText.match(/"keywords":\s*"([^"]*)"/);
        
        if (titleMatch && descMatch && keywordsMatch) {
          parsedSEO = {
            metaTitle: titleMatch[1],
            metaDescription: descMatch[1],
            keywords: keywordsMatch[1]
          };
        } else {
          throw new Error("Failed to parse AI response");
        }
      }

      // Validate the parsed content
      if (!parsedSEO.metaTitle || !parsedSEO.metaDescription || !parsedSEO.keywords) {
        throw new Error("Incomplete SEO data generated");
      }

      setGeneratedSEO(parsedSEO);
      toast.success("SEO content generated successfully! You can now apply it or make modifications.");

    } catch (error) {
      console.error('Error generating SEO content:', error);
      toast.error(error instanceof Error ? error.message : "Failed to generate SEO content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const applySEOContent = () => {
    if (!generatedSEO) return;

    // Apply the generated content to form fields
    form.setValue("seoMetadata.title", generatedSEO.metaTitle);
    form.setValue("seoMetadata.description", generatedSEO.metaDescription);
    form.setValue("seoMetadata.focusKeyword", generatedSEO.keywords);

    toast.success("SEO content applied to form!");
    setGeneratedSEO(null); // Clear the generated content after applying
  };

  const discardSEOContent = () => {
    setGeneratedSEO(null);
    toast.info("Generated SEO content discarded.");
  };

  return (
    <div className="space-y-6">
      {/* AI SEO Generation Section */}
      <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Sparkles className="h-5 w-5" />
            AI SEO Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-blue-600">
            Generate SEO-optimized meta title, description, and keywords based on your blog content using AI.
          </p>
          
          <Button
            type="button"
            onClick={generateSEOContent}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating SEO Content...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate SEO Content with AI
              </>
            )}
          </Button>

          {/* Generated SEO Preview */}
          {generatedSEO && (
            <div className="mt-4 p-4 bg-white border rounded-lg space-y-3">
              <h4 className="font-semibold text-green-700 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generated SEO Content
              </h4>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-600">Meta Title ({generatedSEO.metaTitle.length}/60):</span>
                  <p className="text-sm bg-gray-50 p-2 rounded border">{generatedSEO.metaTitle}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Meta Description ({generatedSEO.metaDescription.length}/160):</span>
                  <p className="text-sm bg-gray-50 p-2 rounded border">{generatedSEO.metaDescription}</p>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-gray-600">Keywords:</span>
                  <p className="text-sm bg-gray-50 p-2 rounded border">{generatedSEO.keywords}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={applySEOContent}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Apply to Form
                </Button>
                <Button
                  type="button"
                  onClick={discardSEOContent}
                  size="sm"
                  variant="outline"
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  onClick={generateSEOContent}
                  disabled={isGenerating}
                  size="sm"
                  variant="outline"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual SEO Fields */}
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="customSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input placeholder="post-url-slug" {...field} />
              </FormControl>
              <FormDescription>
                The unique URL path for this post (e.g., domain.com/posts/your-slug)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoMetadata.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Title</FormLabel>
              <FormControl>
                <Input placeholder="SEO optimized title" {...field} />
              </FormControl>
              <FormDescription>
                <div className="flex justify-between">
                  <span>The title that appears in search engine results</span>
                  <span className={`${field.value && field.value.length > 60 ? 'text-destructive' : ''}`}>
                    {field.value ? field.value.length : 0}/60
                  </span>
                </div>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoMetadata.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SEO Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description for search engines"
                  {...field}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                <div className="flex justify-between">
                  <span>Meta description that appears in search results</span>
                  <span className={`${field.value && field.value.length > 160 ? 'text-destructive' : ''}`}>
                    {field.value ? field.value.length : 0}/160
                  </span>
                </div>
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoMetadata.focusKeyword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Focus Keywords</FormLabel>
              <FormControl>
                <Input
                  placeholder="keyword1, keyword2, keyword3"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Main keywords for this post (comma-separated)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seoMetadata.canonicalUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canonical URL</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://yourdomain.com/posts/your-slug"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The preferred URL for this content if it exists in multiple locations
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}