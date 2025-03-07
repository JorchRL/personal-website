'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'

interface CubeProps {
  rotationX: number
  rotationY: number
}

function Cube({ rotationX, rotationY }: CubeProps) {
  const mesh = useRef<THREE.Mesh>(null)
  const [hovered, setHover] = useState(false)

  useFrame((state, delta) => {
    if (mesh.current) {
      // Base rotation
      mesh.current.rotation.x += delta * 0.2
      mesh.current.rotation.y += delta * 0.3
      
      // Add influence from mouse movement
      mesh.current.rotation.x += (rotationX - mesh.current.rotation.x) * 0.1
      mesh.current.rotation.y += (rotationY - mesh.current.rotation.y) * 0.1
    }
  })

  return (
    <Box
      ref={mesh}
      args={[3, 3, 3]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <meshStandardMaterial 
        color={hovered ? '#38bdf8' : '#0ea5e9'} 
        metalness={0.8}
        roughness={0.2}
        wireframe
      />
    </Box>
  )
}

export default function SpinningCube({ rotationX, rotationY }: CubeProps) {
  return (
    <div className="w-full h-full absolute">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ 
          background: 'transparent',
          width: '100%', 
          height: '100%'
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <pointLight position={[-10, -10, -10]} color="#0ea5e9" intensity={0.5} />
        <Cube rotationX={rotationX} rotationY={rotationY} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
} 