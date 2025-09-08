import Link from 'next/link'
import Header from '../_components/Header'
import Footer from '../_components/Footer'
import ContactClient from './ContactClient'
import { Resend } from 'resend'

export default function ContactPage() {
  async function sendEmail(prevState: { ok: boolean; error?: string }, formData: FormData) {
    'use server'

    try {
      const name = String(formData.get('name') || '')
      const email = String(formData.get('email') || '')
      const subject = String(formData.get('subject') || '')
      const message = String(formData.get('message') || '')

      if (!name || !email || !message) {
        return { ok: false, error: 'Missing required fields' }
      }

      const apiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY
      if (!apiKey) {
        return { ok: false, error: 'Email service not configured' }
      }

      const resend = new Resend(apiKey)
      const from = "Personal Website <contact@jrlgs.dev>"

      await resend.emails.send({
        from,
        to: 'jorch.rl@gmail.com',
        subject: subject || 'New contact message',
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`,
      })

      return { ok: true }
    } catch (err) {
      return { ok: false, error: 'Failed to send message' }
    }
  }

  return (
    <>
      <Header />
      <main className="flex-grow pt-36 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-16">
              <h1 className="text-3xl font-bold">Contact</h1>
              <Link href="/" className="text-xs uppercase tracking-widest border border-black/20 dark:border-white/20 px-4 py-2 hover:border-black dark:hover:border-white transition-colors">
                Back
              </Link>
            </div>

            <ContactClient action={sendEmail} />

            <div className="mt-24 space-y-8">
              <h2 className="text-xl">Other ways to reach me</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-black/20 dark:border-white/20 p-6">
                  <h3 className="text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">Email</h3>
                  <a href="mailto:jorch.rl@gmail.com" className="text-lg hover:underline">
                    jorch.rl@gmail.com
                  </a>
                </div>
                
                <div className="border border-black/20 dark:border-white/20 p-6">
                  <h3 className="text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">Phone</h3>
                  <a href="tel:+52-4943-7096" className="text-lg hover:underline">
                    +52 4943 7096
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}