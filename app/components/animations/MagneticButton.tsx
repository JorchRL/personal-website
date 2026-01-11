'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type ReactNode } from 'react'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  damping?: number
  stiffness?: number
  disabled?: boolean
}

export function MagneticButton({ children, className, strength = 0.3, damping = 25, stiffness = 400, disabled = false }: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || disabled) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    setPosition({
      x: x * strength,
      y: y * strength,
    })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setPosition({ x: 0, y: 0 })
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  return (
    <div
      ref={ref}
      className={cn('inline-block', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      <motion.div
        animate={{
          x: position.x,
          y: position.y,
        }}
        transition={{
          type: 'spring',
          damping,
          stiffness,
        }}
        className="inline-block"
      >
        {children}
      </motion.div>
    </div>
  )
}