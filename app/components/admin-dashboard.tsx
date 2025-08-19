
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SessionStatus } from "@/components/session-status"
import { 
  Plus, 
  Settings, 
  BarChart3, 
  Users,
  Vote,
  Clock,
  Activity,
  Presentation,
  ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import type { PollingSession, User } from "@/lib/types"

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
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

  const recentSessions = sessions?.slice(0, 5) || []
  const activeSessions = sessions?.filter(s => s?.status === 'ACTIVE') || []
  const totalParticipants = sessions?.reduce((total, session) => total + (session?.participants?.length || 0), 0) || 0
  const totalResponses = sessions?.reduce((total, session) => total + (session?.responses?.length || 0), 0) || 0

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your polling sessions, view analytics, and control audience engagement
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Vote className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sessions?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSessions?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalParticipants}</p>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalResponses}</p>
                <p className="text-sm text-muted-foreground">Total Responses</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/create">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Create New Session</CardTitle>
                  <CardDescription>Set up a new polling session with questions</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/sessions">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Presentation className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Manage Sessions</CardTitle>
                  <CardDescription>View and control all your polling sessions</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Analytics</CardTitle>
                <CardDescription>View detailed reports and insights</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-600" />
              <span>Active Sessions</span>
            </CardTitle>
            <CardDescription>Sessions currently running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeSessions.map((session) => (
                <div
                  key={session?.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-green-900">{session?.title}</h3>
                    <p className="text-sm text-green-700">
                      Code: <span className="font-mono font-bold">{session?.sessionCode}</span> • 
                      {session?.questions?.filter(q => q?.active)?.length || 0} active questions
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="real-time-indicator">
                      <span className="text-sm text-green-600 font-medium">
                        {session?.participants?.length || 0} participants
                      </span>
                    </div>
                    <Link href={`/admin/sessions/${session?.id}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Manage Live
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Sessions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest polling sessions</CardDescription>
          </div>
          <Link href="/admin/sessions">
            <Button variant="outline" size="sm" className="flex items-center space-x-2">
              <span>View All Sessions</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div
                  key={session?.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{session?.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Code: {session?.sessionCode} • {session?.questions?.length || 0} questions • 
                      Created {new Date(session?.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <SessionStatus 
                      status={session?.status} 
                      participantCount={session?.participants?.length}
                    />
                    <Link href={`/admin/sessions/${session?.id}`}>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No sessions created yet</p>
              <p className="text-sm mb-4">
                Create your first polling session to start engaging with your audience
              </p>
              <Link href="/admin/create">
                <Button className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Session</span>
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
