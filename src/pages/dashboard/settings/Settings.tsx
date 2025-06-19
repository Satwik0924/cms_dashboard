// src/pages/dashboard/settings/Settings.tsx - Based on actual live API
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import CompanyInfoCard from '@/components/settings/CompanyInfoCard';
import APIDocumentationCard from '@/components/settings/APIDocumentationCard';
import { toast } from 'sonner';
import { Download, Loader2, RefreshCw, AlertTriangle, Building2, Code2, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ApiService } from '@/services/api-service';

interface ClientInfo {
  company: {
    uuid: string;
    name: string;
    subdomain: string;
    contactName: string;
    contactEmail: string;
    status: string;
    subscriptionPlan: string;
    subscriptionStatus: string;
    trialEndsAt?: string;
    createdAt: string;
  };
  apiInfo: {
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
    responseFormats: any;
    commonParameters: any;
  };
}

// Simple PDF generation service for the available data
const generateSimplePDF = (clientInfo: ClientInfo) => {
  const content = `
CLIENT INFORMATION REPORT
Generated on ${new Date().toLocaleDateString()}

COMPANY INFORMATION
Company Name: ${clientInfo.company.name}
Contact Person: ${clientInfo.company.contactName}
Contact Email: ${clientInfo.company.contactEmail}
Subdomain: ${clientInfo.company.subdomain}
Status: ${clientInfo.company.status}
Subscription Plan: ${clientInfo.company.subscriptionPlan}
Member Since: ${new Date(clientInfo.company.createdAt).toLocaleDateString()}

API DOCUMENTATION
Base URL: ${clientInfo.apiInfo.baseUrl}
Authentication Method: ${clientInfo.apiInfo.authentication.method}
API Key: ${clientInfo.apiInfo.authentication.apiKey}

AVAILABLE ENDPOINTS:
- GET /posts - Get all posts
- GET /posts/slug/{slug} - Get post by slug
- GET /posts/category/{categorySlug} - Get posts by category
- GET /posts/tag/{tagSlug} - Get posts by tag

EXAMPLE USAGE:
${clientInfo.apiInfo.exampleRequests.getAllPosts.url}
Headers: x-api-key: ${clientInfo.apiInfo.authentication.apiKey}
  `;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${clientInfo.company.name.replace(/[^a-zA-Z0-9]/g, '_')}_API_Documentation.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function Settings() {
  const { token } = useAuth();
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClientInfo();
  }, []);

  const fetchClientInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await ApiService.getClientInfo(token);
      
      if (response?.success) {
        setClientInfo(response.data);
      } else {
        throw new Error(response?.message || 'Failed to load client information');
      }
    } catch (error) {
      console.error('Error fetching client info:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load client information';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchClientInfo();
      toast.success('Client information refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh client information');
    } finally {
      setIsRefreshing(false);
    }
  };

  const downloadDocumentation = async () => {
    if (!clientInfo) {
      toast.error('No client information available to generate documentation');
      return;
    }
    
    try {
      setIsGeneratingPDF(true);
      generateSimplePDF(clientInfo);
      toast.success('API documentation downloaded successfully! 📄');
    } catch (error) {
      console.error('Error generating documentation:', error);
      toast.error('Failed to generate documentation');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const retryLoading = () => {
    setError(null);
    fetchClientInfo();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Settings" 
          description="Manage your account settings and view client information." 
        />
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading client information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Settings" 
          description="Manage your account settings and view client information." 
        />
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Error Loading Settings
            </CardTitle>
            <CardDescription>
              We encountered an issue while loading your client information.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {error}
            </p>
            <div className="flex gap-2">
              <Button onClick={retryLoading} size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!clientInfo) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Settings" 
          description="Manage your account settings and view client information." 
        />
        <Card>
          <CardHeader>
            <CardTitle>No Data Available</CardTitle>
            <CardDescription>
              Client information is not available at the moment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={retryLoading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reload Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Settings" 
        description="Manage your account settings and view client information."
        action={{
          label: isGeneratingPDF ? "Generating..." : "Download API Guide",
          icon: isGeneratingPDF ? 
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
            <Download className="h-4 w-4 mr-2" />,
          href: "#",
          onClick: downloadDocumentation
        }}
      />
      
      {/* Refresh Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Company Information and API Documentation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Information Card */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription className="text-blue-700">
                Your organization details and subscription status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">Company Name</label>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-blue-800">{clientInfo.company.name}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(clientInfo.company.name, 'Company name')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">Contact Person</label>
                  <p className="text-blue-800">{clientInfo.company.contactName}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">Contact Email</label>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-800">{clientInfo.company.contactEmail}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(clientInfo.company.contactEmail, 'Email')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-blue-900">Subdomain</label>
                  <div className="flex items-center gap-2">
                    <p className="text-blue-800 font-mono">{clientInfo.company.subdomain}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(clientInfo.company.subdomain, 'Subdomain')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-blue-200" />
              
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Status:</span>
                  <Badge variant={clientInfo.company.status === 'active' ? 'default' : 'secondary'}>
                    {clientInfo.company.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Plan:</span>
                  <Badge variant="outline" className="border-blue-300 text-blue-800">
                    {clientInfo.company.subscriptionPlan}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-700">Member since:</span>
                  <span className="text-sm font-medium text-blue-800">
                    {new Date(clientInfo.company.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Documentation Card */}
          <APIDocumentationCard apiInfo={clientInfo.apiInfo} />
        </div>

        {/* Sidebar - Quick Actions and API Status */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <Download className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-amber-700">
                Common tasks and utilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={downloadDocumentation}
                disabled={isGeneratingPDF}
                className="w-full bg-amber-600 hover:bg-amber-700"
                size="sm"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download API Guide
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
                size="sm"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Data
                  </>
                )}
              </Button>

              <Button
                onClick={() => copyToClipboard(clientInfo.apiInfo.authentication.apiKey, 'API Key')}
                variant="outline"
                className="w-full border-amber-300 text-amber-800 hover:bg-amber-100"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Copy API Key
              </Button>
            </CardContent>
          </Card>

          {/* API Status Card */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-900">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                API Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Status:</span>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Method:</span>
                  <span className="font-semibold text-green-800">
                    {clientInfo.apiInfo.authentication.method}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-green-700">Base URL:</span>
                  <div className="bg-green-100 p-2 rounded border break-all">
                    <code className="text-xs text-green-800">
                      {clientInfo.apiInfo.baseUrl}
                    </code>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-green-700">Your API Key:</span>
                  <div className="bg-green-100 p-2 rounded border break-all">
                    <code className="text-xs text-green-800">
                      {clientInfo.apiInfo.authentication.apiKey}
                    </code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Integration Help Card */}
          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Code2 className="h-5 w-5" />
                Integration Guide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <h4 className="font-medium text-purple-800 mb-2">Quick Start:</h4>
                <ol className="list-decimal list-inside space-y-1 text-purple-700">
                  <li>Copy your API key above</li>
                  <li>Use it in the <code className="bg-purple-100 px-1 rounded">x-api-key</code> header</li>
                  <li>Make requests to the endpoints shown in the API documentation</li>
                  <li>Start with <code className="bg-purple-100 px-1 rounded">GET /posts</code> to test</li>
                </ol>
              </div>
              <div className="bg-purple-100 p-3 rounded border">
                <p className="text-xs text-purple-700">
                  <strong>Note:</strong> {clientInfo.apiInfo.authentication.note}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Information */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-semibold text-sm">Need Help?</h3>
              <p className="text-xs text-muted-foreground">
                Contact support or check our documentation for integration help.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('mailto:support@8views.net', '_blank')}
              >
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={downloadDocumentation}
              >
                Download Guide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}