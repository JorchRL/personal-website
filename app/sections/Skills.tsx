'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const frontendSkills = [
  { name: 'React', level: 90 },
  { name: 'TypeScript', level: 85 },
  { name: 'Next.js', level: 88 },
  { name: 'CSS/SCSS', level: 82 },
  { name: 'TailwindCSS', level: 95 },
]

const backendSkills = [
  { name: 'Node.js', level: 85 },
  { name: 'Express', level: 88 },
  { name: 'MongoDB', level: 82 },
  { name: 'PostgreSQL', level: 78 },
  { name: 'GraphQL', level: 75 },
]

const toolsAndOthers = [
  { name: 'Git/GitHub', level: 90 },
  { name: 'Docker', level: 75 },
  { name: 'CI/CD', level: 80 },
  { name: 'Jest/Testing', level: 78 },
  { name: 'AWS', level: 72 },
]

export default function Skills() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const skillVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const barVariants = {
    hidden: { width: 0 },
    visible: (level: number) => ({
      width: `${level}%`,
      transition: { duration: 1, ease: [0.34, 1.56, 0.64, 1] },
    }),
  }

  return (
    <section
      id="skills"
      ref={ref}
      className="py-20 bg-gray-50 dark:bg-gray-900/50"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient">My Skills</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Here are the technologies and tools I work with to create impressive digital experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Frontend Skills */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="text-xl font-bold mb-6 text-center text-primary-600 dark:text-primary-400"
            >
              Frontend Development
            </motion.h3>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-4"
            >
              {frontendSkills.map((skill) => (
                <motion.div key={skill.name} variants={skillVariants}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{skill.level}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <motion.div
                      custom={skill.level}
                      variants={barVariants}
                      className="h-2.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Backend Skills */}
          <div>
            <motion.h3
              initial={{ opacity: 0, y: -20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-xl font-bold mb-6 text-center text-primary-600 dark:text-primary-400"
            >
              Backend Development
            </motion.h3>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-4"
            >
              {backendSkills.map((skill) => (
                <motion.div key={skill.name} variants={skillVariants}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{skill.level}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <motion.div
                      custom={skill.level}
                      variants={barVariants}
                      className="h-2.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Tools and Other Skills */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl font-bold mb-6 text-center text-primary-600 dark:text-primary-400"
            >
              Tools & Other
            </motion.h3>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate={isInView ? "visible" : "hidden"}
              className="space-y-4"
            >
              {toolsAndOthers.map((skill) => (
                <motion.div key={skill.name} variants={skillVariants}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{skill.name}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{skill.level}%</span>
                  </div>
                  <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <motion.div
                      custom={skill.level}
                      variants={barVariants}
                      className="h-2.5 rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
} 