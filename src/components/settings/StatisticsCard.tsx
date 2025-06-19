// src/components/settings/StatisticsCard.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Activity,
  Users,
  FileText,
  Image,
  FolderOpen,
  Tag
} from 'lucide-react';

interface Statistics {
  users: { total: number };
  posts: { total: number; published: number; draft: number; archived: number };
  media: { total: number };
  taxonomy: { categories: number; tags: number };
}

interface StatisticsCardProps {
  statistics: Statistics;
}

export default function StatisticsCard({ statistics }: StatisticsCardProps) {
  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Activity className="h-5 w-5" />
          Statistics
        </CardTitle>
        <CardDescription className="text-purple-700">
          Overview of your content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-800">Users</span>
          </div>
          <span className="font-semibold text-purple-900">{statistics.users.total}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-800">Total Posts</span>
          </div>
          <span className="font-semibold text-purple-900">{statistics.posts.total}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-green-100 rounded">
            <div className="font-semibold text-green-800">{statistics.posts.published}</div>
            <div className="text-green-600">Published</div>
          </div>
          <div className="text-center p-2 bg-yellow-100 rounded">
            <div className="font-semibold text-yellow-800">{statistics.posts.draft}</div>
            <div className="text-yellow-600">Draft</div>
          </div>
          <div className="text-center p-2 bg-gray-100 rounded">
            <div className="font-semibold text-gray-800">{statistics.posts.archived}</div>
            <div className="text-gray-600">Archived</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-800">Media Files</span>
          </div>
          <span className="font-semibold text-purple-900">{statistics.media.total}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-800">Categories</span>
          </div>
          <span className="font-semibold text-purple-900">{statistics.taxonomy.categories}</span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-800">Tags</span>
          </div>
          <span className="font-semibold text-purple-900">{statistics.taxonomy.tags}</span>
        </div>
      </CardContent>
    </Card>
  );
}