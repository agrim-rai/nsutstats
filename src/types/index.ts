export interface User {
  _id: string;
  username: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  richContent?: any; // Tiptap JSON content
  excerpt: string;
  author: User;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  featuredImage?: string;
  attachments?: Attachment[];
  readTime: number;
  views: number;
  likes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  post: string;
  parentComment?: string;
  likes: string[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  category: string;
  count: number;
}

export interface Tag {
  tag: string;
  count: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: Pagination;
}

export interface CategoriesResponse {
  categories: Category[];
}

export interface TagsResponse {
  tags: Tag[];
}
