import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Link from 'next/link'

import Head from "next/head";
import Contact from '../components/Contact';
import WorkFooter from '../components/WorkFooter';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div className='flex flex-col min-h-screen'>
      <header className="flex justify-between px-6 items-center pt-6">

        <Link href="/">

          <h1 className="font-bold text-3xl font-sans">JR</h1>
        </Link>

        <Link href="/">
          <span className="text-lg ">
            
          </span>
        </Link>


      </header>

      {/* Rest of the Page */}
      <Component {...pageProps} />
      {/* Rest of the Page */}

      <footer  >
        <Contact />
        <WorkFooter />
      </footer>

    </div>
  )
}

export default MyApp
