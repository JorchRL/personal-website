import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  magnetic?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  type?: 'button' | 'submit' | 'reset'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', magnetic = false, disabled = false, className, children, onClick, type = 'button', ...props }, ref) => {
    const variantClasses = {
      primary: 'bg-accent hover:bg-accent-light text-white',
      secondary: 'border border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white',
      ghost: 'hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white',
      outline: 'border-2 border-accent text-accent hover:bg-accent hover:text-white',
    }

    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl',
    }

    const Component = (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 ease-[0.22,1,0.36,1] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        onClick={onClick}
        whileHover={!disabled ? { scale: 1.02 } : {}}
        whileTap={!disabled ? { scale: 0.98 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.button>
    )

    if (magnetic) {
      return (
        <motion.div
          className="inline-block"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          {Component}
        </motion.div>
      )
    }

    return Component
  }
)

Button.displayName = 'Button'

export { Button }