
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, title, description, type, options = [], required = true, timeLimit } = await request.json()

    if (!sessionId || !title || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

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

    // Get the next order number
    const maxOrder = await prisma.question.findFirst({
      where: { sessionId },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const question = await prisma.question.create({
      data: {
        sessionId,
        title,
        description,
        type: type.toUpperCase(),
        options,
        required,
        timeLimit,
        order: (maxOrder?.order || 0) + 1
      },
      include: {
        responses: true
      }
    })

    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    console.error("Create question error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
