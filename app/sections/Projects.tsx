'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const projects = [
  {
    id: 1,
    title: 'EdTech Learning Platform',
    year: '2025',
    category: 'Full-Stack · Architect',
    description: 'SAT/AP prep platform at Whiz.Study serving 10K+ students. Rebuilt critical infrastructure, mentor a team of junior devs, and drove performance from failing to 90+ Lighthouse scores.',
    slug: 'edtech-platform',
  },
  {
    id: 2,
    title: 'Digital Twins Platform',
    year: '2023',
    category: 'Real-Time · 3D',
    description: 'Interactive digital twins platform enabling real-time multiplayer collaboration—synchronized navigation, spatial annotations, and guided experiences.',
    slug: 'spatial-collaboration',
  },
  {
    id: 3,
    title: 'Metroidvania Game',
    year: '2025–26',
    category: 'Unreal Engine · Pre-prod',
    description: 'Dark, atmospheric action game inspired by Hollow Knight and Nine Sols. Currently in pre-production with a small indie team.',
    slug: 'metroidvania-game',
  },
  {
    id: 4,
    title: 'Racing Sim Project',
    year: '2025–26',
    category: 'C++ · Learning',
    description: 'A personal deep-dive into low-level game development—building a racing sim from scratch to truly understand engines, physics, and netcode.',
    slug: 'racing-simulator',
  },
]

export default function Projects() {
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 })

  return (
    <section 
      ref={sectionRef}
      id="projects" 
      className="py-24 md:py-32 relative"
    >
      {/* Section header - editorial style */}
      <div className="container-custom mb-16 md:mb-24">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-sm font-mono text-black/50 dark:text-white/50 mb-2 block">
              Selected Work
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-black dark:text-white">
              Projects
              <span className="text-accent">.</span>
            </h2>
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-black/60 dark:text-white/60 max-w-sm text-lg"
          >
            From production platforms to passion projects. Each one taught me something new.
          </motion.p>
        </div>
      </div>

      {/* Projects list - editorial table style */}
      <div className="container-custom">
        <div className="border-t border-black/10 dark:border-white/10">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            >
              <Link
                href={`/projects/${project.slug}`}
                className="group block"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="relative py-6 md:py-8 border-b border-black/10 dark:border-white/10 transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Number */}
                    <div className="col-span-1 hidden md:block">
                      <span className="text-sm font-mono text-black/30 dark:text-white/30">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Title */}
                    <div className="col-span-12 md:col-span-5">
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-black dark:text-white group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                      <p className="text-sm text-black/50 dark:text-white/50 mt-1 md:hidden">
                        {project.category} · {project.year}
                      </p>
                    </div>

                    {/* Category */}
                    <div className="col-span-3 hidden md:block">
                      <span className="text-sm text-black/50 dark:text-white/50">
                        {project.category}
                      </span>
                    </div>

                    {/* Year */}
                    <div className="col-span-2 hidden md:block">
                      <span className="text-sm font-mono text-black/50 dark:text-white/50">
                        {project.year}
                      </span>
                    </div>

                    {/* Arrow */}
                    <div className="col-span-1 hidden md:flex justify-end">
                      <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={hoveredId === project.id ? { x: 0, opacity: 1 } : { x: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ArrowUpRight className="w-6 h-6 text-accent" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Hover description */}
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={hoveredId === project.id ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-black/60 dark:text-white/60 max-w-xl md:ml-[8.33%]">
                      {project.description}
                    </p>
                  </motion.div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
