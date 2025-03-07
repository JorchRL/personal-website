'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Link from 'next/link'

// Social media icons
import LinkedInIcon from '../components/icons/LinkedInIcon'
import GitHubIcon from '../components/icons/GitHubIcon'
import TwitterIcon from '../components/icons/TwitterIcon'
import WhatsAppIcon from '../components/icons/WhatsAppIcon'

export default function Contact() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.5 })

  return (
    <section id="contact" ref={ref} className="py-40">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full bg-black dark:bg-white text-white dark:text-black py-16"
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center space-y-12">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl tracking-wider">
                talk to me.
              </h2>
              <Link href="/contact" className="flex items-center justify-center w-8 h-8 border border-white/30 dark:border-black/30 hover:border-white dark:hover:border-black transition-colors group">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="w-4 h-4 transform group-hover:scale-110 transition-transform" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Link>
            </div>
            
            <div className="flex space-x-12">
              <a
                href="https://linkedin.com/in/jorchrl"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                <LinkedInIcon className="w-6 h-6" />
              </a>
              
              <a
                href="https://github.com/jorchrl"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                <GitHubIcon className="w-6 h-6" />
              </a>
              
              <a
                href="https://twitter.com/jrlgs"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                <TwitterIcon className="w-6 h-6" />
              </a>
              
              <a
                href="https://wa.me/527773369629"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-80 hover:opacity-100 transition-opacity"
              >
                <WhatsAppIcon className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
} 