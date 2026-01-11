'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Github, Linkedin, Twitter } from 'lucide-react'

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com/jorchrl', icon: Github },
  { name: 'LinkedIn', href: 'https://linkedin.com/in/jorchrl', icon: Linkedin },
  { name: 'Twitter', href: 'https://twitter.com/jrlgs', icon: Twitter },
]

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-black text-white py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo & Copyright */}
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="text-2xl font-black tracking-tighter hover:text-accent transition-colors"
            >
              JR<span className="text-accent">.</span>
            </Link>
            <span className="text-white/30">|</span>
            <span className="text-sm text-white/40">
              © {currentYear}
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((link) => (
              <motion.a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <link.icon className="w-4 h-4 text-white/70" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
