import { NextResponse } from 'next/server'
import { Resend } from 'resend'

type ContactBody = {
  name: string
  email: string
  subject: string
  message: string
}





export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ContactBody

    if (!body.email || !body.message || !body.name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    
    const resp = await resend.emails.send({
      from: process.env.RESEND_FROM || 'Personal Website <onboarding@resend.dev>',
      to: 'jorch.rl@gmail.com',
      subject: body.subject || 'New contact message',
      text: `Name: ${body.name}\nEmail: ${body.email}\n\n${body.message}`,
      html: `<p><strong>Name:</strong> ${body.name}</p><p><strong>Email:</strong> ${body.email}</p><p>${body.message}</p>`,
    })
    if ((resp as any)?.error) {
      return NextResponse.json({ error: 'Failed to send' }, { status: 502 })
    }
    const id = (resp as any)?.id ?? (resp as any)?.data?.id
    return NextResponse.json({ ok: true, id })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Contact API error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


