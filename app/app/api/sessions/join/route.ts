
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { sessionCode, nickname } = await request.json()
    
    if (!sessionCode) {
      return NextResponse.json({ error: "Session code is required" }, { status: 400 })
    }

    // Find the session
    const session = await prisma.pollingSession.findUnique({
      where: { sessionCode: sessionCode.toUpperCase() },
      include: {
        participants: true,
        questions: {
          where: { active: true },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    if (session.status === 'COMPLETED') {
      return NextResponse.json({ error: "Session has ended" }, { status: 400 })
    }

    // Check max participants
    if (session.maxParticipants && session.participants.length >= session.maxParticipants) {
      return NextResponse.json({ error: "Session is full" }, { status: 400 })
    }

    const userSession = await getServerSession(authOptions)
    let participantId = null

    if (userSession?.user) {
      // Authenticated user
      const existingParticipant = await prisma.sessionParticipant.findFirst({
        where: {
          sessionId: session.id,
          userId: userSession.user.id
        }
      })

      if (!existingParticipant) {
        const participant = await prisma.sessionParticipant.create({
          data: {
            sessionId: session.id,
            userId: userSession.user.id
          }
        })
        participantId = participant.id
      } else {
        participantId = existingParticipant.id
      }
    } else {
      // Anonymous user
      if (!session.allowAnonymous) {
        return NextResponse.json({ error: "Authentication required for this session" }, { status: 401 })
      }

      if (!nickname) {
        return NextResponse.json({ error: "Nickname is required for anonymous access" }, { status: 400 })
      }

      // Check for duplicate nickname
      const existingNickname = await prisma.sessionParticipant.findFirst({
        where: {
          sessionId: session.id,
          nickname: nickname
        }
      })

      if (existingNickname) {
        return NextResponse.json({ error: "Nickname already taken" }, { status: 400 })
      }

      const participant = await prisma.sessionParticipant.create({
        data: {
          sessionId: session.id,
          nickname: nickname
        }
      })
      participantId = participant.id
    }

    return NextResponse.json({
      sessionId: session.id,
      participantId,
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        status: session.status,
        allowAnonymous: session.allowAnonymous,
        showRealTimeResults: session.showRealTimeResults,
        activeQuestion: session.questions[0] || null
      }
    })
  } catch (error) {
    console.error("Join session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
