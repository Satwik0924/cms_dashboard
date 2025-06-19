// src/pages/dashboard/AIBlogGenerator.tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Copy, Check, Loader2, Brain, Wand2, Sparkles, Plus } from 'lucide-react';
import { ApiService } from '@/services/api-service';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface GeneratedContent {
  title: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  excerpt: string;
  focusKeyword: string;
  slug: string;
  tags: string[];
  categories: string[];
  canonicalUrl: string;
}

export default function AIBlogGenerator() {
  const { token } = useAuth();
  const [inputContent, setInputContent] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [settings, setSettings] = useState({
    tone: 'professional',
    targetAudience: 'general',
    contentType: 'blog'
  });

  const handleGenerate = async () => {
    if (!inputContent.trim() || inputContent.length < 10) {
      toast.error('Please enter at least 10 characters of input content');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await ApiService.generateBlogContent({
        inputContent,
        ...settings
      }, token);

      if (response.success) {
        setGeneratedContent(response.data);
        toast.success('Blog content generated successfully! 🎉');
      } else {
        toast.error(response.message || 'Error generating content');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'Network error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(''), 2000);
      toast.success('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy text');
    }
  };

  const handleUseGenerated = () => {
    if (!generatedContent) return;
    
    // Dispatch custom event that can be caught by the post form
    const blogData = {
      postTitle: generatedContent.title,
      postContent: generatedContent.content,
      postExcerpt: generatedContent.excerpt,
      customSlug: generatedContent.slug,
      seoMetadata: {
        title: generatedContent.metaTitle,
        description: generatedContent.metaDescription,
        canonicalUrl: generatedContent.canonicalUrl,
        focusKeyword: generatedContent.focusKeyword
      },
      tags: generatedContent.tags,
      categories: generatedContent.categories
    };
    
    // Store in session storage for the post form to pick up
    sessionStorage.setItem('aiGeneratedContent', JSON.stringify(blogData));
    
    toast.success('Content ready! Go to "Create New Post" to use it.');
  };

  const handleCreatePost = () => {
    if (!generatedContent) return;
    
    // Store the generated content in session storage
    const blogData = {
      postTitle: generatedContent.title,
      postContent: generatedContent.content,
      postExcerpt: generatedContent.excerpt,
      customSlug: generatedContent.slug,
      seoMetadata: {
        title: generatedContent.metaTitle,
        description: generatedContent.metaDescription,
        canonicalUrl: generatedContent.canonicalUrl,
        focusKeyword: generatedContent.focusKeyword
      },
      tags: generatedContent.tags,
      categories: generatedContent.categories
    };
    
    sessionStorage.setItem('aiGeneratedContent', JSON.stringify(blogData));
    
    // Navigate to create new post page
    window.location.href = '/dashboard/posts/new';
  };

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="AI Blog Generator" 
        description="Generate comprehensive blog content using AI - titles, content, SEO metadata, and more."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Input Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="input-content">Topic or Content Ideas</Label>
                <Textarea
                  id="input-content"
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Enter your topic, ideas, keywords, or any content you want to expand into a full blog post..."
                  className="min-h-32 resize-none"
                  disabled={isGenerating}
                />
                <div className="text-sm text-muted-foreground mt-2">
                  {inputContent.length} characters (minimum 10 required)
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select
                  value={settings.tone}
                  onValueChange={(value) => setSettings({...settings, tone: value})}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="authoritative">Authoritative</SelectItem>
                    <SelectItem value="conversational">Conversational</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="audience">Target Audience</Label>
                <Select
                  value={settings.targetAudience}
                  onValueChange={(value) => setSettings({...settings, targetAudience: value})}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Audience</SelectItem>
                    <SelectItem value="beginners">Beginners</SelectItem>
                    <SelectItem value="experts">Experts</SelectItem>
                    <SelectItem value="business">Business Professionals</SelectItem>
                    <SelectItem value="technical">Technical Audience</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || inputContent.length < 10}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating Content...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Blog Content
              </>
            )}
          </Button>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {generatedContent ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-500" />
                    Generated Content
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUseGenerated}
                      variant="outline"
                      size="sm"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Save for Later
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      className="bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create New Post
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Blog Title</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.title, 'title')}
                    >
                      {copiedField === 'title' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="font-semibold">{generatedContent.title}</p>
                  </div>
                </div>

                {/* Meta Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Meta Title</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.metaTitle, 'metaTitle')}
                    >
                      {copiedField === 'metaTitle' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{generatedContent.metaTitle}</p>
                  </div>
                </div>

                {/* Meta Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Meta Description</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.metaDescription, 'metaDescription')}
                    >
                      {copiedField === 'metaDescription' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{generatedContent.metaDescription}</p>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Excerpt</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.excerpt, 'excerpt')}
                    >
                      {copiedField === 'excerpt' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{generatedContent.excerpt}</p>
                  </div>
                </div>

                {/* Focus Keyword & Slug */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-medium">Focus Keyword</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedContent.focusKeyword, 'focusKeyword')}
                      >
                        {copiedField === 'focusKeyword' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-mono">{generatedContent.focusKeyword}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="font-medium">URL Slug</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(generatedContent.slug, 'slug')}
                      >
                        {copiedField === 'slug' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-mono">{generatedContent.slug}</p>
                    </div>
                  </div>
                </div>

                {/* Tags & Categories */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium mb-2 block">Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="font-medium mb-2 block">Categories</Label>
                    <div className="flex flex-wrap gap-2">
                      {generatedContent.categories.map((category, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Blog Content Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="font-medium">Blog Content</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent.content, 'content')}
                    >
                      {copiedField === 'content' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-4 bg-muted rounded-lg border">
                    <div className="prose prose-sm max-w-none text-sm">
                      {generatedContent.content.length > 500 
                        ? generatedContent.content.substring(0, 500) + '...'
                        : generatedContent.content
                      }
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No content generated yet</h3>
                <p className="text-muted-foreground text-center">Enter your content and click generate to see AI-powered results</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}