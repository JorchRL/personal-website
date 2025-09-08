'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { motion } from 'framer-motion'

type ContactAction = (prevState: { ok: boolean; error?: string }, formData: FormData) => Promise<{ ok: boolean; error?: string }>

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <motion.button
      type="submit"
      disabled={pending}
      className="w-full px-6 py-3 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white hover:bg-transparent hover:text-black dark:hover:bg-transparent dark:hover:text-white transition-colors duration-300 flex items-center justify-center"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {pending ? (
        <span className="inline-block h-5 w-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin mr-2"></span>
      ) : null}
      {pending ? 'Sending...' : 'Send Message'}
    </motion.button>
  )
}

export default function ContactClient({ action }: { action: ContactAction }) {
  const [state, formAction] = useFormState(action, { ok: false })

  return (
    <form action={formAction} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label htmlFor="name" className="block text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
        >
          <option value="" disabled>Select a subject</option>
          <option value="Project inquiry">Project inquiry</option>
          <option value="Job opportunity">Job opportunity</option>
          <option value="Collaboration">Collaboration</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-xs uppercase tracking-widest text-black/60 dark:text-white/60 mb-2">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          className="w-full px-4 py-3 bg-transparent border border-black/20 dark:border-white/20 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
        ></textarea>
      </div>

      <div>
        <SubmitButton />

        {state.ok && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-sm text-green-600 dark:text-green-400"
          >
            Your message has been sent successfully!
          </motion.p>
        )}

        {!state.ok && state.error && (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </div>
    </form>
  )
}


