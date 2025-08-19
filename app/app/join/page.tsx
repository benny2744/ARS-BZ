
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"
import { Vote, Users, Hash, User, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function JoinSessionPage() {
  const router = useRouter()
  const { data: session } = useSession() || {}
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    sessionCode: "",
    nickname: ""
  })
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!formData.sessionCode.trim()) {
      setError("Session code is required")
      setIsLoading(false)
      return
    }

    if (!session?.user && !formData.nickname.trim()) {
      setError("Nickname is required for anonymous access")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/sessions/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionCode: formData.sessionCode.toUpperCase(),
          nickname: formData.nickname.trim() || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to join session")
      }

      toast.success("Successfully joined session!", {
        description: `Welcome to "${data.session.title}"`
      })

      // Redirect to the participant session page
      router.push(`/session/${data.sessionId}?participantId=${data.participantId}`)
    } catch (error: any) {
      console.error("Join session error:", error)
      setError(error.message || "Failed to join session")
      toast.error("Failed to join session", {
        description: error.message || "Please check your session code"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      
      <div className="container mx-auto max-w-md px-4 py-16">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Join Session</CardTitle>
            <CardDescription>
              Enter the session code provided by your presenter to participate in real-time polling
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center space-x-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="sessionCode">Session Code</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="sessionCode"
                    name="sessionCode"
                    type="text"
                    placeholder="Enter 6-character code (e.g., DEMO01)"
                    value={formData.sessionCode}
                    onChange={handleChange}
                    className="pl-10 uppercase"
                    maxLength={6}
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Ask your presenter for the 6-character session code
                </p>
              </div>

              {!session?.user && (
                <div className="space-y-2">
                  <Label htmlFor="nickname">Nickname</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nickname"
                      name="nickname"
                      type="text"
                      placeholder="Enter your nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      className="pl-10"
                      maxLength={50}
                      required={!session?.user}
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will be displayed to identify your responses
                  </p>
                </div>
              )}

              {session?.user && (
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="flex items-center space-x-2 text-sm text-green-700">
                    <User className="h-4 w-4" />
                    <span>Signed in as: <strong>{session.user.name || session.user.email}</strong></span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Joining session...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Vote className="h-4 w-4" />
                    <span>Join Session</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {!session?.user ? (
                <p>
                  Have an account?{" "}
                  <Link href="/auth/signin" className="text-primary hover:underline font-medium">
                    Sign in for a better experience
                  </Link>
                </p>
              ) : (
                <p>
                  Want to create your own sessions?{" "}
                  <Link href="/admin" className="text-primary hover:underline font-medium">
                    Go to admin panel
                  </Link>
                </p>
              )}
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <div className="text-xs text-blue-700">
                <p className="font-medium mb-1">💡 Try these demo codes:</p>
                <p><strong>DEMO01</strong> - Team Meeting Feedback</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
