
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  Vote, 
  Users, 
  Eye, 
  EyeOff,
  Settings,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import type { User } from "@/lib/types"

interface CreateSessionFormProps {
  user: User
}

export function CreateSessionForm({ user }: CreateSessionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    allowAnonymous: "true",
    showRealTimeResults: "false",
    maxParticipants: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error("Session title is required")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          allowAnonymous: formData.allowAnonymous === "true",
          showRealTimeResults: formData.showRealTimeResults === "true",
          maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create session")
      }

      toast.success("Session created successfully!", {
        description: `Session code: ${data.sessionCode}`
      })

      // Redirect to session management page
      router.push(`/admin/sessions/${data.id}`)
    } catch (error: any) {
      console.error("Create session error:", error)
      toast.error("Failed to create session", {
        description: error.message || "An unexpected error occurred"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Session</h1>
          <p className="text-gray-600">Set up a new polling session for your audience</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Vote className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Session Details</CardTitle>
              <CardDescription>Configure your polling session settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="title">Session Title *</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="e.g., Team Meeting Feedback, Product Launch Survey"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground">
                  Choose a clear, descriptive title for your polling session
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of what this session is about..."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>

            {/* Access Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Access Settings</h3>
              
              <div className="space-y-2">
                <Label>Participant Access</Label>
                <Select 
                  value={formData.allowAnonymous} 
                  onValueChange={(value) => handleSelectChange('allowAnonymous', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Allow anonymous participation (with nicknames)</SelectItem>
                    <SelectItem value="false">Require user authentication</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.allowAnonymous === "true" 
                    ? "Participants can join without creating an account using a nickname"
                    : "Participants must sign in to join this session"
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label>Real-time Results</Label>
                <Select 
                  value={formData.showRealTimeResults} 
                  onValueChange={(value) => handleSelectChange('showRealTimeResults', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <div className="flex items-center space-x-2">
                      {formData.showRealTimeResults === "true" ? (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">Hide results from participants</SelectItem>
                    <SelectItem value="true">Show results to participants in real-time</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {formData.showRealTimeResults === "true"
                    ? "Participants will see live results as others respond"
                    : "Only you will see the results until you choose to share them"
                  }
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants (Optional)</Label>
                <Input
                  id="maxParticipants"
                  name="maxParticipants"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min={1}
                  disabled={isLoading}
                />
                <p className="text-sm text-muted-foreground">
                  Leave empty for unlimited participants
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Link href="/admin">
                <Button variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </Link>
              
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Session...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Create Session</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
