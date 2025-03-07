import Link from 'next/link'
import Header from '../_components/Header'

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <main className="flex-grow">
        {children}
      </main>
    </>
  )
} 