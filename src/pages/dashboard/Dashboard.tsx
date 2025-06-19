// src/pages/dashboard/Dashboard.tsx - Updated with real API integration

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  FileText, 
  FolderOpen, 
  BarChart, 
  Users, 
  ArrowUp, 
  ArrowDown,
  Image,
  Tag,
  Activity,
  TrendingUp,
  Eye,
  Loader2,
  Calendar,
  Plus
} from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ApiService } from "@/services/api-service";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [pageViewsData, setPageViewsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      const response = await ApiService.getDashboardStats(token);
      if (response && response.success) {
        setDashboardData(response.data);
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
      toast.error('Failed to load dashboard statistics');
    }
  };

  // Fetch page views analytics
  const fetchPageViews = async () => {
    try {
      const response = await ApiService.getPageViewsAnalytics({ days: 30 }, token);
      if (response && response.success) {
        setPageViewsData(response.data);
      }
    } catch (error) {
      console.error('Error fetching page views:', error);
      // Don't show error for analytics as it's optional
    }
  };

  // Track this page view
  const trackPageView = async () => {
    try {
      await ApiService.trackPageView({
        pageUrl: window.location.href,
        referrer: document.referrer
      }, token);
    } catch (error) {
      // Silently fail for tracking
      console.error('Error tracking page view:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchDashboardStats(),
          fetchPageViews()
        ]);
        
        // Track this dashboard visit
        await trackPageView();
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Dashboard" 
          description="Welcome to your CMS dashboard." 
        />
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error && !dashboardData) {
    return (
      <div className="space-y-6">
        <DashboardHeader 
          title="Dashboard" 
          description="Welcome to your CMS dashboard." 
        />
        <div className="p-6 text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Dashboard" 
        description="Welcome to your CMS dashboard. Here's an overview of your content and performance." 
        action={{
          label: "Add Post",
          icon: <Plus className="h-4 w-4 mr-2" />,
          href: "/dashboard/posts/new"
        }}
      />
      
      {/* Statistics Cards */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.totalPosts}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.overview.publishedPosts} published, {dashboardData.overview.draftPosts} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardData.overview.totalTags} tags available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {pageViewsData ? 'Page Views' : 'Users'}
              </CardTitle>
              {pageViewsData ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pageViewsData ? pageViewsData.summary.totalViews : dashboardData.overview.totalUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                {pageViewsData ? 'Last 30 days' : 'Active users'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media Files</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.overview.totalMedia}</div>
              <p className="text-xs text-muted-foreground">
                Images and documents
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Growth Analytics */}
      {dashboardData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Content Growth
            </CardTitle>
            <CardDescription>
              Monthly content creation statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{dashboardData.analytics.postsThisMonth}</div>
                <p className="text-sm text-muted-foreground">Posts this month</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{dashboardData.analytics.postsLastMonth}</div>
                <p className="text-sm text-muted-foreground">Posts last month</p>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-bold">{dashboardData.analytics.growthPercentage}%</span>
                  {dashboardData.analytics.growthPercentage >= 0 ? (
                    <ArrowUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Growth rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Posts */}
        {dashboardData && (
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Posts
              </CardTitle>
              <CardDescription>
                Your most recently created content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentActivity.recentPosts.slice(0, 5).map((post, index) => (
                  <div key={post.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold line-clamp-1">{post.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status}
                        </Badge>
                        {post.publishedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(post.publishedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {dashboardData.recentActivity.recentPosts.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">No posts yet</p>
                    <Button size="sm" asChild>
                      <a href="/dashboard/posts/new">Create your first post</a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top Categories or Analytics */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {pageViewsData ? (
                <>
                  <Eye className="h-5 w-5" />
                  Top Content
                </>
              ) : (
                <>
                  <FolderOpen className="h-5 w-5" />
                  Top Categories
                </>
              )}
            </CardTitle>
            <CardDescription>
              {pageViewsData ? 'Most viewed content' : 'Most used content categories'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pageViewsData ? (
                // Show top posts if analytics data is available
                pageViewsData.topContent.posts.slice(0, 5).map((post, index) => (
                  <div key={post.slug} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium line-clamp-1">{post.title}</span>
                      <Badge variant="outline">{post.views} views</Badge>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ 
                          width: `${Math.min((post.views / pageViewsData.topContent.posts[0]?.views || 1) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : dashboardData ? (
                // Show categories if no analytics data
                dashboardData.analytics.topCategories.slice(0, 5).map((category, index) => (
                  <div key={category.slug} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">{category.postCount} posts</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full"
                        style={{ 
                          width: `${Math.min((category.postCount / (dashboardData.overview.totalPosts || 1)) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : null}
              
              {dashboardData && dashboardData.analytics.topCategories.length === 0 && !pageViewsData && (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">No categories yet</p>
                  <Button size="sm" asChild>
                    <a href="/dashboard/categories/new">Create your first category</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Page Views Analytics (if available) */}
      {pageViewsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Analytics Overview
            </CardTitle>
            <CardDescription>
              Website performance over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{pageViewsData.summary.totalViews}</div>
                <p className="text-sm text-blue-600">Total Views</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{pageViewsData.summary.uniqueVisitors}</div>
                <p className="text-sm text-green-600">Unique Visitors</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{pageViewsData.summary.viewedPosts}</div>
                <p className="text-sm text-purple-600">Posts Viewed</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">
                  {pageViewsData.trafficSources.referrers.length}
                </div>
                <p className="text-sm text-orange-600">Traffic Sources</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}