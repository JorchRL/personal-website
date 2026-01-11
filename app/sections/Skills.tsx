'use client'

import { Section, SectionHeader } from '../components/ui/Section'
import { FadeIn } from '../components/animations/FadeIn'
import { StaggeredReveal } from '../components/animations/StaggeredReveal'
import { Card, CardTitle, CardDescription, CardContent } from '../components/ui/Card'
import { motion } from 'framer-motion'

const skills = {
  frontend: [
    'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Vue', 'JavaScript'
  ],
  backend: [
    'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'GraphQL', 'REST APIs'
  ],
  tools: [
    'Git', 'Docker', 'AWS', 'Vercel', 'Figma', 'VS Code'
  ],
  other: [
    'Three.js', 'Framer Motion', 'Supabase', 'Stripe', 'Prisma', 'Testing'
  ]
}

export default function Skills() {
  const categories = Object.entries(skills)
  const delay = (index: number) => index * 0.1

  return (
    <Section id="skills">
      <SectionHeader 
        title="Skills & Technologies"
        description="The tools and technologies I use to bring ideas to life"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {categories.map(([category, items], categoryIndex) => (
          <FadeIn key={category} delay={delay(categoryIndex)}>
            <Card variant="bordered">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-6 text-black dark:text-white capitalize">
                  {category}
                </h3>
                
                <div className="space-y-3">
                  {items.map((skill, skillIndex) => (
                    <motion.div
                      key={skill}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: delay(categoryIndex) + 0.1 + skillIndex * 0.05,
                      }}
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-2 h-2 bg-accent rounded-full group-hover:scale-150 transition-transform" />
                      <span className="text-black dark:text-white group-hover:text-accent transition-colors">
                        {skill}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        ))}
      </div>
    </Section>
  )
}