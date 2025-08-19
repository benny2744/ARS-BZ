
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Navigation } from "@/components/navigation"
import { ParticipantSession } from "@/components/participant-session"

interface SessionPageProps {
  params: { sessionId: string }
  searchParams: { participantId?: string }
}

export default async function SessionPage({ params, searchParams }: SessionPageProps) {
  const session = await getServerSession(authOptions)
  const { sessionId } = params
  const { participantId } = searchParams

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <ParticipantSession 
        sessionId={sessionId}
        participantId={participantId}
        user={session?.user}
      />
    </div>
  )
}
