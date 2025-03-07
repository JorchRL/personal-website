'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// Sample project data - replace with your actual projects
const projects = [
  {
    id: 1,
    title: 'Minimalist E-commerce',
    slug: 'minimalist-ecommerce',
    description: 'A clean, elegant online store built with a focus on simplicity and user experience.',
    image: '/images/projects/minimalist-ecommerce.jpg',
    tags: ['React', 'NextJS', 'Monochrome Design'],
  },
  {
    id: 2,
    title: 'AI Content Studio',
    slug: 'ai-content-studio',
    description: 'An AI-powered application that generates content with a sleek, modern interface.',
    image: '/images/projects/ai-content-studio.jpg',
    tags: ['React', 'AI', 'Black & White'],
  },
  {
    id: 3,
    title: 'Brutalist Portfolio',
    slug: 'brutalist-portfolio',
    description: 'A stark, high-contrast portfolio site with bold typography and minimal color.',
    image: '/images/projects/brutalist-portfolio.jpg',
    tags: ['HTML', 'CSS', 'Brutalism'],
  },
  {
    id: 4,
    title: 'Monochrome Dashboard',
    slug: 'monochrome-dashboard',
    description: 'A sophisticated admin dashboard with a black and white color scheme and clean typography.',
    image: '/images/projects/monochrome-dashboard.jpg',
    tags: ['React', 'Monochrome', 'Dashboard'],
  },
  {
    id: 5,
    title: 'Typography Magazine',
    slug: 'typography-magazine',
    description: 'A digital magazine focusing on beautiful typography and minimalist design principles.',
    image: '/images/projects/typography-magazine.jpg',
    tags: ['NextJS', 'Typography', 'Editorial'],
  },
  {
    id: 6,
    title: 'Architect Showcase',
    slug: 'architect-showcase',
    description: 'A portfolio site for an architecture firm with elegant, spacious layouts.',
    image: '/images/projects/architect-showcase.jpg',
    tags: ['Three.js', 'Architecture', 'Minimalism'],
  },
]

interface ProjectItemProps {
  project: typeof projects[0]
  index: number
  openProject: (slug: string) => void
}

function ProjectItem({ project, index, openProject }: ProjectItemProps) {
  const [isHovered, setIsHovered] = useState(false)
  const itemRef = useRef(null)
  const isInView = useInView(itemRef, { once: false, amount: 0.1 })

  return (
    <motion.div
      ref={itemRef}
      layoutId={`project-${project.slug}`}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ 
        duration: 0.8, 
        delay: index * 0.2,
        ease: [0.16, 1, 0.3, 1] 
      }}
      onClick={() => openProject(project.slug)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="project-item w-full h-full aspect-square relative"
    >
      <div className="absolute inset-0">
        <Image 
          src={project.image} 
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover grayscale transition-all duration-700"
          style={{
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          }}
        />
        <div className={`absolute inset-0 bg-black/60 dark:bg-black/70 flex items-center justify-center transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="p-6 max-w-xs">
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="text-lg font-bold text-white mb-2"
            >
              {project.title}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="text-sm text-white/80 mb-4 line-clamp-3"
            >
              {project.description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex flex-wrap gap-2"
            >
              {project.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="text-xs px-2 py-1 border border-white/30 text-white/90"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const router = useRouter()
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const openProject = (slug: string) => {
    // Set the selected ID to trigger the animation
    setSelectedId(slug)
    
    // After animation, navigate to project page
    setTimeout(() => {
      router.push(`/projects/${slug}`)
    }, 600)
  }

  return (
    <section
      id="projects"
      ref={sectionRef}
      className="py-40"
    >
      <div className="container mx-auto px-4 md:px-0">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-2xl uppercase tracking-widest mb-24 text-center"
        >
          Projects
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
          {projects.map((project, index) => (
            <div key={project.id} className="aspect-square">
              <ProjectItem 
                project={project} 
                index={index} 
                openProject={openProject}
              />
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            layoutId={`project-${selectedId}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="w-full h-full flex items-center justify-center"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 1.2 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-5 h-5 border-t border-black dark:border-white rounded-full animate-spin"></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
} 