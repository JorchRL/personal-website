'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react'
import Header from '@/app/_components/Header'
import Footer from '@/app/_components/Footer'
import { FadeIn } from '@/app/components/animations/FadeIn'

// Project data - generalized for NDA compliance
const projects = [
  {
    id: 1,
    title: 'EdTech Learning Platform',
    slug: 'edtech-platform',
    year: '2024',
    category: 'Full-Stack Development',
    client: 'Whiz.Study',
    role: 'Architect & Team Mentor',
    duration: 'Ongoing',
    description: 'SAT/AP prep platform serving 10K+ students with AI tutoring and adaptive learning.',
    longDescription: 'A comprehensive educational platform helping students prepare for SAT and AP exams through personalized learning paths, AI-powered tutoring, and adaptive practice tests. The platform serves over 10,000 students and processes subscription revenue exceeding $3.5K MRR. Beyond code, I mentor a team of junior developers with the goal of elevating them to senior-level execution under my guidance.',
    challenge: 'Inherited a codebase with severe performance issues—database queries maxing at 99% CPU, no image optimization, poor SSR strategies, and caching issues causing significant slowdowns. The platform was losing approximately 40% of potential revenue due to these performance problems. Additionally, the team needed guidance to level up their skills.',
    solution: 'Implemented comprehensive database indexing (reducing CPU from 99% to 1%), rebuilt SSR and data fetching strategies, added image/GIF optimization, and implemented proper caching layers. Designed and built the Stripe subscription system from scratch. Debugged complex production errors that were causing widespread crashes. Established code review practices and mentorship sessions to help junior devs think architecturally.',
    results: [
      '99% → 1% database CPU utilization',
      '90+ Lighthouse performance score',
      '$3.5K+ monthly recurring revenue',
      'Team mentorship & growth'
    ],
    tech: ['Next.js', 'TypeScript', 'PostgreSQL', 'Stripe', 'OpenAI API', 'Vercel'],
    image: '/images/projects/edtech-hero.jpg',
    gallery: [],
    color: '#4361EE',
    status: 'Production',
  },
  {
    id: 2,
    title: 'Digital Twins Platform',
    slug: 'spatial-collaboration',
    year: '2024',
    category: 'Real-Time 3D',
    client: 'Under NDA',
    role: 'Senior Developer',
    duration: '1+ year',
    description: 'Interactive digital twins platform for real-time multiplayer collaboration.',
    longDescription: 'A platform that transforms Matterport 3D scans into interactive, collaborative digital twins. Multiple users can explore spaces simultaneously with real-time presence, synchronized navigation, spatial annotations, and guided tour capabilities—enabling remote collaboration in immersive 3D environments.',
    challenge: 'Building real-time synchronization for 3D spatial experiences presents unique challenges—users need to see each other\'s positions and annotations in 3D space with minimal latency, while the guide mode requires frame-accurate synchronization across all participants.',
    solution: 'Architected a real-time backend using WebSockets for instant state synchronization. Integrated deeply with the Matterport SDK to track and broadcast user positions in 3D space. Built a custom annotation system allowing users to place markers and drawings that persist in the 3D environment. Implemented a guide mode where one user can lead others through the space.',
    results: [
      'Real-time multiplayer sessions',
      'Sub-100ms synchronization',
      '3D spatial annotations',
      'Guided tour system'
    ],
    tech: ['React', 'Node.js', 'WebSockets', 'Matterport SDK', 'Three.js', 'WebGL'],
    image: '/images/projects/spatial-hero.jpg',
    gallery: [],
    color: '#10B981',
    status: 'Production',
  },
  {
    id: 3,
    title: 'Metroidvania Game',
    slug: 'metroidvania-game',
    year: '2025',
    category: 'Game Development',
    client: 'TBD (Own Studio)',
    role: 'Co-founder & Developer',
    duration: 'Pre-production',
    description: 'Dark, atmospheric action game inspired by Hollow Knight and Nine Sols.',
    longDescription: 'An indie game project creating a dark, atmospheric metroidvania experience. Drawing heavy inspiration from Hollow Knight\'s exploration and Nine Sols\' precise combat, we\'re crafting an interconnected world with tight controls, meaningful ability progression, and a haunting atmosphere with subtle horror elements.',
    challenge: 'Creating a cohesive experience that honors our inspirations without feeling derivative. The combat needs to feel precise and responsive, while the world design must reward exploration and backtracking with meaningful discoveries.',
    solution: 'Currently in pre-production—establishing core design pillars, experimenting with mechanics, and building the visual/audio identity. Working with a small team including artists and composers to develop a distinctive aesthetic before committing to full production.',
    results: [
      'Core design pillars defined',
      'Mechanic prototypes in progress',
      'Art direction exploration',
      'Original soundtrack concepts'
    ],
    tech: ['Unreal Engine 5', 'Blueprints', 'C++', 'Blender', 'Substance Painter'],
    image: '/images/projects/metroidvania-hero.jpg',
    gallery: [],
    color: '#8B5CF6',
    status: 'Pre-production',
  },
  {
    id: 4,
    title: 'Racing Sim Project',
    slug: 'racing-simulator',
    year: '2025',
    category: 'Systems Programming',
    client: 'Personal Project',
    role: 'Learning in Public',
    duration: 'Early Exploration',
    description: 'A personal deep-dive into low-level game development, building understanding from the ground up.',
    longDescription: 'A deliberate learning project to deeply understand low-level game development. The goal isn\'t to ship a product—it\'s to truly comprehend how engines, physics systems, and netcode work by building them myself. Inspired by Handmade Hero\'s from-scratch philosophy, but leveraging LLMs as learning accelerators rather than code generators.',
    challenge: 'Modern game development often abstracts away the fundamentals. I wanted to understand what\'s actually happening: how physics engines simulate vehicles, how netcode handles latency, how rendering pipelines work. The challenge is learning deeply, not just getting something working.',
    solution: 'Using raylib as a minimal starting point while building everything else to understand it. Studying tire models, suspension physics, client-side prediction, and rollback netcode—implementing each system to internalize the concepts. Using LLMs strategically to explain concepts, review my understanding, and accelerate learning (not to write code for me).',
    results: [
      'Deep understanding of physics sims',
      'Netcode concepts internalized',
      'LLM-assisted learning workflow',
      'Ongoing exploration'
    ],
    tech: ['C++', 'Raylib', 'From-scratch systems', 'Physics', 'Networking'],
    image: '/images/projects/racing-hero.jpg',
    gallery: [],
    color: '#F59E0B',
    status: 'Learning Project',
  },
]

