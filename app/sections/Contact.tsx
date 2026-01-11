'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Link from 'next/link'
import { ContactFormSelector } from '../components/contact/ContactFormSelector'
import { ArrowUpRight, ChevronDown, Github, Linkedin, Twitter, Mail } from 'lucide-react'

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/jorchrl', icon: Github },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/jorchrl', icon: Linkedin },
  { name: 'Twitter', href: 'https://twitter.com/jrlgs', icon: Twitter },
  { name: 'Email', href: 'mailto:jorch.rl@gmail.com', icon: Mail },
]

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Projects', href: '/#projects' },
]

export default function Contact() {
  const [isExpanded, setIsExpanded] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.1 })
  const currentYear = new Date().getFullYear()

  // Listen for unfold event (for programmatic triggers)
  useEffect(() => {
    const handleUnfold = () => {
      setIsExpanded(true)
    }

    window.addEventListener('unfoldContact', handleUnfold)
    return () => window.removeEventListener('unfoldContact', handleUnfold)
  }, [])

  return (
    <section 
      ref={sectionRef}
      id="contact" 
      className="relative bg-black text-white"
    >
      {/* Decorative gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

      <div className="container-custom py-24 md:py-32">
        {/* Main CTA Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-mono text-white/40 block mb-4">
            Get in touch
          </span>
          <h2 className="text-5xl md:text-6xl lg:text-8xl font-black tracking-tight mb-6">
            Got a project?
            <br />
            <span className="text-accent">Let's talk</span>
            <span className="text-white/20">.</span>
          </h2>
          <p className="text-xl text-white/60 max-w-lg">
            I'm always interested in hearing about new projects and opportunities.
          </p>
        </motion.div>

        {/* Expandable Contact Form */}
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="collapsed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-24"
            >
              <motion.button
                onClick={() => setIsExpanded(true)}
                className="group inline-flex items-center gap-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl md:text-2xl text-white group-hover:text-accent transition-colors">
                  Start a conversation
                </span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:border-accent transition-colors"
                >
                  <ChevronDown className="w-5 h-5 text-white/60 group-hover:text-accent transition-colors" />
                </motion.div>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-24"
            >
              {/* Form Selector */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="max-w-4xl mb-12"
              >
                <ContactFormSelector />
              </motion.div>

              {/* Direct email option */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col md:flex-row md:items-center gap-4 mb-8"
              >
                <span className="text-white/40">Or email directly:</span>
                <a 
                  href="mailto:jorch.rl@gmail.com"
                  className="group inline-flex items-center gap-2 text-xl font-medium text-white hover:text-accent transition-colors"
                >
                  jorch.rl@gmail.com
                  <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </a>
              </motion.div>

              {/* Collapse button */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={() => setIsExpanded(false)}
                className="text-sm text-white/30 hover:text-white/60 transition-colors"
              >
                Collapse
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 py-12 border-t border-white/10">
          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">
              Navigation
            </h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">
              Social
            </h3>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">
              Location
            </h3>
            <p className="text-white/70">Mexico City, MX</p>
            <p className="text-white/50 text-sm mt-1">CST (UTC-6)</p>
          </motion.div>

          {/* Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-white/40 mb-4">
              Status
            </h3>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-white/70">Available for projects</span>
            </div>
          </motion.div>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-12 border-t border-white/10"
        >
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-2xl font-black tracking-tighter hover:text-accent transition-colors"
            >
              JR<span className="text-accent">.</span>
            </Link>
            <span className="text-white/30">|</span>
            <span className="text-sm text-white/40">Jorge Romero</span>
          </div>

          <p className="text-sm text-white/40">
            © {currentYear} All rights reserved
          </p>
        </motion.div>
      </div>
    </section>
  )
}
