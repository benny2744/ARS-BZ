
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SessionStatus } from "@/components/session-status"
import { 
  Vote, 
  Plus, 
  BarChart3, 
  Users, 
  Clock,
  Settings,
  ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import type { PollingSession, User } from "@/lib/types"

interface DashboardContentProps {
  user: User
}

export function DashboardContent({ user }: DashboardContentProps) {
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

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.name || 'User'}!
        </h1>
        <p className="text-gray-600">
          {user.role === 'ADMIN' 
            ? "Manage your polling sessions and view results" 
            : "Join sessions and participate in interactive polls"
          }
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
                <p className="text-sm text-muted-foreground">
                  {user.role === 'ADMIN' ? 'Total Sessions' : 'Sessions Joined'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSessions?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
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
                <p className="text-2xl font-bold">
                  {sessions?.reduce((total, session) => total + (session?.participants?.length || 0), 0) || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {sessions?.filter(s => s?.status === 'COMPLETED')?.length || 0}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/join">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Join Session</CardTitle>
                  <CardDescription>Enter a session code to participate</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Link>
        </Card>

        {user.role === 'ADMIN' && (
          <>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/admin/create">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Plus className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Create Session</CardTitle>
                      <CardDescription>Start a new polling session</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/admin">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Settings className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Admin Panel</CardTitle>
                      <CardDescription>Manage all your sessions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Link>
            </Card>
          </>
        )}
      </div>

      {/* Recent Sessions */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              {user.role === 'ADMIN' ? 'Your latest polling sessions' : 'Sessions you\'ve participated in'}
            </CardDescription>
          </div>
          {user.role === 'ADMIN' && (
            <Link href="/admin/sessions">
              <Button variant="outline" size="sm" className="flex items-center space-x-2">
                <span>View All</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
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
                      Code: {session?.sessionCode} • {session?.questions?.length || 0} questions
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <SessionStatus 
                      status={session?.status} 
                      participantCount={session?.participants?.length}
                    />
                    {user.role === 'ADMIN' && (
                      <Link href={`/admin/sessions/${session?.id}`}>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No sessions yet</p>
              <p className="text-sm">
                {user.role === 'ADMIN' 
                  ? "Create your first polling session to get started"
                  : "Join a session to start participating in polls"
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
