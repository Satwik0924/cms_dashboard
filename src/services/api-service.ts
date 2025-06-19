// src/services/api-service.ts - Fixed version

export const API_URL = "https://cmsapi.8views.net/api";

export class ApiService {
  static getHeaders(token: string | null = null) {
    return {
      "Content-Type": "application/json",
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    };
  }

  static async get(endpoint: string, params: Record<string, any> = {}, token: string | null = null) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      const url = `${API_URL}/${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      console.log(`Fetching from URL: ${url}`);
      console.log(`Using auth token: ${token ? 'Yes' : 'No'}`);
      
      const response = await fetch(url, {
        headers: this.getHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`Error in GET request to ${endpoint}:`, error);
      throw error;
    }
  }

  static async post(endpoint: string, data: any, token: string | null = null) {
    try {
      console.log(`Posting to ${endpoint} with data:`, data);
      console.log(`Using auth token: ${token ? 'Yes' : 'No'}`);
      
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(token),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`Response from POST ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`Error in POST request to ${endpoint}:`, error);
      throw error;
    }
  }

  static async put(endpoint: string, data: any, token: string | null = null) {
    try {
      console.log(`Putting to ${endpoint} with data:`, data);
      console.log(`Using auth token: ${token ? 'Yes' : 'No'}`);
      
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "PUT",
        headers: this.getHeaders(token),
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`Response from PUT ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`Error in PUT request to ${endpoint}:`, error);
      throw error;
    }
  }

  static async delete(endpoint: string, token: string | null = null) {
    try {
      console.log(`Deleting from ${endpoint}`);
      console.log(`Using auth token: ${token ? 'Yes' : 'No'}`);
      
      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`Response from DELETE ${endpoint}:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`Error in DELETE request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Category API endpoints
  static async getCategories(token: string | null = null) {
    try {
      console.log('Getting categories with token:', token ? 'Token provided' : 'No token');
      
      const response = await this.get('categories', {}, token);
      console.log('Raw categories response:', response);
      
      // The API returns a response in format: { success: true, categories: [...] }
      if (response && response.success && response.categories) {
        console.log(`Found ${response.categories.length} categories`);
        return response;
      } else if (response && Array.isArray(response)) {
        console.log(`Found ${response.length} categories in array format`);
        return { categories: response };
      }
      
      console.warn('Unexpected categories response format:', response);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return empty array to prevent UI breaking
      return { categories: [] };
    }
  }

  static async createCategory(categoryData: any, token: string | null = null) {
    return this.post('categories/add', categoryData, token);
  }

  static async getCategoryById(categoryId: string, token: string | null = null) {
    try {
      console.log(`Fetching category by ID: ${categoryId}`);

      // Make a GET request to the server
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        headers: this.getHeaders(token)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log(`Response from getCategoryById:`, data);

      return data;
    } catch (error) {
      console.error(`Error in GET request to get category by ID ${categoryId}:`, error);
      throw error;
    }
  }

  static async editCategory(categoryId: string, categoryData: any, token: string | null = null) {
    try {
      console.log(`Editing category with ID: ${categoryId}`, categoryData);
      
      const response = await fetch(`${API_URL}/categories/${categoryId}`, {
        method: "PUT",
        headers: this.getHeaders(token),
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`Category updated successfully:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`Error in PUT request to edit category ${categoryId}:`, error);
      throw error;
    }
  }

  static async deleteCategory(categoryId: string, token: string | null = null) {
    return this.delete(`categories/${categoryId}`, token);
  }

  // Tag API endpoints
  static async getTags(token: string | null = null, page = 1, limit = 10) {
    try {
      const response = await fetch(`${API_URL}/tags?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch tags');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error in getTags:', error);
      throw error;
    }
  }

  static async getAllTags(token: string | null = null) {
    try {
      console.log('Getting all tags for selection');
      
      // Use a high limit to get all tags in one request
      const response = await fetch(`${API_URL}/tags?page=1&limit=1000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch all tags');
      }
  
      const data = await response.json();
      console.log('All tags response:', data);
      
      // Return the tags array from the response
      if (data && data.success && data.tags) {
        return data.tags;
      } else if (data && Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.tags)) {
        return data.tags;
      }
      
      console.warn('Unexpected tags response format for getAllTags:', data);
      return [];
    } catch (error) {
      console.error('Error fetching all tags:', error);
      return []; // Return empty array to prevent UI errors
    }
  }

  static async getTagById(tagId: string, token: string | null = null) {
    try {
      console.log(`Getting tag by ID ${tagId} with token:`, token ? 'Token provided' : 'No token');
      
      const response = await this.get(`tags/${tagId}`, {}, token);
      console.log('Raw tag response:', response);
      
      return response;
    } catch (error) {
      console.error(`Error fetching tag by ID ${tagId}:`, error);
      throw error;
    }
  }

  static async createTag(tagData: any, token: string | null = null) {
    return this.post('tags/add', tagData, token);
  }

  static async editTag(tagId: string, tagData: any, token: string | null = null) {
    return this.put(`tags/${tagId}`, tagData, token);
  }

  static async deleteTag(tagId: string, token: string | null = null) {
    return this.delete(`tags/${tagId}`, token);
  }

  // Media API endpoints
  static async getMedia(params: Record<string, any> = {}, token: string | null = null) {
    try {
      console.log('Getting media with token:', token ? 'Token provided' : 'No token');
      console.log('Params:', params);
      
      const response = await this.get('media', params, token);
      console.log('Raw media response:', response);
      
      // Properly handle different response formats from the API
      if (response && response.success && response.media) {
        console.log(`Found ${response.media.length} media items`);
        return response;
      } else if (response && Array.isArray(response)) {
        console.log(`Found ${response.length} media items in array format`);
        return {
          success: true,
          media: response,
          page: params.page || 1,
          limit: params.limit || 20,
          totalItems: response.length,
          totalPages: 1
        };
      } else if (response && response.media === undefined) {
        // If the API returns a success response without media, create an empty array
        return {
          success: true,
          media: [],
          page: params.page || 1,
          limit: params.limit || 20,
          totalItems: 0,
          totalPages: 0
        };
      }
      
      console.warn('Unexpected media response format:', response);
      return {
        success: false,
        message: 'Invalid response format',
        media: []
      };
    } catch (error) {
      console.error('Error fetching media:', error);
      // Return empty array to prevent UI breaking
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        media: []
      };
    }
  }

  static async getMediaById(mediaId: string, token: string | null = null) {
    try {
      console.log(`Getting media by ID ${mediaId} with token:`, token ? 'Token provided' : 'No token');
      
      // Make a GET request to the specific endpoint for a single media item
      const response = await this.get(`media/${mediaId}`, {}, token);
      console.log('Raw media by ID response:', response);
      
      // Handle the response format - the API returns { success: true, media: {...} }
      if (response && response.success && response.media) {
        console.log('Found media item:', response.media);
        return response;
      } else if (response && !response.success) {
        console.warn('API returned unsuccessful response:', response);
        return {
          success: false,
          message: response.message || 'Failed to retrieve media',
          media: null
        };
      } else if (response && typeof response === 'object' && !response.media) {
        // If the API returns the media object directly instead of wrapped
        console.log('Found media item in direct response format');
        return {
          success: true,
          media: response
        };
      }
      
      console.warn('Unexpected media response format:', response);
      return {
        success: false,
        message: 'Invalid response format',
        media: null
      };
    } catch (error) {
      console.error(`Error fetching media by ID ${mediaId}:`, error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        media: null
      };
    }
  }



  static async deleteMedia(mediaId: string, token: string | null = null) {
    return this.delete(`media/${mediaId}`, token);
  }

  static async uploadMedia(file: File, token: string | null = null) {
    try {
      // Create form data for the API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', file.name);
      formData.append('fileType', file.type);
      formData.append('fileSize', file.size.toString());
      formData.append('altText', file.name); // Use filename as default alt text
      
      console.log(`Uploading file: ${file.name} (${file.type}, ${file.size} bytes)`);
      
      const response = await fetch(`${API_URL}/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type here, the browser will set it with the boundary
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }));
        throw new Error(errorData.message || `API request failed with status ${response.status}`);
      }

      const responseData = await response.json();
      console.log(`Media upload response:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`Error in media upload:`, error);
      throw error;
    }
  }

  // Post API endpoints
  static async getPosts(params: Record<string, any> = {}, token: string | null = null) {
    try {
      const response = await this.get('posts', params, token);
      
      // Handle potential different response formats
      if (response && response.success && response.posts) {
        return response;
      } else if (response && Array.isArray(response)) {
        return { posts: response };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [] };
    }
  }

  static async getPostBySlug(slug: string, token: string | null = null) {
    try {
      console.log(`Getting post by slug ${slug} with token:`, token ? 'Token provided' : 'No token');
      
      const response = await this.get(`posts/slug/${slug}`, {}, token);
      console.log('Raw post by slug response:', response);
      
      // Process the response to ensure categories and tags are properly formatted
      if (response) {
        // If categories exist and are objects, ensure they have id property
        if (response.categories && Array.isArray(response.categories)) {
          // Normalize categories to include id consistently
          response.categories = response.categories.map(cat => {
            if (typeof cat === 'object' && cat !== null) {
              // Ensure each category has an id property
              return {
                ...cat,
                id: cat.id || cat._id || cat.categoryId
              };
            }
            // If it's just a string ID, convert to object with id
            return { id: cat, name: "Unknown", slug: "" };
          });
        }
        
        // If tags exist and are objects, ensure they have id property
        if (response.tags && Array.isArray(response.tags)) {
          // Normalize tags to include id consistently
          response.tags = response.tags.map(tag => {
            if (typeof tag === 'object' && tag !== null) {
              // Ensure each tag has an id property
              return {
                ...tag,
                id: tag.id || tag._id || tag.tagId
              };
            }
            // If it's just a string ID, convert to object with id
            return { id: tag, name: "Unknown", slug: "" };
          });
        }
        
        console.log('Processed post response with normalized categories/tags:', {
          categoriesCount: response.categories?.length || 0,
          tagsCount: response.tags?.length || 0
        });
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching post by slug ${slug}:`, error);
      throw error;
    }
  }

  static async createPost(postData: any, token: string | null = null) {
    console.log('Creating post with data:', postData);
    
    // Format the data to match the expected API structure
    const apiPostData = {
      postTitle: postData.postTitle,
      postContent: postData.postContent,
      postExcerpt: postData.postExcerpt,
      customSlug: postData.customSlug || undefined,
      postStatus: postData.postStatus || 'draft',
      categories: postData.categories || [],
      tags: postData.tags || [],
      featuredMediaId: postData.featuredMediaId,
      allowIndexing: postData.allowIndexing !== undefined ? postData.allowIndexing : true,
      scheduledPublishDate: postData.scheduledPublishDate,
      seoMetadata: {
        title: postData.seoMetadata?.title || postData.postTitle,
        description: postData.seoMetadata?.description || postData.postExcerpt,
        canonicalUrl: postData.seoMetadata?.canonicalUrl || '',
        focusKeyword: postData.seoMetadata?.focusKeyword || ''
      }
    };
    
    try {
      console.log('Sending post data to API:', apiPostData);
      const result = await ApiService.post('posts/upload', apiPostData, token);
      console.log('Post created successfully:', result);
      return result;
    } catch (error) {
      console.error('Error creating post:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create post');
    }
  }
  
// Fixed editPost method in src/services/api-service.ts

// Updated editPost method for src/services/api-service.ts

// Updated ApiService.editPost method to handle focus keywords properly

static async editPost(postId: string, postData: any, token: string | null = null) {
  console.log(`Editing post ${postId} with data:`, postData);
  
  // Map frontend field names to backend field names based on your API structure
  const apiPostData: Record<string, any> = {};

  // Basic post fields mapping
  if (postData.postTitle !== undefined) apiPostData.title = postData.postTitle;
  if (postData.postContent !== undefined) apiPostData.content = postData.postContent;
  if (postData.postExcerpt !== undefined) apiPostData.excerpt = postData.postExcerpt;
  if (postData.customSlug !== undefined) apiPostData.customSlug = postData.customSlug;
  if (postData.postStatus !== undefined) apiPostData.status = postData.postStatus;
  if (postData.allowIndexing !== undefined) apiPostData.allowIndexing = postData.allowIndexing;
  if (postData.scheduledPublishDate !== undefined) apiPostData.scheduledPublishDate = postData.scheduledPublishDate;

  if (postData.videoId !== undefined) {
  apiPostData.videoId = postData.videoId;
}
  
  // Handle categories - only include if they exist and are arrays with content
  if (postData.categories && Array.isArray(postData.categories) && postData.categories.length > 0) {
    apiPostData.categories = postData.categories;
  }
  
  // Handle tags - only include if they exist and are arrays with content
  if (postData.tags && Array.isArray(postData.tags) && postData.tags.length > 0) {
    apiPostData.tags = postData.tags;
  }
  
  // Handle featured image - map to the format expected by backend
  if (postData.featuredMediaId !== undefined && postData.featuredMediaId !== "") {
    apiPostData.featuredImage = postData.featuredMediaId;
  }
  
  // Handle video ID
  if (postData.videoId !== undefined) {
    apiPostData.videoId = postData.videoId;
  }
  
  // Handle SEO metadata - map to individual fields as expected by backend
  if (postData.seoMetadata) {
    const seo = postData.seoMetadata;
    
    if (seo.title !== undefined) apiPostData.metaTitle = seo.title;
    if (seo.description !== undefined) apiPostData.metaDescription = seo.description;
    if (seo.canonicalUrl !== undefined) apiPostData.canonicalUrl = seo.canonicalUrl;
    if (seo.focusKeyword !== undefined) apiPostData.focusKeyword = seo.focusKeyword;
    
    // OpenGraph fields
    if (seo.ogTitle !== undefined) apiPostData.ogTitle = seo.ogTitle;
    if (seo.ogDescription !== undefined) apiPostData.ogDescription = seo.ogDescription;
    if (seo.ogImageId !== undefined) apiPostData.ogImageId = seo.ogImageId;
    
    // Twitter fields
    if (seo.twitterTitle !== undefined) apiPostData.twitterTitle = seo.twitterTitle;
    if (seo.twitterDescription !== undefined) apiPostData.twitterDescription = seo.twitterDescription;
    if (seo.twitterImageId !== undefined) apiPostData.twitterImageId = seo.twitterImageId;
  }
  
  console.log('Final API payload for post update:', apiPostData);
  
  try {
    const result = await ApiService.put(`posts/${postId}`, apiPostData, token);
    console.log('Post updated successfully:', result);
    return result;
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        throw new Error('Validation failed: Please check that all required fields are filled correctly');
      } else if (error.message.includes('categories')) {
        throw new Error('Invalid categories selected. Please check category selections.');
      } else if (error.message.includes('tags')) {
        throw new Error('Invalid tags selected. Please check tag selections.');
      } else {
        throw new Error(error.message);
      }
    }
    
    throw new Error('Failed to update post. Please try again.');
  }
}
  
  static async deletePost(postId: string, token: string | null = null) {
    return this.delete(`posts/${postId}`, token);
  }

  // User API endpoints
  static async getAllUsers(token: string | null = null) {
    try {
      console.log('Getting users with token:', token ? 'Token provided' : 'No token');
      
      const response = await this.get('users', {}, token);
      console.log('Raw users response:', response);
      
      // Return the response in expected format
      if (response && response.success && response.users) {
        console.log(`Found ${response.users.length} users`);
        return response;
      } else if (response && Array.isArray(response)) {
        console.log(`Found ${response.length} users in array format`);
        return { users: response };
      }
      
      console.warn('Unexpected users response format:', response);
      return response;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [] };
    }
  }

  static async getUserById(userId: string, token: string | null = null) {
    try {
      const response = await this.get(`users/${userId}`, {}, token);
      
      // Return the response in expected format
      if (response && response.success && response.user) {
        return response;
      }
      
      console.warn('Unexpected user response format:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  }

 static async generateBlogContent(inputData: {
  inputContent: string;
  tone?: string;
  targetAudience?: string;
  contentType?: string;
  includeVideo?: boolean;  // Add this parameter
  videoTopic?: string;     // Add this parameter
}, token: string | null = null) {
  try {
    console.log('Generating AI blog content with data:', inputData);
    
    const response = await this.post('ai/generate-blog', inputData, token);
    
    if (response && response.success) {
      console.log('AI blog content generated successfully');
      return response;
    } else {
      throw new Error(response?.message || 'Failed to generate blog content');
    }
  } catch (error) {
    console.error('Error generating AI blog content:', error);
    throw error;
  }
}

  static async updateUser(userId: string, userData: any, token: string | null = null) {
    return this.put(`users/${userId}`, userData, token);
  }

  static async deleteUser(userId: string, token: string | null = null) {
    return this.delete(`users/${userId}`, token);
  }

static async getClientInfo(token: string | null = null) {
  try {
    console.log('Getting client info with token:', token ? 'Token provided' : 'No token');
    
    const response = await this.get('client/info', {}, token);
    console.log('Raw client info response:', response);
    
    if (response && response.success && response.data) {
      console.log('Client info retrieved successfully');
      return response;
    } else if (response && !response.success) {
      console.warn('API returned unsuccessful response:', response);
      throw new Error(response.message || 'Failed to retrieve client information');
    }
    
    console.warn('Unexpected client info response format:', response);
    return response;
  } catch (error) {
    console.error('Error fetching client info:', error);
    throw error;
  }
}

static async updateClientInfo(clientData: any, token: string | null = null) {
  try {
    console.log('Updating client info with data:', clientData);
    
    const response = await this.put('client/info', clientData, token);
    
    if (response && response.success) {
      console.log('Client info updated successfully');
      return response;
    } else {
      throw new Error(response?.message || 'Failed to update client information');
    }
  } catch (error) {
    console.error('Error updating client info:', error);
    throw error;
  }
}

static async getDashboardStats(token: string | null = null) {
  try {
    console.log('Getting dashboard stats with token:', token ? 'Token provided' : 'No token');
    
    const response = await this.get('dashboard/stats', {}, token);
    console.log('Raw dashboard stats response:', response);
    
    if (response && response.success && response.data) {
      console.log('Dashboard stats retrieved successfully');
      return response;
    } else if (response && !response.success) {
      console.warn('API returned unsuccessful response:', response);
      throw new Error(response.message || 'Failed to retrieve dashboard statistics');
    }
    
    console.warn('Unexpected dashboard stats response format:', response);
    return response;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

static async getPageViewsAnalytics(params: Record<string, any> = {}, token: string | null = null) {
  try {
    console.log('Getting page views analytics with params:', params);
    console.log('Using auth token:', token ? 'Token provided' : 'No token');
    
    // Set default parameters
    const defaultParams = {
      days: 30,
      groupBy: 'day'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    const response = await this.get('analytics/page-views', queryParams, token);
    console.log('Raw page views analytics response:', response);
    
    if (response && response.success && response.data) {
      console.log('Page views analytics retrieved successfully');
      return response;
    } else if (response && !response.success) {
      console.warn('API returned unsuccessful response:', response);
      throw new Error(response.message || 'Failed to retrieve page views analytics');
    }
    
    console.warn('Unexpected page views analytics response format:', response);
    return response;
  } catch (error) {
    console.error('Error fetching page views analytics:', error);
    throw error;
  }
}

// Track Page View API
static async trackPageView(data: {
  postSlug?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  pageUrl?: string;
}, token: string | null = null) {
  try {
    console.log('Tracking page view with data:', data);
    
    const trackingData = {
      postSlug: data.postSlug || null,
      referrer: data.referrer || document.referrer || '',
      userAgent: data.userAgent || navigator.userAgent || '',
      ipAddress: data.ipAddress || '', // Will be determined by server
      pageUrl: data.pageUrl || window.location.href || ''
    };
    
    const response = await this.post('analytics/track', trackingData, token);
    
    if (response && response.success) {
      console.log('Page view tracked successfully');
      return response;
    } else {
      console.warn('Failed to track page view:', response);
      // Don't throw error for tracking failures to avoid disrupting user experience
      return { success: false, message: 'Failed to track page view' };
    }
  } catch (error) {
    console.error('Error tracking page view:', error);
    // Don't throw error for tracking failures
    return { success: false, message: 'Error tracking page view' };
  }
}

}