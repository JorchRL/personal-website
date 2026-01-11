export interface ContactFormBase {
  name: string
  email: string
  message: string
}

export interface HiringForm extends ContactFormBase {
  company?: string
  position?: string
  jobType?: 'full-time' | 'contract' | 'freelance'
  budget?: string
  timeline?: string
  techStack?: string
}

export interface CollaborationForm extends ContactFormBase {
  projectType?: string
  timeline?: string
  budget?: string
  currentStage?: string
}

export interface NetworkingForm extends ContactFormBase {
  topic?: string
  twitter?: string
  linkedin?: string
}

export type ContactFormType = 'hiring' | 'collaboration' | 'networking'