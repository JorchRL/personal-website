'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Ribbon from '../components/Ribbon'

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

export default function Projects() {
  const router = useRouter()
  const sectionRef = useRef(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)

  const openProject = (slug: string) => {
    // Find the project data
    const project = projects.find(p => p.slug === slug)
    if (project) {
      // Set selected project data
      setSelectedProject(project)
      // Set the selected ID to trigger the animation
      setSelectedId(slug)
      
      // After animation, navigate to project page
      setTimeout(() => {
        router.push(`/projects/${slug}`)
      }, 800)
    }
  }

  return (
    <section
      id="projects"
      ref={sectionRef}
    >
      <Ribbon projects={projects} openProject={openProject} />

      <AnimatePresence>
        {selectedId && selectedProject && (
          <motion.div
            layoutId={`project-${selectedId}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <motion.div 
              className="w-full h-full relative overflow-hidden"
              initial={{ borderRadius: 16 }}
              animate={{ borderRadius: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.img
                src={selectedProject.image}
                alt={selectedProject.title}
                className="w-full h-full object-cover"
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
              
              <div className="absolute inset-0 opacity-0">
                <div className="container mx-auto px-8 pb-16">
                  <h2 className="text-4xl font-light text-white mb-4">{selectedProject.title}</h2>
                  <div className="w-16 h-[1px] bg-white/30 mb-6" />
                  <p className="text-white/70 max-w-xl">{selectedProject.description}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  )
} 