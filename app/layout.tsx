import type { Metadata } from 'next'
import { inter, roboto_mono } from './lib/fonts'
import { ThemeProvider } from './providers/ThemeProvider'
import './globals.css'

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
    <html lang="en" className={`${inter.variable} ${roboto_mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}