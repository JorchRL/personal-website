'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isPointer, setIsPointer] = useState(false)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }

    const updateCursorType = () => {
      const hoveredElement = document.querySelectorAll('a, button, [role="button"], input, textarea')
      let isHovering = false
      
      hoveredElement.forEach(el => {
        const rect = el.getBoundingClientRect()
        if (
          position.x >= rect.left &&
          position.x <= rect.right &&
          position.y >= rect.top &&
          position.y <= rect.bottom
        ) {
          isHovering = true
        }
      })
      
      setIsPointer(isHovering)
    }

    const handleMouseDown = () => setIsActive(true)
    const handleMouseUp = () => setIsActive(false)

    window.addEventListener('mousemove', updatePosition)
    window.addEventListener('mouseover', updateCursorType)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', updatePosition)
      window.removeEventListener('mouseover', updateCursorType)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [position])

  return (
    <>
      <motion.div
        className="cursor-dot"
        style={{ 
          left: position.x, 
          top: position.y 
        }}
        animate={{
          scale: isActive ? 0.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="cursor-outline"
        style={{ 
          left: position.x, 
          top: position.y 
        }}
        animate={{
          scale: isPointer ? 1.5 : isActive ? 0.8 : 1,
          opacity: isActive ? 0.4 : 1,
        }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      />
    </>
  )
} 