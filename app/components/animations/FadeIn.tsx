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

export interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade' | 'scale'
  amount?: number
}

const variants = {
  up: { initial: { y: 40, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  down: { initial: { y: -40, opacity: 0 }, animate: { y: 0, opacity: 1 } },
  left: { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  right: { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 } },
  scale: { initial: { scale: 0.9, opacity: 0 }, animate: { scale: 1, opacity: 1 } },
}

export function FadeIn({ children, className, delay = 0, duration = 0.6, direction = 'up', amount = 0.1 }: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, amount })

  const variant = variants[direction]

  return (
    <motion.div
      ref={ref}
      initial={variant.initial}
      animate={isInView ? variant.animate : variant.initial}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('', className)}
    >
      {children}
    </motion.div>
  )
}

export interface SlideInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function SlideIn({ children, className, delay = 0, duration = 0.8, direction = 'up' }: SlideInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })

  const directions = {
    up: { y: 100 },
    down: { y: -100 },
    left: { x: 100 },
    right: { x: -100 },
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...directions[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directions[direction] }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('', className)}
    >
      {children}
    </motion.div>
  )
}

export interface ScaleInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function ScaleIn({ children, className, delay = 0, duration = 0.5 }: ScaleInProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: false, amount: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0, opacity: 0 }}
      animate={isInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('', className)}
    >
      {children}
    </motion.div>
  )
}