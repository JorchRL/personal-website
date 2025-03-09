'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-16 overflow-hidden" id="home">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent to-white/5 dark:to-black/5"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            Jorge Romero
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-12"
          >
            I craft <span className="font-semibold">minimal</span> and <span className="font-semibold">elegant</span> digital experiences with meticulous attention to detail and clean code.
          </motion.p>
          
        </div>
      </div>
    </section>
  )
} 