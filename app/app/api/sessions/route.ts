
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { generateSessionCode } from "@/lib/utils"

export const dynamic = "force-dynamic"

// Get all sessions for admin
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const includeAll = searchParams.get('includeAll') === 'true'

    const sessions = await prisma.pollingSession.findMany({
      where: includeAll ? {} : { adminId: session.user.id },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        questions: {
          orderBy: { order: 'asc' }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        _count: {
          select: {
            responses: true,
            participants: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error("Get sessions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Create new session
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { title, description, allowAnonymous = true, showRealTimeResults = false, maxParticipants } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Generate unique session code
    let sessionCode = generateSessionCode()
    let existingSession = await prisma.pollingSession.findUnique({
      where: { sessionCode }
    })

    while (existingSession) {
      sessionCode = generateSessionCode()
      existingSession = await prisma.pollingSession.findUnique({
        where: { sessionCode }
      })
    }

    const newSession = await prisma.pollingSession.create({
      data: {
        title,
        description,
        sessionCode,
        adminId: session.user.id,
        allowAnonymous,
        showRealTimeResults,
        maxParticipants
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        questions: true,
        participants: true,
        _count: {
          select: {
            responses: true,
            participants: true
          }
        }
      }
    })

    return NextResponse.json(newSession, { status: 201 })
  } catch (error) {
    console.error("Create session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
