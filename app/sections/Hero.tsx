'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'
import { ArrowDown } from 'lucide-react'

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95])

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden" 
      id="home"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent dark:from-accent/10" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/10 to-transparent" />
      </div>

      <motion.div 
        style={{ y, opacity, scale }}
        className="container-custom relative z-10"
      >
        <div className="max-w-6xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6"
          >
            <span className="text-sm md:text-base font-mono text-black/50 dark:text-white/50">
              Creative Developer
            </span>
          </motion.div>

          {/* Main headline - editorial style */}
          <div className="space-y-2 md:space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter text-black dark:text-white"
            >
              Jorge
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-[12vw] md:text-[10vw] lg:text-[8vw] font-black leading-[0.85] tracking-tighter text-black dark:text-white"
            >
              Romero
              <span className="text-accent">.</span>
            </motion.h1>
          </div>

          {/* Description - offset for editorial feel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 md:mt-12 md:ml-[20%] max-w-md"
          >
            <p className="text-lg md:text-xl text-black/70 dark:text-white/70 leading-relaxed">
              I build things for the web. Currently crafting digital experiences that feel 
              <span className="text-black dark:text-white font-medium"> alive</span> and 
              <span className="text-black dark:text-white font-medium"> intentional</span>.
            </p>
          </motion.div>

          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 md:ml-[20%]"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/5 dark:bg-white/5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-black/60 dark:text-white/60">
                Available for projects
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <Link href="#projects" className="group flex flex-col items-center gap-2">
          <span className="text-xs font-mono text-black/40 dark:text-white/40 group-hover:text-accent transition-colors">
            scroll
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown size={20} className="text-black/40 dark:text-white/40 group-hover:text-accent transition-colors" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Corner decoration */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute top-1/2 right-8 md:right-16 -translate-y-1/2 hidden lg:block"
      >
        <div className="w-32 h-32 border border-black/10 dark:border-white/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-accent rounded-full" />
      </motion.div>
    </section>
  )
}