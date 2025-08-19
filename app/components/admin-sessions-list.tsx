
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SessionStatus } from "@/components/session-status"
import { 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  BarChart3,
  Users,
  Clock,
  ArrowLeft
} from "lucide-react"
import { toast } from "sonner"
import type { PollingSession, User } from "@/lib/types"

interface AdminSessionsListProps {
  user: User
}

export function AdminSessionsList({ user }: AdminSessionsListProps) {
  const [sessions, setSessions] = useState<PollingSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const response = await fetch("/api/sessions")
      if (response.ok) {
        const data = await response.json()
        setSessions(data || [])
      } else {
        toast.error("Failed to load sessions")
      }
    } catch (error) {
      console.error("Error fetching sessions:", error)
      toast.error("Failed to load sessions")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        toast.success("Session deleted successfully")
        setSessions(sessions.filter(s => s?.id !== sessionId))
      } else {
        toast.error("Failed to delete session")
      }
    } catch (error) {
      console.error("Error deleting session:", error)
      toast.error("Failed to delete session")
    }
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Link href="/admin">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Sessions</h1>
            <p className="text-gray-600">Manage your polling sessions</p>
          </div>
        </div>
        <Link href="/admin/create">
          <Button className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Session</span>
          </Button>
        </Link>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
                  <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                  <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid gap-6">
          {sessions.map((session) => (
            <Card key={session?.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold">{session?.title}</h3>
                      <SessionStatus status={session?.status} />
                    </div>
                    
                    {session?.description && (
                      <p className="text-gray-600 mb-3">{session.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono bg-muted px-2 py-1 rounded text-xs font-bold">
                          {session?.sessionCode}
                        </span>
                        <span>Session Code</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{session?.participants?.length || 0} participants</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <BarChart3 className="h-4 w-4" />
                        <span>{session?.questions?.length || 0} questions</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span>{new Date(session?.createdAt || '').toLocaleDateString()}</span>
                      </div>
                    </div>

                    {session?.showRealTimeResults && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Real-time results enabled
                        </span>
                      </div>
                    )}

                    {!session?.allowAnonymous && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                          Authentication required
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/sessions/${session?.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    </Link>

                    <Link href={`/admin/sessions/${session?.id}/results`}>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Results
                      </Button>
                    </Link>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteSession(session?.id || '')}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-muted-foreground">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No sessions created yet</h3>
              <p className="text-sm mb-6">
                Create your first polling session to start engaging with your audience
              </p>
              <Link href="/admin/create">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Your First Session</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
