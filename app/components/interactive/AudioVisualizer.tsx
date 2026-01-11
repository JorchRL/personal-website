'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Mic, MicOff } from 'lucide-react'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface AudioVisualizerProps {
  className?: string
  showBars?: boolean
  showWaveform?: boolean
  showSpectrum?: boolean
  barCount?: number
  color?: string
}

export function AudioVisualizer({
  className,
  showBars = true,
  showWaveform = false,
  showSpectrum = true,
  barCount = 64,
  color = '#4361EE'
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationRef = useRef<number>()

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = barCount * 2

      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      sourceRef.current = source

      setIsListening(true)
      setError(null)
    } catch (err) {
      setError('Microphone access denied')
      console.error('Audio visualizer error:', err)
    }
  }, [barCount])

  const stopListening = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.disconnect()
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    setIsListening(false)
  }, [])

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

      if (isListening && analyserRef.current) {
        const bufferLength = analyserRef.current.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyserRef.current.getByteFrequencyData(dataArray)

        const barWidth = canvas.width / bufferLength
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
        gradient.addColorStop(0, color)
        gradient.addColorStop(1, `${color}33`)

        if (showBars) {
          dataArray.forEach((value, i) => {
            const barHeight = (value / 255) * canvas.height
            const x = i * barWidth
            const y = canvas.height - barHeight

            ctx.fillStyle = gradient
            ctx.fillRect(x, y, barWidth - 1, barHeight)
          })
        }

        if (showSpectrum) {
          dataArray.forEach((value, i) => {
            const x = (i / bufferLength) * canvas.width
            const y = canvas.height
            const radius = (value / 255) * 50

            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fillStyle = `${color}${Math.floor((value / 255) * 255).toString(16).padStart(2, '0')}`
            ctx.fill()
          })
        }

        if (showWaveform) {
          const waveformArray = new Uint8Array(bufferLength)
          analyserRef.current.getByteTimeDomainData(waveformArray)

          ctx.beginPath()
          ctx.strokeStyle = color
          ctx.lineWidth = 2

          waveformArray.forEach((value, i) => {
            const x = (i / bufferLength) * canvas.width
            const y = (value / 255) * canvas.height

            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          })

          ctx.stroke()
        }
      } else {
        ctx.fillStyle = `${color}22`
        for (let i = 0; i < barCount; i++) {
          const barHeight = Math.sin(Date.now() * 0.003 + i * 0.2) * 20 + 30
          const x = (canvas.width / barCount) * i
          const y = canvas.height - barHeight

          ctx.fillRect(x, y, canvas.width / barCount - 2, barHeight)
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening, showBars, showWaveform, showSpectrum, barCount, color])

  useEffect(() => {
    return () => {
      stopListening()
    }
  }, [stopListening])

  return (
    <div ref={containerRef} className={cn('relative w-full h-full min-h-[400px]', className)}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <motion.button
        onClick={isListening ? stopListening : startListening}
        className="absolute top-4 right-4 p-3 bg-black/80 dark:bg-white/80 text-white dark:text-black rounded-lg backdrop-blur-sm transition-all hover:scale-105"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} />}
      </motion.button>

      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500/90 text-white rounded-lg backdrop-blur-sm text-sm">
          {error}
        </div>
      )}

      <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-black/80 dark:bg-white/80 text-white dark:text-black text-sm rounded-lg backdrop-blur-sm">
        {isListening ? 'listening' : 'demo mode'}
      </div>
    </div>
  )
}