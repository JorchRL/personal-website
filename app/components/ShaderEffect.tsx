'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

// Define the fragment shader
const fragmentShader = `
  precision mediump float;
  
  uniform float time;
  uniform vec2 resolution;
  uniform vec2 mouse;
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 center = vec2(0.5, 0.5);
    
    // Calculate distance from mouse position
    float mouseDist = distance(uv, mouse);
    
    // Subtle vignette effect
    float vignette = smoothstep(1.0, 0.4, length(uv - center));
    
    // Add subtle mouse-based distortion
    float mouseEffect = smoothstep(0.2, 0.0, mouseDist) * 0.02;
    
    // Combine effects - keep this very subtle
    float effect = vignette * 0.05 + mouseEffect;
    
    // Output final color with very low opacity
    // Dark mode: slightly lighten the edges
    // Light mode: slightly darken the edges
    gl_FragColor = vec4(0.5, 0.5, 0.5, effect * 0.15);
  }
`

export default function ShaderEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const gl = canvas.getContext('webgl', { 
      alpha: true,
      premultipliedAlpha: true,
      antialias: true
    })
    if (!gl) {
      console.error('WebGL not supported')
      return
    }
    
    // Enable transparency
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    
    // Create shader program
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    const fragShader = gl.createShader(gl.FRAGMENT_SHADER)
    
    if (!vertexShader || !fragShader) {
      console.error('Unable to create shaders')
      return
    }
    
    // Vertex shader source - just passing through coordinates
    const vertexShaderSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `
    
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.shaderSource(fragShader, fragmentShader)
    
    gl.compileShader(vertexShader)
    gl.compileShader(fragShader)
    
    // Check for shader compilation errors
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error('Vertex shader compilation error:', gl.getShaderInfoLog(vertexShader))
      return
    }
    
    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fragShader))
      return
    }
    
    // Create and link program
    const program = gl.createProgram()
    if (!program) {
      console.error('Unable to create program')
      return
    }
    
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragShader)
    gl.linkProgram(program)
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program))
      return
    }
    
    gl.useProgram(program)
    
    // Create a quad that covers the screen
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = new Float32Array([
      -1.0, -1.0,
       1.0, -1.0,
      -1.0,  1.0,
       1.0,  1.0
    ])
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
    
    // Set up attribute
    const positionLocation = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    
    // Set up uniforms
    const timeLocation = gl.getUniformLocation(program, 'time')
    const resolutionLocation = gl.getUniformLocation(program, 'resolution')
    const mouseLocation = gl.getUniformLocation(program, 'mouse')
    
    // Set initial resolution
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
    }
    
    // Initial size
    handleResize()
    window.addEventListener('resize', handleResize)
    
    // Animation variables
    let startTime = Date.now()
    let frameId: number
    
    // Render loop
    const render = () => {
      // Update time uniform
      const currentTime = (Date.now() - startTime) / 1000
      gl.uniform1f(timeLocation, currentTime)
      
      // Update mouse uniform
      gl.uniform2f(mouseLocation, mousePosition.x, 1.0 - mousePosition.y) // Flip Y for WebGL coordinates
      
      // Clear the canvas
      gl.clear(gl.COLOR_BUFFER_BIT)
      
      // Draw the quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      
      frameId = requestAnimationFrame(render)
    }
    
    render()
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameId)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragShader)
      gl.deleteBuffer(positionBuffer)
    }
  }, [mousePosition])
  
  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])
  
  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-50 mix-blend-multiply dark:mix-blend-soft-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      transition={{ duration: 1.5 }}
    />
  )
} 