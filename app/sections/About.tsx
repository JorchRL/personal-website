'use client'

import { Section, SectionHeader } from '../components/ui/Section'
import { FadeIn } from '../components/animations/FadeIn'
import { TextReveal } from '../components/animations/TextReveal'
import { Card, CardTitle, CardDescription } from '../components/ui/Card'

export default function About() {
  const stats = [
    { value: '5+', label: 'Years Experience' },
    { value: '50+', label: 'Projects Built' },
    { value: '20+', label: 'Happy Clients' },
    { value: '15+', label: 'Technologies' },
  ]

  return (
    <Section id="about">
      <SectionHeader 
        title="About Me"
        description="Passionate about creating exceptional digital experiences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-7 space-y-6">
          <FadeIn delay={0.1}>
            <div className="text-xl md:text-2xl leading-relaxed text-black dark:text-white">
              <TextReveal by="word" stagger={0.02} delay={0.2}>
                I'm a software developer who specializes in building exceptional digital experiences with a focus on clean code and elegant design.
              </TextReveal>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="text-lg md:text-xl leading-relaxed text-black/70 dark:text-white/70">
              <TextReveal by="word" stagger={0.02} delay={0.3}>
                My approach combines technical expertise with creative problem-solving to deliver projects that exceed expectations.
              </TextReveal>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="text-lg md:text-xl leading-relaxed text-black/70 dark:text-white/70">
              <TextReveal by="word" stagger={0.02} delay={0.4}>
                When I'm not coding, you can find me exploring new technologies, contributing to open source, or enjoying the outdoors.
              </TextReveal>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-5 space-y-4">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} delay={0.4 + i * 0.05}>
              <Card variant="default" hover={false} className="text-center">
                <CardTitle className="text-4xl md:text-5xl mb-2">{stat.value}</CardTitle>
                <CardDescription className="text-sm uppercase tracking-wider">{stat.label}</CardDescription>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </Section>
  )
}