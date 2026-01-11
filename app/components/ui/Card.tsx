import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface CardProps {
  children: ReactNode
  hover?: boolean
  variant?: 'default' | 'gradient' | 'bordered'
  id?: string
  className?: string
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
}

export function Card({ children, hover = true, variant = 'default', className, ...props }: CardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(cardRef, { once: false, amount: 0.1 })

  const variants = {
    default: 'bg-white dark:bg-black border border-black/10 dark:border-white/10',
    gradient: 'bg-gradient-to-br from-black to-gray-900 dark:from-white dark:to-gray-100 text-white dark:text-black',
    bordered: 'bg-transparent border-2 border-black dark:border-white',
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      className={cn(
        'rounded-xl p-6 transition-all duration-500 ease-[0.22,1,0.36,1]',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-xl font-bold text-black dark:text-white', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('text-sm text-black/60 dark:text-white/60', className)}>
      {children}
    </p>
  )
}