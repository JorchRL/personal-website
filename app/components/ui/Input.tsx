import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface InputProps {
  label?: string
  error?: string
  helper?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  required?: boolean
  id?: string
  name?: string
  className?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helper, type = 'text', placeholder, value, onChange, disabled, required, id, name, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium mb-2 text-black dark:text-white"
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <motion.input
          type={type}
          id={id}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={cn(
            'w-full px-4 py-3 rounded-lg border border-black/20 dark:border-white/20',
            'bg-transparent text-black dark:text-white',
            'placeholder:text-black/40 dark:placeholder:text-white/40',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent',
            'transition-all duration-300 ease-[0.22,1,0.36,1]',
            error && 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500',
            disabled && 'opacity-50 cursor-not-allowed',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-red-500 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
        {helper && !error && (
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            {helper}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }