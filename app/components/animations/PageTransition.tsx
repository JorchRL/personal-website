'use client'

import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface PageTransitionProps {
  children: ReactNode
  className?: string
  duration?: number
}

export function PageTransition({ children, className, duration = 0.5 }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('', className)}
    >
      {children}
    </motion.div>
  )
}

export interface PageTransitionMaskProps {
  children: ReactNode
  className?: string
}

export function PageTransitionMask({ children, className }: PageTransitionMaskProps) {
  return (
    <>
      <motion.div
        initial={{ scaleY: 0, transformOrigin: 'bottom' }}
        animate={{ scaleY: [0, 1, 1, 0], transformOrigin: ['bottom', 'top', 'top', 'top'] }}
        exit={{ scaleY: [0, 1, 1, 0], transformOrigin: ['bottom', 'top', 'top', 'top'] }}
        transition={{ duration: 0.8, times: [0, 0.25, 0.75, 1] }}
        className="fixed inset-0 z-50 bg-accent"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className={cn('', className)}
      >
        {children}
      </motion.div>
    </>
  )
}

export interface RotateInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function RotateIn({ children, className, delay = 0, duration = 0.6 }: RotateInProps) {
  return (
    <motion.div
      initial={{ rotate: -15, opacity: 0, scale: 0.9 }}
      animate={{ rotate: 0, opacity: 1, scale: 1 }}
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

export interface FlipInProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'x' | 'y'
}

export function FlipIn({ children, className, delay = 0, duration = 0.6, direction = 'y' }: FlipInProps) {
  return (
    <motion.div
      initial={{ rotateX: direction === 'x' ? 90 : 0, rotateY: direction === 'y' ? 90 : 0, opacity: 0 }}
      animate={{ rotateX: 0, rotateY: 0, opacity: 1 }}
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