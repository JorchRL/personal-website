'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '../_components/Header'
import Footer from '../_components/Footer'

export default function ContactPage() {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormState((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitSuccess(true)
      setFormState({ name: '', email: '', subject: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 5000)
    }, 1500)
  }

  return (
    <>
      <Header />
      <main className="flex-grow pt-36 pb-24">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-between mb-16">
              <h1 className="text-3xl font-bold">Contact</h1>
              <Link href="/" className="text-xs uppercase tracking-widest border border-black/20 dark:border-white/20 px-4 py-2 hover:border-black dark:hover:border-white transition-colors">
                Back
              </Link>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                >
                  <option value="" disabled>Select a subject</option>
                  <option value="Project inquiry">Project inquiry</option>
                  <option value="Job opportunity">Job opportunity</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                ></textarea>
              </div>

              <div>
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-transparent hover:text-black dark:hover:bg-transparent dark:hover:text-white transition-colors duration-300 flex items-center justify-center"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {isSubmitting ? (
                    <span className="inline-block h-5 w-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin mr-2"></span>
                  ) : null}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </motion.button>

                {submitSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center text-sm text-green-600 dark:text-green-400"
                  >
                    Your message has been sent successfully!
                  </motion.p>
                )}
              </div>
            </form>
            
            <div className="mt-24 space-y-8">
              <h2 className="text-xl">Other ways to reach me</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-black/20 dark:border-white/20 p-6">
                  <h3 className="text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">Email</h3>
                  <a href="mailto:contact@jorgeromero.dev" className="text-lg hover:underline">
                    contact@jorgeromero.dev
                  </a>
                </div>
                
                <div className="border border-black/20 dark:border-white/20 p-6">
                  <h3 className="text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">Phone</h3>
                  <a href="tel:+527773369629" className="text-lg hover:underline">
                    +52 777 336 9629
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
} 