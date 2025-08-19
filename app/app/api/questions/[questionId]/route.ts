
import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export const dynamic = "force-dynamic"

// Update question
export async function PUT(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const questionId = params.questionId
    const updates = await request.json()

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

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: updates,
      include: {
        responses: true
      }
    })

    return NextResponse.json(updatedQuestion)
  } catch (error) {
    console.error("Update question error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Delete question
export async function DELETE(
  request: NextRequest,
  { params }: { params: { questionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const questionId = params.questionId

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

    await prisma.question.delete({
      where: { id: questionId }
    })

    return NextResponse.json({ message: "Question deleted successfully" })
  } catch (error) {
    console.error("Delete question error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
