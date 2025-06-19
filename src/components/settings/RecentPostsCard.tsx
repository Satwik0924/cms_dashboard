// src/components/settings/RecentPostsCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface RecentPost {
  id: string;
  title: string;
  status: string;
  createdAt?: string;
}

interface RecentActivity {
  recentPosts: RecentPost[];
}

interface RecentPostsCardProps {
  recentActivity: RecentActivity;
}

export default function RecentPostsCard({ recentActivity }: RecentPostsCardProps) {
  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-900">
          <Calendar className="h-5 w-5" />
          Recent Posts
        </CardTitle>
        <CardDescription className="text-orange-700">
          Latest content activity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentActivity.recentPosts && recentActivity.recentPosts.length > 0 ? (
          recentActivity.recentPosts.map((post) => (
            <div key={post.id} className="p-3 bg-white/70 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900 text-sm leading-tight mb-2">{post.title}</h4>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={post.status === 'published' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {post.status}
                </Badge>
                {post.createdAt && (
                  <span className="text-xs text-orange-600">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-orange-600 text-sm text-center py-4">No recent posts</p>
        )}
      </CardContent>
    </Card>
  );
}