'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// This is a simplified version - in a real app, you'd fetch this data from an API
const projects = [
  {
    id: 1,
    title: 'Minimalist E-commerce',
    slug: 'minimalist-ecommerce',
    description: 'A clean, elegant online store built with a focus on simplicity and user experience.',
    image: '/images/projects/minimalist-ecommerce.jpg',
    tags: ['React', 'NextJS', 'Monochrome Design'],
    content: 'This minimalist e-commerce platform focuses on delivering a clean, intuitive shopping experience with careful attention to typography and whitespace. The design eliminates distractions, allowing products to take center stage, while subtle animations enhance interactivity without overwhelming the user.'
  },
  {
    id: 2,
    title: 'AI Content Studio',
    slug: 'ai-content-studio',
    description: 'An AI-powered application that generates content with a sleek, modern interface.',
    image: '/images/projects/ai-content-studio.jpg',
    tags: ['React', 'AI', 'Black & White'],
    content: 'The AI Content Studio combines cutting-edge artificial intelligence with a clean, monochromatic user interface. This application allows users to generate various types of content—from marketing copy to creative writing—with intuitive controls and real-time editing capabilities.'
  },
  {
    id: 3,
    title: 'Brutalist Portfolio',
    slug: 'brutalist-portfolio',
    description: 'A stark, high-contrast portfolio site with bold typography and minimal color.',
    image: '/images/projects/brutalist-portfolio.jpg',
    tags: ['HTML', 'CSS', 'Brutalism'],
    content: 'This portfolio embraces brutalist web design principles with raw HTML/CSS implementations, stark typography, and intentionally minimal styling. The high-contrast visuals and asymmetrical layouts create a memorable viewing experience that stands apart from conventional portfolio designs.'
  },
  {
    id: 4,
    title: 'Monochrome Dashboard',
    slug: 'monochrome-dashboard',
    description: 'A sophisticated admin dashboard with a black and white color scheme and clean typography.',
    image: '/images/projects/monochrome-dashboard.jpg',
    tags: ['React', 'Monochrome', 'Dashboard'],
    content: 'The Monochrome Dashboard provides data visualization and system management tools in an elegant black and white interface. This project focuses on information hierarchy and readability, using subtle variations in grayscale to indicate relationships between data points and interface elements.'
  },
  {
    id: 5,
    title: 'Typography Magazine',
    slug: 'typography-magazine',
    description: 'A digital magazine focusing on beautiful typography and minimalist design principles.',
    image: '/images/projects/typography-magazine.jpg',
    tags: ['NextJS', 'Typography', 'Editorial'],
    content: 'This digital publication celebrates typography as both an art form and communication tool. The responsive design adapts seamlessly across devices while maintaining careful attention to font pairings, line heights, and spacing. Articles feature immersive reading experiences with dynamic layouts that honor the text\'s content.'
  },
  {
    id: 6,
    title: 'Architect Showcase',
    slug: 'architect-showcase',
    description: 'A portfolio site for an architecture firm with elegant, spacious layouts.',
    image: '/images/projects/architect-showcase.jpg',
    tags: ['Three.js', 'Architecture', 'Minimalism'],
    content: 'The Architect Showcase features interactive 3D models and immersive photography of architectural projects. The site employs generous negative space and restrained typography that reflects the firm\'s design philosophy. Three.js powers subtle animations and spatial visualizations that enhance the presentation of physical structures.'
  },
]

export default function ProjectPage() {
  const params = useParams();
  const slugParam = typeof params.slug === 'string' ? params.slug : '';
  
  const [project, setProject] = useState<typeof projects[0] | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // In a real app, this would be an API call
    const foundProject = projects.find(p => p.slug === slugParam)
    if (foundProject) {
      setProject(foundProject)
    }
    setIsLoading(false)
  }, [slugParam])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-5 h-5 border-t border-white rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Project not found</h2>
          <Link href="/" className="text-white/70 hover:text-white underline">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <div className="h-screen w-full relative">
        <div className="absolute inset-0">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover"
            priority
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
        </div>
        
        <motion.div 
          className="absolute inset-0 flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="container mx-auto px-8 pb-32">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-5xl md:text-6xl font-light text-white mb-6"
            >
              {project.title}
            </motion.h1>
            
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 120, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="w-24 h-[1px] bg-white/30 mb-8"
            />
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-xl text-white/80 max-w-xl mb-8"
            >
              {project.description}
            </motion.p>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="flex flex-wrap gap-3"
            >
              {project.tags.map(tag => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-white/10 text-white/90 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* Content Section */}
      <motion.div
        className="bg-[#0A0A0A] py-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.0 }}
      >
        <div className="container mx-auto px-8">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-white/80 text-lg leading-relaxed mb-12">
              {project.content}
            </p>
            
            <div className="flex justify-between items-center pt-12 border-t border-white/10">
              <Link
                href="/#projects"
                className="text-white/70 hover:text-white flex items-center gap-2 transition-colors duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Projects
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
} 