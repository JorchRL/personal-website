'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface ParticleSceneProps {
  className?: string
  particleCount?: number
  connectionDistance?: number
  mouseInfluence?: number
  variant?: 'network' | 'flow' | 'explosion'
  color?: string
}

export function ParticleScene({ 
  className, 
  particleCount = 100, 
  connectionDistance = 150,
  mouseInfluence = 100,
  variant = 'network',
  color = '#4361EE'
}: ParticleSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(true)
  const particlesRef = useRef<Array<{
    x: number
    y: number
    vx: number
    vy: number
    size: number
  }>>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
    }

    resize()
    window.addEventListener('resize', resize)

    const particles: Array<{ x: number; y: number; vx: number; vy: number; size: number }> = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 1,
      })
    }

    particlesRef.current = particles

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const variantConfigs = {
        network: { speed: 1, connect: true },
        flow: { speed: 2, connect: false },
        explosion: { speed: 0.5, connect: false },
      }

      const config = variantConfigs[variant]

      particles.forEach((p, i) => {
        p.x += p.vx * config.speed
        p.y += p.vy * config.speed

        const dx = p.x - mouseRef.current.x
        const dy = p.y - mouseRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < mouseInfluence) {
          const force = (mouseInfluence - dist) / mouseInfluence
          p.vx -= (dx / dist) * force * 0.5
          p.vy -= (dy / dist) * force * 0.5
        }

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()

        if (config.connect) {
          particles.slice(i + 1).forEach(p2 => {
            const dx = p.x - p2.x
            const dy = p.y - p2.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < connectionDistance) {
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.strokeStyle = `${color}${Math.floor((1 - dist / connectionDistance) * 255).toString(16).padStart(2, '0')}`
              ctx.stroke()
            }
          })
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    if (isPlaying) {
      animate()
    }

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, particleCount, connectionDistance, mouseInfluence, variant, color])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (rect) {
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  const handleMouseLeave = () => {
    mouseRef.current = { x: 0, y: 0 }
  }

  const togglePlay = useCallback(() => {
    setIsPlaying(p => !p)
  }, [])

  return (
    <div 
      ref={containerRef} 
      className={cn('relative w-full h-full min-h-[400px]', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <motion.button
        onClick={togglePlay}
        className="absolute bottom-4 right-4 px-4 py-2 bg-black/80 dark:bg-white/80 text-white dark:text-black rounded-lg backdrop-blur-sm transition-all hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </motion.button>

      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/80 dark:bg-white/80 text-white dark:text-black text-sm rounded-lg backdrop-blur-sm">
        {variant} · {particleCount} particles
      </div>
    </div>
  )
}