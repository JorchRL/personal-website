'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Sample project data - should match the data in the Projects.tsx component
const projects = [
  {
    id: 1,
    title: 'Minimalist E-commerce',
    slug: 'minimalist-ecommerce',
    description: 'A clean, elegant online store built with a focus on simplicity and user experience.',
    fullDescription: `
      This project exemplifies minimalist design principles while delivering a fully functional e-commerce experience. The design uses ample white space, elegant typography, and a restrained black and white color palette to create a premium shopping experience.
      
      The architecture leverages Next.js server components for optimal performance, with client-side interactivity for cart and checkout functionalities. Product images are displayed in high-contrast monochrome to maintain the design aesthetic while highlighting product details.
    `,
    image: '/images/projects/minimalist-ecommerce.jpg',
    gallery: [
      '/images/projects/minimalist-ecommerce-gallery-1.jpg',
      '/images/projects/minimalist-ecommerce-gallery-2.jpg',
      '/images/projects/minimalist-ecommerce-gallery-3.jpg',
    ],
    tags: ['React', 'NextJS', 'Monochrome Design'],
    date: 'October 2023',
    client: 'Elegant Retail Co.',
    link: 'https://example.com',
  },
  {
    id: 2,
    title: 'AI Content Studio',
    slug: 'ai-content-studio',
    description: 'An AI-powered application that generates content with a sleek, modern interface.',
    fullDescription: `
      AI Content Studio is a sophisticated application that leverages artificial intelligence to help creators generate high-quality content. The interface design follows strict minimalist principles, with a monochromatic color scheme that puts focus on the content itself.
      
      The application features real-time content generation, smart editing tools, and export options. The UI is designed to be intuitive and distraction-free, allowing users to focus entirely on the creative process.
    `,
    image: '/images/projects/ai-content-studio.jpg',
    gallery: [
      '/images/projects/ai-content-studio-gallery-1.jpg',
      '/images/projects/ai-content-studio-gallery-2.jpg',
      '/images/projects/ai-content-studio-gallery-3.jpg',
    ],
    tags: ['React', 'AI', 'Black & White'],
    date: 'January 2023',
    client: 'Content Creators Network',
    link: 'https://example.com',
  },
  {
    id: 3,
    title: 'Brutalist Portfolio',
    slug: 'brutalist-portfolio',
    description: 'A stark, high-contrast portfolio site with bold typography and minimal color.',
    fullDescription: `
      This portfolio embraces brutalist web design principles, featuring raw HTML aesthetics, stark typography, and unconventional layouts. The design intentionally breaks traditional grid layouts while maintaining a rigorous black and white color scheme.
      
      The site features dramatic scroll effects, exposed structural elements, and typography as a primary design element. Despite its raw appearance, the site is fully responsive and optimized for all devices.
    `,
    image: '/images/projects/brutalist-portfolio.jpg',
    gallery: [
      '/images/projects/brutalist-portfolio-gallery-1.jpg',
      '/images/projects/brutalist-portfolio-gallery-2.jpg',
      '/images/projects/brutalist-portfolio-gallery-3.jpg',
    ],
    tags: ['HTML', 'CSS', 'Brutalism'],
    date: 'August 2023',
    client: 'Independent Artist',
    link: 'https://example.com',
  },
  {
    id: 4,
    title: 'Monochrome Dashboard',
    slug: 'monochrome-dashboard',
    description: 'A sophisticated admin dashboard with a black and white color scheme and clean typography.',
    fullDescription: `
      This dashboard project demonstrates how effective a strictly monochrome interface can be for data visualization and system management. The design uses variable font weights and subtle gray tones to create hierarchy without relying on color.
      
      The dashboard includes real-time analytics, user management tools, and customizable widgets. The interface makes heavy use of negative space and typography to organize complex information in an elegant, understandable way.
    `,
    image: '/images/projects/monochrome-dashboard.jpg',
    gallery: [
      '/images/projects/monochrome-dashboard-gallery-1.jpg',
      '/images/projects/monochrome-dashboard-gallery-2.jpg',
      '/images/projects/monochrome-dashboard-gallery-3.jpg',
    ],
    tags: ['React', 'Monochrome', 'Dashboard'],
    date: 'March 2023',
    client: 'Enterprise Solutions Inc.',
    link: 'https://example.com',
  },
  {
    id: 5,
    title: 'Typography Magazine',
    slug: 'typography-magazine',
    description: 'A digital magazine focusing on beautiful typography and minimalist design principles.',
    fullDescription: `
      This digital publication celebrates typography as both content and form. The design uses a strict grid system with dynamic layouts that adapt to different screen sizes while maintaining typographic integrity.
      
      The magazine features articles on design theory, interviews with typographers, and showcases of exceptional type-focused work. The reading experience is enhanced by subtle animations and careful attention to typographic details like leading, kerning, and rhythm.
    `,
    image: '/images/projects/typography-magazine.jpg',
    gallery: [
      '/images/projects/typography-magazine-gallery-1.jpg',
      '/images/projects/typography-magazine-gallery-2.jpg',
      '/images/projects/typography-magazine-gallery-3.jpg',
    ],
    tags: ['NextJS', 'Typography', 'Editorial'],
    date: 'June 2023',
    client: 'Typography Today',
    link: 'https://example.com',
  },
  {
    id: 6,
    title: 'Architect Showcase',
    slug: 'architect-showcase',
    description: 'A portfolio site for an architecture firm with elegant, spacious layouts.',
    fullDescription: `
      This portfolio site for an architecture firm embodies the principles of architectural design itself: space, structure, and light. The monochromatic design allows the architectural work to take center stage while providing an appropriate, sophisticated context.
      
      The site features immersive project galleries, interactive 3D models, and elegant transitions between sections. The layout uses asymmetric grids inspired by architectural blueprints, creating a subtle connection between the medium and the message.
    `,
    image: '/images/projects/architect-showcase.jpg',
    gallery: [
      '/images/projects/architect-showcase-gallery-1.jpg',
      '/images/projects/architect-showcase-gallery-2.jpg',
      '/images/projects/architect-showcase-gallery-3.jpg',
    ],
    tags: ['Three.js', 'Architecture', 'Minimalism'],
    date: 'November 2023',
    client: 'Modern Structures Architects',
    link: 'https://example.com',
  },
]

