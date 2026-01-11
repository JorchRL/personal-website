import { supabase } from '../supabase/client'
import type { ContactFormType } from '../types/contact'
import type { ContactSubmission } from '../types/posts'

export async function submitContactForm(
  formType: ContactFormType,
  data: Record<string, any>
) {
  const { data: submission, error } = await supabase
    .from('contact_submissions')
    .insert({
      form_type: formType,
      name: data.name,
      email: data.email,
      form_data: data,
    })
    .select()
    .single()

  if (error) throw error
  return submission as ContactSubmission
}

export async function getContactSubmissions(limit = 50) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as ContactSubmission[]
}