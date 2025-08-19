
import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { lookup } from "mime-types"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string[] } }
) {
  try {
    const filename = params.filename.join('/')
    
    if (!filename) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 })
    }

    const filePath = join(process.cwd(), 'uploads', filename)
    
    try {
      const fileBuffer = await readFile(filePath)
      const mimeType = lookup(filename) || 'application/octet-stream'

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000'
        }
      })
    } catch (error) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("File serve error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