export default function ProjectPage() {
  const { slug } = useParams()
  const project = projects.find(p => p.slug === slug)
  
  if (!project) {
    return <div>Project not found</div>
  }

  return (
    <div className="min-h-screen pt-16">
      <motion.div
        layoutId={`project-${project.slug}`}
        className="w-full"
      >
        <div className="relative h-[50vh] md:h-[70vh] w-full overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            priority
            className="object-cover grayscale"
          />
          <div className="absolute inset-0 bg-black/30 dark:bg-black/50 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {project.title}
              </motion.h1>
              <motion.p 
                className="text-xl max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                {project.description}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="prose prose-lg dark:prose-invert max-w-none"
            >
              <h2 className="text-3xl font-bold mb-8">Overview</h2>
              {project.fullDescription.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-6 text-lg">{paragraph}</p>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16"
            >
              <h2 className="text-3xl font-bold mb-8">Gallery</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {project.gallery.map((image, index) => (
                  <motion.div
                    key={index}
                    className="relative aspect-[4/3] overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  >
                    <Image
                      src={image}
                      alt={`${project.title} gallery image ${index + 1}`}
                      fill
                      className="object-cover grayscale hover:scale-105 transition-transform duration-700"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gray-50 dark:bg-gray-900/30 p-8"
          >
            <h3 className="text-xl font-bold mb-6 text-gradient">Project Details</h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Client</h4>
                <p className="text-lg font-medium mt-1">{project.client}</p>
              </div>
              
              <div>
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Date</h4>
                <p className="text-lg font-medium mt-1">{project.date}</p>
              </div>
              
              <div>
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Technologies</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400">Live Project</h4>
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block text-lg font-medium mt-2 border-b border-black dark:border-white pb-1 transition-all hover:pb-2"
                >
                  Visit Website
                </a>
              </div>
            </div>

            <div className="mt-12">
              <Link 
                href="/#projects" 
                className="inline-block border border-black dark:border-white px-6 py-3 transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
              >
                Back to Projects
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 