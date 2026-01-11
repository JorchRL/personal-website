export interface AnalyticsStats {
  totalViews: number
  uniqueUsers: number
  avgReadTime: number
  topPosts: Array<{
    id: string
    title: string
    views: number
  }>
}

export interface TimeSeriesData {
  date: string
  views: number
}