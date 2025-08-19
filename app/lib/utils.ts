
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate random session code
export function generateSessionCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length))
  }
  return result
}

// Format time remaining for questions
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return "0:00"
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Validate file upload
export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  
  if (file.size > maxSize) {
    return { valid: false, error: "File size must be less than 10MB" }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Only image files are allowed (JPG, PNG, GIF, WebP)" }
  }
  
  return { valid: true }
}

// Get file extension from filename
export function getFileExtension(filename: string): string {
  return filename.split('.').pop() || ''
}

// Generate unique filename
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const extension = getFileExtension(originalName)
  return `${timestamp}_${random}.${extension}`
}

// Format participant count
export function formatParticipantCount(count: number): string {
  if (count === 1) return "1 participant"
  return `${count} participants`
}

// Calculate response percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Format session status
export function formatSessionStatus(status: string): string {
  switch (status) {
    case 'WAITING':
      return 'Waiting to start'
    case 'ACTIVE':
      return 'Active'
    case 'PAUSED':
      return 'Paused'
    case 'COMPLETED':
      return 'Completed'
    default:
      return status
  }
}

// Check if user is admin
export function isAdmin(userRole?: string): boolean {
  return userRole === 'ADMIN'
}

// Safe JSON parse
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString)
  } catch {
    return fallback
  }
}
