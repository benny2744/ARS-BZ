
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { questionId, sessionId, participantId, responseType, textValue, optionValue, fileUrl } = await request.json()

    if (!questionId || !sessionId || !responseType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const session = await getServerSession(authOptions)

    // Check if question exists and is active
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { session: true }
    })

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    if (!question.active) {
      return NextResponse.json({ error: "Question is not currently active" }, { status: 400 })
    }

    // Check if participant already responded
    const existingResponse = await prisma.response.findFirst({
      where: {
        questionId,
        ...(session?.user ? { userId: session.user.id } : { participantId })
      }
    })

    if (existingResponse) {
      return NextResponse.json({ error: "Response already submitted" }, { status: 400 })
    }

    // Create response
    const response = await prisma.response.create({
      data: {
        questionId,
        sessionId,
        userId: session?.user?.id,
        participantId: !session?.user ? participantId : null,
        responseType: responseType.toUpperCase(),
        textValue,
        optionValue,
        fileUrl
      }
    })

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error("Create response error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Get responses for a question (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const questionId = searchParams.get('questionId')
    const sessionId = searchParams.get('sessionId')

    if (!questionId && !sessionId) {
      return NextResponse.json({ error: "Question ID or Session ID is required" }, { status: 400 })
    }

    let responses: any[] = []

    if (questionId) {
      // Check if user is admin of the session this question belongs to
      const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: { session: true }
      })

      if (!question) {
        return NextResponse.json({ error: "Question not found" }, { status: 404 })
      }

      if (question.session.adminId !== session.user.id) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 })
      }

      responses = await prisma.response.findMany({
        where: { questionId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' }
      })
    } else if (sessionId) {
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

      responses = await prisma.response.findMany({
        where: { sessionId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          question: {
            select: {
              id: true,
              title: true,
              type: true
            }
          }
        },
        orderBy: { submittedAt: 'desc' }
      })
    }

    return NextResponse.json(responses)
  } catch (error) {
    console.error("Get responses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
