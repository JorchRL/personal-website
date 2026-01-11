'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface StaggeredRevealProps {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'
}

const variants = {
  up: { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  down: { initial: { y: -40, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  left: { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  right: { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  scale: { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
}

export function StaggeredReveal({ children, className, stagger = 0.1, delay = 0, duration = 0.5, direction = 'up' }: StaggeredRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })

  const variant = variants[direction]

  return (
    <div ref={ref} className={cn('', className)}>
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div
            key={index}
            initial={variant.initial}
            animate={isInView ? variant.animate : variant.initial}
            transition={{
              duration,
              delay: delay + index * stagger,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div
          initial={variant.initial}
          animate={isInView ? variant.animate : variant.initial}
          transition={{
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}