// Post related types
export interface Post {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  published: boolean;
  slug: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  authorId: string;
  author?: PostAuthor;
  tags?: PostTag[];
}

export interface PostAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  createdAt: Date;
}

export interface PostTag {
  postId: string;
  tagId: string;
  tag: Tag;
}

export interface PostListItem {
  id: string;
  title: string;
  excerpt: string | null;
  published: boolean;
  slug: string;
  viewCount: number;
  createdAt: Date;
  publishedAt: Date | null;
  author: PostAuthor;
  tags?: Tag[];
}

export interface PostDetail extends Omit<Post, "tags"> {
  author: PostAuthor;
  tags?: Tag[];
}