export default function ProjectPage() {
  const params = useParams()
  const slugParam = typeof params.slug === 'string' ? params.slug : ''
  
  const [project, setProject] = useState<typeof projects[0] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [adjacentProjects, setAdjacentProjects] = useState<{ prev: typeof projects[0] | null, next: typeof projects[0] | null }>({ prev: null, next: null })
  
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  })
  
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const titleY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])

  useEffect(() => {
    const foundProject = projects.find(p => p.slug === slugParam)
    if (foundProject) {
      setProject(foundProject)
      const currentIndex = projects.findIndex(p => p.slug === slugParam)
      setAdjacentProjects({
        prev: currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1],
        next: currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0],
      })
    }
    setIsLoading(false)
  }, [slugParam])

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center">
        <motion.div 
          className="w-12 h-12 border-2 border-black/20 dark:border-white/20 border-t-accent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-black dark:text-white">Project not found</h2>
          <p className="text-black/60 dark:text-white/60 mb-8">The project you're looking for doesn't exist.</p>
          <Link 
            href="/#projects" 
            className="inline-flex items-center gap-2 text-accent hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to projects
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Header />
      
      <main className="min-h-screen bg-white dark:bg-black">
        {/* Hero Section */}
        <section ref={heroRef} className="relative h-[70vh] md:h-screen overflow-hidden">
          {/* Background with gradient (no image for NDA projects) */}
          <motion.div 
            className="absolute inset-0"
            style={{ y: heroY }}
          >
            <div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(135deg, ${project.color}15 0%, transparent 50%), linear-gradient(225deg, ${project.color}10 0%, transparent 50%)` 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-black" />
            
            {/* Abstract decorative elements */}
            <div 
              className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
              style={{ backgroundColor: project.color }}
            />
            <div 
              className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-10"
              style={{ backgroundColor: project.color }}
            />
          </motion.div>

          {/* Hero Content */}
          <motion.div 
            className="relative z-20 h-full flex flex-col justify-end pb-16 md:pb-24"
            style={{ opacity: heroOpacity }}
          >
            <div className="container-custom">
              {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-6"
              >
                <span 
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
                  style={{ 
                    backgroundColor: `${project.color}20`,
                    color: project.color 
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                  {project.status}
                </span>
              </motion.div>

              {/* Category and Year */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-4 mb-4"
              >
                <span className="text-sm font-mono text-black/50 dark:text-white/50">{project.category}</span>
                <span className="w-8 h-px bg-black/20 dark:bg-white/20" />
                <span className="text-sm font-mono text-black/50 dark:text-white/50">{project.year}</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                style={{ y: titleY }}
                className="text-4xl md:text-6xl lg:text-7xl font-black text-black dark:text-white tracking-tight mb-6"
              >
                {project.title}
                <span style={{ color: project.color }}>.</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl md:text-2xl text-black/70 dark:text-white/70 max-w-2xl"
              >
                {project.description}
              </motion.p>
            </div>
          </motion.div>
        </section>

        {/* Project Info Grid */}
        <section className="py-16 md:py-24 border-b border-black/10 dark:border-white/10">
          <div className="container-custom">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <FadeIn delay={0.1}>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-black/40 dark:text-white/40 block mb-2">
                    Client
                  </span>
                  <span className="text-lg font-medium text-black dark:text-white">
                    {project.client}
                  </span>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-black/40 dark:text-white/40 block mb-2">
                    Role
                  </span>
                  <span className="text-lg font-medium text-black dark:text-white">
                    {project.role}
                  </span>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.3}>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-black/40 dark:text-white/40 block mb-2">
                    Duration
                  </span>
                  <span className="text-lg font-medium text-black dark:text-white">
                    {project.duration}
                  </span>
                </div>
              </FadeIn>
              
              <FadeIn delay={0.4}>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-black/40 dark:text-white/40 block mb-2">
                    Status
                  </span>
                  <span 
                    className="text-lg font-medium"
                    style={{ color: project.color }}
                  >
                    {project.status}
                  </span>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 md:py-24">
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
              {/* Sidebar - Tech Stack */}
              <div className="lg:col-span-3 order-2 lg:order-1">
                <FadeIn>
                  <div className="sticky top-32">
                    <span className="text-xs font-mono uppercase tracking-wider text-black/40 dark:text-white/40 block mb-4">
                      Tech Stack
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span 
                          key={tech}
                          className="px-3 py-1 text-sm bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-9 order-1 lg:order-2">
                {/* Overview */}
                <FadeIn>
                  <div className="mb-16">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-black/40 dark:text-white/40 mb-4">
                      Overview
                    </h2>
                    <p className="text-xl md:text-2xl text-black/80 dark:text-white/80 leading-relaxed">
                      {project.longDescription}
                    </p>
                  </div>
                </FadeIn>

                {/* Challenge */}
                <FadeIn delay={0.1}>
                  <div className="mb-16">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-black/40 dark:text-white/40 mb-4">
                      The Challenge
                    </h2>
                    <p className="text-lg text-black/70 dark:text-white/70 leading-relaxed">
                      {project.challenge}
                    </p>
                  </div>
                </FadeIn>

                {/* Solution */}
                <FadeIn delay={0.2}>
                  <div className="mb-16">
                    <h2 className="text-sm font-mono uppercase tracking-wider text-black/40 dark:text-white/40 mb-4">
                      The Approach
                    </h2>
                    <p className="text-lg text-black/70 dark:text-white/70 leading-relaxed">
                      {project.solution}
                    </p>
                  </div>
                </FadeIn>

                {/* Results */}
                <FadeIn delay={0.3}>
                  <div>
                    <h2 className="text-sm font-mono uppercase tracking-wider text-black/40 dark:text-white/40 mb-6">
                      Key Outcomes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.results.map((result, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          viewport={{ once: true }}
                          className="flex items-start gap-3 p-4 bg-black/[0.02] dark:bg-white/[0.02] rounded-lg"
                        >
                          <span 
                            className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="text-black/80 dark:text-white/80">{result}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* Next/Previous Navigation */}
        <section className="py-16 md:py-24 border-t border-black/10 dark:border-white/10">
          <div className="container-custom">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Previous Project */}
              {adjacentProjects.prev && (
                <Link 
                  href={`/projects/${adjacentProjects.prev.slug}`}
                  className="group"
                >
                  <FadeIn direction="left">
                    <div className="p-8 border border-black/10 dark:border-white/10 rounded-lg hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-2 text-black/40 dark:text-white/40 mb-4">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-2 transition-transform" />
                        <span className="text-sm font-mono uppercase tracking-wider">Previous</span>
                      </div>
                      <h3 className="text-2xl font-bold text-black dark:text-white group-hover:text-accent transition-colors">
                        {adjacentProjects.prev.title}
                      </h3>
                      <p className="text-black/60 dark:text-white/60 mt-2">
                        {adjacentProjects.prev.category}
                      </p>
                    </div>
                  </FadeIn>
                </Link>
              )}

              {/* Next Project */}
              {adjacentProjects.next && (
                <Link 
                  href={`/projects/${adjacentProjects.next.slug}`}
                  className="group md:text-right"
                >
                  <FadeIn direction="right">
                    <div className="p-8 border border-black/10 dark:border-white/10 rounded-lg hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-2 text-black/40 dark:text-white/40 mb-4 md:justify-end">
                        <span className="text-sm font-mono uppercase tracking-wider">Next</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                      </div>
                      <h3 className="text-2xl font-bold text-black dark:text-white group-hover:text-accent transition-colors">
                        {adjacentProjects.next.title}
                      </h3>
                      <p className="text-black/60 dark:text-white/60 mt-2">
                        {adjacentProjects.next.category}
                      </p>
                    </div>
                  </FadeIn>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* Back to All Projects */}
        <section className="pb-16 md:pb-24">
          <div className="container-custom text-center">
            <FadeIn>
              <Link 
                href="/#projects"
                className="inline-flex items-center gap-2 text-black/60 dark:text-white/60 hover:text-accent transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to all projects</span>
              </Link>
            </FadeIn>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
