'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ContactModal, ContactForm } from './ContactForm'
import { type ContactField } from './ContactForm'
import { X, Briefcase, DollarSign, Users } from 'lucide-react'

export interface ContactFormSelectorProps {
  className?: string
}

export function ContactFormSelector({ className }: ContactFormSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedForm, setSelectedForm] = useState<'hiring' | 'collaboration' | 'networking' | null>(null)

  const formConfigs: Record<string, { fields: ContactField[]; title: string; description: string; icon: any }> = {
    hiring: {
      fields: [
        { name: 'name', label: 'Your Name', type: 'text', placeholder: 'John Doe', required: true },
        { name: 'company', label: 'Company Name', type: 'text', placeholder: 'Acme Inc.', required: true },
        { name: 'email', label: 'Work Email', type: 'email', placeholder: 'john@company.com', required: true },
        { name: 'position', label: 'Position', type: 'text', placeholder: 'CTO, CEO, etc.', required: true },
        { name: 'positionType', label: 'Position Type', type: 'select', placeholder: 'Full-time', options: [
          { value: 'full-time', label: 'Full-time' },
          { value: 'contract', label: 'Contract' },
          { value: 'freelance', label: 'Freelance' },
        ]},
        { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Tell me about the opportunity...', required: true },
      ],
      title: 'Hiring Inquiry',
      description: 'Looking to bring me on board? Let me know about the role!',
      icon: Briefcase,
    },
    collaboration: {
      fields: [
        { name: 'name', label: 'Your Name', type: 'text', placeholder: 'Jane Smith', required: true },
        { name: 'company', label: 'Company/Organization', type: 'text', placeholder: 'Your startup or organization', required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'jane@startup.com', required: true },
        { name: 'project', label: 'Project Idea', type: 'textarea', placeholder: 'Describe your project vision...', required: true },
        { name: 'timeline', label: 'Timeline', type: 'select', options: [
          { value: 'asap', label: 'ASAP' },
          { value: '1-3 months', label: '1-3 months' },
          { value: '3-6 months', label: '3-6 months' },
          { value: '6+ months', label: '6+ months' },
        ]},
        { name: 'interest', label: 'Why me?', type: 'textarea', placeholder: 'Why would you like to collaborate specifically?', required: true },
      ],
      title: 'Collaboration Request',
      description: 'Have a project in mind? Let\'s make something great together!',
      icon: Users,
    },
    networking: {
      fields: [
        { name: 'name', label: 'Your Name', type: 'text', placeholder: 'Your Name', required: true },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com', required: true },
        { name: 'linkedin', label: 'LinkedIn', type: 'text', placeholder: 'linkedin.com/in/yourprofile', required: false },
        { name: 'interest', label: 'What brings you here?', type: 'textarea', placeholder: 'I\'d love to connect because...', required: true },
        { name: 'topic', label: 'Topics of Interest', type: 'select', options: [
          { value: 'tech', label: 'Tech & Development' },
          { value: 'design', label: 'Design & UX' },
          { value: 'startups', label: 'Startups & Entrepreneurship' },
          { value: 'other', label: 'Other' },
        ]},
      ],
      title: 'Let\'s Connect',
      description: 'Interested in connecting? I\'d love to hear from you!',
      icon: DollarSign,
    },
  }

  const handleSubmit = async (data: Record<string, string>) => {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType: selectedForm, ...data }),
    })

    if (!response.ok) throw new Error('Failed to send message')
  }

  const openForm = (formType: 'hiring' | 'collaboration' | 'networking') => {
    setSelectedForm(formType)
    setIsOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(formConfigs).map(([key, config]) => {
          const Icon = config.icon
          return (
            <motion.button
              key={key}
              onClick={() => openForm(key as any)}
              className="group relative p-6 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-xl text-left transition-all hover:border-accent"
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="mb-4">
                <Icon className="w-12 h-12 text-black dark:text-white group-hover:text-accent transition-colors" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-black dark:text-white">{config.title}</h3>
              <p className="text-sm text-black/60 dark:text-white/60">{config.description}</p>
              
              <motion.div
                className="absolute inset-0 bg-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                initial={false}
              />
            </motion.button>
          )
        })}
      </div>

      <ContactModal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <div className="p-8">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5 text-black dark:text-white" />
          </button>

          {selectedForm && (
            <ContactForm
              title={formConfigs[selectedForm].title}
              description={formConfigs[selectedForm].description}
              fields={formConfigs[selectedForm].fields}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </ContactModal>
    </div>
  )
}