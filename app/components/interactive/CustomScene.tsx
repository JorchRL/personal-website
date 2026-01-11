'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Play, Pause, RotateCcw, Code2, Box } from 'lucide-react'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface CustomSceneProps {
  className?: string
  initialCode?: string
  libraries?: 'none' | 'three' | 'p5'
}

const defaultTemplates: Record<string, string> = {
  three: `// Three.js Scene
// Available: THREE, canvas, width, height

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })

renderer.setSize(width, height)
camera.position.z = 5

const geometry = new THREE.BoxGeometry()
const material = new THREE.MeshBasicMaterial({ color: 0x4361EE })
const cube = new THREE.Mesh(geometry, material)
scene.add(cube)

function animate() {
  requestAnimationFrame(animate)
  cube.rotation.x += 0.01
  cube.rotation.y += 0.01
  renderer.render(scene, camera)
}

animate()`,

  p5: `// p5.js Sketch
// Available: p5, canvas, width, height

p5.setup = () => {
  p5.createCanvas(width, height)
}

p5.draw = () => {
  p5.background(0, 0, 0, 10)
  
  p5.translate(width / 2, height / 2)
  
  for (let i = 0; i < 10; i++) {
    p5.push()
    p5.rotate(p5.frameCount * 0.01 + i * 0.4)
    p5.noFill()
    p5.stroke(67, 97, 238, 200)
    p5.rect(0, 0, 100 + i * 20, 100 + i * 20)
    p5.pop()
  }
}`,

  none: `// Canvas API Only
// Available: ctx, canvas, width, height

let time = 0

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, width, height)

  const centerX = width / 2
  const centerY = height / 2

  for (let i = 0; i < 20; i++) {
    const angle = (time + i * 0.5) * 0.02
    const radius = 100 + i * 15
    
    const x = centerX + Math.cos(angle * (i + 1)) * radius
    const y = centerY + Math.sin(angle * (i + 1)) * radius

    ctx.beginPath()
    ctx.arc(x, y, 5, 0, Math.PI * 2)
    ctx.fillStyle = \`hsl(\${(time * 2 + i * 20) % 360}, 70%, 60%)\`
    ctx.fill()
  }

  time++
  requestAnimationFrame(animate)
}

animate()`,
}

export function CustomScene({
  className,
  initialCode,
  libraries = 'none'
}: CustomSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [code, setCode] = useState<string>(initialCode || defaultTemplates[libraries])
  const [isRunning, setIsRunning] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLib, setSelectedLib] = useState(libraries)
  const cleanupRef = useRef<(() => void) | null>(null)
  const threeScriptRef = useRef<HTMLScriptElement | null>(null)
  const p5ScriptRef = useRef<HTMLScriptElement | null>(null)

  const loadLibrary = (lib: string) => {
    if (lib === 'three' && !threeScriptRef.current) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
      script.onload = () => loadScene()
      document.head.appendChild(script)
      threeScriptRef.current = script
    } else if (lib === 'p5' && !p5ScriptRef.current) {
      const script = document.createElement('script')
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js'
      script.onload = () => loadScene()
      document.head.appendChild(script)
      p5ScriptRef.current = script
    }
  }

  const cleanupScene = () => {
    if (cleanupRef.current) {
      try {
        cleanupRef.current()
      } catch {
      }
      cleanupRef.current = null
    }

    const canvas = canvasRef.current
    if (canvas) {
      const gl = canvas.getContext('webgl')
      if (gl) {
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
      canvas.width = 0
      canvas.height = 0
    }
  }

  const loadScene = () => {
    cleanupScene()
    loadLibrary(selectedLib)

    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    const width = canvas.width
    const height = canvas.height
    const ctx = canvas.getContext('2d')

    try {
      let THREE, p5

      if (selectedLib === 'three' && (window as any).THREE) {
        THREE = (window as any).THREE
      } else if (selectedLib === 'p5' && (window as any).p5) {
        p5 = new ((window as any).p5)((sketch: any) => {
          (window as any).p5Instance = sketch
        }, canvas)
      }

      const func = new Function('THREE', 'p5', 'cleanup', 'canvas', 'width', 'height', 'ctx', `
        "use strict"
        try {
          ${code}
          return null
        } catch (e) {
          return e.message
        }
      `)

      const error = func(THREE, p5, (fn: () => void) => { cleanupRef.current = fn }, canvas, width, height, ctx)

      if (error) {
        setError(error)
      } else {
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  useEffect(() => {
    setCode(defaultTemplates[selectedLib])
  }, [selectedLib])

  useEffect(() => {
    if (isRunning) {
      loadScene()
    } else {
      cleanupScene()
    }

    return () => {
      cleanupScene()
      if (threeScriptRef.current) {
        threeScriptRef.current.remove()
      }
      if (p5ScriptRef.current) {
        p5ScriptRef.current.remove()
      }
    }
  }, [isRunning, selectedLib])

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
    setError(null)
  }

  const runCode = () => {
    setIsRunning(true)
  }

  const resetCode = () => {
    setCode(defaultTemplates[selectedLib])
    setError(null)
  }

  return (
    <div ref={containerRef} className={cn('relative w-full h-full min-h-[460px] flex flex-col md:flex-row gap-4', className)}>
      <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
        
        {error && (
          <div className="absolute top-4 left-4 right-4 p-3 bg-red-500/90 text-white rounded-lg backdrop-blur-sm text-sm font-mono max-h-32 overflow-auto">
            {error}
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex gap-2">
          <motion.button
            onClick={() => setIsRunning(p => !p)}
            className="p-2 bg-black/80 dark:bg-white/80 text-white dark:text-black rounded-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
          </motion.button>
          <motion.button
            onClick={resetCode}
            className="p-2 bg-black/80 dark:bg-white/80 text-white dark:text-black rounded-lg backdrop-blur-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={18} />
          </motion.button>
        </div>

        <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/80 dark:bg-white/80 text-white dark:text-black text-sm rounded-lg backdrop-blur-sm">
          {selectedLib}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex gap-2 mb-2">
          <motion.button
            onClick={() => setSelectedLib('none')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedLib === 'none' ? 'bg-accent text-white' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Canvas
          </motion.button>
          <motion.button
            onClick={() => setSelectedLib('three')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedLib === 'three' ? 'bg-accent text-white' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Box size={16} className="inline mr-1" />
            Three.js
          </motion.button>
          <motion.button
            onClick={() => setSelectedLib('p5')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedLib === 'p5' ? 'bg-accent text-white' : 'bg-black/10 dark:bg-white/10 text-black dark:text-white'}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Code2 size={16} className="inline mr-1" />
            p5.js
          </motion.button>
        </div>

        <textarea
          value={code}
          onChange={handleCodeChange}
          className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg p-4 font-mono text-sm resize-none focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          spellCheck={false}
          placeholder="Write your code here..."
        />

        <div className="flex justify-end">
          <motion.button
            onClick={runCode}
            className="px-4 py-2 bg-accent hover:bg-accent-light text-white rounded-lg font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Run
          </motion.button>
        </div>
      </div>
    </div>
  )
}