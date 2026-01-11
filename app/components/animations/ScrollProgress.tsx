'use client'

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion'
import { useRef, useMemo } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

interface MilestoneDotProps {
  milestone: { id: string; label: string }
  index: number
  total: number
  scrollYProgress: MotionValue<number>
  milestoneColor: string
}

function MilestoneDot({ milestone, index, total, scrollYProgress, milestoneColor }: MilestoneDotProps) {
  const progress = useTransform(scrollYProgress, [index / total, (index + 1) / total], [0, 1])
  const top = total > 1 ? (index / (total - 1)) * 100 : 50

  return (
    <motion.button
      key={milestone.id}
      onClick={() => document.getElementById(milestone.id)?.scrollIntoView({ behavior: 'smooth' })}
      className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 group"
      style={{ top: `${top}%` }}
    >
      <div className="relative w-3 h-3 bg-white dark:bg-black border-2 border-black dark:border-white rounded-full group-hover:scale-125 transition-transform">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ 
            backgroundColor: milestoneColor,
            opacity: progress,
          }}
        />
      </div>
      <span className="absolute left-6 text-xs font-medium text-black/60 dark:text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {milestone.label}
      </span>
    </motion.button>
  )
}

export interface ScrollProgressProps {
  milestones?: Array<{ id: string; label: string }>
  className?: string
  showLabels?: boolean
  progressColor?: string
  milestoneColor?: string
}

export function ScrollProgress({ milestones = [], className, showLabels = true, progressColor = '#4361EE', milestoneColor = '#4361EE' }: ScrollProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])
  const progressOpacity = useTransform(scrollYProgress, [0, 0.05, 0.95, 1], [0, 1, 1, 0])

  const milestoneElements = useMemo(
    () => milestones.map((milestone, index) => (
      <MilestoneDot
        key={milestone.id}
        milestone={milestone}
        index={index}
        total={milestones.length}
        scrollYProgress={scrollYProgress}
        milestoneColor={milestoneColor}
      />
    )),
    [milestones, scrollYProgress, milestoneColor]
  )

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-black/5 dark:bg-white/5 z-50"
        style={{ opacity: progressOpacity }}
      >
        <motion.div
          className="h-full origin-left"
          style={{
            scaleX: pathLength,
            backgroundColor: progressColor,
          }}
        />
      </motion.div>

      {milestones.length > 0 && showLabels && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
          <motion.div
            className="px-4 py-2 bg-black text-white dark:bg-white dark:text-black text-sm font-medium rounded-full"
            style={{ opacity: progressOpacity }}
          >
            scroll
          </motion.div>
        </div>
      )}

      {milestones.length > 0 && (
        <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 hidden xl:block">
          <div className="relative h-96 w-1 bg-black/10 dark:bg-white/10">
            <motion.div
              className="absolute left-0 w-1 origin-top"
              style={{
                scaleY: pathLength,
                backgroundColor: progressColor,
              }}
            />
            {milestoneElements}
          </div>
        </div>
      )}
    </div>
  )
}