'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="py-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex justify-between items-center border-t border-black/10 dark:border-white/10 pt-6"
        >
          <Link href="/" className="text-xs tracking-widest uppercase">
            JR
          </Link>
          
          <p className="text-xs text-black/50 dark:text-white/50">
            &copy; {currentYear}
          </p>
        </motion.div>
      </div>
    </footer>
  )
} 