'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { type ReactNode } from 'react'

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

export interface ContactModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function ContactModal({ isOpen, onClose, children, className, size = 'lg' }: ContactModalProps) {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                'relative w-full bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto',
                sizeClasses[size],
                className
              )}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export interface ContactFormProps {
  title: string
  description: string
  onSubmit: (data: Record<string, string>) => void | Promise<void>
  fields: ContactField[]
  isSuccess?: boolean
  isLoading?: boolean
  error?: string | null
}

export interface ContactField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select'
  placeholder?: string
  required?: boolean
  options?: Array<{ value: string; label: string }>
}

export function ContactForm({ title, description, onSubmit, fields, isSuccess, isLoading, error }: ContactFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    fields.forEach(field => {
      if (field.required && !formData[field.name]?.trim()) {
        newErrors[field.name] = `${field.label} is required`
      }
      if (field.type === 'email' && formData[field.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData[field.name])) {
        newErrors[field.name] = 'Invalid email address'
      }
    })

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const validationErrors = validate()

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-black dark:text-white">{title}</h2>
        <p className="text-black/60 dark:text-white/60">{description}</p>
      </div>

      {fields.map(field => (
        <div key={field.name} className="space-y-2">
          <label className="block text-sm font-medium text-black dark:text-white">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-lg border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          ) : field.type === 'select' ? (
            <select
              name={field.name}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all cursor-pointer"
            >
              <option value="">Select an option</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value} className="bg-white dark:bg-black">
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              name={field.name}
              placeholder={field.placeholder}
              required={field.required}
              value={formData[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-black/20 dark:border-white/20 bg-transparent text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
            />
          )}

          {errors[field.name] && (
            <p className="text-sm text-red-500 dark:text-red-400">{errors[field.name]}</p>
          )}
        </div>
      ))}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isLoading || isSuccess}
        className="w-full px-6 py-4 bg-accent hover:bg-accent-light disabled:bg-black/20 dark:disabled:bg-white/20 text-white font-medium rounded-lg transition-all disabled:cursor-not-allowed disabled:opacity-50"
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isSuccess ? 'Sent successfully!' : isLoading ? 'Sending...' : 'Send message'}
      </motion.button>
    </form>
  )
}