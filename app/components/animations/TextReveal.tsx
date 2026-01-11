'use client'

import { motion } from 'framer-motion'

export interface TextRevealProps {
  children: string
  className?: string
  delay?: number
  stagger?: number
  by?: 'word' | 'letter' | 'line'
  direction?: 'up' | 'down' | 'left' | 'right'
}

export function TextReveal({ children, className, delay = 0, stagger = 0.03, by = 'word', direction = 'up' }: TextRevealProps) {
  const variants = {
    up: { initial: { y: 100, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    down: { initial: { y: -100, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    left: { initial: { x: 100, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    right: { initial: { x: -100, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  }

  let items: string[] = []

  if (by === 'word') {
    items = children.split(' ')
  } else if (by === 'letter') {
    items = children.split('')
  } else if (by === 'line') {
    items = children.split('\n')
  }

  return (
    <motion.span className={className}>
      {items.map((item, index) => (
        <motion.span
          key={`${by}-${index}`}
          initial={variants[direction].initial}
          animate={variants[direction].animate}
          transition={{
            duration: 0.5,
            delay: delay + index * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ 
            display: by === 'letter' ? 'inline' : 'inline-block',
            whiteSpace: by === 'letter' ? 'pre' : 'normal' 
          }}
        >
          {item}
          {by === 'word' && index < items.length - 1 && ' '}
        </motion.span>
      ))}
    </motion.span>
  )
}