'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface GeometricSceneProps {
  className?: string
  shape?: 'cube' | 'pyramid' | 'octahedron' | 'sphere'
  rotationSpeed?: number
  autoRotate?: boolean
  interactive?: boolean
  color?: string
}

interface Point3D {
  x: number
  y: number
  z: number
}

export function GeometricScene({
  className,
  shape = 'cube',
  rotationSpeed = 0.01,
  autoRotate = true,
  interactive = true,
  color = '#4361EE'
}: GeometricSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 })
  const animationRef = useRef<number>()

  const shapes: Record<string, Point3D[][]> = {
    cube: [
      [{ x: -100, y: -100, z: -100 }, { x: 100, y: -100, z: -100 }, { x: 100, y: 100, z: -100 }, { x: -100, y: 100, z: -100 }],
      [{ x: -100, y: -100, z: 100 }, { x: 100, y: -100, z: 100 }, { x: 100, y: 100, z: 100 }, { x: -100, y: 100, z: 100 }],
    ],
    pyramid: [
      [{ x: 0, y: -150, z: 0 }, { x: -150, y: 150, z: -150 }, { x: 150, y: 150, z: -150 }],
      [{ x: 0, y: -150, z: 0 }, { x: 150, y: 150, z: -150 }, { x: 150, y: 150, z: 150 }],
      [{ x: 0, y: -150, z: 0 }, { x: 150, y: 150, z: 150 }, { x: -150, y: 150, z: 150 }],
      [{ x: 0, y: -150, z: 0 }, { x: -150, y: 150, z: 150 }, { x: -150, y: 150, z: -150 }],
      [{ x: -150, y: 150, z: -150 }, { x: 150, y: 150, z: -150 }, { x: 150, y: 150, z: 150 }, { x: -150, y: 150, z: 150 }],
    ],
    octahedron: [
      [{ x: 0, y: -150, z: 0 }, { x: -100, y: 0, z: -100 }, { x: 100, y: 0, z: -100 }],
      [{ x: 0, y: -150, z: 0 }, { x: 100, y: 0, z: -100 }, { x: 100, y: 0, z: 100 }],
      [{ x: 0, y: -150, z: 0 }, { x: 100, y: 0, z: 100 }, { x: -100, y: 0, z: 100 }],
      [{ x: 0, y: -150, z: 0 }, { x: -100, y: 0, z: 100 }, { x: -100, y: 0, z: -100 }],
      [{ x: 0, y: 150, z: 0 }, { x: -100, y: 0, z: -100 }, { x: 100, y: 0, z: -100 }],
      [{ x: 0, y: 150, z: 0 }, { x: 100, y: 0, z: -100 }, { x: 100, y: 0, z: 100 }],
      [{ x: 0, y: 150, z: 0 }, { x: 100, y: 0, z: 100 }, { x: -100, y: 0, z: 100 }],
      [{ x: 0, y: 150, z: 0 }, { x: -100, y: 0, z: 100 }, { x: -100, y: 0, z: -100 }],
    ],
    sphere: Array.from({ length: 12 }, (_, lat) => {
      return Array.from({ length: 24 }, (_, lon) => {
        const theta = (lat / 12) * Math.PI
        const phi = (lon / 24) * Math.PI * 2
        const radius = 150
        return [
          { x: radius * Math.sin(theta) * Math.cos(phi), y: radius * Math.cos(theta), z: radius * Math.sin(theta) * Math.sin(phi) },
          { x: radius * Math.sin(theta) * Math.cos(phi + Math.PI / 12), y: radius * Math.cos(theta), z: radius * Math.sin(theta) * Math.sin(phi + Math.PI / 12) },
        ]
      })
    }).flat().filter(a => a.length > 0) as Point3D[][],
  }

  const projectPoint = (point: Point3D, width: number, height: number) => {
    const rotatedX = point.x * Math.cos(rotation.y) - point.z * Math.sin(rotation.y)
    const rotatedZ = point.x * Math.sin(rotation.y) + point.z * Math.cos(rotation.y)
    const rotatedY = point.y * Math.cos(rotation.x) - rotatedZ * Math.sin(rotation.x)
    const rotatedZ2 = point.y * Math.sin(rotation.x) + rotatedZ * Math.cos(rotation.x)

    const scale = 500 / (500 - rotatedZ2)
    return {
      x: (rotatedX * scale) + width / 2,
      y: (rotatedY * scale) + height / 2,
      scale: scale,
    }
  }

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

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (autoRotate && !isDragging) {
        setRotation(prev => ({ x: prev.x + rotationSpeed, y: prev.y + rotationSpeed }))
      }

      const faces = shapes[shape] || shapes.cube

      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      faces.forEach((face, i) => {
        if (face.length < 3) return

        const projected = face.map(p => projectPoint(p, canvas.width, canvas.height))

        ctx.beginPath()
        ctx.moveTo(projected[0].x, projected[0].y)
        projected.forEach(p => ctx.lineTo(p.x, p.y))
        ctx.closePath()

        const alpha = 0.3 + Math.sin(i * 0.5 + rotation.x) * 0.2
        ctx.fillStyle = `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`
        ctx.fill()
        ctx.stroke()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [shape, rotation, autoRotate, isDragging, rotationSpeed, color])

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return
    setIsDragging(true)
    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !interactive) return

    const deltaX = e.clientX - lastMouse.x
    const deltaY = e.clientY - lastMouse.y

    setRotation(prev => ({
      x: prev.x - deltaY * 0.01,
      y: prev.y + deltaX * 0.01,
    }))

    setLastMouse({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full h-full min-h-[400px] cursor-grab active:cursor-grabbing', className)}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/80 dark:bg-white/80 text-white dark:text-black text-sm rounded-lg backdrop-blur-sm">
        {shape} · {interactive ? 'drag to rotate' : 'auto-rotating'}
      </div>
    </div>
  )
}