'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

export default function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.3 })

  const stats = [
    { value: '5+', label: 'Years of Experience' },
    { value: '50+', label: 'Projects Completed' },
    { value: '20+', label: 'Happy Clients' },
    { value: '10+', label: 'Technologies Mastered' },
  ]

  return (
    <section 
      id="about" 
      ref={ref}
      className="py-20 border-b border-gray-200 dark:border-gray-800"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-4">
            <span className="text-gradient">About Me</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-xl leading-relaxed text-gray-700 dark:text-gray-300"
            >
              I'm a passionate software developer who specializes in building exceptional digital experiences. With a strong foundation in modern web technologies, I create solutions that are not only functional but also aesthetically pleasing.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl leading-relaxed text-gray-700 dark:text-gray-300"
            >
              My approach combines technical expertise with creative problem-solving to deliver projects that exceed expectations. I believe in writing clean, maintainable code and staying up-to-date with the latest industry trends.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl leading-relaxed text-gray-700 dark:text-gray-300"
            >
              When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or enjoying the outdoors.
            </motion.p>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                className="border border-gray-200 dark:border-gray-800 p-6 text-center"
              >
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-sm uppercase tracking-wider mt-2 text-gray-600 dark:text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
} 