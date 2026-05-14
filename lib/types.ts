export interface ReadableArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  imageUrl: string;
  audioUrl?: string | null;
  readCount: number;
  createdAt: string;
  slug?: string;
  isChildCorner?: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  imageUrl: string;
  audioUrl?: string;
  readCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleInput {
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  imageUrl?: string;
  audioUrl?: string;
  createdAt?: string;
}

export interface BlogPost extends ReadableArticle {
  isChildCorner: boolean;
}

export interface BlogPostInput {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  isChildCorner?: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  imageUrl: string;
  pdfUrl?: string | null;
  description?: string | null;
}

export interface BookInput {
  title: string;
  author: string;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  description?: string | null;
}

export interface Video {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  categorySlug: string;
  isYouTube: boolean;
  createdAt: string;
}

export interface VideoInput {
  title: string;
  url: string;
  imageUrl?: string | null;
  categorySlug: string;
  isYouTube?: boolean;
}

export interface PaginatedResult<T> {
  results: T[];
  totalItems: number;
}

export interface SearchResult {
  blogPosts: BlogPost[];
  books: Book[];
  videos: Video[];
}
