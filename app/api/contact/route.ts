import { NextResponse } from 'next/server'
import { Resend } from 'resend'

type ContactBody = {
  formType?: 'hiring' | 'collaboration' | 'networking'
  name: string
  email: string
  // Hiring fields
  company?: string
  position?: string
  positionType?: string
  // Collaboration fields
  project?: string
  timeline?: string
  interest?: string
  // Networking fields
  linkedin?: string
  topic?: string
  // Generic
  subject?: string
  message?: string
}

function formatEmailContent(body: ContactBody): { subject: string; text: string; html: string } {
  const { formType, name, email, ...rest } = body

  let subject = 'New Contact Message'
  let sections: string[] = []

  if (formType === 'hiring') {
    subject = `Hiring Inquiry from ${body.company || 'Unknown Company'}`
    sections = [
      `**Name:** ${name}`,
      `**Email:** ${email}`,
      `**Company:** ${body.company || 'N/A'}`,
      `**Position:** ${body.position || 'N/A'}`,
      `**Type:** ${body.positionType || 'N/A'}`,
      ``,
      `**Message:**`,
      body.message || 'No message provided',
    ]
  } else if (formType === 'collaboration') {
    subject = `Collaboration Request from ${name}`
    sections = [
      `**Name:** ${name}`,
      `**Email:** ${email}`,
      `**Company/Org:** ${body.company || 'N/A'}`,
      `**Timeline:** ${body.timeline || 'N/A'}`,
      ``,
      `**Project Idea:**`,
      body.project || 'No project description',
      ``,
      `**Why me:**`,
      body.interest || 'No reason provided',
    ]
  } else if (formType === 'networking') {
    subject = `Let's Connect - ${name}`
    sections = [
      `**Name:** ${name}`,
      `**Email:** ${email}`,
      `**LinkedIn:** ${body.linkedin || 'N/A'}`,
      `**Topic:** ${body.topic || 'N/A'}`,
      ``,
      `**What brings them here:**`,
      body.interest || 'No message provided',
    ]
  } else {
    // Generic contact
    subject = body.subject || 'New Contact Message'
    sections = [
      `**Name:** ${name}`,
      `**Email:** ${email}`,
      ``,
      `**Message:**`,
      body.message || 'No message provided',
    ]
  }

  const text = sections.join('\n')
  const html = sections
    .map(line => {
      if (line.startsWith('**') && line.includes(':**')) {
        const [label, value] = line.split(':** ')
        return `<p><strong>${label.replace('**', '')}:</strong> ${value || ''}</p>`
      }
      if (line === '') return '<br/>'
      return `<p>${line}</p>`
    })
    .join('')

  return { subject, text, html }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactBody

    if (!body.email || !body.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY not configured')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    const { subject, text, html } = formatEmailContent(body)
    
    const resp = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Personal Website <onboarding@resend.dev>',
      to: 'jorch.rl@gmail.com',
      replyTo: body.email,
      subject,
      text,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="border-bottom: 2px solid #4361EE; padding-bottom: 20px; margin-bottom: 20px;">
            <h1 style="margin: 0; color: #000; font-size: 24px;">${subject}</h1>
            <p style="margin: 10px 0 0; color: #666; font-size: 14px;">From your personal website contact form</p>
          </div>
          ${html}
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #999; font-size: 12px;">
            <p>Reply directly to this email to respond to ${body.name} at ${body.email}</p>
          </div>
        </div>
      `,
    } as Parameters<typeof resend.emails.send>[0])

    if ((resp as any)?.error) {
      console.error('Resend error:', (resp as any).error)
      return NextResponse.json({ error: 'Failed to send' }, { status: 502 })
    }

    const id = (resp as any)?.id ?? (resp as any)?.data?.id
    return NextResponse.json({ ok: true, id })
  } catch (err) {
    console.error('Contact API error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
