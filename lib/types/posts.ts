export interface Post {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  cover_image?: string
  category_id?: string
  author_id?: string
  interactive_type?: 'none' | 'particle' | 'geometric' | 'audio' | 'custom'
  interactive_config?: Record<string, any>
  status: 'draft' | 'published' | 'archived'
  published_at?: string
  updated_at?: string
  meta_title?: string
  meta_description?: string
  read_time?: number
  tags?: string[]
  featured?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  order_index?: number
}

export interface Comment {
  id: string
  post_id: string
  user_id?: string
  parent_id?: string
  author_name?: string
  author_email?: string
  content: string
  status: 'pending' | 'published' | 'spam' | 'deleted'
  created_at: string
  updated_at?: string
  likes_count?: number
  replies?: Comment[]
}

export interface Profile {
  id: string
  username?: string
  avatar_url?: string
  bio?: string
  website?: string
  role: 'reader' | 'author' | 'admin'
  created_at: string
}

export interface PageView {
  id: string
  post_id?: string
  session_id?: string
  user_id?: string
  referrer?: string
  user_agent?: string
  duration?: number
  created_at: string
}

export interface ContactSubmission {
  id: string
  form_type: 'hiring' | 'collaboration' | 'networking'
  name: string
  email: string
  form_data: Record<string, any>
  status: 'new' | 'replied' | 'archived'
  created_at: string
}

export interface InteractiveScene {
  id: string
  post_id: string
  scene_type: 'custom'
  code: string
  dependencies: Record<string, string>
  created_at: string
}