import Hero from '../sections/Hero'
import Projects from '../sections/Projects'
import Contact from '../sections/Contact'
import Header from '../_components/Header'
import Footer from '../_components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-grow">
        <Hero />
        <Projects />
        <Contact />
      </main>
      <Footer />
    </>
  )
} 