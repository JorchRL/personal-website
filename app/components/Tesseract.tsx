'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TesseractProps {
  mouseX: number
  mouseY: number
  scrollY: number
}

// Create points for a 4D tesseract (hypercube)
function createTesseractPoints() {
  // Points for a 4D tesseract (16 points)
  const points = []
  for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        for (let w = -1; w <= 1; w += 2) {
          points.push(new THREE.Vector4(x, y, z, w))
        }
      }
    }
  }
  return points
}

// Create edges for the tesseract
function createTesseractEdges(points: THREE.Vector4[]) {
  const edges = []
  
  // Connect points that differ by exactly one coordinate
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i]
      const p2 = points[j]
      
      // Calculate the number of coordinates that differ
      let diffCount = 0
      if (p1.x !== p2.x) diffCount++
      if (p1.y !== p2.y) diffCount++
      if (p1.z !== p2.z) diffCount++
      if (p1.w !== p2.w) diffCount++
      
      // If only one coordinate differs, add an edge
      if (diffCount === 1) {
        edges.push([i, j])
      }
    }
  }
  
  return edges
}

function TesseractObject({ mouseX, mouseY, scrollY }: TesseractProps) {
  const linesRef = useRef<THREE.LineSegments>(null)
  const points = useRef(createTesseractPoints()).current
  const edges = useRef(createTesseractEdges(points)).current
  
  // Create geometry for edges
  useFrame(({ clock }) => {
    if (!linesRef.current) return

    const time = clock.getElapsedTime()
    
    // Center of rotation is affected by mouse movement
    const centerX = mouseX * 0.05
    const centerY = mouseY * 0.05
    
    // 4D rotation matrices - SLOWED DOWN by reducing the multipliers
    // XY rotation
    const angleXY = time * 0.03 + scrollY * 0.003
    const cosXY = Math.cos(angleXY)
    const sinXY = Math.sin(angleXY)
    
    // ZW rotation
    const angleZW = time * 0.04 + mouseX * 0.003
    const cosZW = Math.cos(angleZW)
    const sinZW = Math.sin(angleZW)
    
    // XW rotation
    const angleXW = time * 0.05 + mouseY * 0.003
    const cosXW = Math.cos(angleXW)
    const sinXW = Math.sin(angleXW)
    
    // YZ rotation 
    const angleYZ = time * 0.035 + scrollY * 0.005
    const cosYZ = Math.cos(angleYZ)
    const sinYZ = Math.sin(angleYZ)
    
    // Apply 4D rotations and projection to 3D
    const positions = new Float32Array(points.length * 3)
    const linePosArray = new Float32Array(edges.length * 6)
    
    // Distortion based on mouseY and scrollY - reduced significantly
    const distortion = (Math.sin(time * 0.15) * 0.05) + (scrollY * 0.0002) + (mouseY * 0.0002)
    
    points.forEach((point, i) => {
      // Make a copy of the original point
      let x = point.x
      let y = point.y
      let z = point.z
      let w = point.w
      
      // Apply XY rotation
      const tempX = x
      x = x * cosXY - y * sinXY
      y = tempX * sinXY + y * cosXY
      
      // Apply ZW rotation
      const tempZ = z
      z = z * cosZW - w * sinZW
      w = tempZ * sinZW + w * cosZW
      
      // Apply XW rotation
      const tempX2 = x
      x = x * cosXW - w * sinXW
      w = tempX2 * sinXW + w * cosXW
      
      // Apply YZ rotation
      const tempY = y
      y = y * cosYZ - z * sinYZ
      z = tempY * sinYZ + z * cosYZ
      
      // Distort the tesseract with sine waves based on time and mouse/scroll
      x += Math.sin(time * 0.25 + y * 1.5) * distortion
      y += Math.sin(time * 0.3 + z * 1.5) * distortion
      z += Math.sin(time * 0.35 + x * 1.5) * distortion
      
      // Project from 4D to 3D (simple perspective projection)
      const scale = 5 / (4 + w)
      const projX = x * scale + centerX
      const projY = y * scale + centerY
      const projZ = z * scale
      
      // Store the 3D position
      positions[i * 3] = projX * 1.5
      positions[i * 3 + 1] = projY * 1.5
      positions[i * 3 + 2] = projZ * 1.5
    })
    
    // Update line positions based on point positions
    edges.forEach((edge, i) => {
      const [p1Index, p2Index] = edge
      
      linePosArray[i * 6] = positions[p1Index * 3]
      linePosArray[i * 6 + 1] = positions[p1Index * 3 + 1]
      linePosArray[i * 6 + 2] = positions[p1Index * 3 + 2]
      
      linePosArray[i * 6 + 3] = positions[p2Index * 3]
      linePosArray[i * 6 + 4] = positions[p2Index * 3 + 1]
      linePosArray[i * 6 + 5] = positions[p2Index * 3 + 2]
    })
    
    // Update geometries
    if (linesRef.current.geometry) {
      linesRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(linePosArray, 3))
      linesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
    </lineSegments>
  )
}

export default function Tesseract() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollPosition, setScrollPosition] = useState(0)
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates to range from -1 to 1
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePosition({ x, y })
    }
    
    const handleScroll = () => {
      setScrollPosition(window.scrollY)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])
  
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <TesseractObject 
          mouseX={mousePosition.x} 
          mouseY={mousePosition.y} 
          scrollY={scrollPosition} 
        />
      </Canvas>
    </div>
  )
} 