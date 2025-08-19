
import { NextRequest, NextResponse } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { prisma } from "@/lib/db"
import { validateFileUpload, generateUniqueFilename } from "@/lib/utils"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file
    const validation = validateFileUpload(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name)
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads')
    
    try {
      await writeFile(join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()))
    } catch (error) {
      // Directory might not exist, create it
      const { mkdir } = await import('fs/promises')
      await mkdir(uploadsDir, { recursive: true })
      await writeFile(join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()))
    }

    // Save to database
    const upload = await prisma.upload.create({
      data: {
        filename,
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        fileUrl: `/api/files/${filename}`
      }
    })

    return NextResponse.json(upload, { status: 201 })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
