
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

// Get single session
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId

    const session = await prisma.pollingSession.findUnique({
      where: { id: sessionId },
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
          include: {
            responses: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
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
        }
      }
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    return NextResponse.json(session)
  } catch (error) {
    console.error("Get session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update session
export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = params.sessionId
    const updates = await request.json()

    // Check if user is admin of this session
    const pollingSession = await prisma.pollingSession.findUnique({
      where: { id: sessionId }
    })

    if (!pollingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (pollingSession.adminId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const updatedSession = await prisma.pollingSession.update({
      where: { id: sessionId },
      data: updates,
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
        participants: true
      }
    })

    return NextResponse.json(updatedSession)
  } catch (error) {
    console.error("Update session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const sessionId = params.sessionId

    // Check if user is admin of this session
    const pollingSession = await prisma.pollingSession.findUnique({
      where: { id: sessionId }
    })

    if (!pollingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (pollingSession.adminId !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await prisma.pollingSession.delete({
      where: { id: sessionId }
    })

    return NextResponse.json({ message: "Session deleted successfully" })
  } catch (error) {
    console.error("Delete session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
