import type { Metadata } from 'next'
import { inter, roboto_mono } from './lib/fonts'
import './globals.css'
import CustomCursor from './components/CustomCursor'
import Tesseract from './components/Tesseract'
import ShaderEffect from './components/ShaderEffect'

export const metadata: Metadata = {
  title: 'Jorge Romero | Software Developer',
  description: 'Jorge Romero is a freelance software developer who builds exceptional digital experiences',
  keywords: ['developer', 'software', 'web', 'portfolio', 'minimal'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`}>
      <body className="antialiased bg-white dark:bg-black text-black dark:text-white">
        <CustomCursor />
        <Tesseract />
        <ShaderEffect />
        <div className="flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
} 