import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  company: z.string().optional(),
  position: z.string().optional(),
  jobType: z.enum(['full-time', 'contract', 'freelance']).optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  techStack: z.string().optional(),
  projectType: z.string().optional(),
  currentStage: z.string().optional(),
  topic: z.string().optional(),
  twitter: z.string().optional(),
  linkedin: z.string().optional(),
})

export const hiringFormSchema = contactFormSchema.extend({
  company: z.string().min(2, 'Company name is required'),
  position: z.string().min(2, 'Position title is required'),
  jobType: z.enum(['full-time', 'contract', 'freelance']),
})

export const collaborationFormSchema = contactFormSchema.extend({
  projectType: z.string().min(2, 'Project type is required'),
})

export const networkingFormSchema = contactFormSchema

export const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().optional(),
  cover_image: z.string().url().optional().or(z.literal('')),
  category_id: z.string().uuid().optional(),
  interactive_type: z.enum(['none', 'particle', 'geometric', 'audio', 'custom']),
  interactive_config: z.record(z.string(), z.any()).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
})

export const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  author_name: z.string().min(2, 'Name is required'),
  author_email: z.string().email('Invalid email address').optional(),
})