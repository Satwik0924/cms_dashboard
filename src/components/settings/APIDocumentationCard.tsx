// src/components/settings/APIDocumentationCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Code,
  Copy,
  Shield,
  Database,
  FileText,
  FolderOpen,
  Tag,
  Search,
  Filter
} from 'lucide-react';

interface APIInfo {
  baseUrl: string;
  authentication: {
    method: string;
    description: string;
    header: string;
    apiKey: string;
    usage: string;
    note: string;
  };
  endpoints: {
    posts: {
      list: string;
      getBySlug: string;
      getByCategory: string;
      getByTag: string;
    };
  };
  exampleRequests: {
    getAllPosts: {
      url: string;
      headers: any;
      queryParameters: any;
    };
    getPostBySlug: {
      url: string;
      headers: any;
    };
    getPostsByCategory: {
      url: string;
      headers: any;
      queryParameters: any;
    };
    getPostsByTag: {
      url: string;
      headers: any;
      queryParameters: any;
    };
  };
}

interface APIDocumentationCardProps {
  apiInfo: APIInfo;
}

export default function APIDocumentationCard({ apiInfo }: APIDocumentationCardProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Code className="h-5 w-5" />
          API Documentation
        </CardTitle>
        <CardDescription className="text-green-700">
          Complete integration guide for your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="authentication" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="authentication">Auth</TabsTrigger>
            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
            <TabsTrigger value="responses">Responses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="authentication" className="space-y-4">
            <div className="bg-white/70 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-900">Base URL</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(apiInfo.baseUrl, 'Base URL')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <code className="text-sm text-green-800 bg-green-100 px-2 py-1 rounded break-all">
                {apiInfo.baseUrl}
              </code>
            </div>
            
            <div className="bg-white/70 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-900">API Key</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(apiInfo.authentication.apiKey, 'API Key')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <code className="text-sm text-green-800 bg-green-100 px-2 py-1 rounded break-all">
                {apiInfo.authentication.apiKey}
              </code>
              <p className="text-xs text-green-600 mt-2">
                Use this in the <code className="bg-green-100 px-1 rounded">x-api-key</code> header
              </p>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-amber-600" />
                <h5 className="font-medium text-amber-800">Security Note</h5>
              </div>
              <p className="text-sm text-amber-700">
                {apiInfo.authentication.note}
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="endpoints" className="space-y-4">
            <div className="grid gap-4">
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-900">All Posts</h4>
                </div>
                <code className="text-sm text-green-800 bg-green-100 px-2 py-1 rounded">
                  {apiInfo.endpoints.posts.list}
                </code>
                <p className="text-xs text-green-600 mt-1">Get all posts with pagination and filters</p>
              </div>
              
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-900">Post by Slug</h4>
                </div>
                <code className="text-sm text-green-800 bg-green-100 px-2 py-1 rounded">
                  {apiInfo.endpoints.posts.getBySlug}
                </code>
                <p className="text-xs text-green-600 mt-1">Get a specific post by its slug</p>
              </div>
              
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <FolderOpen className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-900">Posts by Category</h4>
                </div>
                <code className="text-sm text-green-800 bg-green-100 px-2 py-1 rounded">
                  {apiInfo.endpoints.posts.getByCategory}
                </code>
                <p className="text-xs text-green-600 mt-1">Get all posts in a specific category</p>
              </div>
              
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-900">Posts by Tag</h4>
                </div>
                <code className="text-sm text-green-800 bg-green-100 px-2 py-1 rounded">
                  {apiInfo.endpoints.posts.getByTag}
                </code>
                <p className="text-xs text-green-600 mt-1">Get all posts with a specific tag</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="examples" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Get All Posts</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <div>curl -X GET \</div>
                  <div>  "{apiInfo.exampleRequests.getAllPosts.url}" \</div>
                  <div>  -H "x-api-key: {apiInfo.authentication.apiKey}" \</div>
                  <div>  -G -d "page=1&limit=10&status=published"</div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Get Posts by Category</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <div>curl -X GET \</div>
                  <div>  "{apiInfo.exampleRequests.getPostsByCategory.url}" \</div>
                  <div>  -H "x-api-key: {apiInfo.authentication.apiKey}" \</div>
                  <div>  -G -d "page=1&limit=10&status=published"</div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Get Posts by Tag</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <div>curl -X GET \</div>
                  <div>  "{apiInfo.exampleRequests.getPostsByTag.url}" \</div>
                  <div>  -H "x-api-key: {apiInfo.authentication.apiKey}" \</div>
                  <div>  -G -d "page=1&limit=10&status=published"</div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-2">Get Post by Slug</h4>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <div>curl -X GET \</div>
                  <div>  "{apiInfo.exampleRequests.getPostBySlug.url}" \</div>
                  <div>  -H "x-api-key: {apiInfo.authentication.apiKey}"</div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="responses" className="space-y-4">
            <div className="space-y-4">
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-900">Success Response</h4>
                </div>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <div>{'{'}</div>
                  <div>  "success": true,</div>
                  <div>  "message": "Operation successful",</div>
                  <div>  "data": {'{'}</div>
                  <div>    // Response data object</div>
                  <div>  {'}'}</div>
                  <div>{'}'}</div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-900">Query Parameters</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <code className="bg-green-100 px-2 py-1 rounded">page</code>
                    <span className="text-green-700">Page number (default: 1)</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-green-100 px-2 py-1 rounded">limit</code>
                    <span className="text-green-700">Items per page (default: 10)</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-green-100 px-2 py-1 rounded">status</code>
                    <span className="text-green-700">published, draft, archived, all</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-green-100 px-2 py-1 rounded">search</code>
                    <span className="text-green-700">Search in title and content</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/70 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-green-900">Error Response</h4>
                </div>
                <div className="bg-gray-900 text-red-400 p-3 rounded text-xs font-mono overflow-x-auto">
                  <div>{'{'}</div>
                  <div>  "success": false,</div>
                  <div>  "message": "Error description",</div>
                  <div>  "error": "Detailed error information"</div>
                  <div>{'}'}</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}