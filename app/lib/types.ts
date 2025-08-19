
export interface User {
  id: string
  name?: string | null
  email?: string | null
  role: 'ADMIN' | 'PARTICIPANT'
  image?: string | null
}

export interface Session {
  user?: User
}

export interface PollingSession {
  id: string
  title: string
  description?: string | null
  sessionCode: string
  adminId: string
  status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  allowAnonymous: boolean
  showRealTimeResults: boolean
  maxParticipants?: number | null
  createdAt: Date
  updatedAt: Date
  admin: User
  questions: Question[]
  participants: SessionParticipant[]
  responses: Response[]
}

export interface Question {
  id: string
  sessionId: string
  title: string
  description?: string | null
  type: 'MULTIPLE_CHOICE' | 'TEXT' | 'PHOTO_UPLOAD' | 'RATING' | 'POLL'
  options: string[]
  required: boolean
  active: boolean
  order: number
  timeLimit?: number | null
  createdAt: Date
  updatedAt: Date
  responses: Response[]
}

export interface Response {
  id: string
  questionId: string
  sessionId: string
  userId?: string | null
  participantId?: string | null
  responseType: 'TEXT' | 'OPTION' | 'FILE' | 'RATING'
  textValue?: string | null
  optionValue?: string | null
  fileUrl?: string | null
  submittedAt: Date
}

export interface SessionParticipant {
  id: string
  sessionId: string
  userId?: string | null
  nickname?: string | null
  joinedAt: Date
}

export interface Upload {
  id: string
  filename: string
  originalName: string
  mimeType: string
  fileSize: number
  fileUrl: string
  uploadedAt: Date
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Question form types
export interface CreateQuestionForm {
  title: string
  description?: string
  type: Question['type']
  options?: string[]
  required?: boolean
  timeLimit?: number
}

// Session form types
export interface CreateSessionForm {
  title: string
  description?: string
  allowAnonymous?: boolean
  showRealTimeResults?: boolean
  maxParticipants?: number
}

// Join session form
export interface JoinSessionForm {
  sessionCode: string
  nickname?: string
}
