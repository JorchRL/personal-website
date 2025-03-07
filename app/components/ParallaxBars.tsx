'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface BarProps {
  index: number
  total: number
}

function ParallaxBar({ index, total }: BarProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  const { scrollYProgress } = useScroll()
  
  // Calculate position and dimensions based on index
  const width = useTransform(
    scrollYProgress,
    [0, 1],
    [100 / total, 200 / total]
  )
  
  const speed = 0.05 * (index % 3 + 1)
  const xPos = index * (100 / total) + '%'
  const direction = index % 2 === 0 ? 1 : -1
  
  // Calculate height and vertical movement based on scroll and index
  const height = useTransform(
    scrollYProgress,
    [0, 1],
    [30 + index * 5, 70 + index * 2]
  )
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, direction * 100]
  )

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to range from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePosition({ x, y })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <motion.div
      ref={ref}
      className="parallax-bar"
      style={{
        left: xPos,
        width: `${width.get()}%`,
        height: `${height.get()}%`,
        y,
        // Apply additional subtle movement based on mouse position
        transform: `translateX(${mousePosition.x * 20 * direction}px) translateY(${y.get() + mousePosition.y * 20}px)`,
      }}
      animate={{
        scaleY: [1, 1 + (index % 4) * 0.05, 1],
        transition: {
          duration: 4 + index,
          repeat: Infinity,
          ease: 'easeInOut',
        },
      }}
    />
  )
}

export default function ParallaxBars() {
  const barCount = 12
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {Array.from({ length: barCount }).map((_, i) => (
        <ParallaxBar key={i} index={i} total={barCount} />
      ))}
    </div>
  )
} 