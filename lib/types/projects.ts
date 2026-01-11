export interface Project {
  id: number
  title: string
  slug: string
  description: string
  content: string
  image: string
  tags: string[]
  type: 'professional' | 'creative' | 'game'
  year?: number
  role?: string
  client?: string
  links?: {
    demo?: string
    github?: string
    external?: string
  }
  gallery?: string[]
}

export type ProjectType = 'professional' | 'creative' | 'game'