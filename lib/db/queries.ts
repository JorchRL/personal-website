import { supabase } from '../supabase/client'
import type { Post, Category } from '../types/posts'

export async function getPosts(limit = 10, offset = 0, category?: string) {
  let query = supabase
    .from('posts')
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        icon,
        color
      ),
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (category) {
    query = query.eq('categories.slug', category)
  }

  const { data, error } = await query

  if (error) throw error
  return data as (Post & { categories: Category })[]
}

export async function getPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      categories (
        id,
        name,
        slug,
        icon,
        color
      ),
      profiles (
        username,
        avatar_url
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) throw error
  return data as Post & { categories: Category }
}

export async function getFeaturedPosts(limit = 3) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Post[]
}

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as Category[]
}

export async function searchPosts(query: string, limit = 10) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Post[]
}

export async function getRelatedPosts(postId: string, categoryId?: string, limit = 3) {
  let query = supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Post[]
}