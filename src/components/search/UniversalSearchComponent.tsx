import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Filter, Loader2, FileText, FolderOpen, Tag, Calendar, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { ApiService } from '@/services/api-service';
import { toast } from 'sonner';

interface SearchResult {
  id: string;
  title: string;
  type: 'post' | 'category' | 'tag';
  excerpt?: string;
  slug?: string;
  status?: string;
  createdAt?: string;
  author?: string;
  postCount?: number;
}

interface SearchComponentProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  searchTypes?: ('post' | 'category' | 'tag')[];
  showFilters?: boolean;
  className?: string;
}

const UniversalSearchComponent = ({
  onResultSelect,
  placeholder = "Search posts, categories, and tags...",
  searchTypes = ['post', 'category', 'tag'],
  showFilters = true,
  className = ""
}: SearchComponentProps) => {
  const { token } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all' as 'all' | 'post' | 'category' | 'tag',
    status: 'all' as 'all' | 'published' | 'draft' | 'archived',
    dateRange: 'all' as 'all' | 'week' | 'month' | 'year'
  });
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchContent = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const searchPromises = [];
      const allResults: SearchResult[] = [];

      // Search Posts
      if (searchTypes.includes('post')) {
        const postsPromise = ApiService.getPosts({
          search: searchQuery,
          limit: 10,
          status: filters.status === 'all' ? undefined : filters.status
        }, token).then(response => {
          if (response?.posts) {
            return response.posts.map((post: any) => ({
              id: post.id,
              title: post.title,
              type: 'post' as const,
              excerpt: post.excerpt || '',
              slug: post.slug,
              status: post.status,
              createdAt: post.createdAt || post.publishedAt,
              author: post.author?.username || 'Unknown'
            }));
          }
          return [];
        }).catch(() => []);
        
        searchPromises.push(postsPromise);
      }

      // Search Categories
      if (searchTypes.includes('category')) {
        const categoriesPromise = ApiService.getCategories(token).then(response => {
          if (response?.categories) {
            return response.categories
              .filter((cat: any) => 
                cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, 5)
              .map((category: any) => ({
                id: category.id,
                title: category.name,
                type: 'category' as const,
                excerpt: category.description || '',
                slug: category.slug,
                postCount: category.postCount || 0
              }));
          }
          return [];
        }).catch(() => []);
        
        searchPromises.push(categoriesPromise);
      }

      // Search Tags
      if (searchTypes.includes('tag')) {
        const tagsPromise = ApiService.getAllTags(token).then(response => {
          if (Array.isArray(response)) {
            return response
              .filter((tag: any) => 
                tag.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, 5)
              .map((tag: any) => ({
                id: tag.id,
                title: tag.name,
                type: 'tag' as const,
                slug: tag.slug,
                postCount: tag.postCount || 0
              }));
          }
          return [];
        }).catch(() => []);
        
        searchPromises.push(tagsPromise);
      }

      const searchResults = await Promise.all(searchPromises);
      const combinedResults = searchResults.flat();

      // Apply type filter
      const filteredResults = filters.type === 'all' 
        ? combinedResults 
        : combinedResults.filter(result => result.type === filters.type);

      // Apply date filter for posts
      const dateFilteredResults = filters.dateRange === 'all' 
        ? filteredResults 
        : filteredResults.filter(result => {
            if (result.type !== 'post' || !result.createdAt) return true;
            
            const resultDate = new Date(result.createdAt);
            const now = new Date();
            const daysDiff = Math.floor((now.getTime() - resultDate.getTime()) / (1000 * 60 * 60 * 24));
            
            switch (filters.dateRange) {
              case 'week': return daysDiff <= 7;
              case 'month': return daysDiff <= 30;
              case 'year': return daysDiff <= 365;
              default: return true;
            }
          });

      setResults(dateFilteredResults);
      setIsOpen(true);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTypes, filters, token]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchContent(query);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchContent]);

  const handleResultClick = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation behavior
      switch (result.type) {
        case 'post':
          window.location.href = `/dashboard/posts/${result.slug}`;
          break;
        case 'category':
          window.location.href = `/dashboard/categories/edit/${result.id}`;
          break;
        case 'tag':
          window.location.href = `/dashboard/tags/edit/${result.id}`;
          break;
      }
    }
    setIsOpen(false);
    setQuery('');
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      status: 'all',
      dateRange: 'all'
    });
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'post': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'category': return <FolderOpen className="h-4 w-4 text-green-500" />;
      case 'tag': return <Tag className="h-4 w-4 text-purple-500" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const hasActiveFilters = filters.type !== 'all' || filters.status !== 'all' || filters.dateRange !== 'all';

  return (
    <div ref={searchRef} className={`relative w-full  ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className="pl-10 pr-20"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          
          {showFilters && (
            <Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`h-6 w-6 p-0 ${hasActiveFilters ? 'text-blue-600' : 'text-gray-400'}`}
                >
                  <Filter className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">Search Filters</h3>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="h-6 text-xs"
                      >
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Content Type</label>
                      <Select
                        value={filters.type}
                        onValueChange={(value: any) => setFilters({...filters, type: value})}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {searchTypes.includes('post') && <SelectItem value="post">Posts</SelectItem>}
                          {searchTypes.includes('category') && <SelectItem value="category">Categories</SelectItem>}
                          {searchTypes.includes('tag') && <SelectItem value="tag">Tags</SelectItem>}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {searchTypes.includes('post') && (
                      <>
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Post Status</label>
                          <Select
                            value={filters.status}
                            onValueChange={(value: any) => setFilters({...filters, status: value})}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Status</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">Date Range</label>
                          <Select
                            value={filters.dateRange}
                            onValueChange={(value: any) => setFilters({...filters, dateRange: value})}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Time</SelectItem>
                              <SelectItem value="week">Last Week</SelectItem>
                              <SelectItem value="month">Last Month</SelectItem>
                              <SelectItem value="year">Last Year</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <Card className="absolute top-full left-0 right-0 mt-1 max-h-96 overflow-y-auto z-50 shadow-lg border">
          <CardContent className="p-0">
            {results.length === 0 && !isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No results found for "{query}"</p>
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="py-2">
                {results.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getResultIcon(result.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {result.title}
                          </h4>
                          <Badge variant="outline" className="text-xs capitalize">
                            {result.type}
                          </Badge>
                          {result.status && (
                            <Badge className={`text-xs ${getStatusBadgeColor(result.status)}`}>
                              {result.status}
                            </Badge>
                          )}
                        </div>
                        
                        {result.excerpt && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {result.excerpt}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          {result.author && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {result.author}
                            </span>
                          )}
                          {result.createdAt && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(result.createdAt)}
                            </span>
                          )}
                          {result.postCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {result.postCount} posts
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Header Search Component for Dashboard
const HeaderSearchComponent = () => {
  const handleResultSelect = (result: SearchResult) => {
    // Navigate based on result type
    switch (result.type) {
      case 'post':
        if (result.slug) {
          window.location.href = `/dashboard/posts/${result.slug}`;
        }
        break;
      case 'category':
        window.location.href = `/dashboard/categories/edit/${result.id}`;
        break;
      case 'tag':
        window.location.href = `/dashboard/tags/edit/${result.id}`;
        break;
    }
  };

  return (
    <UniversalSearchComponent
      onResultSelect={handleResultSelect}
      placeholder="Search content..."
      searchTypes={['post', 'category', 'tag']}
      showFilters={true}
      className="w-full max-w-sm"
    />
  );
};

// Quick Search for specific pages
const PostsSearchComponent = ({ onFilter }: { onFilter?: (results: SearchResult[]) => void }) => {
  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'post') {
      window.location.href = `/dashboard/posts/edit/${result.id}`;
    }
  };

  return (
    <UniversalSearchComponent
      onResultSelect={handleResultSelect}
      placeholder="Search posts..."
      searchTypes={['post']}
      showFilters={true}
      className="w-full"
    />
  );
};

const CategoriesSearchComponent = ({ onFilter }: { onFilter?: (results: SearchResult[]) => void }) => {
  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'category') {
      window.location.href = `/dashboard/categories/edit/${result.id}`;
    }
  };

  return (
    <UniversalSearchComponent
      onResultSelect={handleResultSelect}
      placeholder="Search categories..."
      searchTypes={['category']}
      showFilters={false}
      className="w-full"
    />
  );
};

const TagsSearchComponent = ({ onFilter }: { onFilter?: (results: SearchResult[]) => void }) => {
  const handleResultSelect = (result: SearchResult) => {
    if (result.type === 'tag') {
      window.location.href = `/dashboard/tags/edit/${result.id}`;
    }
  };

  return (
    <UniversalSearchComponent
      onResultSelect={handleResultSelect}
      placeholder="Search tags..."
      searchTypes={['tag']}
      showFilters={false}
      className="w-full"
    />
  );
};

export default UniversalSearchComponent;
export {
  HeaderSearchComponent,
  PostsSearchComponent,
  CategoriesSearchComponent,
  TagsSearchComponent
};