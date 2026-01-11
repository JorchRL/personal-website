import { supabase } from '../supabase/client'
import type { Comment } from '../types/posts'

export async function getComments(postId: string) {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .eq('status', 'published')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Comment[]
}

export async function addComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'status' | 'likes_count'>) {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      ...comment,
      status: 'pending',
      likes_count: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data as Comment
}

export async function likeComment(commentId: string) {
  const { data, error } = await supabase.rpc('like_comment', { comment_id: commentId })
  if (error) throw error
  return data
}