import { supabase } from '../supabase/client'
import type { AnalyticsStats, TimeSeriesData } from '../types/analytics'

export async function trackPageView(postId?: string, sessionId?: string, userId?: string) {
  const { error } = await supabase
    .from('page_views')
    .insert({
      post_id: postId,
      session_id: sessionId,
      user_id: userId,
      referrer: typeof window !== 'undefined' ? document.referrer : null,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : null,
    })

  if (error) console.error('Failed to track page view:', error)
}

export async function updateTimeOnPage(viewId: string, duration: number) {
  const { error } = await supabase
    .from('page_views')
    .update({ duration })
    .eq('id', viewId)

  if (error) console.error('Failed to update time on page:', error)
}

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const { data: viewsData } = await supabase
    .from('page_views')
    .select('id, session_id')

  const totalViews = viewsData?.length || 0
  const uniqueUsers = new Set(viewsData?.map((v: any) => v.session_id || v.user_id)).size

  const { data: timeData } = await supabase
    .from('page_views')
    .select('duration')
    .not('duration', 'is', null)

  const avgReadTime = timeData && timeData.length > 0
    ? Math.round(timeData.reduce((sum, v) => sum + (v.duration || 0), 0) / timeData.length)
    : 0

  const { data: topPostsData } = await supabase
    .from('page_views')
    .select('post_id, id')
    .not('post_id', 'is', null)

  const postViewCounts = topPostsData?.reduce((acc, pv) => {
    acc[pv.post_id] = (acc[pv.post_id] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  const postIds = Object.entries(postViewCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id)

  const { data: postsData } = await supabase
    .from('posts')
    .select('id, title')
    .in('id', postIds)

  const topPosts = (postsData || []).map(post => ({
    id: post.id,
    title: post.title,
    views: postViewCounts[post.id] || 0,
  }))

  return {
    totalViews,
    uniqueUsers,
    avgReadTime,
    topPosts,
  }
}

export async function getTimeSeriesData(days = 30): Promise<TimeSeriesData[]> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('page_views')
    .select('created_at')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) throw error

  const dailyViews: Record<string, number> = {}

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    dailyViews[dateStr] = 0
  }

  data?.forEach(view => {
    const date = new Date(view.created_at).toISOString().split('T')[0]
    if (dailyViews[date] !== undefined) {
      dailyViews[date]++
    }
  })

  return Object.entries(dailyViews).map(([date, views]) => ({ date, views }))
}