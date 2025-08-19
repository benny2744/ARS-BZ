
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId
    const session = await getServerSession(authOptions)

    // Get the polling session
    const pollingSession = await prisma.pollingSession.findUnique({
      where: { id: sessionId },
      include: {
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
                name: true
              }
            }
          }
        }
      }
    })

    if (!pollingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Check permissions - admin can always view, participants only if showRealTimeResults is enabled
    const isAdmin = session?.user?.id === pollingSession.adminId
    
    if (!isAdmin && !pollingSession.showRealTimeResults) {
      return NextResponse.json({ error: "Results not available" }, { status: 403 })
    }

    // Process results
    const results = pollingSession.questions.map(question => {
      const totalResponses = question.responses.length
      let processedData: any = {
        questionId: question.id,
        title: question.title,
        type: question.type,
        totalResponses
      }

      if (question.type === 'MULTIPLE_CHOICE' || question.type === 'POLL') {
        // Count responses for each option
        const optionCounts = question.options.reduce((acc, option) => {
          acc[option] = question.responses.filter(r => r.optionValue === option).length
          return acc
        }, {} as Record<string, number>)

        processedData.optionCounts = optionCounts
        processedData.percentages = Object.entries(optionCounts).reduce((acc, [option, count]) => {
          acc[option] = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0
          return acc
        }, {} as Record<string, number>)
      } else if (question.type === 'TEXT') {
        // Return text responses (admin only sees all, participants see anonymized)
        if (isAdmin) {
          processedData.textResponses = question.responses.map(r => ({
            id: r.id,
            text: r.textValue,
            submittedBy: r.user?.name || 'Anonymous',
            submittedAt: r.submittedAt
          }))
        } else {
          processedData.textResponses = question.responses.map(r => ({
            id: r.id,
            text: r.textValue,
            submittedAt: r.submittedAt
          }))
        }
      } else if (question.type === 'PHOTO_UPLOAD') {
        // Return photo URLs
        processedData.photos = question.responses
          .filter(r => r.fileUrl)
          .map(r => ({
            id: r.id,
            url: r.fileUrl,
            submittedBy: isAdmin ? (r.user?.name || 'Anonymous') : null,
            submittedAt: r.submittedAt
          }))
      } else if (question.type === 'RATING') {
        // Calculate rating statistics
        const ratings = question.responses
          .map(r => parseFloat(r.textValue || '0'))
          .filter(r => !isNaN(r))

        if (ratings.length > 0) {
          const average = ratings.reduce((a, b) => a + b, 0) / ratings.length
          processedData.averageRating = Math.round(average * 100) / 100
          processedData.ratingDistribution = ratings.reduce((acc, rating) => {
            acc[rating] = (acc[rating] || 0) + 1
            return acc
          }, {} as Record<number, number>)
        }
      }

      return processedData
    })

    return NextResponse.json({
      sessionId: pollingSession.id,
      title: pollingSession.title,
      totalParticipants: pollingSession.participants.length,
      status: pollingSession.status,
      results
    })
  } catch (error) {
    console.error("Get results error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
